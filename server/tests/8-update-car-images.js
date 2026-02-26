/**
 * Обновление изображений автомобилей в базе данных
 * Скрапит детальные страницы для получения реальных изображений
 *
 * Запуск: node tests/8-update-car-images.js
 */

require('dotenv').config();
const { Car } = require('../db/models');
const scraperService = require('../services/scraper.service');

async function updateCarImages() {
  console.log('=== ОБНОВЛЕНИЕ ИЗОБРАЖЕНИЙ АВТОМОБИЛЕЙ ===\n');

  try {
    // Получаем все автомобили без изображений
    const carsWithoutImages = await Car.findAll({
      where: {
        image_url: null,
        url: { [require('sequelize').Op.ne]: null }
      },
      order: [['id', 'ASC']]
    });

    console.log(`📋 Найдено автомобилей без изображений: ${carsWithoutImages.length}\n`);

    if (carsWithoutImages.length === 0) {
      console.log('✅ Все автомобили уже имеют изображения!');
      return;
    }

    const stats = {
      total: carsWithoutImages.length,
      updated: 0,
      failed: 0,
      errors: []
    };

    console.log('🔄 Начинаю обработку...\n');

    for (let i = 0; i < carsWithoutImages.length; i++) {
      const car = carsWithoutImages[i];

      console.log(`[${i + 1}/${stats.total}] Обрабатываю: ${car.brand} ${car.model.substring(0, 30)}...`);
      console.log(`   ID: ${car.id}, External ID: ${car.external_id}`);
      console.log(`   URL: ${car.url}`);

      try {
        // Скрапим детальную страницу для получения изображения
        const imageUrl = await scraperService.scrapeCarDetail(car.url);

        if (imageUrl) {
          // Обновляем запись в БД
          await car.update({ image_url: imageUrl });

          console.log(`   ✅ Изображение найдено и сохранено: ${imageUrl.substring(0, 80)}...`);
          stats.updated++;
        } else {
          console.log(`   ⚠️  Изображение не найдено`);
          stats.failed++;
          stats.errors.push({
            id: car.id,
            external_id: car.external_id,
            error: 'Изображение не найдено на детальной странице'
          });
        }

        // Задержка между запросами для соблюдения rate limiting
        if (i < carsWithoutImages.length - 1) {
          await scraperService.delay(2500); // 2.5 секунды между запросами
          console.log('');
        }

      } catch (error) {
        console.log(`   ❌ Ошибка: ${error.message}`);
        stats.failed++;
        stats.errors.push({
          id: car.id,
          external_id: car.external_id,
          error: error.message
        });
      }
    }

    console.log('\n\n✅ ОБНОВЛЕНИЕ ЗАВЕРШЕНО!\n');
    console.log('📊 Статистика:');
    console.log(`   Всего обработано: ${stats.total}`);
    console.log(`   Успешно обновлено: ${stats.updated}`);
    console.log(`   Не найдено/ошибки: ${stats.failed}`);

    if (stats.errors.length > 0) {
      console.log('\n⚠️  Детали ошибок:');
      stats.errors.forEach((err, i) => {
        console.log(`   ${i + 1}. ID ${err.id} (${err.external_id}): ${err.error}`);
      });
    }

    // Выводим финальную статистику из БД
    const totalCars = await Car.count();
    const carsWithImages = await Car.count({
      where: {
        image_url: { [require('sequelize').Op.ne]: null }
      }
    });

    console.log('\n📈 Общая статистика по базе данных:');
    console.log(`   Всего автомобилей: ${totalCars}`);
    console.log(`   С изображениями: ${carsWithImages}`);
    console.log(`   Без изображений: ${totalCars - carsWithImages}`);
    console.log(`   Процент покрытия: ${((carsWithImages / totalCars) * 100).toFixed(1)}%`);

  } catch (error) {
    console.error('\n❌ КРИТИЧЕСКАЯ ОШИБКА:', error.message);
    console.error('Stack trace:', error.stack);
    process.exit(1);
  }
}

// Запуск обновления
updateCarImages();
