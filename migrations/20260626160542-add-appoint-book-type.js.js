// 'use strict';

// module.exports = {
//   async up(queryInterface, Sequelize) {
//     await queryInterface.addColumn('Appointments', 'booking_type', {
//       type: Sequelize.STRING(50),
//       allowNull: false,
//     });
//   },

//   async down(queryInterface, Sequelize) {
//     await queryInterface.removeColumn('Appointments', 'booking_type');
//   }
// };
module.exports = {
  async up(queryInterface, Sequelize) {
    // Đã thêm trong DB nên để trống
  },

  async down(queryInterface, Sequelize) {
    // Để trống
  }
};