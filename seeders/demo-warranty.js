"use strict";

module.exports = {
  async up(queryInterface) {
    await queryInterface.bulkInsert(
      "Warranty_Policies",
      [
        {
          policy_code: "NONE",
          policy_name: "No Warranty",
          warranty_type: "NONE",
          duration_months: 0,
          distance_km: 0,
          description: "No warranty provided.",
          is_active: true,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          policy_code: "STD_6M",
          policy_name: "Standard 6 Months",
          warranty_type: "TIME",
          duration_months: 6,
          distance_km: null,
          description:
            "Warranty covers defects for 6 months from installation.",
          is_active: true,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          policy_code: "EXT_12M",
          policy_name: "Extended 12 Months",
          warranty_type: "TIME",
          duration_months: 12,
          distance_km: null,
          description: "Extended warranty for 12 months.",
          is_active: true,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          policy_code: "DIST_10K",
          policy_name: "Distance 10,000 km",
          warranty_type: "DISTANCE",
          duration_months: null,
          distance_km: 10000,
          description: "Warranty valid up to 10,000 km.",
          is_active: true,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          policy_code: "BOTH_24M_50K",
          policy_name: "24 Months or 50,000 km",
          warranty_type: "BOTH",
          duration_months: 24,
          distance_km: 50000,
          description:
            "Warranty valid for 24 months OR 50,000 km, whichever comes first.",
          is_active: true,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ],
      {}
    );
  },

  async down(queryInterface) {
    await queryInterface.bulkDelete(
      "Warranty_Policies",
      {
        policy_code: ["NONE", "STD_6M", "EXT_12M", "DIST_10K", "BOTH_24M_50K"],
      },
      {}
    );
  },
};
