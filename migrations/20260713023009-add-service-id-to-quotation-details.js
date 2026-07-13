'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
async up(queryInterface, Sequelize) {
  await queryInterface.addColumn("Quotation_Details", "service_id", {
    type: Sequelize.INTEGER,
    allowNull: true,
    references: { model: "Service_Catalogs", key: "id" },  // FK, xem file mẫu có làm vậy với issue_id không thì làm theo cho đồng bộ
    onUpdate: "CASCADE",
    onDelete: "SET NULL",
  });
},
async down(queryInterface) {
  await queryInterface.removeColumn("Quotation_Details", "service_id");
}

};
