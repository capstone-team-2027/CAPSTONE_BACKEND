const db = require("../../../models");
const { Op, fn, col, literal, Sequelize } = require("sequelize");

const Spare_Parts = db.Spare_Parts;
const Inventory_Logs = db.Inventory_Logs;
const Service_Orders = db.Service_Orders;
const Workshop_Tools = db.Workshop_Tools;
const Tool_History = db.Tool_History;
const User = db.User;
const Role = db.Role;

/**
 * Build a Sequelize date filter for a column.
 */
function buildDateFilter(col, start, end) {
  if (!start && !end) return {};
  const filter = {};
  if (start) {
    const s = new Date(start);
    s.setHours(0, 0, 0, 0);
    filter[Op.gte] = s;
  }
  if (end) {
    const e = new Date(end);
    e.setHours(23, 59, 59, 999);
    if (filter[Op.gte] && filter[Op.gte] > e) {
      throw { status: 400, message: "Ngày bắt đầu phải nhỏ hơn ngày kết thúc" };
    }
    filter[Op.lte] = e;
  }
  return filter;
}

module.exports.getFinancialReport = async ({ startDate, endDate }) => {
  const dateFilter = buildDateFilter("createdAt", startDate, endDate);
  const hasDates = Object.keys(dateFilter).length > 0;

  // ─────────────────────────────────────────────────────────────────
  // REVENUE SOURCES
  // ─────────────────────────────────────────────────────────────────

  // 1. Revenue from parts sales: OUT logs × retail_price
  const partSaleLogs = await Inventory_Logs.findAll({
    where: {
      type: "OUT",
      service_order_id: { [Op.ne]: null }, // sold via a service order
      ...(hasDates ? { createdAt: dateFilter } : {}),
    },
    include: [
      {
        model: Spare_Parts,
        as: "part",
        attributes: ["id", "name", "retail_price", "cogs"],
      },
    ],
    attributes: ["id", "part_id", "quantity", "createdAt"],
  });

  const partsRevenueItems = partSaleLogs.map((log) => ({
    date: log.createdAt,
    description: `Bán linh kiện: ${log.part?.name || "N/A"}`,
    quantity: log.quantity,
    unitPrice: parseFloat(log.part?.retail_price || 0),
    amount: log.quantity * parseFloat(log.part?.retail_price || 0),
    category: "parts_sales",
  }));

  const totalPartsRevenue = partsRevenueItems.reduce((s, i) => s + i.amount, 0);

  // 2. Revenue from completed service orders (flat rate per completed order)
  //    Since there's no invoice table, we estimate using the number of completed service orders
  //    and the average service value from Service_Catalogs pricing_rules.
  //    We use a representative flat 500,000 VND / order as placeholder.
  const FLAT_SERVICE_VALUE = 500000;

  const completedOrders = await Service_Orders.findAll({
    where: {
      status: "COMPLETED",
      ...(hasDates ? { updatedAt: dateFilter } : {}),
    },
    attributes: ["id", "updatedAt", "receptionist_id"],
  });

  const serviceRevenueItems = completedOrders.map((o) => ({
    date: o.updatedAt,
    description: `Dịch vụ sửa chữa hoàn thành #${o.id}`,
    quantity: 1,
    unitPrice: FLAT_SERVICE_VALUE,
    amount: FLAT_SERVICE_VALUE,
    category: "service",
  }));

  const totalServiceRevenue = serviceRevenueItems.reduce((s, i) => s + i.amount, 0);

  // ─────────────────────────────────────────────────────────────────
  // EXPENSE SOURCES
  // ─────────────────────────────────────────────────────────────────

  // 3. Cost of purchasing / importing spare parts: IN logs × cogs
  const partImportLogs = await Inventory_Logs.findAll({
    where: {
      type: "IN",
      ...(hasDates ? { createdAt: dateFilter } : {}),
    },
    include: [
      {
        model: Spare_Parts,
        as: "part",
        attributes: ["id", "name", "cogs"],
      },
    ],
    attributes: ["id", "part_id", "quantity", "createdAt"],
  });

  const partImportItems = partImportLogs.map((log) => ({
    date: log.createdAt,
    description: `Nhập linh kiện: ${log.part?.name || "N/A"}`,
    quantity: log.quantity,
    unitPrice: parseFloat(log.part?.cogs || 0),
    amount: log.quantity * parseFloat(log.part?.cogs || 0),
    category: "parts_import",
  }));

  const totalPartsImport = partImportItems.reduce((s, i) => s + i.amount, 0);

  // 4. Tool maintenance & repair costs
  const toolHistoryFilter = {};
  if (hasDates) {
    toolHistoryFilter.event_date = buildDateFilter("event_date", startDate, endDate);
  }

  const toolHistories = await Tool_History.findAll({
    where: {
      cost: { [Op.gt]: 0 },
      ...toolHistoryFilter,
    },
    include: [
      {
        model: Workshop_Tools,
        as: "tool",
        attributes: ["id", "tool_name"],
      },
    ],
    attributes: ["id", "tool_id", "event_type", "event_date", "cost", "description"],
  });

  const toolExpenseItems = toolHistories.map((h) => ({
    date: h.event_date,
    description: `${h.event_type === "MAINTENANCE" ? "Bảo trì" : "Sửa chữa"} thiết bị: ${h.tool?.tool_name || "N/A"}${h.description ? " — " + h.description : ""}`,
    quantity: 1,
    unitPrice: parseFloat(h.cost),
    amount: parseFloat(h.cost),
    category: "tool_maintenance",
  }));

  const totalToolExpense = toolExpenseItems.reduce((s, i) => s + i.amount, 0);

  // 5. Payroll expense – estimated from active staff count
  //    Flat salary: ADMIN=20M, RECEPTIONIST=10M, TECHNICIAN=12M, MANAGER=15M / month
  const SALARY_MAP = {
    ADMIN: 20_000_000,
    MANAGER: 15_000_000,
    TECHNICIAN: 12_000_000,
    RECEPTIONIST: 10_000_000,
  };
  const DEFAULT_SALARY = 10_000_000;

  const activeStaff = await User.findAll({
    where: { status: "ACTIVE" },
    include: [{ model: Role, as: "role", attributes: ["roleCode", "roleName"] }],
    attributes: ["id", "fullName", "createdAt"],
  });

  // Calculate how many months the date range spans (default 1 if no filter)
  let monthsInRange = 1;
  if (startDate && endDate) {
    const s = new Date(startDate);
    const e = new Date(endDate);
    monthsInRange = Math.max(
      1,
      Math.round((e - s) / (1000 * 60 * 60 * 24 * 30))
    );
  }

  const payrollItems = activeStaff.map((u) => {
    const roleCode = u.role?.roleCode?.toUpperCase() || "";
    const monthlySalary = SALARY_MAP[roleCode] || DEFAULT_SALARY;
    return {
      date: new Date(),
      description: `Lương nhân viên: ${u.fullName} (${u.role?.roleName || roleCode})`,
      quantity: monthsInRange,
      unitPrice: monthlySalary,
      amount: monthlySalary * monthsInRange,
      category: "payroll",
    };
  });

  const totalPayroll = payrollItems.reduce((s, i) => s + i.amount, 0);

  // ─────────────────────────────────────────────────────────────────
  // AGGREGATION
  // ─────────────────────────────────────────────────────────────────

  const totalRevenue = totalPartsRevenue + totalServiceRevenue;
  const totalExpense = totalPartsImport + totalToolExpense + totalPayroll;
  const netProfit = totalRevenue - totalExpense;

  return {
    summary: {
      totalRevenue,
      totalExpense,
      netProfit,
      profitMargin: totalRevenue > 0 ? ((netProfit / totalRevenue) * 100).toFixed(1) : "0.0",
      breakdown: {
        revenue: {
          service: totalServiceRevenue,
          parts_sales: totalPartsRevenue,
        },
        expense: {
          parts_import: totalPartsImport,
          tool_maintenance: totalToolExpense,
          payroll: totalPayroll,
        },
      },
    },
    transactions: {
      revenue: [...serviceRevenueItems, ...partsRevenueItems].sort(
        (a, b) => new Date(b.date) - new Date(a.date)
      ),
      expense: [...partImportItems, ...toolExpenseItems, ...payrollItems].sort(
        (a, b) => new Date(b.date) - new Date(a.date)
      ),
    },
    counts: {
      completedOrders: completedOrders.length,
      partSaleTransactions: partsRevenueItems.length,
      partImportTransactions: partImportItems.length,
      toolMaintenanceCount: toolHistories.length,
      activeStaff: activeStaff.length,
    },
  };
};
