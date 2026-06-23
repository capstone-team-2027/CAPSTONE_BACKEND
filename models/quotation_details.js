'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Quotation_Details extends Model {
    static associate(models) {
      this.belongsTo(models.Quotations, {
        foreignKey: 'quotation_id',
        as: 'quotation'
      });

      if (models.Service_Catalog) {
        this.belongsTo(models.Service_Catalog, {
          foreignKey: 'service_catalog_id',
          as: 'catalog'
        });
      }

      if (models.Spare_Parts) {
        this.belongsTo(models.Spare_Parts, {
          foreignKey: 'spare_part_id',
          as: 'sparePart'
        });
      }
    }
  }

  Quotation_Details.init({
    quotation_id: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    service_catalog_id: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    spare_part_id: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    quantity: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 1
    },
    unit_price: {
      type: DataTypes.DECIMAL(12, 2),
      allowNull: false
    },
    amount: {
      type: DataTypes.DECIMAL(12, 2),
      allowNull: false
    }
  }, {
    sequelize,
    modelName: 'Quotation_Details',
    tableName: 'Quotation_Details',
    timestamps: true
  });

  return Quotation_Details;
};
