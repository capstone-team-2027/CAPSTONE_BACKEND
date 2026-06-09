'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Appointment_Details extends Model {
    static associate(models) {
      // 1. Một chi tiết lịch hẹn thuộc về một Lịch hẹn (Appointment)
      this.belongsTo(models.Appointments, {
        foreignKey: 'appointment_id',
        as: 'appointment'
      });

      // 2. Một chi tiết lịch hẹn có thể thuộc về một Dịch vụ lẻ (Service_Catalog)
      if (models.Service_Catalogs) {
        this.belongsTo(models.Service_Catalogs, {
          foreignKey: 'catalog_id',
          as: 'catalog'
        });
      }

      // 3. Một chi tiết lịch hẹn có thể thuộc về một Combo dịch vụ (Service_Combo)
      if (models.Service_Combos) {
        this.belongsTo(models.Service_Combos, {
          foreignKey: 'combo_id',
          as: 'combo'
        });
      }
    }
  }

  Appointment_Details.init({
    appointment_id: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    catalog_id: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    combo_id: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    price_snapshot: {
      type: DataTypes.DECIMAL(12, 2),
      allowNull: false
    }
  }, {
    sequelize,
    modelName: 'Appointment_Details',
    tableName: 'Appointment_Details',
    timestamps: true
  });

  return Appointment_Details;
};
