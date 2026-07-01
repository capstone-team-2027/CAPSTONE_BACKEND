const STATUS_LABELS = {
  PENDING: "Chờ xác nhận",
  APPROVED: "Đã đồng ý",
  REJECTED: "Đã từ chối",
  EXPORTED: "Đã xuất kho",
};

module.exports.quotationEmailTemplate = (quotation, customer = {}) => {
  const items = quotation.items || [];
  const statusLabel = STATUS_LABELS[quotation.status] || quotation.status;
  const itemRows = items
    .map((item) => {
      const name = item.sparePart?.name || "Tiền công sửa chữa";
      const type = item.sparePart ? "Phụ tùng" : "Tiền công";
      const price = item.sparePart ? item.unit_price : item.repair_price;
      return `
        <tr>
          <td style="padding: 10px; border: 1px solid #e0e0e0;">${name}</td>
          <td style="padding: 10px; border: 1px solid #e0e0e0;">${type}</td>
          <td style="padding: 10px; border: 1px solid #e0e0e0; text-align: center;">${item.quantity}</td>
          <td style="padding: 10px; border: 1px solid #e0e0e0; text-align: right;">${Number(price).toLocaleString("vi-VN")} VNĐ</td>
          <td style="padding: 10px; border: 1px solid #e0e0e0; text-align: right;">${Number(item.amount).toLocaleString("vi-VN")} VNĐ</td>
        </tr>
      `;
    })
    .join("");
  return `
  <div style="font-family: Arial, sans-serif; max-width: 640px; margin: 0 auto; background: #ffffff; border-radius: 8px; overflow: hidden; border: 1px solid #e0e0e0;">
    <div style="background: #1a73e8; padding: 24px; color: #ffffff;">
      <h2 style="margin: 0;">Báo giá sửa chữa #${quotation.id}</h2>
    </div>
    <div style="padding: 24px;">
      <h3 style="margin-top: 0; color: #1a73e8;">Thông tin khách hàng</h3>
      <table style="width: 100%; border-collapse: collapse; margin-bottom: 24px;">
        <tr>
          <td style="padding: 8px; color: #666; width: 140px;">Họ tên</td>
          <td style="padding: 8px;">${customer.name || ""}</td>
        </tr>
        <tr>
          <td style="padding: 8px; color: #666;">Số điện thoại</td>
          <td style="padding: 8px;">${customer.phone || ""}</td>
        </tr>
        <tr>
          <td style="padding: 8px; color: #666;">Email</td>
          <td style="padding: 8px;">${customer.email || ""}</td>
        </tr>
      </table>
      <h3 style="color: #1a73e8;">Chi tiết báo giá</h3>
      <table style="width: 100%; border-collapse: collapse; margin-bottom: 24px;">
        <thead>
          <tr style="background: #f2f6fc;">
            <th style="padding: 10px; border: 1px solid #e0e0e0; text-align: left;">Tên</th>
            <th style="padding: 10px; border: 1px solid #e0e0e0; text-align: left;">Loại</th>
            <th style="padding: 10px; border: 1px solid #e0e0e0;">SL</th>
            <th style="padding: 10px; border: 1px solid #e0e0e0; text-align: right;">Đơn giá</th>
            <th style="padding: 10px; border: 1px solid #e0e0e0; text-align: right;">Thành tiền</th>
          </tr>
        </thead>
        <tbody>
          ${itemRows}
        </tbody>
      </table>

      <table style="border-collapse: collapse; margin-left: auto; margin-bottom: 24px;">
        <tr>
          <td style="padding: 4px 8px; text-align: right; color: #666;">Tổng tiền</td>
          <td style="padding: 4px 8px; text-align: right; font-weight: bold; color: #1a73e8; width: 120px;">${Number(quotation.total_amount).toLocaleString("vi-VN")} VNĐ</td>
        </tr>
        <tr>
          <td style="padding: 4px 8px; text-align: right; color: #666;">Trạng thái</td>
          <td style="padding: 4px 8px; text-align: right; width: 120px;">${statusLabel}</td>
        </tr>
        ${
          quotation.note
            ? `<tr>
          <td style="padding: 4px 8px; text-align: right; color: #666;">Ghi chú</td>
          <td style="padding: 4px 8px; text-align: right; width: 120px;">${quotation.note}</td>
        </tr>`
            : ""
        }
      </table>
      <p style="color: #444;">Vui lòng xác nhận báo giá để chúng tôi tiến hành sửa chữa:</p>
      <div style="text-align: center; margin: 24px 0;">
        <a href="#" style="display: inline-block; padding: 12px 32px; margin: 0 8px; background: #34a853; color: #ffffff; text-decoration: none; border-radius: 6px; font-weight: bold;">Đồng ý</a>
        <a href="#" style="display: inline-block; padding: 12px 32px; margin: 0 8px; background: #ea4335; color: #ffffff; text-decoration: none; border-radius: 6px; font-weight: bold;">Từ chối</a>
      </div>
      <p style="color: #999; font-size: 12px; text-align: center; margin-top: 24px;">Vui lòng liên hệ garage nếu bạn có thắc mắc.</p>
    </div>
  </div>
  `;
};
