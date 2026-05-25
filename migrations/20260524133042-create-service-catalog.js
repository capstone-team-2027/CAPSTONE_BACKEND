'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('Service_Catalogs', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      category_id: {
        type: Sequelize.INTEGER,
        allowNull: false, // Bắt buộc phải gắn vào một nhóm danh mục (Vd: Bảo dưỡng định kỳ, Sửa chữa máy gầm...)
        references: {     // Thiết lập khóa ngoại
          model: 'Service_Categories',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'RESTRICT' // Không cho phép xóa danh mục cha nếu đang có các dịch vụ con thuộc về nó
      },
      service_name: {
        type: Sequelize.STRING(255),
        allowNull: false // Tên dịch vụ mẫu không được để trống
      },
      estimated_duration: {
        type: Sequelize.INTEGER,
        allowNull: false, // Bắt buộc nhập thời gian tiêu chuẩn (tính bằng Phút) để hệ thống tự động xếp lịch cầu nâng
        defaultValue: 30  // Mặc định ban đầu nếu không nhập là 30 phút
      },
       is_active: {
      type: Sequelize.BOOLEAN,
      allowNull: false,
      defaultValue: true
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
    await queryInterface.dropTable('Service_Catalogs');
  }
};