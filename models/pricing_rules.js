'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Pricing_Rules extends Model {
  }
  Pricing_Rules.init({
    category: {
      type: DataTypes.STRING(50),
      allowNull: false
    },
    markup_rate: {
      type: DataTypes.FLOAT,
      allowNull: false,
      defaultValue: 0.0 // Mặc định không tăng giá
    },
    discount_rate: {
      type: DataTypes.FLOAT,
      allowNull: false,
      defaultValue: 0.0 // Mặc định không giảm giá
    },
    start_date: {
      type: DataTypes.DATE,
      allowNull: true // Cho phép null nếu cấu hình áp dụng vĩnh viễn
    },
    end_date: {
      type: DataTypes.DATE,
      allowNull: true
    },
    is_active: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true // Mặc định luật này được bật
    },
    is_deleted: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false
    },
  }, {
    sequelize,
    modelName: 'Pricing_Rules',
    tableName: 'Pricing_Rules',
    timestamps: true
  });
  return Pricing_Rules;
};