'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('Customers', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      user_id: {
        type: Sequelize.INTEGER,
        allowNull: true,  // FIX: Để null nếu khách chỉ đến gara sửa và cung cấp SĐT, chưa đăng ký tài khoản app
        references: {     // Khóa ngoại liên kết sang bảng Users
          model: 'Users',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL' // Nếu tài khoản user bị xóa, thông tin khách hàng vãng lai/lịch sử sửa chữa vẫn được giữ lại
      },
      phone: {
        type: Sequelize.STRING(20),
        allowNull: false // FIX: Số điện thoại bắt buộc phải có để nhân viên tra cứu, gọi điện trao đổi
      },
      membership_tier: {
        type: Sequelize.STRING(50),
        allowNull: false,
        defaultValue: 'BRONZE' // FIX: Mặc định mới vào sẽ là hạng Đồng (hoặc hạng Standard)
      },
      loyalty_points: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 0 // FIX: Điểm tích lũy ban đầu bằng 0
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.fn('NOW') // Lấy thời gian server chuẩn Postgres
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.fn('NOW')
      }
    });
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('Customers');
  }
};