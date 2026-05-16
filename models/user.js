'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class User extends Model {
    static associate(models) {
      //n-1
      User.belongsTo(models.Role, {
        foreignKey: 'roleId',
        as: 'role'
      });
      // 1-n : hasMany
    }
  }
  User.init({
    roleId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'Roles',
        key: 'id'
      }
    },
    phoneNumber: {
      type: DataTypes.STRING(20),
      allowNull: false,
      unique: true,
      validate: {
        isNumeric: true, // Chỉ cho phép nhập số 
        len: [10, 15]
      }
    },
    password: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        notEmpty: true // Ngăn chặn mật khẩu rỗng [cite: 484, 519]
      }
    },
    fullName: {
      type: DataTypes.STRING(150),
      allowNull: false,
      validate: {
        len: [2, 150]
      }
    },
    avatar: {
      type: DataTypes.STRING,
      defaultValue: ""
    },
    refreshToken: {
      type: DataTypes.STRING,
      allowNull: true
    },
    status: {
      type: DataTypes.STRING(50),
      defaultValue: 'PENDING', 
      validate: {
        isIn: [['PENDING','ACTIVE', 'INACTIVE', 'BANNED']]
      }
    },
    hasDrivingLicense: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    },

  }, {
    sequelize,
    modelName: 'User',
    tableName: 'Users',
    timestamps: true,
  });
  return User;
};