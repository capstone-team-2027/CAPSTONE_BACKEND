'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('Workshop_Tools', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      tool_name: {
        type: Sequelize.STRING(150),
        allowNull: false // FIX: Tên máy móc/thiết bị bắt buộc phải nhập
      },
      serial_number: {
        type: Sequelize.STRING(100),
        allowNull: false, // FIX: Mã số định danh máy bắt buộc phải có để đối soát tài sản
        unique: true       // FIX: Số Serial (S/N) của mỗi thiết bị từ nhà sản xuất phải là duy nhất
      },
      bay_id: {
        type: Sequelize.INTEGER,
        allowNull: true,  // Cấu hình chuẩn Nullable: Để trống nếu dụng cụ di động hoặc cất ở kho chung, điền ID nếu gắn cố định tại một cầu nâng
        references: {     // Khóa ngoại liên kết sang bảng Service_Bays
          model: 'Service_Bays',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL' // Nếu cầu nâng đó bị dỡ bỏ/xóa, thiết bị chỉ cần reset vị trí về NULL chứ không bị xóa theo
      },
      current_location: {
        type: Sequelize.STRING(100),
        allowNull: true // Mô tả cụ thể vị trí trong kho khi không nằm trên cầu nâng (Vd: Tủ đồ nghề số 2)
      },
      purchase_price: {
        type: Sequelize.DECIMAL(12, 2), // FIX: Đổi sang (12, 2) để lưu trữ giá mua máy móc chính xác (Vd: Cầu nâng giá trăm triệu)
        allowNull: false,
        defaultValue: 0.00
      },
      current_value: {
        type: Sequelize.DECIMAL(12, 2), // FIX: Giá trị còn lại sau khấu hao
        allowNull: false,
        defaultValue: 0.00
      },
      vendor_info: {
        type: Sequelize.TEXT,
        allowNull: true // Thông tin đại lý mua máy phục vụ việc gọi sửa chữa/bảo hành khi có sự cố
      },
      status: {
        type: Sequelize.STRING(50),
        allowNull: false,
        defaultValue: 'AVAILABLE' // FIX: Trạng thái mặc định ban đầu: AVAILABLE, IN_USE, MAINTENANCE, BROKEN, SOLD, DISPOSED
      },
      purchase_date: {
        type: Sequelize.DATEONLY, // Dùng DATEONLY để lưu thuần ngày/tháng/năm không kèm múi giờ (YYYY-MM-DD)
        allowNull: true
      },
      warranty_expiry: {
        type: Sequelize.DATEONLY,
        allowNull: true // Ngày hết hạn bảo hành máy móc
      },
      last_maintenance_date: {
        type: Sequelize.DATEONLY,
        allowNull: true // Lịch sử ngày bảo trì gần nhất
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
    await queryInterface.dropTable('Workshop_Tools');
  }
};