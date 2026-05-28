'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Appointments extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      this.belongsTo(models.Customers, {
        foreignKey: 'customer_id',
        as: 'customer'
      });

      // 2. Một lịch hẹn được lên lịch cho một chiếc Xe cụ thể (Vehicle)
      this.belongsTo(models.Vehicles, {
        foreignKey: 'vehicle_id',
        as: 'vehicle'
      });

      // 3. Một lịch hẹn đăng ký một nhóm Danh mục dịch vụ (Service_Category)
      this.belongsTo(models.Service_Categories, {
        foreignKey: 'category_id',
        as: 'category'
      });

      // 4. Mối quan hệ 1-1: Khi xe đến xưởng, lịch hẹn này sẽ sinh ra tối đa 1 Lệnh sửa chữa (Service_Order)
      if (models.Service_Orders) {
        this.hasOne(models.Service_Orders, {
          foreignKey: 'appointment_id',
          as: 'serviceOrder'
        });
      }
    }
  }
  Appointments.init({
    customer_id: {
      type: DataTypes.INTEGER,
      allowNull: false // FIX: Khóa ngoại không được phép để trống
    },
    vehicle_id: {
      type: DataTypes.INTEGER,
      allowNull: false // FIX: Khóa ngoại không được phép để trống
    },
    scheduled_time: {
      type: DataTypes.DATE,
      allowNull: false // FIX: Ngày giờ hẹn bắt buộc phải có
    },
    category_id: {
      type: DataTypes.INTEGER,
      allowNull: false // FIX: Nhóm dịch vụ mong muốn bắt buộc phải chọn
    },
    notes: {
      type: DataTypes.TEXT,
      allowNull: true // Cho phép null nếu khách không có yêu cầu đặc biệt
    },
    status: {
      type: DataTypes.STRING(50),
      allowNull: false,
      defaultValue: 'PENDING' // FIX: Mặc định tạo lịch xong sẽ ở trạng thái PENDING
    }
  }, {
    sequelize,
    modelName: 'Appointments',
    tableName: 'Appointments',
    timestamps: true
  });
  return Appointments;
};