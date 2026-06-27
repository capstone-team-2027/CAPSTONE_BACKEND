'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('Part_Catalogs', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      sku: {
        type: Sequelize.STRING(100),
        allowNull: false,  // FIX: Không được để trống mã định danh catalogue
        unique: true       // FIX: Mã SKU catalogue là duy nhất để tránh tạo trùng mẫu linh kiện
      },
      name: {
        type: Sequelize.STRING(255),
        allowNull: false   // FIX: Tên mẫu linh kiện bắt buộc phải nhập
      },
      category_id: {
        type: Sequelize.INTEGER,
        allowNull: false,  // FIX: Linh kiện mẫu bắt buộc phải nằm trong một nhóm danh mục
        references: {      // FIX: Cấu hình Khóa Ngoại liên kết sang bảng Part_Categories
          model: 'Part_Categories',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'RESTRICT' // Chặn không cho xóa danh mục nếu đang có mẫu linh kiện thuộc catalogue này
      },
      brand: {
        type: Sequelize.STRING(100),
        allowNull: true    // Cho phép null nếu là hàng trôi nổi không rõ thương hiệu
      },
      base_price: {
        type: Sequelize.DECIMAL(12, 2), // FIX: Đổi thành (12, 2) để lưu giá tham khảo chính xác từng đồng
        allowNull: false,
        defaultValue: 0.00
      },
      is_active: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: true // FIX: Mặc định tạo xong là mẫu linh kiện này được bật kinh doanh luôn
      },
      image_url: {
        type: Sequelize.STRING(255),
        allowNull: true
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
    await queryInterface.dropTable('Part_Catalogs');
  }
};