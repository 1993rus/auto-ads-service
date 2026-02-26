'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Car extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  Car.init({
    brand: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        notEmpty: true
      }
    },
    model: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        notEmpty: true
      }
    },
    year: {
      type: DataTypes.INTEGER,
      validate: {
        min: 1900,
        max: new Date().getFullYear() + 1
      }
    },
    price: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      validate: {
        min: 0
      }
    },
    color: DataTypes.STRING,
    url: {
      type: DataTypes.STRING(500),
      allowNull: false,
      validate: {
        isUrl: true
      }
    },
    image_url: {
      type: DataTypes.STRING(500),
      validate: {
        isUrl: true
      }
    },
    mileage: {
      type: DataTypes.INTEGER,
      validate: {
        min: 0
      }
    },
    transmission: DataTypes.STRING,
    fuel_type: DataTypes.STRING,
    body_type: DataTypes.STRING,
    location: DataTypes.STRING,
    description: DataTypes.TEXT,
    external_id: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
      validate: {
        notEmpty: true
      }
    },
    last_scraped_at: DataTypes.DATE,
    cached_at: DataTypes.DATE
  }, {
    sequelize,
    modelName: 'Car',
    indexes: [
      { fields: ['brand'] },
      { fields: ['model'] },
      { fields: ['year'] },
      { fields: ['price'] },
      { fields: ['brand', 'model'] }
    ]
  });
  return Car;
};