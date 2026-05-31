"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    const now = new Date();

    // Clear old data to avoid duplication/unique name constraint issues
    await queryInterface.bulkDelete("Service_Catalogs", null, {});
    await queryInterface.bulkDelete("Service_Categories", null, {});

    // 1) Insert Categories
    const categories = [
      {
        category_name: "Bảo dưỡng định kỳ",
        is_active: true,
        createdAt: now,
        updatedAt: now,
      },
      {
        category_name: "Sửa chữa động cơ",
        is_active: true,
        createdAt: now,
        updatedAt: now,
      },
      {
        category_name: "Dịch vụ lốp & phanh",
        is_active: true,
        createdAt: now,
        updatedAt: now,
      },
      {
        category_name: "Chăm sóc nội thất",
        is_active: true,
        createdAt: now,
        updatedAt: now,
      },
      {
        category_name: "Chẩn đoán điện tử",
        is_active: true,
        createdAt: now,
        updatedAt: now,
      },
      {
        category_name: "Cứu hộ 24/7",
        is_active: true,
        createdAt: now,
        updatedAt: now,
      },
    ];
    await queryInterface.bulkInsert("Service_Categories", categories, {});

    // 2) Read inserted category ids
    const [rows] = await queryInterface.sequelize.query(
      `SELECT id, category_name FROM "Service_Categories"`
    );

    const catId = {};
    rows.forEach((r) => {
      catId[r.category_name] = r.id;
    });

    // 3) Insert Services
    const services = [
      // Bảo dưỡng định kỳ
      {
        service_name: "Bảo dưỡng định kỳ cấp 1 (5,000 km)",
        estimated_duration: 45,
        category_id: catId["Bảo dưỡng định kỳ"],
        description: "Kiểm tra tổng quát gầm, thay nhớt động cơ, vệ sinh lọc gió và châm nước rửa kính.",
        is_active: true,
        createdAt: now,
        updatedAt: now,
      },
      {
        service_name: "Bảo dưỡng định kỳ cấp 2 (10,000 km)",
        estimated_duration: 60,
        category_id: catId["Bảo dưỡng định kỳ"],
        description: "Thay nhớt & lọc nhớt động cơ, vệ sinh phanh 4 bánh, kiểm tra đảo lốp.",
        is_active: true,
        createdAt: now,
        updatedAt: now,
      },
      {
        service_name: "Bảo dưỡng định kỳ cấp 3 (20,000 km)",
        estimated_duration: 90,
        category_id: catId["Bảo dưỡng định kỳ"],
        description: "Bao gồm cấp 2 + thay lọc gió điều hòa, lọc gió động cơ, châm các dung dịch.",
        is_active: true,
        createdAt: now,
        updatedAt: now,
      },
      {
        service_name: "Thay dầu động cơ & lọc dầu",
        estimated_duration: 30,
        category_id: catId["Bảo dưỡng định kỳ"],
        description: "Sử dụng dầu tổng hợp cao cấp chuẩn hãng để xe vận hành êm ái.",
        is_active: true,
        createdAt: now,
        updatedAt: now,
      },

      // Sửa chữa động cơ
      {
        service_name: "Kiểm tra & Vệ sinh kim phun buồng đốt",
        estimated_duration: 60,
        category_id: catId["Sửa chữa động cơ"],
        description: "Làm sạch muội than carbon buồng đốt giúp tối ưu công suất và tiết kiệm nhiên liệu.",
        is_active: true,
        createdAt: now,
        updatedAt: now,
      },
      {
        service_name: "Thay thế dây curoa cam động cơ",
        estimated_duration: 120,
        category_id: catId["Sửa chữa động cơ"],
        description: "Thay thế định kỳ bộ dây curoa cam và bi tăng tì tránh đứt dây hỏng động cơ.",
        is_active: true,
        createdAt: now,
        updatedAt: now,
      },
      {
        service_name: "Xử lý rò rỉ dầu gioăng nắp giàn cò",
        estimated_duration: 90,
        category_id: catId["Sửa chữa động cơ"],
        description: "Khắc phục triệt để vết thấm dầu khoang máy bằng gioăng chất lượng cao.",
        is_active: true,
        createdAt: now,
        updatedAt: now,
      },

      // Dịch vụ lốp & phanh
      {
        service_name: "Cân bằng động lốp xe bằng máy Hunter",
        estimated_duration: 30,
        category_id: catId["Dịch vụ lốp & phanh"],
        description: "Khắc phục rung vô lăng ở tốc độ cao bằng thiết bị cân bằng chuyên dụng.",
        is_active: true,
        createdAt: now,
        updatedAt: now,
      },
      {
        service_name: "Cân chỉnh góc đặt bánh xe 3D",
        estimated_duration: 45,
        category_id: catId["Dịch vụ lốp & phanh"],
        description: "Hiệu chỉnh góc chụm camber thước lái tránh nhao lái và mòn không đều lốp.",
        is_active: true,
        createdAt: now,
        updatedAt: now,
      },
      {
        service_name: "Thay má phanh trước (cặp)",
        estimated_duration: 45,
        category_id: catId["Dịch vụ lốp & phanh"],
        description: "Thay thế má phanh mòn đảm bảo hiệu suất dừng xe an toàn tối đa.",
        is_active: true,
        createdAt: now,
        updatedAt: now,
      },

      // Chăm sóc nội thất
      {
        service_name: "Vệ sinh & dưỡng nội thất chuyên sâu",
        estimated_duration: 120,
        category_id: catId["Chăm sóc nội thất"],
        description: "Làm sạch sâu da, nhựa, trần, sàn bằng dung dịch Meguiar's và dưỡng bóng cao cấp.",
        is_active: true,
        createdAt: now,
        updatedAt: now,
      },
      {
        service_name: "Khử mùi diệt khuẩn cabin bằng Ozon",
        estimated_duration: 30,
        category_id: catId["Chăm sóc nội thất"],
        description: "Diệt nấm mốc, vi khuẩn có hại và khử mùi khó chịu trong hệ thống điều hòa.",
        is_active: true,
        createdAt: now,
        updatedAt: now,
      },

      // Chẩn đoán điện tử
      {
        service_name: "Đọc & xóa mã lỗi hệ thống OBD2",
        estimated_duration: 20,
        category_id: catId["Chẩn đoán điện tử"],
        description: "Sử dụng máy quét lỗi OBD chuyên dụng phát hiện lỗi cảm biến, động cơ, túi khí.",
        is_active: true,
        createdAt: now,
        updatedAt: now,
      },
      {
        service_name: "Kiểm tra chẩn đoán hệ thống điều hòa",
        estimated_duration: 45,
        category_id: catId["Chẩn đoán điện tử"],
        description: "Đo áp suất ga lạnh, nhiệt độ cửa gió và chẩn đoán hoạt động của lốc lạnh.",
        is_active: true,
        createdAt: now,
        updatedAt: now,
      },

      // Cứu hộ 24/7
      {
        service_name: "Cứu hộ kích bình ắc quy lưu động",
        estimated_duration: 30,
        category_id: catId["Cứu hộ 24/7"],
        description: "Hỗ trợ kích nổ xe tại chỗ do hết điện ắc quy trong khu vực nội thành.",
        is_active: true,
        createdAt: now,
        updatedAt: now,
      },
      {
        service_name: "Cứu hộ thay lốp dự phòng ô tô",
        estimated_duration: 30,
        category_id: catId["Cứu hộ 24/7"],
        description: "Thay lốp dự phòng tại hiện trường khi bị đinh hoặc rách xẹp lốp dọc đường.",
        is_active: true,
        createdAt: now,
        updatedAt: now,
      },
      {
        service_name: "Cứu hộ cẩu kéo xe ô tô về xưởng",
        estimated_duration: 60,
        category_id: catId["Cứu hộ 24/7"],
        description: "Cẩu kéo xe gặp tai nạn hoặc hư hỏng nặng về trung tâm dịch vụ bằng xe chuyên dụng.",
        is_active: true,
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
    await queryInterface.bulkDelete("Service_Catalogs", null, {});
    await queryInterface.bulkDelete("Service_Categories", null, {});
  },
};
