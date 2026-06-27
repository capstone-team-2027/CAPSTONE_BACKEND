'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Vehicle_Models extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      this.belongsTo(models.Vehicle_Makes, {
        foreignKey: 'make_id',
        as: 'make'
      });
      if (models.Vehicles) {
        this.hasMany(models.Vehicles, {
          foreignKey: 'model_id',
          as: 'vehicles'
        });
      }
    }
  }
  Vehicle_Models.init({
    make_id: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    model_name: {
      type: DataTypes.STRING(50),
      allowNull: false
    },
    vehicle_type: {
      type: DataTypes.STRING(50),
      allowNull: false
    }
  }, {
    sequelize,
    modelName: 'Vehicle_Models',
    tableName: 'Vehicle_Models',
    timestamps: true
  });
  return Vehicle_Models;
};