"use strict";

module.exports = {
  async up(queryInterface) {
    const now = new Date();

    const categoryNames = [
      "Lọc dầu",
      "Má phanh",
      "Bugi",
    ];

    const [existingCategories] = await queryInterface.sequelize.query(
      `SELECT id, category_name FROM "Part_Categories" WHERE category_name IN (${categoryNames
        .map((name) => `'${name.replace(/'/g, "''")}'`)
        .join(", ")})`
    );

    const existingCategoryMap = new Map(
      existingCategories.map((item) => [item.category_name, item.id])
    );

    const categoriesToInsert = categoryNames
      .filter((name) => !existingCategoryMap.has(name))
      .map((name, index) => ({
        category_name: name,
        description: `Danh muc linh kien ${name.toLowerCase()}`,
        pricing_rule_id: null,
        code: `PC${String(index + 1).padStart(2, "0")}`,
        is_active: true,
        createdAt: now,
        updatedAt: now,
      }));

    if (categoriesToInsert.length > 0) {
      await queryInterface.bulkInsert("Part_Categories", categoriesToInsert);
    }

    await queryInterface.sequelize.query(`
      UPDATE "Part_Categories"
      SET
        code = CASE category_name
          WHEN 'Lọc dầu' THEN 'PC01'
          WHEN 'Má phanh' THEN 'PC02'
          WHEN 'Bugi' THEN 'PC03'
          ELSE code
        END,
        description = CASE category_name
          WHEN 'Lọc dầu' THEN 'Danh muc linh kien loc dau'
          WHEN 'Má phanh' THEN 'Danh muc linh kien ma phanh'
          WHEN 'Bugi' THEN 'Danh muc linh kien bugi'
          ELSE description
        END,
        is_active = true,
        "updatedAt" = NOW()
      WHERE category_name IN ('Lọc dầu', 'Má phanh', 'Bugi')
    `);

    const [categories] = await queryInterface.sequelize.query(
      `SELECT id, category_name FROM "Part_Categories" WHERE category_name IN (${categoryNames
        .map((name) => `'${name.replace(/'/g, "''")}'`)
        .join(", ")})`
    );

    const categoryMap = new Map(
      categories.map((item) => [item.category_name, item.id])
    );

    const skus = [
      "SP-TOY-0001",
      "SP-HON-0002",
      "SP-BMW-0003",
      "SP-MER-0004",
      "SP-AUD-0005",
      "SP-TOY-0006",
    ];

    const [existingParts] = await queryInterface.sequelize.query(
      `SELECT sku FROM "Spare_Parts" WHERE sku IN (${skus
        .map((sku) => `'${sku}'`)
        .join(", ")})`
    );

    const existingSkuSet = new Set(existingParts.map((item) => item.sku));

    const parts = [
      {
        sku: "SP-TOY-0001",
        name: "Lọc dầu động cơ Toyota Vios",
        brand: "Toyota",
        stock_quantity: 25,
        min_threshold: 5,
        cogs: 85000,
        retail_price: 120000,
        location_id: null,
        category_id: categoryMap.get("Lọc dầu"),
        warranty_type: "NONE",
        warranty_period_months: 0,
        warranty_km_limit: 0,
        createdAt: now,
        updatedAt: now,
      },
      {
        sku: "SP-HON-0002",
        name: "Má phanh trước Honda City",
        brand: "Honda",
        stock_quantity: 18,
        min_threshold: 5,
        cogs: 420000,
        retail_price: 560000,
        location_id: null,
        category_id: categoryMap.get("Má phanh"),
        warranty_type: "TIME",
        warranty_period_months: 6,
        warranty_km_limit: 0,
        createdAt: now,
        updatedAt: now,
      },
      {
        sku: "SP-BMW-0003",
        name: "Bugi BMW 320i",
        brand: "BMW",
        stock_quantity: 12,
        min_threshold: 3,
        cogs: 190000,
        retail_price: 280000,
        location_id: null,
        category_id: categoryMap.get("Bugi"),
        warranty_type: "NONE",
        warranty_period_months: 0,
        warranty_km_limit: 0,
        createdAt: now,
        updatedAt: now,
      },
      {
        sku: "SP-MER-0004",
        name: "Lọc dầu Mercedes C200",
        brand: "Mercedes-Benz",
        stock_quantity: 10,
        min_threshold: 3,
        cogs: 210000,
        retail_price: 320000,
        location_id: null,
        category_id: categoryMap.get("Lọc dầu"),
        warranty_type: "NONE",
        warranty_period_months: 0,
        warranty_km_limit: 0,
        createdAt: now,
        updatedAt: now,
      },
      {
        sku: "SP-AUD-0005",
        name: "Má phanh sau Audi A4",
        brand: "Audi",
        stock_quantity: 8,
        min_threshold: 2,
        cogs: 680000,
        retail_price: 890000,
        location_id: null,
        category_id: categoryMap.get("Má phanh"),
        warranty_type: "TIME",
        warranty_period_months: 6,
        warranty_km_limit: 0,
        createdAt: now,
        updatedAt: now,
      },
      {
        sku: "SP-TOY-0006",
        name: "Bugi Toyota Altis",
        brand: "Toyota",
        stock_quantity: 20,
        min_threshold: 4,
        cogs: 110000,
        retail_price: 175000,
        location_id: null,
        category_id: categoryMap.get("Bugi"),
        warranty_type: "NONE",
        warranty_period_months: 0,
        warranty_km_limit: 0,
        createdAt: now,
        updatedAt: now,
      },
    ].filter(
      (part) => part.category_id && !existingSkuSet.has(part.sku)
    );

    if (parts.length > 0) {
      await queryInterface.bulkInsert("Spare_Parts", parts);
    }
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete(
      "Spare_Parts",
      {
        sku: {
          [Sequelize.Op.in]: [
            "SP-TOY-0001",
            "SP-HON-0002",
            "SP-BMW-0003",
            "SP-MER-0004",
            "SP-AUD-0005",
            "SP-TOY-0006",
          ],
        },
      }
    );

    await queryInterface.bulkDelete(
      "Part_Categories",
      {
        category_name: {
          [Sequelize.Op.in]: ["Lọc dầu", "Má phanh", "Bugi"],
        },
      }
    );
  },
};
