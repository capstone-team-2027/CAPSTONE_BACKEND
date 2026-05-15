'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Role extends Model {

    static associate(models) {
    }
  }
  Role.init({
    roleCode: {
      type: DataTypes.STRING,
      allowNull: false
    },
    roleName: {
      type: DataTypes.STRING(100),
      allowNull: false,
      validate: {
        notEmpty: true
      }
    },
    description: {
      type: DataTypes.TEXT,
      defaultValue: ""
    },
    isActive: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
      allowNull: false
    }
  }, {
    sequelize,
    modelName: 'Role',
    tableName: "Roles", // tên table trong db
    timestamps: true,
    // Thêm index ở mức model để Sequelize hiểu cấu trúc DB tối ưu
    indexes: [
      {
        unique: true,
        fields: ['roleCode']
      }
    ]
  });
  return Role;
};