const { Car, ScrapingLog } = require('../db/models');
const { Op } = require('sequelize');

class CarService {
  /**
   * Проверить валидность кеша
   * @param {number} ttlMinutes - TTL кеша в минутах (по умолчанию 1)
   * @returns {Promise<boolean>}
   */
  async isCacheValid(ttlMinutes = 1) {
    try {
      const thresholdDate = new Date(Date.now() - ttlMinutes * 60 * 1000);

      const validCacheCount = await Car.count({
        where: {
          cached_at: { [Op.gte]: thresholdDate }
        }
      });

      return validCacheCount > 0;
    } catch (error) {
      console.error('Error checking cache validity:', error.message);
      return false;
    }
  }

  /**
   * Обновить кеш - очистить таблицу и вставить новые данные
   * @param {Array} carsData - массив данных автомобилей
   * @returns {Promise<number>} количество добавленных записей
   */
  async refreshCache(carsData) {
    try {
      // Очищаем таблицу
      await Car.destroy({ where: {}, truncate: true });

      // Дедуплицируем по external_id
      const uniqueCars = [];
      const seenIds = new Set();

      for (const car of carsData) {
        if (!seenIds.has(car.external_id)) {
          seenIds.add(car.external_id);
          uniqueCars.push(car);
        }
      }

      // Добавляем cached_at ко всем записям
      const carsWithCache = uniqueCars.map(car => ({
        ...car,
        cached_at: new Date(),
        last_scraped_at: new Date()
      }));

      // Вставляем новые данные
      const createdCars = await Car.bulkCreate(carsWithCache);

      console.log(`✅ Cache refreshed: ${createdCars.length} cars added (${carsData.length - uniqueCars.length} duplicates removed)`);
      return createdCars.length;
    } catch (error) {
      console.error('Error refreshing cache:', error.message);
      throw error;
    }
  }

  /**
   * Upsert автомобиля - обновить существующий или создать новый
   * @param {Object} carData - данные автомобиля
   * @returns {Object} { created: boolean, car: Car }
   */
  async upsertCar(carData) {
    try {
      // Ищем автомобиль по external_id
      const existingCar = await Car.findOne({
        where: { external_id: carData.external_id }
      });

      if (existingCar) {
        // Проверяем, изменились ли данные
        const hasChanges = this.detectChanges(existingCar, carData);

        if (hasChanges) {
          // Обновляем существующий
          await existingCar.update({
            ...carData,
            cached_at: new Date()
          });
          return { created: false, updated: true, car: existingCar };
        }

        // Обновляем только last_scraped_at и cached_at
        await existingCar.update({
          last_scraped_at: new Date(),
          cached_at: new Date()
        });
        return { created: false, updated: false, car: existingCar };
      }

      // Создаём новый
      const newCar = await Car.create({
        ...carData,
        cached_at: new Date()
      });
      return { created: true, updated: false, car: newCar };

    } catch (error) {
      console.error('Error upserting car:', error.message);
      throw error;
    }
  }

  /**
   * Массовый upsert автомобилей
   * @param {Array} carsData - массив данных автомобилей
   * @returns {Object} { added: number, updated: number, errors: Array }
   */
  async bulkUpsert(carsData) {
    const results = {
      added: 0,
      updated: 0,
      unchanged: 0,
      errors: []
    };

    for (const carData of carsData) {
      try {
        const result = await this.upsertCar(carData);

        if (result.created) {
          results.added++;
        } else if (result.updated) {
          results.updated++;
        } else {
          results.unchanged++;
        }
      } catch (error) {
        results.errors.push({
          external_id: carData.external_id,
          error: error.message
        });
      }
    }

    return results;
  }

