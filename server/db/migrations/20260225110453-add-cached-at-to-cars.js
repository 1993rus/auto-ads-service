'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    // Добавляем поле cached_at для отслеживания времени кеширования
    await queryInterface.addColumn('Cars', 'cached_at', {
      type: Sequelize.DATE,
      allowNull: true,
      comment: 'Время последнего обновления данных из carsensor.net'
    });

    // Устанавливаем текущее время для существующих записей
    await queryInterface.sequelize.query(
      'UPDATE "Cars" SET "cached_at" = "last_scraped_at" WHERE "last_scraped_at" IS NOT NULL'
    );
  },

  async down (queryInterface, Sequelize) {
    // Удаляем поле cached_at при откате
    await queryInterface.removeColumn('Cars', 'cached_at');
  }
};
