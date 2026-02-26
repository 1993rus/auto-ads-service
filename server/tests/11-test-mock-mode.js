/**
 * Тест mock режима скрапера
 *
 * Запуск: SCRAPER_MODE=mock node tests/11-test-mock-mode.js
 */

// Устанавливаем mock режим перед загрузкой модуля
process.env.SCRAPER_MODE = 'mock';

const scraperService = require('../services/scraper.service');

async function testMockMode() {
  console.log('=== ТЕСТ MOCK РЕЖИМА СКРАПЕРА ===\n');

  try {
    // Проверяем, что mock режим включен
    if (!scraperService.mockMode) {
      throw new Error('Mock режим не включен! Установите SCRAPER_MODE=mock');
    }

    console.log('✅ Mock режим активирован\n');

    // Тест 1: Скрапинг страницы поиска
    console.log('📋 Тест 1: Скрапинг страницы поиска\n');

    const testUrl = 'https://www.carsensor.net/usedcar/search.php?STID=CS210610&BRDC=TO';
    const startTime = Date.now();

    const cars = await scraperService.scrapeSearchPage(testUrl);

    const endTime = Date.now();
    const duration = (endTime - startTime);

    console.log(`✅ Скрапинг завершён за ${duration}мс`);
    console.log(`📋 Найдено автомобилей: ${cars.length}\n`);

    if (cars.length === 0) {
      throw new Error('Mock данные не вернули автомобили!');
    }

    // Выводим первый автомобиль
    const car = cars[0];
    console.log('Пример автомобиля из mock данных:');
    console.log(`- ID: ${car.external_id}`);
    console.log(`- Марка: ${car.brand}`);
    console.log(`- Модель: ${car.model}`);
    console.log(`- Год: ${car.year}`);
    console.log(`- Цена: ¥${car.price?.toLocaleString()}`);
    console.log(`- Пробег: ${car.mileage?.toLocaleString()} км`);
    console.log(`- КПП: ${car.transmission}`);

    // Тест 2: Скрапинг детальной страницы
    console.log('\n📋 Тест 2: Скрапинг детальной страницы\n');

    const detailUrl = 'https://www.carsensor.net/usedcar/detail/AU6757636162/index.html';
    const imageUrl = await scraperService.scrapeCarDetail(detailUrl);

    if (!imageUrl) {
      throw new Error('Mock режим не вернул изображение!');
    }

    console.log(`✅ Изображение получено: ${imageUrl}\n`);

    // Тест 3: Скрапинг с загрузкой изображений
    console.log('📋 Тест 3: Скрапинг с автоматической загрузкой изображений\n');

    const carsWithImages = await scraperService.scrapeSearchPage(testUrl, true);

    console.log(`✅ Скрапинг с изображениями завершён`);
    console.log(`📋 Найдено автомобилей: ${carsWithImages.length}`);

    const carsWithImagesCount = carsWithImages.filter(c => c.image_url).length;
    console.log(`🖼️  С изображениями: ${carsWithImagesCount}/${carsWithImages.length}\n`);

    // Проверка производительности
    if (duration > 1000) {
      console.log(`⚠️  Внимание: Mock режим слишком медленный (${duration}мс > 1000мс)`);
    }

    console.log('✅ ВСЕ ТЕСТЫ ПРОЙДЕНЫ!');
    console.log('\n📊 Преимущества mock режима:');
    console.log('- Быстрое тестирование без реальных HTTP запросов');
    console.log('- Не нагружает carsensor.net');
    console.log('- Стабильные результаты для автоматизированных тестов');
    console.log('- Работает офлайн');

  } catch (error) {
    console.error('\n❌ ОШИБКА:', error.message);
    console.error('Stack trace:', error.stack);
    process.exit(1);
  }
}

// Запуск теста
testMockMode();
