"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    const now = new Date();

    // 1) Insert categories
    const categories = [
      {
        category_name: "Bảo dưỡng cơ bản",
        is_active: true,
        createdAt: now,
        updatedAt: now,
      },
      {
        category_name: "Thay dầu",
        is_active: true,
        createdAt: now,
        updatedAt: now,
      },
      {
        category_name: "Sửa chữa điện",
        is_active: true,
        createdAt: now,
        updatedAt: now,
      },
      {
        category_name: "Làm đẹp xe",
        is_active: true,
        createdAt: now,
        updatedAt: now,
      },
    ];
    await queryInterface.bulkInsert("Service_Categories", categories, {});

    // 2) Read inserted category ids
    const [rows] = await queryInterface.sequelize.query(
      `SELECT id, category_name FROM "Service_Categories" WHERE category_name IN (${categories
        .map((c) => `'${c.category_name.replace("'", "''")}'`)
        .join(",")})`
    );

    const catId = {};
    rows.forEach((r) => {
      catId[r.category_name] = r.id;
    });

    // 3) Insert services referencing category ids
    const services = [
      // Bảo dưỡng cơ bản
      {
        service_name: "Kiểm tra tổng quát",
        estimated_duration: 30,
        category_id: catId["Bảo dưỡng cơ bản"],
        createdAt: now,
        updatedAt: now,
      },
      {
        service_name: "Vệ sinh lọc gió",
        estimated_duration: 20,
        category_id: catId["Bảo dưỡng cơ bản"],
        createdAt: now,
        updatedAt: now,
      },

      // Thay dầu
      {
        service_name: "Thay dầu động cơ",
        estimated_duration: 45,
        category_id: catId["Thay dầu"],
        createdAt: now,
        updatedAt: now,
      },
      {
        service_name: "Thay dầu hộp số",
        estimated_duration: 60,
        category_id: catId["Thay dầu"],
        createdAt: now,
        updatedAt: now,
      },

      // Sửa chữa điện
      {
        service_name: "Kiểm tra hệ thống điện",
        estimated_duration: 40,
        category_id: catId["Sửa chữa điện"],
        createdAt: now,
        updatedAt: now,
      },
      {
        service_name: "Thay ắc quy",
        estimated_duration: 30,
        category_id: catId["Sửa chữa điện"],
        createdAt: now,
        updatedAt: now,
      },

      // Làm đẹp xe
      {
        service_name: "Rửa xe & hút bụi",
        estimated_duration: 25,
        category_id: catId["Làm đẹp xe"],
        createdAt: now,
        updatedAt: now,
      },
      {
        service_name: "Đánh bóng",
        estimated_duration: 90,
        category_id: catId["Làm đẹp xe"],
        createdAt: now,
        updatedAt: now,
      },
    ];

    // Filter out any service where category id not found (safety)
    const servicesToInsert = services.filter((s) => s.category_id);
    if (servicesToInsert.length) {
      await queryInterface.bulkInsert("Service_Catalogs", servicesToInsert, {});
    }
  },

  async down(queryInterface, Sequelize) {
    // remove seeded services and categories
    const serviceNames = [
      "Kiểm tra tổng quát",
      "Vệ sinh lọc gió",
      "Thay dầu động cơ",
      "Thay dầu hộp số",
      "Kiểm tra hệ thống điện",
      "Thay ắc quy",
      "Rửa xe & hút bụi",
      "Đánh bóng",
    ];
    await queryInterface.bulkDelete(
      "Service_Catalogs",
      {
        service_name: { [Sequelize.Op.in]: serviceNames },
      },
      {}
    );

    const categoryNames = [
      "Bảo dưỡng cơ bản",
      "Thay dầu",
      "Sửa chữa điện",
      "Làm đẹp xe",
    ];
    await queryInterface.bulkDelete(
      "Service_Categories",
      {
        category_name: { [Sequelize.Op.in]: categoryNames },
      },
      {}
    );
  },
};
