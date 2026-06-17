'use strict';
const {
  Model
} = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Garage_Configurations extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // No associations currently needed
    }
  }

  Garage_Configurations.init({
    config_key: {
      type: DataTypes.STRING(100),
      allowNull: false,
      unique: true
    },
    config_value: {
      type: DataTypes.STRING(255),
      allowNull: false
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true
    }
  }, {
    sequelize,
    modelName: 'Garage_Configurations',
    tableName: 'Garage_Configurations',
    timestamps: true
  });

  return Garage_Configurations;
};
