/**
 * Тест реального скрапинга с carsensor.net
 *
 * Запуск: node tests/5-test-scraper-real.js
 */

const scraperService = require('../services/scraper.service');
const fs = require('fs');
const path = require('path');

async function testRealScraping() {
  console.log('=== ТЕСТ РЕАЛЬНОГО СКРАПИНГА ===\n');

  try {
    // URL для тестирования - поиск Toyota
    const testUrl = 'https://www.carsensor.net/usedcar/search.php?STID=CS210610&BRDC=TO';

    console.log(`📡 Запуск скрапинга: ${testUrl}\n`);

    const cars = await scraperService.scrapeSearchPage(testUrl);

    console.log(`\n✅ Скрапинг завершён! Найдено автомобилей: ${cars.length}\n`);

    if (cars.length === 0) {
      console.log('⚠️  Автомобили не найдены. Возможные причины:');
      console.log('   - Селекторы устарели');
      console.log('   - Сайт изменил структуру');
      console.log('   - Блокировка по User-Agent');
      return;
    }

    // Выводим первые 3 автомобиля для проверки
    console.log('📋 Первые 3 автомобиля:\n');
    cars.slice(0, 3).forEach((car, index) => {
      console.log(`--- Автомобиль ${index + 1} ---`);
      console.log(`ID: ${car.external_id}`);
      console.log(`Марка: ${car.brand}`);
      console.log(`Модель: ${car.model}`);
      console.log(`Год: ${car.year}`);
      console.log(`Цена: ¥${car.price?.toLocaleString() || 'N/A'}`);
      console.log(`Пробег: ${car.mileage?.toLocaleString() || 'N/A'} км`);
      console.log(`КПП: ${car.transmission || 'N/A'}`);
      console.log(`Цвет: ${car.color || 'N/A'}`);
      console.log(`Кузов: ${car.body_type || 'N/A'}`);
      console.log(`URL: ${car.url}`);
      console.log(`Изображение: ${car.image_url ? 'Есть' : 'Нет'}`);
      console.log('');
    });

    // Статистика по полям
    console.log('📊 Статистика заполненности полей:\n');
    const stats = {
      total: cars.length,
      withBrand: cars.filter(c => c.brand).length,
      withModel: cars.filter(c => c.model).length,
      withYear: cars.filter(c => c.year).length,
      withPrice: cars.filter(c => c.price).length,
      withMileage: cars.filter(c => c.mileage).length,
      withTransmission: cars.filter(c => c.transmission).length,
      withColor: cars.filter(c => c.color).length,
      withBodyType: cars.filter(c => c.body_type).length,
      withImage: cars.filter(c => c.image_url).length,
    };

    Object.entries(stats).forEach(([field, count]) => {
      const percentage = ((count / stats.total) * 100).toFixed(1);
      console.log(`${field}: ${count}/${stats.total} (${percentage}%)`);
    });

    // Сохраняем результаты в JSON файл
    const outputPath = path.join(__dirname, 'scraper-results.json');
    fs.writeFileSync(outputPath, JSON.stringify(cars, null, 2), 'utf-8');

    console.log(`\n💾 Результаты сохранены в: ${outputPath}`);
    console.log('\n✅ ТЕСТ ПРОЙДЕН!');

  } catch (error) {
    console.error('\n❌ ОШИБКА:', error.message);
    console.error('\nStack trace:', error.stack);
    process.exit(1);
  }
}

// Запуск теста
testRealScraping();
