/**
 * Отладочный тест для проверки getStats()
 * Запуск: node tests/15-test-stats-debug.js
 */

require('dotenv').config();
const carService = require('../services/car.service');

async function testStatsDebug() {
  console.log('=== ОТЛАДКА getStats() ===\n');

  try {
    console.log('Вызываем getStats()...\n');
    const stats = await carService.getStats();

    console.log('✅ Успешно!\n');
    console.log('Результат:');
    console.log(JSON.stringify(stats, null, 2));

  } catch (error) {
    console.error('❌ ОШИБКА:', error.message);
    console.error('\nStack trace:');
    console.error(error.stack);
    console.error('\nПодробности ошибки:');
    console.error(error);
    process.exit(1);
  }
}

testStatsDebug();
