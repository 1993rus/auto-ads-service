/**
 * Принудительное обновление кеша
 * Запуск: SCRAPER_MODE=mock node tests/17-force-refresh-cache.js
 */

// Устанавливаем mock режим
process.env.SCRAPER_MODE = 'mock';
process.env.SCRAPER_WITH_IMAGES = 'false';

require('dotenv').config();
const carService = require('../services/car.service');
const scraperService = require('../services/scraper.service');

async function forceRefreshCache() {
  console.log('=== ПРИНУДИТЕЛЬНОЕ ОБНОВЛЕНИЕ КЕША ===\n');

  try {
    // Генерируем URLs для скрапинга
    const searchUrls = scraperService.generateSearchUrls();
    console.log(`🔍 Будет просканировано страниц: ${searchUrls.length}\n`);

    let allCars = [];

    // Скрапим данные
    for (const url of searchUrls) {
      try {
        console.log(`📄 Скрапинг: ${url}`);
        const cars = await scraperService.scrapeSearchPage(url, false);
        allCars = allCars.concat(cars);
        console.log(`   Найдено: ${cars.length} автомобилей\n`);
      } catch (error) {
        console.error(`❌ Ошибка: ${error.message}\n`);
      }
    }

    console.log(`✅ Всего собрано: ${allCars.length} автомобилей\n`);

    // Обновляем кеш
    console.log('🔄 Обновляем кеш...\n');
    const added = await carService.refreshCache(allCars);

    console.log(`✅ Кеш обновлен: ${added} автомобилей добавлено\n`);

    // Проверяем валидность
    const isValid = await carService.isCacheValid(1);
    console.log(`Кеш валиден: ${isValid}\n`);

    // Проверяем статистику
    console.log('📊 Проверяем статистику...\n');
    const stats = await carService.getStats();
    console.log(`Брендов: ${stats.brands.length}`);
    console.log(`Моделей: ${Object.keys(stats.models).length}`);
    console.log(`Цветов: ${stats.colors.length}\n`);

    console.log('🎉 ГОТОВО!\n');

  } catch (error) {
    console.error('❌ ОШИБКА:', error.message);
    console.error(error.stack);
    process.exit(1);
  }
}

forceRefreshCache();
