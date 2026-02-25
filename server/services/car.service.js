const { Car, ScrapingLog } = require('../db/models');
const { Op } = require('sequelize');

class CarService {
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
          await existingCar.update(carData);
          return { created: false, updated: true, car: existingCar };
        }

        // Обновляем только last_scraped_at
        await existingCar.update({ last_scraped_at: new Date() });
        return { created: false, updated: false, car: existingCar };
      }

      // Создаём новый
      const newCar = await Car.create(carData);
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
   * Получить статистику автомобилей
   */
  async getStats() {
    try {
      const total = await Car.count();

      const byBrand = await Car.findAll({
        attributes: [
          'brand',
          [Car.sequelize.fn('COUNT', '*'), 'count']
        ],
        group: ['brand'],
        order: [[Car.sequelize.fn('COUNT', '*'), 'DESC']],
        limit: 10
      });

      const avgPrice = await Car.findOne({
        attributes: [[Car.sequelize.fn('AVG', Car.sequelize.col('price')), 'avg_price']]
      });

      return {
        total,
        topBrands: byBrand,
        averagePrice: avgPrice?.get('avg_price') || 0
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
