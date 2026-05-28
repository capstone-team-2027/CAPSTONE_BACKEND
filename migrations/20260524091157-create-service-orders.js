'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('Service_Orders', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      appointment_id: {
        type: Sequelize.INTEGER,
        allowNull: true,  // Cho phép null nếu khách vãng lai phi thẳng xe vào gara không đặt lịch trước
        unique: true,     // Ràng buộc 1-1: Một lịch hẹn chỉ được tạo ra tối đa một lệnh sửa chữa
        references: {
          model: 'Appointments',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL'
      },
      vehicle_id: {
        type: Sequelize.INTEGER,
        allowNull: false, // Bắt buộc phải biết lệnh này đang làm cho chiếc xe nào
        references: {
          model: 'Vehicles',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'RESTRICT' // Chặn xóa xe nếu xe đang nằm trong lệnh sửa chữa
      },
      receptionist_id: {
        type: Sequelize.INTEGER,
        allowNull: false, // Bắt buộc lưu ID lễ tân tiếp đón để tính KPI/đối soát
        references: {
          model: 'Users', // Trỏ sang bảng Users hệ thống
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'RESTRICT'
      },
      bay_id: {
        type: Sequelize.INTEGER,
        allowNull: false, // Bắt buộc chỉ định xe vào khu vực/cầu nâng nào khi bắt đầu lệnh
        references: {
          model: 'Service_Bays',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'RESTRICT'
      },
      current_odo: {
        type: Sequelize.INTEGER,
        allowNull: false // Số ODO thực tế khi nhận xe bắt buộc nhập để AI học và dự đoán bảo dưỡng
      },
      status: {
        type: Sequelize.STRING(50),
        allowNull: false,
        defaultValue: 'INSPECTING' // Mặc định ban đầu: Đang giám định/kiểm tra xe (INSPECTING, IN_REPAIR, PARKED, COMPLETED)
      },
      entry_time: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.fn('NOW') // Thời điểm xe chính thức vào xưởng lên cầu nâng
      },
      estimated_finish_time: {
        type: Sequelize.DATE,
        allowNull: true // Thời gian dự kiến hệ thống tự tính dựa trên estimated_duration của dịch vụ
      },
      promised_finish_time: {
        type: Sequelize.DATE,
        allowNull: true // Thời gian cam kết thợ/cố vấn điền vào - Mốc "khóa" cầu nâng dài hạn trên lịch
      },
      actual_finish_time: {
        type: Sequelize.DATE,
        allowNull: true // Thợ bấm Hoàn thành thực tế - Giải phóng cầu nâng về trạng thái trống (AVAILABLE) ngay lập tức
      },
      exit_time: {
        type: Sequelize.DATE,
        allowNull: true // Thời điểm xe thực tế xuất xưởng bàn giao cho khách
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
    await queryInterface.dropTable('Service_Orders');
  }
};