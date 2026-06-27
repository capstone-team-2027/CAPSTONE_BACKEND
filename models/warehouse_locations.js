'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Warehouse_Locations extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      this.hasMany(models.Spare_Parts, {
        foreignKey: 'location_id',
        as: 'spareParts'
      });
    }
  }
  Warehouse_Locations.init({
    area_name: {
      type: DataTypes.STRING(50),
      allowNull: false
    },
    shelf_number: {
      type: DataTypes.STRING(20),
      allowNull: false
    },
    bin_level: {
      type: DataTypes.STRING(20),
      allowNull: false
    },
    is_active: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true
    }
  }, {
    sequelize,
    modelName: 'Warehouse_Locations',
    tableName: 'Warehouse_Locations',
    timestamps: true
  });
  return Warehouse_Locations;
};