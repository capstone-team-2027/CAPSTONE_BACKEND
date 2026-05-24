'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('Tool_Histories', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      tool_id: {
        type: Sequelize.INTEGER,
        allowNull: false, // Bắt buộc dòng nhật ký này phải thuộc về một thiết bị cụ thể
        references: {     // Khóa ngoại liên kết sang bảng Workshop_Tools
          model: 'Workshop_Tools',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE' // Nếu thiết bị bị xóa hoàn toàn khỏi hệ thống, lịch sử của nó cũng tự động xóa theo
      },
      event_type: {
        type: Sequelize.STRING(50),
        allowNull: false // Bắt buộc nhập: 'MAINTENANCE', 'REPAIR', 'UPGRADE' hoặc 'LIQUIDATION'
      },
      event_date: {
        type: Sequelize.DATEONLY, // Dùng DATEONLY để lưu ngày thuần túy (YYYY-MM-DD), không lưu giờ giấc dư thừa
        allowNull: false
      },
      cost: {
        type: Sequelize.DECIMAL(12, 2), // Độ chính xác tiền tệ cao để lưu chi phí sửa hoặc số tiền thanh lý thu về
        allowNull: false,
        defaultValue: 0.00
      },
      description: {
        type: Sequelize.TEXT,
        allowNull: true // Chi tiết tình trạng hỏng hóc hoặc lý do nâng cấp/bán thanh lý
      },
      technician_id: {
        type: Sequelize.INTEGER,
        allowNull: false, // Bắt buộc lưu ID người chịu trách nhiệm thực hiện/bàn giao
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
    await queryInterface.dropTable('Tool_Histories');
  }
};