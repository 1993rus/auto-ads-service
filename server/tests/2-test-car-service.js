/**
 * Тест 2: Проверка car.service.js
 * Создает тестовые автомобили и проверяет функции сервиса
 */

require('dotenv').config();
const carService = require('../services/car.service');
const { Car } = require('../db/models');

async function testCarService() {
  console.log('\n========================================');
  console.log('ТЕСТ 2: Проверка car.service.js');
  console.log('========================================\n');

  const results = {
    passed: [],
    failed: []
  };

  const testCars = [
    {
      brand: 'Toyota',
      model: 'Camry',
      year: 2020,
      price: 2500000,
      color: 'Black',
      url: 'https://example.com/car/1',
      external_id: 'TEST_TOYOTA_CAMRY_001',
      mileage: 30000,
      transmission: 'AT',
      fuel_type: 'Gasoline',
      body_type: 'Sedan',
      location: 'Tokyo',
      description: 'Excellent condition Toyota Camry',
      last_scraped_at: new Date()
    },
    {
      brand: 'BMW',
      model: 'X5',
      year: 2021,
      price: 5500000,
      color: 'White',
      url: 'https://example.com/car/2',
      external_id: 'TEST_BMW_X5_002',
      mileage: 15000,
      transmission: 'AT',
      fuel_type: 'Gasoline',
      body_type: 'SUV',
      location: 'Osaka',
      description: 'Luxury BMW X5 with full options',
      last_scraped_at: new Date()
    },
    {
      brand: 'Honda',
      model: 'Civic',
      year: 2019,
      price: 1800000,
      color: 'Silver',
      url: 'https://example.com/car/3',
      external_id: 'TEST_HONDA_CIVIC_003',
      mileage: 45000,
      transmission: 'MT',
      fuel_type: 'Gasoline',
      body_type: 'Sedan',
      location: 'Nagoya',
      description: 'Reliable Honda Civic manual transmission',
      last_scraped_at: new Date()
    }
  ];

  try {
    console.log('Очистка тестовых данных...');
    // Удаляем старые тестовые данные
    await Car.destroy({
      where: {
        external_id: testCars.map(car => car.external_id)
      }
    });
    console.log('✓ Тестовые данные очищены\n');

    // Тест 1: Создание нового автомобиля (upsertCar)
    console.log('--- Тест: Создание нового автомобиля ---');
    try {
      const result1 = await carService.upsertCar(testCars[0]);

      if (result1.created === true && result1.car) {
        console.log(`✓ Автомобиль создан: ${result1.car.brand} ${result1.car.model}`);
        console.log(`  ID: ${result1.car.id}, External ID: ${result1.car.external_id}`);
        results.passed.push('Создание нового автомобиля');
      } else {
        console.log('✗ Автомобиль не был создан');
        results.failed.push('Создание нового автомобиля');
      }
    } catch (error) {
      console.log('✗ Ошибка при создании:', error.message);
      results.failed.push(`Создание нового автомобиля: ${error.message}`);
    }

    // Тест 2: Обновление существующего автомобиля
    console.log('\n--- Тест: Обновление существующего автомобиля ---');
    try {
      const updatedCarData = {
        ...testCars[0],
        price: 2300000, // Изменяем цену
        mileage: 32000  // Изменяем пробег
      };

      const result2 = await carService.upsertCar(updatedCarData);

      if (result2.created === false && result2.updated === true) {
        console.log(`✓ Автомобиль обновлен: новая цена ${result2.car.price}`);
        console.log(`  Новый пробег: ${result2.car.mileage}`);
        results.passed.push('Обновление существующего автомобиля');
      } else {
        console.log('✗ Автомобиль не был обновлен правильно');
        results.failed.push('Обновление существующего автомобиля');
      }
    } catch (error) {
      console.log('✗ Ошибка при обновлении:', error.message);
      results.failed.push(`Обновление существующего автомобиля: ${error.message}`);
    }

    // Тест 3: detectChanges метод
    console.log('\n--- Тест: detectChanges метод ---');
    try {
      const existingCar = await Car.findOne({
        where: { external_id: testCars[0].external_id }
      });

      // Используем актуальные данные из БД (после обновления в тесте 2)
      const unchangedData = {
        price: 2300000,  // Обновлённая цена из теста 2
        mileage: 32000   // Обновлённый пробег из теста 2
      };
      const changedData = { price: 9999999 };

      const noChanges = carService.detectChanges(existingCar, unchangedData);
      const hasChanges = carService.detectChanges(existingCar, changedData);

      if (noChanges === false && hasChanges === true) {
        console.log('✓ detectChanges работает корректно');
        console.log(`  Без изменений: ${noChanges}`);
        console.log(`  С изменениями: ${hasChanges}`);
        results.passed.push('detectChanges метод');
      } else {
        console.log('✗ detectChanges работает некорректно');
        console.log(`  Ожидалось: noChanges=false, hasChanges=true`);
        console.log(`  Получено: noChanges=${noChanges}, hasChanges=${hasChanges}`);
        results.failed.push('detectChanges метод');
      }
    } catch (error) {
      console.log('✗ Ошибка в detectChanges:', error.message);
      results.failed.push(`detectChanges метод: ${error.message}`);
    }

    // Тест 4: Массовый upsert (bulkUpsert)
    console.log('\n--- Тест: Массовый upsert (bulkUpsert) ---');
    try {
      const bulkResult = await carService.bulkUpsert([testCars[1], testCars[2]]);

      console.log(`  Добавлено: ${bulkResult.added}`);
      console.log(`  Обновлено: ${bulkResult.updated}`);
      console.log(`  Без изменений: ${bulkResult.unchanged}`);
      console.log(`  Ошибок: ${bulkResult.errors.length}`);

      if (bulkResult.added === 2 && bulkResult.errors.length === 0) {
        console.log('✓ Массовый upsert работает корректно');
        results.passed.push('Массовый upsert');
      } else if (bulkResult.added > 0 || bulkResult.updated > 0) {
        console.log('⚠ Массовый upsert работает частично');
        results.passed.push('Массовый upsert (частично)');
      } else {
        console.log('✗ Массовый upsert не работает');
        results.failed.push('Массовый upsert');
      }
    } catch (error) {
      console.log('✗ Ошибка в bulkUpsert:', error.message);
      results.failed.push(`Массовый upsert: ${error.message}`);
    }

    // Тест 5: Получение автомобилей с фильтрами
    console.log('\n--- Тест: Получение автомобилей с фильтрами ---');
    try {
      // Фильтр по марке
      const toyotaCars = await carService.getCars({ brand: 'Toyota' }, { limit: 10 });

      if (toyotaCars.cars.length > 0 && toyotaCars.cars[0].brand === 'Toyota') {
        console.log(`✓ Фильтр по марке: найдено ${toyotaCars.cars.length} Toyota`);
        results.passed.push('Фильтр по марке');
      } else {
        console.log('✗ Фильтр по марке не работает');
        results.failed.push('Фильтр по марке');
      }

      // Фильтр по цене
      const expensiveCars = await carService.getCars(
        { minPrice: 3000000 },
        { limit: 10 }
      );

      const allExpensive = expensiveCars.cars.every(car => parseFloat(car.price) >= 3000000);

      if (expensiveCars.cars.length > 0 && allExpensive) {
        console.log(`✓ Фильтр по цене: найдено ${expensiveCars.cars.length} автомобилей дороже 3M`);
        results.passed.push('Фильтр по цене');
      } else {
        console.log('✗ Фильтр по цене не работает');
        results.failed.push('Фильтр по цене');
      }

    } catch (error) {
      console.log('✗ Ошибка при получении автомобилей:', error.message);
      results.failed.push(`Получение автомобилей: ${error.message}`);
    }

    // Тест 6: Пагинация
    console.log('\n--- Тест: Пагинация ---');
    try {
      const page1 = await carService.getCars({}, { page: 1, limit: 2 });
      const page2 = await carService.getCars({}, { page: 2, limit: 2 });

      if (page1.cars.length > 0 && page1.page === 1 && page1.limit === 2) {
        console.log(`✓ Пагинация работает: страница 1, записей ${page1.cars.length}`);
        console.log(`  Всего: ${page1.total}, страниц: ${page1.totalPages}`);
        results.passed.push('Пагинация');
      } else {
        console.log('✗ Пагинация не работает');
        results.failed.push('Пагинация');
      }
    } catch (error) {
      console.log('✗ Ошибка в пагинации:', error.message);
      results.failed.push(`Пагинация: ${error.message}`);
    }

    // Тест 7: Получение автомобиля по ID
    console.log('\n--- Тест: Получение автомобиля по ID ---');
    try {
      const car = await Car.findOne({ where: { external_id: testCars[0].external_id } });
      const foundCar = await carService.getCarById(car.id);

      if (foundCar && foundCar.id === car.id) {
        console.log(`✓ Получение по ID: найден ${foundCar.brand} ${foundCar.model}`);
        results.passed.push('Получение автомобиля по ID');
      } else {
        console.log('✗ Получение по ID не работает');
        results.failed.push('Получение автомобиля по ID');
      }
    } catch (error) {
      console.log('✗ Ошибка при получении по ID:', error.message);
      results.failed.push(`Получение автомобиля по ID: ${error.message}`);
    }

    // Тест 8: Статистика
    console.log('\n--- Тест: Получение статистики ---');
    try {
      const stats = await carService.getStats();

      if (stats.total >= 3 && stats.topBrands && stats.averagePrice) {
        console.log(`✓ Статистика работает:`);
        console.log(`  Всего автомобилей: ${stats.total}`);
        console.log(`  Средняя цена: ${Math.round(stats.averagePrice)}`);
        console.log(`  Топ брендов: ${stats.topBrands.length}`);
        results.passed.push('Получение статистики');
      } else {
        console.log('✗ Статистика не работает полностью');
        results.failed.push('Получение статистики');
      }
    } catch (error) {
      console.log('✗ Ошибка при получении статистики:', error.message);
      results.failed.push(`Получение статистики: ${error.message}`);
    }

  } catch (error) {
    console.error('\n✗ КРИТИЧЕСКАЯ ОШИБКА:', error.message);
    results.failed.push(`Критическая ошибка: ${error.message}`);
  }

  // Результаты
  console.log('\n========================================');
  console.log('РЕЗУЛЬТАТЫ ТЕСТА 2');
  console.log('========================================');
  console.log(`✓ Пройдено тестов: ${results.passed.length}`);
  console.log(`✗ Провалено тестов: ${results.failed.length}`);

  if (results.failed.length > 0) {
    console.log('\nПроваленные тесты:');
    results.failed.forEach(test => console.log(`  - ${test}`));
  }

  return results;
}

// Запуск теста
if (require.main === module) {
  testCarService()
    .then(results => {
      process.exit(results.failed.length > 0 ? 1 : 0);
    })
    .catch(error => {
      console.error('Критическая ошибка:', error);
      process.exit(1);
    });
}

module.exports = testCarService;
