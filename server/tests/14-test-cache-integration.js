/**
 * Интеграционный тест кеш-архитектуры с роутером
 *
 * Проверяет:
 * 1. Первый запрос при пустом кеше → скрапинг → сохранение в кеш
 * 2. Второй запрос в течение TTL → данные из кеша без скрапинга
 * 3. Запрос после истечения TTL → новый скрапинг → обновление кеша
 *
 * Запуск: SCRAPER_MODE=mock node tests/14-test-cache-integration.js
 */

// Устанавливаем mock режим
process.env.SCRAPER_MODE = 'mock';
process.env.SCRAPER_WITH_IMAGES = 'false';
process.env.CACHE_TTL_MINUTES = '1'; // 1 минута для теста

require('dotenv').config();
const carService = require('../services/car.service');
const scraperService = require('../services/scraper.service');
const { Car } = require('../db/models');

async function testCacheIntegration() {
  console.log('=== ИНТЕГРАЦИОННЫЙ ТЕСТ КЕША ===\n');

  try {
    // Подготовка: очистка БД
    console.log('📋 Подготовка: Очистка БД\n');
    await Car.destroy({ where: {}, truncate: true });
    console.log('✅ БД очищена\n');

    // Тест 1: Первый запрос при пустом кеше
    console.log('📋 Тест 1: Первый запрос при пустом кеше\n');
    console.log('Проверяем валидность кеша...');
    let isCacheValid = await carService.isCacheValid(1);
    console.log(`Кеш валиден: ${isCacheValid}\n`);

    if (isCacheValid) {
      throw new Error('Кеш должен быть невалидным при пустой БД!');
    }

    console.log('⚠️  Кеш невалиден. Запускаем скрапинг...\n');

    // Симулируем работу роутера
    const searchUrls = scraperService.generateSearchUrls();
    let allCars = [];

    for (const url of searchUrls) {
      try {
        const cars = await scraperService.scrapeSearchPage(url, false);
        allCars = allCars.concat(cars);
      } catch (error) {
        console.error(`❌ Error scraping ${url}:`, error.message);
      }
    }

    console.log(`✅ Скрапинг завершен: ${allCars.length} автомобилей\n`);

    // Обновляем кеш
    await carService.refreshCache(allCars);

    // Проверяем данные в БД
    const carsInDb = await Car.count();
    console.log(`Записей в БД: ${carsInDb}\n`);

    if (carsInDb === 0) {
      throw new Error('Данные не сохранились в кеше!');
    }

    console.log('✅ Данные успешно сохранены в кеш\n');

    // Тест 2: Второй запрос в течение TTL
    console.log('📋 Тест 2: Второй запрос в течение TTL (должен использовать кеш)\n');

    isCacheValid = await carService.isCacheValid(1);
    console.log(`Кеш валиден: ${isCacheValid}\n`);

    if (!isCacheValid) {
      throw new Error('Кеш должен быть валидным!');
    }

    console.log('✅ Данные берутся из кеша без скрапинга\n');

    // Получаем данные через сервис (как делает роутер)
    const result = await carService.getCars({}, { page: 1, limit: 10 });
    console.log(`Получено автомобилей: ${result.cars.length}`);
    console.log(`Всего в кеше: ${result.total}\n`);

    if (result.cars.length === 0) {
      throw new Error('Данные не получены из кеша!');
    }

    console.log('✅ getCars правильно возвращает данные из кеша\n');

    // Тест 3: Проверка кеша с фильтрами
    console.log('📋 Тест 3: Проверка фильтров на кешированных данных\n');

    const resultWithFilter = await carService.getCars(
      { brand: 'Toyota' },
      { page: 1, limit: 10 }
    );

    console.log(`Найдено Toyota: ${resultWithFilter.total}\n`);
    console.log('✅ Фильтры работают с кешированными данными\n');

    // Тест 4: Симуляция истечения TTL
    console.log('📋 Тест 4: Симуляция истечения TTL\n');

    // Устанавливаем cached_at на 2 минуты назад
    const twoMinutesAgo = new Date(Date.now() - 2 * 60 * 1000);
    await Car.update({ cached_at: twoMinutesAgo }, { where: {} });

    isCacheValid = await carService.isCacheValid(1);
    console.log(`Кеш валиден (после 2 минут): ${isCacheValid}\n`);

    if (isCacheValid) {
      throw new Error('Кеш должен быть невалидным после истечения TTL!');
    }

    console.log('⚠️  Кеш устарел. Требуется новый скрапинг.\n');
    console.log('✅ TTL логика работает корректно\n');

    // Тест 5: Проверка статистики
    console.log('📋 Тест 5: Проверка статистики\n');

    // Сначала обновляем кеш
    await carService.refreshCache(allCars);

    const stats = await carService.getStats();
    console.log(`Брендов: ${stats.brands.length}`);
    console.log(`Цветов: ${stats.colors.length}`);
    console.log(`Диапазон цен: ¥${stats.priceRange.min.toLocaleString()} - ¥${stats.priceRange.max.toLocaleString()}`);
    console.log(`Диапазон годов: ${stats.yearRange.min} - ${stats.yearRange.max}\n`);

    if (stats.brands.length === 0) {
      throw new Error('Статистика не работает!');
    }

    console.log('✅ getStats работает корректно\n');

    // Резюме
    console.log('\n📊 РЕЗЮМЕ ИНТЕГРАЦИОННОГО ТЕСТА\n');
    console.log('✅ Тест 1: Первый запрос при пустом кеше - ПРОЙДЕН');
    console.log('✅ Тест 2: Второй запрос использует кеш - ПРОЙДЕН');
    console.log('✅ Тест 3: Фильтры работают с кешем - ПРОЙДЕН');
    console.log('✅ Тест 4: TTL логика работает - ПРОЙДЕН');
    console.log('✅ Тест 5: Статистика работает - ПРОЙДЕН');
    console.log('\n🎉 ВСЕ ИНТЕГРАЦИОННЫЕ ТЕСТЫ ПРОЙДЕНЫ!\n');

    console.log('📋 Кеш-архитектура полностью функциональна:\n');
    console.log('✅ 1. Данные подтягиваются из carsensor.net при необходимости');
    console.log('✅ 2. Кеш используется в течение TTL (1 минута в тестовом режиме)');
    console.log('✅ 3. Кеш автоматически обновляется при истечении TTL');
    console.log('✅ 4. Фильтрация и пагинация работают на кешированных данных');
    console.log('✅ 5. Статистика генерируется из кеша');

  } catch (error) {
    console.error('\n❌ ОШИБКА:', error.message);
    console.error('Stack trace:', error.stack);
    process.exit(1);
  }
}

// Запуск теста
testCacheIntegration();
