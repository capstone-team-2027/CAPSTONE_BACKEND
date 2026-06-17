'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    // 1. Chèn hãng xe "VinFast" vào bảng Vehicle_Makes nếu chưa tồn tại
    // Để an toàn và tránh duplicate key, ta dùng câu truy vấn kiểm tra trước
    const [existingMakes] = await queryInterface.sequelize.query(
      `SELECT id FROM "Vehicle_Makes" WHERE make_name = 'VinFast' LIMIT 1;`
    );

    let makeId;
    if (existingMakes && existingMakes.length > 0) {
      makeId = existingMakes[0].id;
    } else {
      await queryInterface.bulkInsert('Vehicle_Makes', [
        {
          make_name: 'VinFast',
          createdAt: new Date(),
          updatedAt: new Date()
        }
      ], {});

      const [newMakes] = await queryInterface.sequelize.query(
        `SELECT id FROM "Vehicle_Makes" WHERE make_name = 'VinFast' LIMIT 1;`
      );
      makeId = newMakes[0].id;
    }

    // 2. Chèn danh sách các dòng xe tương ứng vào bảng Vehicle_Models
    return queryInterface.bulkInsert('Vehicle_Models', [
      {
        make_id: makeId,
        model_name: 'VF 3',
        vehicle_type: 'Mini SUV',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        make_id: makeId,
        model_name: 'VF 5 Plus',
        vehicle_type: 'SUV',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        make_id: makeId,
        model_name: 'VF 6',
        vehicle_type: 'SUV',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        make_id: makeId,
        model_name: 'VF e34',
        vehicle_type: 'SUV',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        make_id: makeId,
        model_name: 'VF 7',
        vehicle_type: 'SUV',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        make_id: makeId,
        model_name: 'VF 8',
        vehicle_type: 'SUV',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        make_id: makeId,
        model_name: 'VF 9',
        vehicle_type: 'SUV',
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ], {});
  },

  async down(queryInterface, Sequelize) {
    const [makes] = await queryInterface.sequelize.query(
      `SELECT id FROM "Vehicle_Makes" WHERE make_name = 'VinFast' LIMIT 1;`
    );

    if (makes && makes.length > 0) {
      const makeId = makes[0].id;

      // Xóa các dòng xe con trước do ràng buộc khóa ngoại (Foreign Key)
      await queryInterface.bulkDelete('Vehicle_Models', { make_id: makeId }, {});

      // Xóa hãng xe VinFast
      await queryInterface.bulkDelete('Vehicle_Makes', { id: makeId }, {});
    }
  }
};
