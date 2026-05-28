'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('Appointments', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      customer_id: {
        type: Sequelize.INTEGER,
        allowNull: false, // Bắt buộc phải biết lịch hẹn này của khách hàng nào
        references: {     // THIẾT LẬP KHÓA NGOẠI
          model: 'Customers', // Tên bảng đích trong DB
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'RESTRICT' // Không cho phép xóa khách hàng nếu họ đang có lịch hẹn
      },
      vehicle_id: {
        type: Sequelize.INTEGER,
        allowNull: false, // Bắt buộc phải biết khách định mang xe nào tới để chuẩn bị vật tư
        references: {     // THIẾT LẬP KHÓA NGOẠI
          model: 'Vehicles',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'RESTRICT' // Không cho phép xóa xe nếu xe đang có lịch hẹn trên hệ thống
      },
      scheduled_time: {
        type: Sequelize.DATE, // Sequelize.DATE tương ứng với TIMESTAMP trong PostgreSQL
        allowNull: false      // Ngày giờ hẹn bắt buộc phải nhập
      },
      category_id: {
        type: Sequelize.INTEGER,
        allowNull: false, // Bắt buộc chọn nhóm dịch vụ để sắp xếp cầu nâng phù hợp
        references: {     // THIẾT LẬP KHÓA NGOẠI
          model: 'Service_Categories',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'RESTRICT'
      },
      notes: {
        type: Sequelize.TEXT,
        allowNull: true // Khách có thể ghi chú hoặc không
      },
      status: {
        type: Sequelize.STRING(50),
        allowNull: false,
        defaultValue: 'PENDING' // Mặc định khi vừa đặt lịch thành công là PENDING (Chờ xác nhận)
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
    await queryInterface.dropTable('Appointments');
  }
};