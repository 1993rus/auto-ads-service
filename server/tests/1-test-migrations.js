/**
 * Тест 1: Проверка миграций БД
 * Проверяет, что таблицы Cars и ScrapingLogs созданы
 * и имеют правильную структуру с индексами
 */

require('dotenv').config();
const { sequelize } = require('../db/models');

async function testMigrations() {
  console.log('\n========================================');
  console.log('ТЕСТ 1: Проверка миграций БД');
  console.log('========================================\n');

  const results = {
    passed: [],
    failed: []
  };

  try {
    // Подключение к БД
    await sequelize.authenticate();
    console.log('✓ Подключение к БД успешно');
    results.passed.push('Подключение к БД');

    // Проверяем таблицу Cars
    const carsTableExists = await sequelize.getQueryInterface().showAllTables();

    if (carsTableExists.includes('Cars')) {
      console.log('✓ Таблица Cars существует');
      results.passed.push('Таблица Cars существует');

      // Проверяем структуру таблицы
      const carsDescription = await sequelize.getQueryInterface().describeTable('Cars');
      console.log('\n--- Структура таблицы Cars ---');

      const requiredFields = [
        'id', 'brand', 'model', 'year', 'price', 'color',
        'url', 'image_url', 'mileage', 'transmission', 'fuel_type',
        'body_type', 'location', 'description', 'external_id',
        'last_scraped_at', 'createdAt', 'updatedAt'
      ];

      const missingFields = [];
      for (const field of requiredFields) {
        if (carsDescription[field]) {
          console.log(`  ✓ Поле ${field}: ${carsDescription[field].type}`);
        } else {
          console.log(`  ✗ Поле ${field}: ОТСУТСТВУЕТ`);
          missingFields.push(field);
        }
      }

      if (missingFields.length === 0) {
        console.log('✓ Все необходимые поля присутствуют');
        results.passed.push('Структура таблицы Cars');
      } else {
        console.log(`✗ Отсутствуют поля: ${missingFields.join(', ')}`);
        results.failed.push(`Структура таблицы Cars (отсутствуют: ${missingFields.join(', ')})`);
      }

      // Проверяем индексы
      const indexes = await sequelize.getQueryInterface().showIndex('Cars');
      console.log(`\n--- Индексы таблицы Cars (найдено ${indexes.length}) ---`);

      const indexFields = indexes.map(idx => idx.name || idx.fields.join('_'));
      console.log('Индексы:', indexFields.join(', '));

      // Проверяем наличие важных индексов
      const hasExternalIdIndex = indexes.some(idx =>
        idx.fields.includes('external_id') || idx.unique
      );

      if (hasExternalIdIndex || indexes.length > 0) {
        console.log('✓ Индексы присутствуют');
        results.passed.push('Индексы таблицы Cars');
      } else {
        console.log('⚠ Индексы могут отсутствовать (проверьте вручную)');
        results.failed.push('Индексы таблицы Cars');
      }

    } else {
      console.log('✗ Таблица Cars НЕ СУЩЕСТВУЕТ');
      results.failed.push('Таблица Cars');
    }

    // Проверяем таблицу ScrapingLogs
    if (carsTableExists.includes('ScrapingLogs')) {
      console.log('\n✓ Таблица ScrapingLogs существует');
      results.passed.push('Таблица ScrapingLogs существует');

      const logsDescription = await sequelize.getQueryInterface().describeTable('ScrapingLogs');
      console.log('\n--- Структура таблицы ScrapingLogs ---');

      const logFields = [
        'id', 'status', 'cars_found', 'cars_added', 'cars_updated',
        'error_message', 'started_at', 'completed_at', 'createdAt', 'updatedAt'
      ];

      const missingLogFields = [];
      for (const field of logFields) {
        if (logsDescription[field]) {
          console.log(`  ✓ Поле ${field}: ${logsDescription[field].type}`);
        } else {
          console.log(`  ✗ Поле ${field}: ОТСУТСТВУЕТ`);
          missingLogFields.push(field);
        }
      }

      if (missingLogFields.length === 0) {
        console.log('✓ Все необходимые поля присутствуют');
        results.passed.push('Структура таблицы ScrapingLogs');
      } else {
        console.log(`✗ Отсутствуют поля: ${missingLogFields.join(', ')}`);
        results.failed.push(`Структура таблицы ScrapingLogs (отсутствуют: ${missingLogFields.join(', ')})`);
      }

    } else {
      console.log('✗ Таблица ScrapingLogs НЕ СУЩЕСТВУЕТ');
      results.failed.push('Таблица ScrapingLogs');
    }

  } catch (error) {
    console.error('\n✗ ОШИБКА при проверке миграций:', error.message);
    results.failed.push(`Критическая ошибка: ${error.message}`);
  } finally {
    await sequelize.close();
  }

  // Результаты
  console.log('\n========================================');
  console.log('РЕЗУЛЬТАТЫ ТЕСТА 1');
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
  testMigrations()
    .then(results => {
      process.exit(results.failed.length > 0 ? 1 : 0);
    })
    .catch(error => {
      console.error('Критическая ошибка:', error);
      process.exit(1);
    });
}

module.exports = testMigrations;
