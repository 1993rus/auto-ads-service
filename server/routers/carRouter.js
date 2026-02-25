const express = require('express');
const carService = require('../services/car.service');
const verifyAccessToken = require('../middleware/verifyAccesssToken');

const carRouter = express.Router();

/**
 * GET /api/cars - получить список автомобилей с фильтрами и пагинацией
 */
carRouter.get('/', verifyAccessToken, async (req, res) => {
  try {
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
 */
carRouter.get('/stats', verifyAccessToken, async (req, res) => {
  try {
    const stats = await carService.getStats();
    res.json(stats);
  } catch (error) {
    console.error('Error getting stats:', error);
    res.status(500).json({ error: 'Ошибка при получении статистики' });
  }
});

/**
 * GET /api/cars/:id - получить автомобиль по ID
 */
carRouter.get('/:id', verifyAccessToken, async (req, res) => {
  try {
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
