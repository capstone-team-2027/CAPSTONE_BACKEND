'use strict';
const {
  Model
} = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Shift_Slots extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      if (models.Shift_Templates) {
        Shift_Slots.hasMany(models.Shift_Templates, {
          foreignKey: 'slot_id',
          as: 'shiftTemplates'
        });
      }
    }
  }

  Shift_Slots.init({
    slot_name: {
      type: DataTypes.STRING(50)
    },
    start_time: {
      type: DataTypes.TIME
    },
    end_time: {
      type: DataTypes.TIME
    },
    max_technicians: {
      type: DataTypes.INTEGER,
      defaultValue: 3
    },
    min_senior: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
      comment: 'hard - bắt buộc'
    },
    min_mid: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
      comment: 'hard - bắt buộc'
    },
    prefer_senior: {
      type: DataTypes.INTEGER,
      defaultValue: 1,
      comment: 'soft - ưu tiên'
    },
    prefer_mid: {
      type: DataTypes.INTEGER,
      defaultValue: 1,
      comment: 'soft - ưu tiên'
    },
    prefer_junior: {
      type: DataTypes.INTEGER,
      defaultValue: 1,
      comment: 'soft - ưu tiên'
    },
    is_active: {
      type: DataTypes.BOOLEAN,
      defaultValue: true
    }
  }, {
    sequelize,
    modelName: 'Shift_Slots',
    tableName: 'Shift_Slots',
    timestamps: true
  });

  return Shift_Slots;
};