  /**
   * Определить изменения между существующим авто и новыми данными
   */
  detectChanges(existingCar, newData) {
    const fieldsToCheck = [
      'brand', 'model', 'year', 'price', 'color',
      'mileage', 'transmission', 'fuel_type', 'body_type',
      'location', 'description', 'image_url'
    ];

    for (const field of fieldsToCheck) {
      if (newData[field] !== undefined) {
        // Приводим к строке для корректного сравнения
        // (DECIMAL из БД возвращается как строка, нужно нормализовать)
        const existingValue = this.normalizeValue(existingCar[field]);
        const newValue = this.normalizeValue(newData[field]);

        if (existingValue !== newValue) {
          return true;
        }
      }
    }

    return false;
  }

  /**
   * Нормализация значения для сравнения
   */
  normalizeValue(value) {
    if (value === null || value === undefined) {
      return '';
    }

    // Для чисел и DECIMAL - приводим к числу, затем к строке
    if (typeof value === 'number' || !isNaN(parseFloat(value))) {
      return String(parseFloat(value));
    }

    // Для всего остального - просто к строке
    return String(value).trim();
  }

  /**
   * Получить список автомобилей с фильтрами и пагинацией
   */
  async getCars(filters = {}, pagination = {}) {
    const {
      brand,
      model,
      minPrice,
      maxPrice,
      minYear,
      maxYear,
      color,
      transmission,
      fuel_type,
      search
    } = filters;

    const {
      page = 1,
      limit = 20,
      sortBy = 'createdAt',
      sortOrder = 'DESC'
    } = pagination;

    const where = {};

    // Фильтры
    if (brand) where.brand = { [Op.iLike]: `%${brand}%` };
    if (model) where.model = { [Op.iLike]: `%${model}%` };
    if (color) where.color = { [Op.iLike]: `%${color}%` };
    if (transmission) where.transmission = transmission;
    if (fuel_type) where.fuel_type = fuel_type;

    // Фильтры по диапазону
    if (minPrice || maxPrice) {
      where.price = {};
      if (minPrice) where.price[Op.gte] = minPrice;
      if (maxPrice) where.price[Op.lte] = maxPrice;
    }

    if (minYear || maxYear) {
      where.year = {};
      if (minYear) where.year[Op.gte] = minYear;
      if (maxYear) where.year[Op.lte] = maxYear;
    }

    // Поиск по тексту
    if (search) {
      where[Op.or] = [
        { brand: { [Op.iLike]: `%${search}%` } },
        { model: { [Op.iLike]: `%${search}%` } },
        { description: { [Op.iLike]: `%${search}%` } }
      ];
    }

    const offset = (page - 1) * limit;

    try {
      const { rows, count } = await Car.findAndCountAll({
        where,
        limit: parseInt(limit),
        offset: parseInt(offset),
        order: [[sortBy, sortOrder]]
      });

      return {
        cars: rows,
        total: count,
        page: parseInt(page),
        totalPages: Math.ceil(count / limit),
        limit: parseInt(limit)
      };
    } catch (error) {
      console.error('Error getting cars:', error.message);
      throw error;
    }
  }

  /**
   * Получить автомобиль по ID
   */
  async getCarById(id) {
    try {
      const car = await Car.findByPk(id);
      return car;
    } catch (error) {
      console.error('Error getting car by id:', error.message);
      throw error;
    }
  }

