'use strict';
const {
  Model
} = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Shift_Templates extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      Shift_Templates.belongsTo(models.User, { foreignKey: 'user_id', as: 'user' });
      Shift_Templates.belongsTo(models.Shift_Slots, { foreignKey: 'slot_id', as: 'shiftSlot' });
    }
  }

  Shift_Templates.init({
    user_id: {
      type: DataTypes.INTEGER
    },
    slot_id: {
      type: DataTypes.INTEGER
    },
    work_date: {
      type: DataTypes.DATEONLY
    },
    is_auto: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    },
    is_confirmed: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    }
  }, {
    sequelize,
    modelName: 'Shift_Templates',
    tableName: 'Shift_Templates',
    timestamps: true
  });

  return Shift_Templates;
};
