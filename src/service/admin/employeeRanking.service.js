const db = require("../../../models");
const { Op, fn, col, literal } = require("sequelize");

const User = db.User;
const Role = db.Role;
const Service_Orders = db.Service_Orders;

/**
 * Compute employee ranking.
 * - "completed tasks"  = count of Service_Orders where status = 'COMPLETED' and receptionist_id = user.id
 * - "revenue contrib." = count * average ticket value (we store a flat 500,000 VND per order as placeholder
 *    since the schema has no invoice / price column yet; replace with real join when billing model exists)
 * - "rating"           = random seeded per employee (4.0 – 5.0) — replace with real reviews when available
 */
module.exports.getEmployeeRanking = async ({ startDate, endDate }) => {
  // Build date filter on Service_Orders.updatedAt (when order last changed to COMPLETED)
  const dateFilter = { status: "COMPLETED" };
  if (startDate && endDate) {
    const start = new Date(startDate);
    const end = new Date(endDate);
    end.setHours(23, 59, 59, 999);
    if (isNaN(start.getTime()) || isNaN(end.getTime()) || start > end) {
      throw { status: 400, message: "Khoảng thời gian lọc không hợp lệ" };
    }
    dateFilter.updatedAt = { [Op.between]: [start, end] };
  }

  // Fetch all non-customer staff
  const staffList = await User.findAll({
    include: [
      {
        model: Role,
        as: "role",
        where: { roleCode: { [Op.ne]: "CUSTOMER" } },
        attributes: ["id", "roleCode", "roleName"],
      },
    ],
    attributes: ["id", "fullName", "phoneNumber", "status", "avatar", "createdAt"],
  });

  if (!staffList || staffList.length === 0) {
    return [];
  }

  // For each staff, count completed orders they received
  const rankings = await Promise.all(
    staffList.map(async (staff) => {
      const completedCount = await Service_Orders.count({
        where: { receptionist_id: staff.id, ...dateFilter },
      });

      // Placeholder revenue: 500,000 VND per completed order
      const revenue = completedCount * 500000;

      // Deterministic pseudo-rating seeded by staff id (4.0 – 5.0 range)
      const rating = parseFloat((4.0 + ((staff.id * 37) % 100) / 100).toFixed(1));

      // Performance score = 40% tasks weight + 60% rating weight (normalised to 100)
      // We'll normalise across the final set after we have all data
      return {
        id: staff.id,
        fullName: staff.fullName,
        phoneNumber: staff.phoneNumber,
        avatar: staff.avatar || "",
        role: staff.role?.roleName || staff.role?.roleCode || "Nhân viên",
        roleCode: staff.role?.roleCode || "",
        status: staff.status,
        workDate: staff.createdAt,
        completedTasks: completedCount,
        revenueContribution: revenue,
        rating,
        performanceScore: 0, // will be set below after normalisation
      };
    })
  );

  // Normalise performance score 0–100 relative to the top performer
  const maxTasks = Math.max(...rankings.map((r) => r.completedTasks), 1);
  const maxRevenue = Math.max(...rankings.map((r) => r.revenueContribution), 1);

  const scored = rankings.map((r) => ({
    ...r,
    performanceScore: parseFloat(
      (
        ((r.completedTasks / maxTasks) * 40 +
          (r.revenueContribution / maxRevenue) * 30 +
          ((r.rating - 4.0) / 1.0) * 30) *
        1
      ).toFixed(1)
    ),
  }));

  // Sort by performanceScore DESC
  scored.sort((a, b) => b.performanceScore - a.performanceScore);

  return scored;
};
