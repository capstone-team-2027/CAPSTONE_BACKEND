'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('Spare_Parts', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      sku: {
        type: Sequelize.STRING(100),
        allowNull: false,
        unique: true // FIX: Đảm bảo mã SKU là duy nhất để không bị trùng lặp phụ tùng trong kho
      },
      name: {
        type: Sequelize.STRING(255),
        allowNull: false // FIX: Không được để trống tên phụ tùng
      },
      stock_quantity: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 0 // FIX: Mặc định hàng mới khai báo có số lượng tồn kho bằng 0
      },
      min_threshold: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 5 // FIX: Mặc định dưới 5 món hệ thống sẽ cảnh báo hết hàng
      },
      cogs: {
        type: Sequelize.DECIMAL(12, 2), // FIX: Đổi thành (12, 2) để lưu trữ giá vốn chính xác từng đồng xu
        allowNull: false,
        defaultValue: 0.00
      },
      retail_price: {
        type: Sequelize.DECIMAL(12, 2), // FIX: Giá bán niêm yết (được tính tự động bằng logic cogs * markup)
        allowNull: false,
        defaultValue: 0.00
      },
      location_id: {
        type: Sequelize.INTEGER,
        allowNull: true, // Cho phép null phòng trường hợp hàng mới nhập về kho chưa kịp xếp lên kệ cụ thể
        references: {    // FIX: Tạo khóa ngoại liên kết sang bảng Warehouse_Locations
          model: 'Warehouse_Locations',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL' // Nếu vị trí kho đó bị xóa/sửa, sản phẩm tạm thời đưa vị trí về null
      },
      category_id: {
        type: Sequelize.INTEGER,
        allowNull: false, // FIX: Bắt buộc phụ tùng phải thuộc về một nhóm phân loại cụ thể
        references: {     // FIX: Tạo khóa ngoại liên kết sang bảng Part_Categories
          model: 'Part_Categories',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'RESTRICT' // Chặn không cho xóa danh mục nếu bên trong danh mục đó vẫn còn phụ tùng
      },
      warranty_type: {
        type: Sequelize.STRING(20),
        allowNull: false,
        defaultValue: 'NONE' // FIX: Các giá trị hợp lệ: 'TIME', 'DISTANCE', 'BOTH', 'NONE'
      },
      warranty_period_months: {
        type: Sequelize.INTEGER,
        allowNull: true,
        defaultValue: 0
      },
      warranty_km_limit: {
        type: Sequelize.INTEGER,
        allowNull: true,
        defaultValue: 0
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
    await queryInterface.dropTable('Spare_Parts');
  }
};