  /**
   * Получить статистику автомобилей для фильтров
   */
  async getStats() {
    try {
      // Получаем уникальные бренды
      const brandsData = await Car.findAll({
        attributes: [[Car.sequelize.fn('DISTINCT', Car.sequelize.col('brand')), 'brand']],
        where: { brand: { [Op.ne]: null } },
        order: [['brand', 'ASC']],
        raw: true
      });
      const brands = brandsData.map(item => item.brand);

      // Получаем модели сгруппированные по брендам
      const modelsData = await Car.findAll({
        attributes: ['brand', 'model'],
        where: {
          brand: { [Op.ne]: null },
          model: { [Op.ne]: null }
        },
        group: ['brand', 'model'],
        order: [['brand', 'ASC'], ['model', 'ASC']],
        raw: true
      });

      const models = {};
      modelsData.forEach(item => {
        if (!models[item.brand]) {
          models[item.brand] = [];
        }
        if (!models[item.brand].includes(item.model)) {
          models[item.brand].push(item.model);
        }
      });

      // Получаем уникальные цвета
      const colorsData = await Car.findAll({
        attributes: [[Car.sequelize.fn('DISTINCT', Car.sequelize.col('color')), 'color']],
        where: { color: { [Op.ne]: null } },
        order: [['color', 'ASC']],
        raw: true
      });
      const colors = colorsData.map(item => item.color);

      // Получаем уникальные типы КПП
      const transmissionsData = await Car.findAll({
        attributes: [[Car.sequelize.fn('DISTINCT', Car.sequelize.col('transmission')), 'transmission']],
        where: { transmission: { [Op.ne]: null } },
        order: [['transmission', 'ASC']],
        raw: true
      });
      const transmissions = transmissionsData.map(item => item.transmission);

      // Получаем уникальные типы топлива
      const fuelTypesData = await Car.findAll({
        attributes: [[Car.sequelize.fn('DISTINCT', Car.sequelize.col('fuel_type')), 'fuel_type']],
        where: { fuel_type: { [Op.ne]: null } },
        order: [['fuel_type', 'ASC']],
        raw: true
      });
      const fuelTypes = fuelTypesData.map(item => item.fuel_type);

      // Получаем диапазон цен
      const priceData = await Car.findOne({
        attributes: [
          [Car.sequelize.fn('MIN', Car.sequelize.col('price')), 'min'],
          [Car.sequelize.fn('MAX', Car.sequelize.col('price')), 'max']
        ],
        raw: true
      });
      const priceRange = {
        min: parseFloat(priceData?.min) || 0,
        max: parseFloat(priceData?.max) || 0
      };

      // Получаем диапазон годов
      const yearData = await Car.findOne({
        attributes: [
          [Car.sequelize.fn('MIN', Car.sequelize.col('year')), 'min'],
          [Car.sequelize.fn('MAX', Car.sequelize.col('year')), 'max']
        ],
        raw: true
      });
      const yearRange = {
        min: parseInt(yearData?.min) || 0,
        max: parseInt(yearData?.max) || 0
      };

      return {
        brands,
        models,
        colors,
        transmissions,
        fuelTypes,
        priceRange,
        yearRange
      };
    } catch (error) {
      console.error('Error getting stats:', error.message);
      throw error;
    }
  }

  /**
   * Создать лог скрапинга
   */
  async createScrapingLog(data = {}) {
    try {
      return await ScrapingLog.create({
        status: 'running',
        started_at: new Date(),
        ...data
      });
    } catch (error) {
      console.error('Error creating scraping log:', error.message);
      throw error;
    }
  }

  /**
   * Обновить лог скрапинга
   */
  async updateScrapingLog(logId, data) {
    try {
      const log = await ScrapingLog.findByPk(logId);
      if (log) {
        await log.update(data);
      }
      return log;
    } catch (error) {
      console.error('Error updating scraping log:', error.message);
      throw error;
    }
  }

  /**
   * Завершить лог скрапинга
   */
  async completeScrapingLog(logId, results) {
    try {
      const updateData = {
        status: results.errors && results.errors.length > 0 ? 'completed' : 'completed',
        cars_found: results.added + results.updated + results.unchanged,
        cars_added: results.added,
        cars_updated: results.updated,
        completed_at: new Date(),
        error_message: results.errors?.length > 0
          ? JSON.stringify(results.errors)
          : null
      };

      return await this.updateScrapingLog(logId, updateData);
    } catch (error) {
      console.error('Error completing scraping log:', error.message);
      throw error;
    }
  }

  /**
   * Отметить лог как failed
   */
  async failScrapingLog(logId, errorMessage) {
    try {
      return await this.updateScrapingLog(logId, {
        status: 'failed',
        error_message: errorMessage,
        completed_at: new Date()
      });
    } catch (error) {
      console.error('Error failing scraping log:', error.message);
      throw error;
    }
  }
}

module.exports = new CarService();
