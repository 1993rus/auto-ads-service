/**
 * Главный тестовый скрипт
 * Запускает все тесты последовательно и создает итоговый отчет
 */

require('dotenv').config();

const testMigrations = require('./1-test-migrations');
const testCarService = require('./2-test-car-service');
const testScraperService = require('./3-test-scraper-service');
// API тесты запускаются отдельно, т.к. требуют запущенного сервера

async function runAllTests() {
  console.log('\n');
  console.log('╔════════════════════════════════════════════════╗');
  console.log('║   AUTO-ADS-SERVICE: ПОЛНОЕ ТЕСТИРОВАНИЕ       ║');
  console.log('╚════════════════════════════════════════════════╝');
  console.log('\n');

  const allResults = {
    migrations: null,
    carService: null,
    scraperService: null,
    totalPassed: 0,
    totalFailed: 0
  };

  // Тест 1: Миграции БД
  try {
    console.log('📋 Запуск теста миграций БД...');
    allResults.migrations = await testMigrations();
    allResults.totalPassed += allResults.migrations.passed.length;
    allResults.totalFailed += allResults.migrations.failed.length;
  } catch (error) {
    console.error('❌ Критическая ошибка в тесте миграций:', error.message);
    allResults.migrations = { passed: [], failed: ['Критическая ошибка'] };
    allResults.totalFailed += 1;
  }

  // Задержка между тестами
  await delay(1000);

  // Тест 2: Car Service
  try {
    console.log('\n📋 Запуск теста car.service.js...');
    allResults.carService = await testCarService();
    allResults.totalPassed += allResults.carService.passed.length;
    allResults.totalFailed += allResults.carService.failed.length;
  } catch (error) {
    console.error('❌ Критическая ошибка в тесте car.service:', error.message);
    allResults.carService = { passed: [], failed: ['Критическая ошибка'] };
    allResults.totalFailed += 1;
  }

  // Задержка между тестами
  await delay(1000);

  // Тест 3: Scraper Service
  try {
    console.log('\n📋 Запуск теста scraper.service.js...');
    allResults.scraperService = await testScraperService();
    allResults.totalPassed += allResults.scraperService.passed.length;
    allResults.totalFailed += allResults.scraperService.failed.length;
  } catch (error) {
    console.error('❌ Критическая ошибка в тесте scraper.service:', error.message);
    allResults.scraperService = { passed: [], failed: ['Критическая ошибка'] };
    allResults.totalFailed += 1;
  }

  // Итоговый отчет
  console.log('\n');
  console.log('╔════════════════════════════════════════════════╗');
  console.log('║            ИТОГОВЫЙ ОТЧЕТ ТЕСТИРОВАНИЯ         ║');
  console.log('╚════════════════════════════════════════════════╝');
  console.log('\n');

  // Детальная статистика по каждому тесту
  console.log('📊 ДЕТАЛЬНАЯ СТАТИСТИКА:\n');

  console.log('1️⃣  Тест миграций БД:');
  console.log(`   ✓ Пройдено: ${allResults.migrations.passed.length}`);
  console.log(`   ✗ Провалено: ${allResults.migrations.failed.length}`);

  console.log('\n2️⃣  Тест car.service.js:');
  console.log(`   ✓ Пройдено: ${allResults.carService.passed.length}`);
  console.log(`   ✗ Провалено: ${allResults.carService.failed.length}`);

  console.log('\n3️⃣  Тест scraper.service.js:');
  console.log(`   ✓ Пройдено: ${allResults.scraperService.passed.length}`);
  console.log(`   ✗ Провалено: ${allResults.scraperService.failed.length}`);

  // Общая статистика
  console.log('\n' + '═'.repeat(50));
  console.log(`✓ ВСЕГО ПРОЙДЕНО:  ${allResults.totalPassed}`);
  console.log(`✗ ВСЕГО ПРОВАЛЕНО: ${allResults.totalFailed}`);
  console.log('═'.repeat(50));

  // Процент успеха
  const total = allResults.totalPassed + allResults.totalFailed;
  const successRate = total > 0 ? ((allResults.totalPassed / total) * 100).toFixed(1) : 0;

  console.log('\n📈 УСПЕШНОСТЬ ТЕСТИРОВАНИЯ:');
  console.log(`   ${successRate}% (${allResults.totalPassed}/${total})\n`);

  // Критические ошибки
  const criticalErrors = [];
  if (allResults.migrations.failed.length > 0) {
    criticalErrors.push(...allResults.migrations.failed.map(e => `[Миграции] ${e}`));
  }
  if (allResults.carService.failed.length > 0) {
    criticalErrors.push(...allResults.carService.failed.map(e => `[CarService] ${e}`));
  }
  if (allResults.scraperService.failed.length > 0) {
    criticalErrors.push(...allResults.scraperService.failed.map(e => `[ScraperService] ${e}`));
  }

  if (criticalErrors.length > 0) {
    console.log('🚨 НАЙДЕННЫЕ ПРОБЛЕМЫ:\n');
    criticalErrors.forEach((error, index) => {
      console.log(`   ${index + 1}. ${error}`);
    });
    console.log('');
  }

  // Рекомендации
  console.log('💡 РЕКОМЕНДАЦИИ:\n');

  if (allResults.migrations.failed.length > 0) {
    console.log('   📌 Миграции БД:');
    console.log('      - Проверьте, что все миграции выполнены: npx sequelize-cli db:migrate');
    console.log('      - Убедитесь, что PostgreSQL запущен и доступен');
    console.log('      - Проверьте настройки подключения в .env файле\n');
  }

  if (allResults.carService.failed.length > 0) {
    console.log('   📌 Car Service:');
    console.log('      - Проверьте корректность SQL запросов');
    console.log('      - Убедитесь, что модели Sequelize настроены правильно');
    console.log('      - Проверьте валидацию данных в моделях\n');
  }

  if (allResults.scraperService.failed.length > 0) {
    console.log('   📌 Scraper Service:');
    console.log('      - Селекторы cheerio могут не совпадать с реальной структурой сайта');
    console.log('      - Протестируйте на реальных HTML страницах');
    console.log('      - Обновите селекторы в соответствии со структурой carsensor.net\n');
  }

  console.log('   📌 API Тесты (не выполнены):');
  console.log('      - Запустите сервер: npm run dev');
  console.log('      - Запустите API тесты: node tests/4-test-api-endpoints.js\n');

  // Следующие шаги
  console.log('🎯 СЛЕДУЮЩИЕ ШАГИ:\n');
  console.log('   1. Исправьте найденные ошибки');
  console.log('   2. Запустите сервер для тестирования API');
  console.log('   3. Протестируйте scraper на реальных данных');
  console.log('   4. Настройте автоматические тесты с Jest');
  console.log('   5. Добавьте мониторинг и логирование\n');

  // Заключение
  if (allResults.totalFailed === 0) {
    console.log('✅ ВСЕ ТЕСТЫ ПРОЙДЕНЫ УСПЕШНО!');
  } else if (successRate >= 80) {
    console.log('⚠️  БОЛЬШИНСТВО ТЕСТОВ ПРОЙДЕНО, НО ЕСТЬ ОШИБКИ');
  } else if (successRate >= 50) {
    console.log('⚠️  ПОЛОВИНА ТЕСТОВ ПРОВАЛЕНА, ТРЕБУЮТСЯ ИСПРАВЛЕНИЯ');
  } else {
    console.log('❌ КРИТИЧЕСКИЕ ПРОБЛЕМЫ, ТРЕБУЕТСЯ СРОЧНОЕ ИСПРАВЛЕНИЕ');
  }

  console.log('\n');

  return {
    success: allResults.totalFailed === 0,
    results: allResults
  };
}

function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// Запуск тестов
if (require.main === module) {
  runAllTests()
    .then(({ success }) => {
      process.exit(success ? 0 : 1);
    })
    .catch(error => {
      console.error('\n❌ ФАТАЛЬНАЯ ОШИБКА:', error);
      console.error(error.stack);
      process.exit(1);
    });
}

module.exports = runAllTests;
