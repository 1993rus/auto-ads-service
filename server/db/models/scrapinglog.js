'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class ScrapingLog extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  ScrapingLog.init({
    status: {
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: 'running',
      validate: {
        isIn: [['running', 'completed', 'failed']]
      }
    },
    cars_found: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
      validate: {
        min: 0
      }
    },
    cars_added: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
      validate: {
        min: 0
      }
    },
    cars_updated: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
      validate: {
        min: 0
      }
    },
    error_message: DataTypes.TEXT,
    started_at: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW
    },
    completed_at: DataTypes.DATE
  }, {
    sequelize,
    modelName: 'ScrapingLog',
  });
  return ScrapingLog;
};