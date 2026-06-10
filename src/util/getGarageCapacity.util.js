const db = require('../../models');
/**
 * Tính toán số lượng xe tối đa có thể tiếp nhận tại một thời điểm.
 * Sức chứa tối đa bằng giá trị nhỏ nhất giữa số lượng nhân viên lễ tân và số lượng khoang sửa chữa (bays).
 */
const getGarageCapacity = async () => {
  try {
    // Đếm số lượng nhân viên lễ tân đang hoạt động
    const receptionistCount = await db.User.count({
      include: [{
        model: db.Role,
        as: 'role',
        where: { roleCode: 'RECEPTIONIST' }
      }],
      where: {
        status: 'ACTIVE'
      }
    });

    // Đếm số lượng khoang sửa chữa (bays) đang hoạt động
    const bayCount = await db.Service_Bays.count({
      where: { is_active: true }
    });

    // Sức chứa là giá trị nhỏ nhất giữa số lượng lễ tân và khoang sửa chữa
    const capacity = Math.min(receptionistCount, bayCount);
    console.log("cap count iss: ", capacity)
    return capacity > 0 ? capacity : 0;
  } catch (error) {
    console.error("Lỗi khi tính toán sức chứa garage:", error);
    throw error;
  }
};

module.exports = getGarageCapacity;
