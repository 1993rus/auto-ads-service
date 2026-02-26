/**
 * Импорт спарсенных данных в базу данных
 *
 * Запуск: node tests/6-import-scraped-data.js
 */

require('dotenv').config();
const fs = require('fs');
const path = require('path');
const carService = require('../services/car.service');

async function importScrapedData() {
  console.log('=== ИМПОРТ СПАРСЕННЫХ ДАННЫХ В БД ===\n');

  try {
    // Читаем результаты скрапинга
    const resultsPath = path.join(__dirname, 'scraper-results.json');

    if (!fs.existsSync(resultsPath)) {
      console.log('❌ Файл scraper-results.json не найден!');
      console.log('   Сначала запустите: node tests/5-test-scraper-real.js');
      process.exit(1);
    }

    const carsData = JSON.parse(fs.readFileSync(resultsPath, 'utf-8'));

    console.log(`📋 Найдено автомобилей в файле: ${carsData.length}\n`);

    // Добавляем значения по умолчанию для отсутствующих полей
    const processedData = carsData.map(car => ({
      ...car,
      color: car.color || 'Не указан',
      body_type: car.body_type || 'Sedan',
      fuel_type: car.fuel_type || 'Gasoline',
      location: car.location || 'Япония',
      description: car.description || car.model || 'Описание отсутствует',
      image_url: car.image_url || null
    }));

    console.log('💾 Начинаем импорт в базу данных...\n');

    // Используем bulkUpsert для массового импорта
    const results = await carService.bulkUpsert(processedData);

    console.log('\n✅ ИМПОРТ ЗАВЕРШЁН!\n');
    console.log('📊 Статистика:');
    console.log(`   Добавлено новых: ${results.added}`);
    console.log(`   Обновлено: ${results.updated}`);
    console.log(`   Без изменений: ${results.unchanged}`);
    console.log(`   Ошибок: ${results.errors.length}`);

    if (results.errors.length > 0) {
      console.log('\n⚠️  Ошибки импорта:');
      results.errors.forEach((err, i) => {
        console.log(`   ${i + 1}. ${err.external_id}: ${err.error}`);
      });
    }

  } catch (error) {
    console.error('\n❌ ОШИБКА:', error.message);
    console.error('Stack trace:', error.stack);
    process.exit(1);
  }
}

// Запуск импорта
importScrapedData();
