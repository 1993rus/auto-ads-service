/**
 * Обновление изображений для автомобилей
 * Запуск: node tests/18-update-images.js
 */

require('dotenv').config();
const scraperService = require('../services/scraper.service');
const { Car } = require('../db/models');

async function updateImages() {
  console.log('=== ОБНОВЛЕНИЕ ИЗОБРАЖЕНИЙ ===\n');

  try {
    // Получаем все автомобили без изображений
    const carsWithoutImages = await Car.findAll({
      where: {
        image_url: null
      },
      limit: 30 // Обновляем по 30 за раз
    });

    console.log(`Автомобилей без изображений: ${carsWithoutImages.length}\n`);

    if (carsWithoutImages.length === 0) {
      console.log('✅ Все автомобили уже имеют изображения!');
      return;
    }

    let updated = 0;
    let failed = 0;

    for (const car of carsWithoutImages) {
      try {
        console.log(`Обновляем: ${car.brand} ${car.model.substring(0, 40)}...`);

        // Получаем изображение с детальной страницы
        const imageUrl = await scraperService.scrapeCarDetail(car.url);

        if (imageUrl) {
          await car.update({ image_url: imageUrl });
          console.log(`✅ Изображение добавлено\n`);
          updated++;
        } else {
          console.log(`⚠️  Изображение не найдено\n`);
          failed++;
        }

        // Задержка между запросами
        await scraperService.delay(2500);

      } catch (error) {
        console.error(`❌ Ошибка: ${error.message}\n`);
        failed++;
      }
    }

    console.log('\n📊 РЕЗУЛЬТАТЫ:');
    console.log(`✅ Обновлено: ${updated}`);
    console.log(`❌ Не удалось: ${failed}`);
    console.log(`📝 Всего обработано: ${carsWithoutImages.length}\n`);

    console.log('🎉 ГОТОВО!');

  } catch (error) {
    console.error('❌ ОШИБКА:', error.message);
    console.error(error.stack);
    process.exit(1);
  }
}

updateImages();
