/**
 * Тест метода scrapeCarDetail на одном автомобиле
 *
 * Запуск: node tests/9-test-scrape-detail.js
 */

const scraperService = require('../services/scraper.service');
const fs = require('fs');
const path = require('path');

async function testScrapeDetail() {
  console.log('=== ТЕСТ МЕТОДА scrapeCarDetail ===\n');

  try {
    // Читаем результаты скрапинга
    const resultsPath = path.join(__dirname, 'scraper-results.json');

    if (!fs.existsSync(resultsPath)) {
      console.log('❌ Файл scraper-results.json не найден!');
      process.exit(1);
    }

    const carsData = JSON.parse(fs.readFileSync(resultsPath, 'utf-8'));

    console.log(`📋 Тестируем на первых 3 автомобилях из файла...\n`);

    for (let i = 0; i < Math.min(3, carsData.length); i++) {
      const car = carsData[i];

      console.log(`--- Автомобиль ${i + 1} ---`);
      console.log(`External ID: ${car.external_id}`);
      console.log(`Марка: ${car.brand}`);
      console.log(`Модель: ${car.model.substring(0, 50)}...`);
      console.log(`URL: ${car.url}`);
      console.log(`Текущее изображение: ${car.image_url || 'отсутствует'}\n`);

      console.log('🔄 Скрапим детальную страницу...');

      const imageUrl = await scraperService.scrapeCarDetail(car.url);

      if (imageUrl) {
        console.log(`✅ Изображение найдено!`);
        console.log(`   URL: ${imageUrl}`);
      } else {
        console.log(`❌ Изображение не найдено`);
      }

      console.log('');

      // Задержка между запросами
      if (i < 2) {
        await scraperService.delay(2500);
      }
    }

    console.log('\n✅ ТЕСТ ЗАВЕРШЁН!');

  } catch (error) {
    console.error('\n❌ ОШИБКА:', error.message);
    console.error('Stack trace:', error.stack);
    process.exit(1);
  }
}

// Запуск теста
testScrapeDetail();
