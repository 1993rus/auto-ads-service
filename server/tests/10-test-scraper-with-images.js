/**
 * Тест скрапера с автоматической загрузкой изображений
 *
 * Запуск: node tests/10-test-scraper-with-images.js
 */

const scraperService = require('../services/scraper.service');
const fs = require('fs');
const path = require('path');

async function testScraperWithImages() {
  console.log('=== ТЕСТ СКРАПЕРА С ИЗОБРАЖЕНИЯМИ ===\n');

  try {
    // URL для тестирования - поиск Toyota (первые 5 результатов)
    const testUrl = 'https://www.carsensor.net/usedcar/search.php?STID=CS210610&BRDC=TO';

    console.log(`📡 Запуск скрапинга с загрузкой изображений: ${testUrl}\n`);
    console.log('⚠️  Внимание: это займет время из-за загрузки детальных страниц\n');

    const startTime = Date.now();

    // Скрапим с параметром withImages=true
    const cars = await scraperService.scrapeSearchPage(testUrl, true);

    const endTime = Date.now();
    const duration = ((endTime - startTime) / 1000).toFixed(1);

    console.log(`\n✅ Скрапинг завершён за ${duration} секунд!`);
    console.log(`📋 Найдено автомобилей: ${cars.length}\n`);

    if (cars.length === 0) {
      console.log('⚠️  Автомобили не найдены');
      return;
    }

    // Статистика по изображениям
    const carsWithImages = cars.filter(c => c.image_url);
    const carsWithoutImages = cars.filter(c => !c.image_url);

    console.log('📊 Статистика по изображениям:\n');
    console.log(`✅ С изображениями: ${carsWithImages.length}/${cars.length} (${((carsWithImages.length / cars.length) * 100).toFixed(1)}%)`);
    console.log(`❌ Без изображений: ${carsWithoutImages.length}/${cars.length}`);

    // Выводим первые 3 автомобиля
    console.log('\n📋 Первые 3 автомобиля:\n');
    cars.slice(0, 3).forEach((car, index) => {
      console.log(`--- Автомобиль ${index + 1} ---`);
      console.log(`ID: ${car.external_id}`);
      console.log(`Марка: ${car.brand}`);
      console.log(`Модель: ${car.model.substring(0, 50)}...`);
      console.log(`Год: ${car.year}`);
      console.log(`Цена: ¥${car.price?.toLocaleString() || 'N/A'}`);
      console.log(`Пробег: ${car.mileage?.toLocaleString() || 'N/A'} км`);
      console.log(`Изображение: ${car.image_url ? '✅ Есть' : '❌ Нет'}`);
      if (car.image_url) {
        console.log(`URL: ${car.image_url.substring(0, 80)}...`);
      }
      console.log('');
    });

    // Сохраняем результаты
    const outputPath = path.join(__dirname, 'scraper-with-images-results.json');
    fs.writeFileSync(outputPath, JSON.stringify(cars, null, 2), 'utf-8');

    console.log(`💾 Результаты сохранены в: ${outputPath}`);
    console.log('\n✅ ТЕСТ ПРОЙДЕН!');

  } catch (error) {
    console.error('\n❌ ОШИБКА:', error.message);
    console.error('Stack trace:', error.stack);
    process.exit(1);
  }
}

// Запуск теста
testScraperWithImages();
