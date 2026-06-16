'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Inventory_Batches extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
        this.belongsTo(models.Inventory_Logs, {
          foreignKey: 'inventory_log_id',
          as: 'inventoryLog'
        });
    }
  }
  Inventory_Batches.init({
    inventory_log_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    unit_cost: {
      type: DataTypes.DECIMAL(12,2),
      allowNull: false
    },
    remaining_quantity: {
      type: DataTypes.INTEGER,
      allowNull: false 
    },
 }, {
    sequelize,
    modelName: 'Inventory_Batches',
    tableName: 'Inventory_Batches',
    timestamps: true
  });
  return Inventory_Batches;
};