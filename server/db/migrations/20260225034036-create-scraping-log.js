'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('ScrapingLogs', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      status: {
        type: Sequelize.STRING,
        allowNull: false,
        defaultValue: 'running'
      },
      cars_found: {
        type: Sequelize.INTEGER,
        defaultValue: 0
      },
      cars_added: {
        type: Sequelize.INTEGER,
        defaultValue: 0
      },
      cars_updated: {
        type: Sequelize.INTEGER,
        defaultValue: 0
      },
      error_message: {
        type: Sequelize.TEXT
      },
      started_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.NOW
      },
      completed_at: {
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
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('ScrapingLogs');
  }
};