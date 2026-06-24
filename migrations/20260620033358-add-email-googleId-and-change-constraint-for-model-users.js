"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    // Thêm cột googleId
    await queryInterface.addColumn("Users", "googleId", {
      type: Sequelize.STRING,
      allowNull: true,
      unique: true,
    });

    // Thêm cột email
    await queryInterface.addColumn("Users", "email", {
      type: Sequelize.STRING,
      allowNull: true,
    });

    // Cho phép phoneNumber null
    await queryInterface.changeColumn("Users", "phoneNumber", {
      type: Sequelize.STRING(20),
      allowNull: true,
    });

    // Cho phép password null
    await queryInterface.changeColumn("Users", "password", {
      type: Sequelize.STRING,
      allowNull: true,
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn("Users", "googleId");
    await queryInterface.removeColumn("Users", "email");

    await queryInterface.changeColumn("Users", "phoneNumber", {
      type: Sequelize.STRING(20),
      allowNull: false,
    });

    await queryInterface.changeColumn("Users", "password", {
      type: Sequelize.STRING,
      allowNull: false,
    });
  },
};