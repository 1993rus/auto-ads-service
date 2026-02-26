/**
 * Обновление кеша в production режиме (без изображений для скорости)
 * Запуск: node tests/19-refresh-cache-production.js
 */

require('dotenv').config();
const carService = require('../services/car.service');
const scraperService = require('../services/scraper.service');

async function refreshCacheProduction() {
  console.log('=== ОБНОВЛЕНИЕ КЕША (PRODUCTION) ===\n');

  try {
    // Генерируем URLs для скрапинга
    const searchUrls = scraperService.generateSearchUrls();
    console.log(`🔍 Будет просканировано страниц: ${searchUrls.length}\n`);

    let allCars = [];

    // Скрапим данные БЕЗ изображений для скорости
    for (const url of searchUrls) {
      try {
        console.log(`📄 Скрапинг: ${url}`);
        const cars = await scraperService.scrapeSearchPage(url, false);
        allCars = allCars.concat(cars);
        console.log(`   Найдено: ${cars.length} автомобилей\n`);

        // Задержка между страницами
        await scraperService.delay(2000);
      } catch (error) {
        console.error(`❌ Ошибка: ${error.message}\n`);
      }
    }

    console.log(`✅ Всего собрано: ${allCars.length} автомобилей\n`);

    // Обновляем кеш
    console.log('🔄 Обновляем кеш...\n');
    const added = await carService.refreshCache(allCars);

    console.log(`✅ Кеш обновлен: ${added} автомобилей\n`);

    // Проверяем валидность
    const isValid = await carService.isCacheValid(60);
    console.log(`Кеш валиден (TTL=60 мин): ${isValid}\n`);

    // Проверяем статистику
    console.log('📊 Статистика:\n');
    const stats = await carService.getStats();
    console.log(`Брендов: ${stats.brands.length}`);
    console.log(`Цветов: ${stats.colors.length}`);

    // Считаем автомобили с изображениями
    const { Car } = require('../db/models');
    const totalCars = await Car.count();
    const carsWithImages = await Car.count({ where: { image_url: { [require('sequelize').Op.ne]: null } } });

    console.log(`\nВсего автомобилей: ${totalCars}`);
    console.log(`С изображениями: ${carsWithImages} (${((carsWithImages/totalCars)*100).toFixed(1)}%)\n`);

    console.log('🎉 ГОТОВО!\n');
    console.log('ℹ️  Для загрузки изображений запустите: node tests/18-update-images.js');

  } catch (error) {
    console.error('❌ ОШИБКА:', error.message);
    console.error(error.stack);
    process.exit(1);
  }
}

refreshCacheProduction();
