'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('Vehicles', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      vin_number: {
        type: Sequelize.STRING(20),
        allowNull: true,  // Cho phép null vì một số xe đời cũ hoặc xe máy cày/cứu hộ đặc biệt có thể không rõ số VIN ban đầu
        unique: true       // FIX: Nếu đã nhập số VIN thì bắt buộc phải là duy nhất, không được trùng xe khác
      },
      customer_id: {
        type: Sequelize.INTEGER,
        allowNull: false, // FIX: Bắt buộc xe phải thuộc quyền sở hữu của một Khách hàng
        references: {     // Khóa ngoại liên kết sang bảng Customers
          model: 'Customers',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'RESTRICT' // Chặn không cho xóa khách hàng nếu xe của họ vẫn đang nằm trong hệ thống
      },
      model_id: {
        type: Sequelize.INTEGER,
        allowNull: false, // FIX: Bắt buộc phải xác định rõ xe này thuộc Dòng xe (Model) nào
        references: {     // Khóa ngoại liên kết sang bảng Vehicle_Models
          model: 'Vehicle_Models',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'RESTRICT' // Chặn không cho xóa Dòng xe nếu đang có xe thực tế của khách dùng model đó
      },
      license_plate: {
        type: Sequelize.STRING(20),
        allowNull: false // FIX: Biển số xe bắt buộc phải có để lễ tân làm thủ tục check-in và quét OCR
      },
      avg_daily_mileage: {
        type: Sequelize.FLOAT,
        allowNull: false,
        defaultValue: 0.0 // Mặc định ban đầu chưa có dữ liệu hành trình thì để 0
      },
      year: {
        type: Sequelize.INTEGER,
        allowNull: false // Năm sản xuất bắt buộc phải nhập để AI phân loại chính xác đời linh kiện tương thích
      },
      color: {
        type: Sequelize.STRING(50),
        allowNull: true
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.NOW
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.NOW
      }
    });
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('Vehicles');
  }
};