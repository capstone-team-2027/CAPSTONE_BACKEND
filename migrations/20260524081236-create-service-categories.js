'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('Service_Categories', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER // Tương đương với SERIAL [PK] trong PostgreSQL
      },
      category_name: {
        type: Sequelize.STRING(100),
        allowNull: false // Tên nhóm dịch vụ bắt buộc phải nhập (Vd: Bảo dưỡng nhanh, Sửa chữa Máy-Gầm...)
      },
      is_active: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: true // Mặc định tạo xong danh mục sẽ ở trạng thái kích hoạt ngay
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.NOW // Fix lỗi viết hoa/thường chuẩn Postgres
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.NOW
      }
    });
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('Service_Categories');
  }
};