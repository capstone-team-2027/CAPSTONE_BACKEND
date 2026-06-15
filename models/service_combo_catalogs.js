'use strict';
const {
  Model
} = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Service_Combo_Catalogs extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      this.belongsTo(models.Service_Combo, {
        foreignKey: 'combo_id',
        as: 'combo'
      });
      this.belongsTo(models.Service_Catalog, {
        foreignKey: 'catalog_id',
        as: 'catalog'
      });
      this.belongsTo(models.Pricing_Rules, {
        foreignKey: 'pricing_rule_id',
        as: 'pricingRule'
      });
    }
  }

  Service_Combo_Catalogs.init({
    combo_id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      allowNull: false,
      references: {
        model: 'Service_Combos',
        key: 'id'
      }
    },
    catalog_id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      allowNull: false,
      references: {
        model: 'Service_Catalogs',
        key: 'id'
      }
    },
    pricing_rule_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'Pricing_Rules',
        key: 'id'
      }
    }
  }, {
    sequelize,
    modelName: 'Service_Combo_Catalogs',
    tableName: 'Service_Combo_Catalogs',
    timestamps: true
  });

  return Service_Combo_Catalogs;
};
