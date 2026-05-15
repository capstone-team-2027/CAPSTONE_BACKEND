'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class User extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
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
      defaultValue: 'ACTIVE', // ACTIVE, INACTIVE, BANNED 
      validate: {
        isIn: [['ACTIVE', 'INACTIVE', 'BANNED']]
      }
    },
    hasDrivingLicense: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    },
    otpCode: {
      type: DataTypes.STRING(10),
      allowNull: true,
    },
    otpExpiration: {
      type: DataTypes.DATE,
      allowNull: true,
    },
  }, {
    sequelize,
    modelName: 'User',
    tableName: 'Users',
    timestamps: true,
  });
  return User;
};