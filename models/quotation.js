'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Quotations extends Model {
    static associate(models) {
      // TODO: Thêm lại khi Service_Orders sẵn sàng
      // this.belongsTo(models.Service_Orders, {
      //   foreignKey: 'service_order_id',
      //   as: 'serviceOrder'
      // });

      if (models.Quotation_Details) {
        this.hasMany(models.Quotation_Details, {
          foreignKey: 'quotation_id',
          as: 'items'
        });
      }
    }
  }
  Quotations.init({
    service_order_id: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    total_amount: {
      type: DataTypes.DECIMAL(12, 2),
      allowNull: false,
      defaultValue: 0
    },
    status: {
      type: DataTypes.STRING(50),
      allowNull: false,
      defaultValue: 'PENDING',
      validate: {
        isIn: [['PENDING', 'APPROVED', 'REJECTED','EXPORTED']]
      }
    },
    approved_at: {
      type: DataTypes.DATE,
      allowNull: true
    },
    note: {
      type: DataTypes.TEXT,
      allowNull: true
    }
  }, {
    sequelize,
    modelName: 'Quotations',
    tableName: 'Quotations',
    timestamps: true
  });

  return Quotations;
};
