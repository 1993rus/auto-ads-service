'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('Cars', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      brand: {
        type: Sequelize.STRING,
        allowNull: false
      },
      model: {
        type: Sequelize.STRING,
        allowNull: false
      },
      year: {
        type: Sequelize.INTEGER
      },
      price: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: false
      },
      color: {
        type: Sequelize.STRING
      },
      url: {
        type: Sequelize.STRING(500),
        allowNull: false
      },
      image_url: {
        type: Sequelize.STRING(500)
      },
      mileage: {
        type: Sequelize.INTEGER
      },
      transmission: {
        type: Sequelize.STRING
      },
      fuel_type: {
        type: Sequelize.STRING
      },
      body_type: {
        type: Sequelize.STRING
      },
      location: {
        type: Sequelize.STRING
      },
      description: {
        type: Sequelize.TEXT
      },
      external_id: {
        type: Sequelize.STRING,
        allowNull: false,
        unique: true
      },
      last_scraped_at: {
        type: Sequelize.DATE
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE
      }
    });

    // Добавляем индексы для быстрого поиска
    await queryInterface.addIndex('Cars', ['brand']);
    await queryInterface.addIndex('Cars', ['model']);
    await queryInterface.addIndex('Cars', ['year']);
    await queryInterface.addIndex('Cars', ['price']);
    await queryInterface.addIndex('Cars', ['color']);
    await queryInterface.addIndex('Cars', ['brand', 'model']); // Составной индекс
    await queryInterface.addIndex('Cars', ['last_scraped_at']); // Для мониторинга скрапинга
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('Cars');
  }
};