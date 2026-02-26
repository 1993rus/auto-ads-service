/**
 * Тест кеш-архитектуры
 *
 * Проверяет:
 * 1. Проверка валидности кеша (isCacheValid)
 * 2. Обновление кеша (refreshCache)
 * 3. Установка cached_at при создании записей
 * 4. TTL логика (кеш устаревает через 1 минуту)
 *
 * Запуск: SCRAPER_MODE=mock node tests/13-test-cache-architecture.js
 */

// Устанавливаем mock режим для быстрого тестирования
process.env.SCRAPER_MODE = 'mock';
process.env.SCRAPER_WITH_IMAGES = 'false';

require('dotenv').config();
const carService = require('../services/car.service');
const { Car } = require('../db/models');

async function testCacheArchitecture() {
  console.log('=== ТЕСТ КЕША (CACHE ARCHITECTURE) ===\n');

  try {
    // Тест 1: Очистка БД перед тестом
    console.log('📋 Тест 1: Очистка БД\n');
    await Car.destroy({ where: {}, truncate: true });
    console.log('✅ БД очищена\n');

    // Тест 2: Проверка пустого кеша
    console.log('📋 Тест 2: Проверка пустого кеша\n');
    const isValidEmpty = await carService.isCacheValid(1);
    console.log(`Кеш валиден (пустая БД): ${isValidEmpty}`);

    if (isValidEmpty) {
      throw new Error('Пустой кеш не должен быть валидным!');
    }
    console.log('✅ Пустой кеш правильно определяется как невалидный\n');

    // Тест 3: Добавление данных в кеш
    console.log('📋 Тест 3: Добавление данных в кеш через refreshCache\n');

    const mockCarsData = [
      {
        external_id: 'CACHE_TEST_001',
        url: 'https://www.carsensor.net/usedcar/detail/CACHE_TEST_001/index.html',
        brand: 'Toyota',
        model: 'Prius',
        year: 2023,
        price: 2500000,
        color: '白',
        mileage: 1000,
        transmission: 'CVT',
        fuel_type: 'Hybrid',
        body_type: 'Sedan',
        location: '東京都',
        description: 'Test car for cache'
      },
      {
        external_id: 'CACHE_TEST_002',
        url: 'https://www.carsensor.net/usedcar/detail/CACHE_TEST_002/index.html',
        brand: 'Honda',
        model: 'Civic',
        year: 2024,
        price: 3000000,
        color: '黒',
        mileage: 500,
        transmission: 'CVT',
        fuel_type: 'Gasoline',
        body_type: 'Sedan',
        location: '大阪府',
        description: 'Another test car'
      }
    ];

    const added = await carService.refreshCache(mockCarsData);
    console.log(`✅ Добавлено записей: ${added}\n`);

    if (added !== 2) {
      throw new Error(`Ожидалось 2 записи, добавлено ${added}`);
    }

    // Тест 4: Проверка валидного кеша
    console.log('📋 Тест 4: Проверка свежего кеша\n');
    const isValidFresh = await carService.isCacheValid(1);
    console.log(`Кеш валиден (свежие данные): ${isValidFresh}`);

    if (!isValidFresh) {
      throw new Error('Свежий кеш должен быть валидным!');
    }
    console.log('✅ Свежий кеш правильно определяется как валидный\n');

    // Тест 5: Проверка cached_at в записях
    console.log('📋 Тест 5: Проверка поля cached_at в записях\n');
    const cars = await Car.findAll();

    let allHaveCachedAt = true;
    cars.forEach((car, index) => {
      console.log(`Автомобиль ${index + 1}:`);
      console.log(`  External ID: ${car.external_id}`);
      console.log(`  cached_at: ${car.cached_at}`);
      console.log(`  last_scraped_at: ${car.last_scraped_at}\n`);

      if (!car.cached_at) {
        allHaveCachedAt = false;
      }
    });

    if (!allHaveCachedAt) {
      throw new Error('Не все записи имеют поле cached_at!');
    }
    console.log('✅ Все записи имеют поле cached_at\n');

    // Тест 6: Проверка устаревшего кеша
    console.log('📋 Тест 6: Проверка устаревшего кеша (симуляция)\n');

    // Устанавливаем cached_at на 2 минуты назад
    const twoMinutesAgo = new Date(Date.now() - 2 * 60 * 1000);
    await Car.update(
      { cached_at: twoMinutesAgo },
      { where: {} }
    );

    const isValidStale = await carService.isCacheValid(1);
    console.log(`Кеш валиден (2 минуты назад, TTL=1): ${isValidStale}`);

    if (isValidStale) {
      throw new Error('Устаревший кеш не должен быть валидным!');
    }
    console.log('✅ Устаревший кеш правильно определяется как невалидный\n');

    // Тест 7: Обновление кеша
    console.log('📋 Тест 7: Обновление кеша с новыми данными\n');

    const newMockData = [
      {
        external_id: 'CACHE_TEST_003',
        url: 'https://www.carsensor.net/usedcar/detail/CACHE_TEST_003/index.html',
        brand: 'Nissan',
        model: 'Leaf',
        year: 2025,
        price: 3500000,
        color: '青',
        mileage: 100,
        transmission: 'AT',
        fuel_type: 'Electric',
        body_type: 'Hatchback',
        location: '神奈川県',
        description: 'Electric car'
      }
    ];

    await carService.refreshCache(newMockData);

    const carsAfterRefresh = await Car.findAll();
    console.log(`Записей после обновления кеша: ${carsAfterRefresh.length}`);

    if (carsAfterRefresh.length !== 1) {
      throw new Error('После refreshCache должна быть только 1 запись (старые удалены)!');
    }

    if (carsAfterRefresh[0].external_id !== 'CACHE_TEST_003') {
      throw new Error('После refreshCache должна быть новая запись!');
    }

    console.log('✅ refreshCache правильно очищает старые и добавляет новые записи\n');

    // Тест 8: Резюме
    console.log('\n📊 РЕЗЮМЕ ТЕСТИРОВАНИЯ\n');
    console.log('✅ Тест 1: Очистка БД - ПРОЙДЕН');
    console.log('✅ Тест 2: Проверка пустого кеша - ПРОЙДЕН');
    console.log('✅ Тест 3: Добавление данных в кеш - ПРОЙДЕН');
    console.log('✅ Тест 4: Проверка свежего кеша - ПРОЙДЕН');
    console.log('✅ Тест 5: Поле cached_at заполнено - ПРОЙДЕН');
    console.log('✅ Тест 6: Проверка устаревшего кеша - ПРОЙДЕН');
    console.log('✅ Тест 7: Обновление кеша - ПРОЙДЕН');
    console.log('\n🎉 ВСЕ ТЕСТЫ ПРОЙДЕНЫ!\n');

    console.log('📋 Архитектура кеша работает корректно:\n');
    console.log('✅ 1. isCacheValid проверяет TTL кеша');
    console.log('✅ 2. refreshCache очищает и обновляет кеш');
    console.log('✅ 3. cached_at устанавливается автоматически');
    console.log('✅ 4. Устаревший кеш правильно определяется');

  } catch (error) {
    console.error('\n❌ ОШИБКА:', error.message);
    console.error('Stack trace:', error.stack);
    process.exit(1);
  }
}

// Запуск теста
testCacheArchitecture();
