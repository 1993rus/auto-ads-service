const express = require('express');
const carService = require('../services/car.service');
const scraperService = require('../services/scraper.service');
const verifyAccessToken = require('../middleware/verifyAccesssToken');

const carRouter = express.Router();

// TTL кеша в минутах (берем из ENV или 1 минута по умолчанию для тестового режима)
const CACHE_TTL_MINUTES = parseInt(process.env.CACHE_TTL_MINUTES) || 1;

/**
 * Вспомогательная функция для проверки и обновления кеша
 * Если кеш устарел или пустой, запускает скрапинг и обновляет кеш
 */
async function ensureCacheValid() {
  const isCacheValid = await carService.isCacheValid(CACHE_TTL_MINUTES);

  if (!isCacheValid) {
    console.log('⚠️  Cache is stale or empty. Fetching fresh data from carsensor.net...');

    const searchUrls = scraperService.generateSearchUrls();
    const withImages = process.env.SCRAPER_WITH_IMAGES !== 'false';
    let allCars = [];

    for (const url of searchUrls) {
      try {
        const cars = await scraperService.scrapeSearchPage(url, withImages);
        allCars = allCars.concat(cars);
        await scraperService.delay(2000);
      } catch (error) {
        console.error(`❌ Error scraping ${url}:`, error.message);
      }
    }

    console.log(`✅ Scraped ${allCars.length} cars from carsensor.net`);
    await carService.refreshCache(allCars);
  }
}

/**
 * GET /api/cars - получить список автомобилей с фильтрами и пагинацией
 * Использует кеш-архитектуру: проверяет валидность кеша и обновляет при необходимости
 */
carRouter.get('/', verifyAccessToken, async (req, res) => {
  try {
    // Проверяем и обновляем кеш при необходимости
    await ensureCacheValid();

    // Получаем данные из кеша с применением фильтров
    const filters = {
      brand: req.query.brand,
      model: req.query.model,
      minPrice: req.query.minPrice,
      maxPrice: req.query.maxPrice,
      minYear: req.query.minYear,
      maxYear: req.query.maxYear,
      color: req.query.color,
      transmission: req.query.transmission,
      fuel_type: req.query.fuel_type,
      search: req.query.search
    };

    const pagination = {
      page: req.query.page || 1,
      limit: req.query.limit || 20,
      sortBy: req.query.sortBy || 'createdAt',
      sortOrder: req.query.sortOrder || 'DESC'
    };

    const result = await carService.getCars(filters, pagination);
    res.json(result);
  } catch (error) {
    console.error('Error getting cars:', error);
    res.status(500).json({ error: 'Ошибка при получении автомобилей' });
  }
});

/**
 * GET /api/cars/stats - получить статистику
 * Использует кеш-архитектуру: проверяет валидность кеша и обновляет при необходимости
 */
carRouter.get('/stats', verifyAccessToken, async (req, res) => {
  try {
    // Проверяем и обновляем кеш при необходимости
    await ensureCacheValid();

    // Получаем статистику из кеша
    const stats = await carService.getStats();
    res.json(stats);
  } catch (error) {
    console.error('Error getting stats:', error);
    res.status(500).json({ error: 'Ошибка при получении статистики' });
  }
});

/**
 * GET /api/cars/:id - получить автомобиль по ID
 * Использует кеш-архитектуру: проверяет валидность кеша и обновляет при необходимости
 */
carRouter.get('/:id', verifyAccessToken, async (req, res) => {
  try {
    // Проверяем и обновляем кеш при необходимости
    await ensureCacheValid();

    // Получаем автомобиль из кеша
    const car = await carService.getCarById(req.params.id);

    if (!car) {
      return res.status(404).json({ error: 'Автомобиль не найден' });
    }

    res.json(car);
  } catch (error) {
    console.error('Error getting car:', error);
    res.status(500).json({ error: 'Ошибка сервера' });
  }
});

module.exports = carRouter;
