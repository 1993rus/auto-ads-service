/**
 * Тест 4: Проверка API endpoints
 * Тестирует GET /api/cars с фильтрами и пагинацией
 */

require('dotenv').config();
const axios = require('axios');

const API_URL = `http://localhost:${process.env.PORT || 5001}`;

// Для тестирования нужен токен - используем тестовый или создаем
// В реальной системе нужно сначала залогиниться
let accessToken = null;

async function testAPIEndpoints() {
  console.log('\n========================================');
  console.log('ТЕСТ 4: Проверка API endpoints');
  console.log('========================================\n');

  const results = {
    passed: [],
    failed: []
  };

  console.log(`Тестируем API на: ${API_URL}\n`);

  // Проверка, что сервер запущен
  console.log('--- Проверка: Сервер запущен ---');
  try {
    const response = await axios.get(`${API_URL}/api/status`, {
      timeout: 5000
    });

    if (response.status === 200 && response.data.message === 'ok') {
      console.log(`✓ Сервер работает: ${response.data.message}`);
      console.log(`  Uptime: ${Math.round(response.data.uptime)}s`);
      results.passed.push('Сервер запущен');
    } else {
      console.log('✗ Сервер не отвечает корректно');
      results.failed.push('Сервер запущен');
      return results;
    }
  } catch (error) {
    console.log('✗ Сервер не доступен:', error.message);
    console.log('\n⚠ ВНИМАНИЕ: Для запуска тестов API необходимо:');
    console.log('  1. Запустить сервер: npm run dev');
    console.log('  2. Убедиться, что порт 5001 свободен');
    console.log('  3. Запустить этот тест в отдельном терминале\n');
    results.failed.push('Сервер не доступен - запустите сервер перед тестированием');
    return results;
  }

  // Примечание: API требует авторизации
  console.log('\n--- ПРИМЕЧАНИЕ ---');
  console.log('API endpoints /api/cars требуют JWT токена (verifyAccessToken)');
  console.log('Для полного тестирования необходимо:');
  console.log('1. Зарегистрировать пользователя через /api/users/register');
  console.log('2. Получить accessToken через /api/users/login');
  console.log('3. Использовать токен в заголовке Authorization\n');

  // Тест 1: GET /api/cars без авторизации (должен вернуть 401)
  console.log('--- Тест: GET /api/cars без авторизации ---');
  try {
    await axios.get(`${API_URL}/api/cars`);
    console.log('✗ API позволил доступ без токена (проблема безопасности)');
    results.failed.push('Проверка авторизации');
  } catch (error) {
    if (error.response && error.response.status === 401) {
      console.log('✓ API корректно требует авторизацию (401)');
      results.passed.push('Проверка авторизации');
    } else {
      console.log(`⚠ Неожиданный ответ: ${error.response?.status || error.message}`);
      results.failed.push('Проверка авторизации');
    }
  }

  // Попытка получить токен для дальнейших тестов
  console.log('\n--- Попытка получения токена ---');
  try {
    // Пытаемся зарегистрировать тестового пользователя
    const testUser = {
      name: 'Test User',
      email: `test_${Date.now()}@example.com`,
      password: 'testpassword123'
    };

    try {
      const registerResponse = await axios.post(
        `${API_URL}/api/users/register`,
        testUser
      );

      if (registerResponse.data.accessToken) {
        accessToken = registerResponse.data.accessToken;
        console.log('✓ Получен токен через регистрацию');
        results.passed.push('Получение токена');
      }
    } catch (regError) {
      // Если регистрация не удалась, пробуем логин с дефолтным пользователем
      console.log('⚠ Регистрация не удалась, пропускаем авторизованные тесты');
    }
  } catch (error) {
    console.log('⚠ Не удалось получить токен для тестов:', error.message);
  }

  // Если есть токен, делаем авторизованные запросы
  if (accessToken) {
    const axiosWithAuth = axios.create({
      baseURL: API_URL,
      headers: {
        'Authorization': `Bearer ${accessToken}`
      }
    });

    // Тест 2: GET /api/cars с авторизацией
    console.log('\n--- Тест: GET /api/cars (базовый запрос) ---');
    try {
      const response = await axiosWithAuth.get('/api/cars');

      if (response.status === 200 && response.data.cars) {
        console.log(`✓ GET /api/cars работает`);
        console.log(`  Найдено автомобилей: ${response.data.total}`);
        console.log(`  Страница: ${response.data.page}/${response.data.totalPages}`);
        console.log(`  Лимит: ${response.data.limit}`);
        results.passed.push('GET /api/cars базовый');
      } else {
        console.log('✗ GET /api/cars не вернул корректные данные');
        results.failed.push('GET /api/cars базовый');
      }
    } catch (error) {
      console.log('✗ Ошибка GET /api/cars:', error.response?.data || error.message);
      results.failed.push(`GET /api/cars базовый: ${error.message}`);
    }

    // Тест 3: Фильтр по марке
    console.log('\n--- Тест: Фильтр по марке (brand=Toyota) ---');
    try {
      const response = await axiosWithAuth.get('/api/cars?brand=Toyota');

      if (response.status === 200) {
        const allToyota = response.data.cars.every(car =>
          car.brand.toLowerCase().includes('toyota')
        );

        if (allToyota || response.data.cars.length === 0) {
          console.log(`✓ Фильтр по марке работает`);
          console.log(`  Найдено Toyota: ${response.data.cars.length}`);
          results.passed.push('Фильтр по марке');
        } else {
          console.log('✗ Фильтр по марке не работает корректно');
          results.failed.push('Фильтр по марке');
        }
      }
    } catch (error) {
      console.log('✗ Ошибка фильтра по марке:', error.message);
      results.failed.push(`Фильтр по марке: ${error.message}`);
    }

    // Тест 4: Фильтр по цене
    console.log('\n--- Тест: Фильтр по цене (minPrice=2000000, maxPrice=3000000) ---');
    try {
      const response = await axiosWithAuth.get('/api/cars?minPrice=2000000&maxPrice=3000000');

      if (response.status === 200) {
        const allInRange = response.data.cars.every(car =>
          parseFloat(car.price) >= 2000000 && parseFloat(car.price) <= 3000000
        );

        if (allInRange || response.data.cars.length === 0) {
          console.log(`✓ Фильтр по цене работает`);
          console.log(`  Найдено в диапазоне: ${response.data.cars.length}`);
          results.passed.push('Фильтр по цене');
        } else {
          console.log('✗ Фильтр по цене не работает корректно');
          results.failed.push('Фильтр по цене');
        }
      }
    } catch (error) {
      console.log('✗ Ошибка фильтра по цене:', error.message);
      results.failed.push(`Фильтр по цене: ${error.message}`);
    }

    // Тест 5: Пагинация
    console.log('\n--- Тест: Пагинация (page=1, limit=5) ---');
    try {
      const response = await axiosWithAuth.get('/api/cars?page=1&limit=5');

      if (response.status === 200) {
        const isCorrectPage = response.data.page === 1;
        const isCorrectLimit = response.data.limit === 5;
        const carsCount = response.data.cars.length;

        if (isCorrectPage && isCorrectLimit && carsCount <= 5) {
          console.log(`✓ Пагинация работает`);
          console.log(`  Страница: ${response.data.page}, Лимит: ${response.data.limit}`);
          console.log(`  Получено записей: ${carsCount}`);
          results.passed.push('Пагинация');
        } else {
          console.log('✗ Пагинация не работает корректно');
          results.failed.push('Пагинация');
        }
      }
    } catch (error) {
      console.log('✗ Ошибка пагинации:', error.message);
      results.failed.push(`Пагинация: ${error.message}`);
    }

    // Тест 6: Сортировка
    console.log('\n--- Тест: Сортировка (sortBy=price, sortOrder=ASC) ---');
    try {
      const response = await axiosWithAuth.get('/api/cars?sortBy=price&sortOrder=ASC&limit=10');

      if (response.status === 200 && response.data.cars.length > 1) {
        // Проверяем, что цены идут по возрастанию
        let isSorted = true;
        for (let i = 1; i < response.data.cars.length; i++) {
          if (parseFloat(response.data.cars[i].price) < parseFloat(response.data.cars[i - 1].price)) {
            isSorted = false;
            break;
          }
        }

        if (isSorted) {
          console.log(`✓ Сортировка работает`);
          console.log(`  Первая цена: ${response.data.cars[0].price}`);
          console.log(`  Последняя цена: ${response.data.cars[response.data.cars.length - 1].price}`);
          results.passed.push('Сортировка');
        } else {
          console.log('✗ Сортировка не работает корректно');
          results.failed.push('Сортировка');
        }
      } else if (response.data.cars.length <= 1) {
        console.log('⚠ Недостаточно данных для проверки сортировки');
        results.passed.push('Сортировка (недостаточно данных)');
      }
    } catch (error) {
      console.log('✗ Ошибка сортировки:', error.message);
      results.failed.push(`Сортировка: ${error.message}`);
    }

    // Тест 7: GET /api/cars/stats
    console.log('\n--- Тест: GET /api/cars/stats ---');
    try {
      const response = await axiosWithAuth.get('/api/cars/stats');

      if (response.status === 200 && response.data.total !== undefined) {
        console.log(`✓ GET /api/cars/stats работает`);
        console.log(`  Всего автомобилей: ${response.data.total}`);
        console.log(`  Средняя цена: ${Math.round(response.data.averagePrice)}`);
        console.log(`  Топ брендов: ${response.data.topBrands?.length || 0}`);
        results.passed.push('GET /api/cars/stats');
      } else {
        console.log('✗ GET /api/cars/stats не вернул корректные данные');
        results.failed.push('GET /api/cars/stats');
      }
    } catch (error) {
      console.log('✗ Ошибка GET /api/cars/stats:', error.message);
      results.failed.push(`GET /api/cars/stats: ${error.message}`);
    }

    // Тест 8: GET /api/cars/:id
    console.log('\n--- Тест: GET /api/cars/:id ---');
    try {
      // Сначала получаем список для получения ID
      const listResponse = await axiosWithAuth.get('/api/cars?limit=1');

      if (listResponse.data.cars.length > 0) {
        const carId = listResponse.data.cars[0].id;
        const response = await axiosWithAuth.get(`/api/cars/${carId}`);

        if (response.status === 200 && response.data.id === carId) {
          console.log(`✓ GET /api/cars/:id работает`);
          console.log(`  Получен: ${response.data.brand} ${response.data.model}`);
          results.passed.push('GET /api/cars/:id');
        } else {
          console.log('✗ GET /api/cars/:id не вернул корректные данные');
          results.failed.push('GET /api/cars/:id');
        }
      } else {
        console.log('⚠ Нет данных для тестирования GET /api/cars/:id');
        results.passed.push('GET /api/cars/:id (нет данных)');
      }
    } catch (error) {
      console.log('✗ Ошибка GET /api/cars/:id:', error.message);
      results.failed.push(`GET /api/cars/:id: ${error.message}`);
    }

    // Тест 9: Несуществующий ID
    console.log('\n--- Тест: GET /api/cars/:id с несуществующим ID ---');
    try {
      await axiosWithAuth.get('/api/cars/999999999');
      console.log('✗ API не вернул 404 для несуществующего ID');
      results.failed.push('404 для несуществующего ID');
    } catch (error) {
      if (error.response && error.response.status === 404) {
        console.log('✓ API корректно возвращает 404 для несуществующего ID');
        results.passed.push('404 для несуществующего ID');
      } else {
        console.log(`⚠ Неожиданный ответ: ${error.response?.status}`);
        results.failed.push('404 для несуществующего ID');
      }
    }

  } else {
    console.log('\n⚠ Пропущены авторизованные тесты (нет токена)');
  }

  // Результаты
  console.log('\n========================================');
  console.log('РЕЗУЛЬТАТЫ ТЕСТА 4');
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
  testAPIEndpoints()
    .then(results => {
      process.exit(results.failed.length > 0 ? 1 : 0);
    })
    .catch(error => {
      console.error('Критическая ошибка:', error);
      process.exit(1);
    });
}

module.exports = testAPIEndpoints;
