/**
 * Проверка состояния кеша
 * Запуск: node tests/16-check-cache-status.js
 */

require('dotenv').config();
const carService = require('../services/car.service');
const { Car } = require('../db/models');

async function checkCacheStatus() {
  console.log('=== ПРОВЕРКА СОСТОЯНИЯ КЕША ===\n');

  try {
    // Проверяем количество записей
    const count = await Car.count();
    console.log(`Записей в БД: ${count}\n`);

    if (count === 0) {
      console.log('⚠️  БД пустая - кеш будет невалидным\n');
    } else {
      // Проверяем cached_at
      const cars = await Car.findAll({
        attributes: ['id', 'brand', 'model', 'cached_at', 'last_scraped_at'],
        limit: 5,
        order: [['cached_at', 'DESC']]
      });

      console.log('Последние 5 записей:\n');
      cars.forEach((car, i) => {
        console.log(`${i + 1}. ${car.brand} ${car.model}`);
        console.log(`   cached_at: ${car.cached_at}`);
        console.log(`   last_scraped_at: ${car.last_scraped_at}`);

        if (car.cached_at) {
          const age = (Date.now() - new Date(car.cached_at).getTime()) / 1000;
          console.log(`   Возраст кеша: ${age.toFixed(0)} секунд\n`);
        } else {
          console.log(`   ⚠️  cached_at не установлен!\n`);
        }
      });
    }

    // Проверяем валидность кеша (TTL = 1 минута)
    const isValid1min = await carService.isCacheValid(1);
    console.log(`Кеш валиден (TTL=1 мин): ${isValid1min}`);

    // Проверяем валидность кеша (TTL = 10 минут)
    const isValid10min = await carService.isCacheValid(10);
    console.log(`Кеш валиден (TTL=10 мин): ${isValid10min}\n`);

    if (!isValid1min) {
      console.log('⚠️  Кеш устарел или пустой - потребуется скрапинг при следующем запросе\n');
    } else {
      console.log('✅ Кеш свежий - данные будут возвращены из БД\n');
    }

  } catch (error) {
    console.error('❌ ОШИБКА:', error.message);
    console.error(error.stack);
    process.exit(1);
  }
}

checkCacheStatus();
