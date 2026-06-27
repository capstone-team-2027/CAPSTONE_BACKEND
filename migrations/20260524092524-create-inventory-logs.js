'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('Inventory_Logs', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      part_id: {
        type: Sequelize.INTEGER,
        allowNull: false, // Bắt buộc phải biết linh kiện nào bị biến động
        references: {     // Khóa ngoại liên kết sang bảng Spare_Parts
          model: 'Spare_Parts',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'RESTRICT' // Chặn không cho xóa linh kiện nếu đã có lịch sử log kho
      },
      service_order_id: {
        type: Sequelize.INTEGER,
        allowNull: true,  // Cấu hình chuẩn Nullable: Cho phép null nếu là hành động nhập hàng (IN) hoặc cân bằng kho (ADJUST)
        references: {     // Khóa ngoại liên kết sang bảng Service_Orders
          model: 'Service_Orders',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL' // Nếu lệnh sửa chữa bị xóa (hiếm), log kho vẫn giữ nguyên để đối soát tài chính
      },
      type: {
        type: Sequelize.STRING(50),
        allowNull: false // Bắt buộc điền phân loại: 'IN', 'OUT' hoặc 'ADJUST'
      },
      quantity: {
        type: Sequelize.INTEGER,
        allowNull: false // Số lượng biến động (Vd: Nhập thêm +10, Xuất đi -2)
      },
      manager_id: {
        type: Sequelize.INTEGER,
        allowNull: false, // Bắt buộc lưu ID người thực hiện (Thủ kho/Quản lý) để chịu trách nhiệm
        references: {     // Khóa ngoại liên kết sang bảng Users hệ thống
          model: 'Users',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'RESTRICT'
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.fn('NOW') // Đóng vai trò là cột `timestamp` ghi nhận thời gian thực tế xảy ra biến động
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.fn('NOW')
      }
    });
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('Inventory_Logs');
  }
};