'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('Service_Categories', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      category_name: {
        type: Sequelize.STRING(100),
        allowNull: false // FIX: Tên nhóm dịch vụ bắt buộc phải nhập
      },
      description: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      estimated_duration: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 0 // FIX: Mặc định là 0 phút nếu chưa ước lượng được thời gian
      },
      base_price: {
        type: Sequelize.DECIMAL(12, 2), // FIX: Định dạng (12, 2) giúp lưu giá tiền dịch vụ chính xác
        allowNull: false,
        defaultValue: 0.00
      },
      is_active: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: true // FIX: Mặc định tạo xong là dịch vụ ở trạng thái sẵn sàng cung cấp
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.NOW
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.Now
      }
    });
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('Service_Categories');
  }
};