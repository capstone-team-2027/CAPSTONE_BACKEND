const db = require("../../../models");
const Quotation = db.Quotations;
const transporter = require("../../config/mailer.config");

module.exports.approveQuotation = async (id, email) => {
  const quotation = await Quotation.findOne({ where: { id: id } });
  if (!quotation) {
    throw { status: 404, message: "Báo giá không tồn tại" };
  }
  if (quotation.status !== "PENDING") {
    throw { status: 400, message: "Báo giá đã được xử lý, không thể thay đổi" };
  }
  await quotation.update({ status: "APPROVED", approved_at: new Date() });
  if (email) {
    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: email,
      subject: "Xác nhận đồng ý báo giá",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 640px; margin: 0 auto;">
          <h2 style="color: #34a853;">Bạn đã đồng ý báo giá #${quotation.id}</h2>
          <p>Garage sẽ tiến hành sửa chữa xe của bạn. Bạn có thể theo dõi tiến độ tại link bên dưới:</p>
          <a href="${process.env.FRONTEND_URL}/track" style="display: inline-block; padding: 12px 32px; background: #1a73e8; color: #ffffff; text-decoration: none; border-radius: 6px;">Theo dõi tiến độ</a>
        </div>
      `,
    });
  }
  return quotation;
};

module.exports.rejectQuotation = async (id) => {
  const quotation = await Quotation.findOne({ where: { id: id } });
  if (!quotation) {
    throw { status: 404, message: "Báo giá không tồn tại" };
  }
  if (quotation.status !== "PENDING") {
    throw { status: 400, message: "Báo giá đã được xử lý, không thể thay đổi" };
  }
  await quotation.update({ status: "REJECTED" });
  return quotation;
};