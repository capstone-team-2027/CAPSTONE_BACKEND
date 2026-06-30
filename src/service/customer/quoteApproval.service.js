const db = require("../../../models");
const Quotation = db.Quotations;

module.exports.approveQuotation = async (id) => {
  const quotation = await Quotation.findOne({ where: { id: id } });
  if (!quotation) {
    throw { status: 404, message: "Báo giá không tồn tại" };
  }
  await quotation.update({
    status: "APPROVED",
  });
  return quotation;
};

module.exports.rejectQuotation = async (id) => {
  const quotation = await Quotation.findOne({ where: { id: id } });
  if (!quotation) {
    throw { status: 404, message: "Báo giá không tồn tại" };
  }
  await quotation.update({
    status: "REJECTED",
  });
  return quotation;
};