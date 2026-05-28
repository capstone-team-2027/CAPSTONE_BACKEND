'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Vehicle_Makes extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // 1. Một Hãng xe có thể có nhiều Dòng xe (Vehicle_Models)
      if (models.Vehicle_Models) {
        this.hasMany(models.Vehicle_Models, {
          foreignKey: 'make_id',
          as: 'models'
        });
      }
    }
  }
  Vehicle_Makes.init({
    make_name: {
      type: DataTypes.STRING(50),
      allowNull: false,
      unique: true // Đồng bộ tầng ứng dụng để Sequelize kiểm tra unique trước khi lưu
    }
  }, {
    sequelize,
    modelName: 'Vehicle_Makes',
    tableName: 'Vehicle_Makes', // Ép Sequelize tìm đúng tên bảng viết hoa/thường này trong PostgreSQL
    timestamps: true
  });
  return Vehicle_Makes;
};