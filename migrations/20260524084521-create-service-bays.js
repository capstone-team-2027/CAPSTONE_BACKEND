'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('Service_Bays', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      bay_name: {
        type: Sequelize.STRING(50),
        allowNull: false // FIX: Tên cầu nâng bắt buộc phải nhập (Vd: Cầu nâng số 1, Khu máy 2)
      },
      status: {
        type: Sequelize.STRING(50),
        allowNull: false,
        defaultValue: 'AVAILABLE' // FIX: Mặc định ô cầu nâng mới tạo sẽ ở trạng thái Sẵn sàng (Trống)
      },
      is_active: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: true
      },
      current_service_order_id: {
        type: Sequelize.INTEGER,
        allowNull: true, // Cho phép null khi cầu đang trống, không có xe nào nằm trên cầu
        unique: true     // FIX: Ràng buộc duy nhất - Đảm bảo tại một thời điểm, một cầu nâng chỉ chứa tối đa một chiếc xe đang sửa
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.Now
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.Now
      }
    });
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('Service_Bays');
  }
};