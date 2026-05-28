'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Vehicles extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // 2. Một chiếc xe bắt buộc phải thuộc một Dòng xe cụ thể (Vehicle_Model)
      this.belongsTo(models.Vehicle_Models, {
        foreignKey: 'model_id',
        as: 'model'
      });
      this.belongsTo(models.Customers, {
        foreignKey: 'customer_id',
        as: 'customer'
      });
      if (models.Appointments) {
        this.hasMany(models.Appointments, {
          foreignKey: 'vehicle_id',
          as: 'appointments'
        });
      }
      if (models.Service_Orders) {
        this.hasMany(models.Service_Orders, {
          foreignKey: 'vehicle_id',
          as: 'serviceOrders'
        });
      }
    }

  }
  Vehicles.init({
    vin_number: {
      type: DataTypes.STRING(20),
      allowNull: true,
      unique: true
    },
    customer_id: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    model_id: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    license_plate: {
      type: DataTypes.STRING(20),
      allowNull: false
    },
    avg_daily_mileage: {
      type: DataTypes.FLOAT,
      allowNull: false,
      defaultValue: 0.0
    },
    year: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    color: {
      type: DataTypes.STRING(50),
      allowNull: true
    }
  }, {
    sequelize,
    modelName: 'Vehicles',
    tableName: 'Vehicles',
    timestamps: true
  });
  return Vehicles;
};