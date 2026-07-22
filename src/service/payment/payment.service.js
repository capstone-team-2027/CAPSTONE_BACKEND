const db = require("../../../models");


const handleSepayTransaction = async (paymentData) => {
    try {
        const { 
            transferType, 
            transferAmount, 
            content,
            gateway,
            transactionDate,
            accountNumber,
            subAccount,
            code,
            accumulated,
            referenceCode
        } = paymentData;

        // Chỉ xử lý các giao dịch cộng tiền (tiền vào tài khoản)
        if (transferType !== 'in') {
            return { success: true, message: "Không phải giao dịch cộng tiền, bỏ qua." };
        }

        console.log(`💰 [Sepay] Nhận được ${transferAmount} VND. Nội dung: "${content}"`);

        // 1. Phân tích nội dung chuyển khoản (content) để tìm Mã Đặt Lịch
        let bookingCode = null;
        let bookingPayment = null;
        const match = content?.match(/AGM[- ]?(\d+)/i);
        
        if (match) {
            bookingCode = match[1];
            console.log(`✅ [Sepay] Tìm thấy mã đặt lịch: ${bookingCode}`);
            bookingPayment = await db.Booking_Payments.findOne({
                where: { order_id: bookingCode, payment_status: 'PENDING' }
            });
        }
        
        // --- TỰ ĐỘNG NHẬN DIỆN QUA SỐ TIỀN (FALLBACK) ---
        if (!bookingPayment) {
            console.log(`⚠️ [Sepay] Nội dung không chứa mã hoặc mã không đúng. Kích hoạt Fallback tìm theo số tiền: ${transferAmount} VND`);
            const { Op } = require("sequelize");
            bookingPayment = await db.Booking_Payments.findOne({
                where: { 
                    payment_status: 'PENDING',
                    amount: transferAmount,
                    created_at: {
                        [Op.gte]: new Date(Date.now() - 15 * 60 * 1000) // Trong vòng 15 phút
                    }
                },
                order: [['created_at', 'DESC']]
            });

            if (bookingPayment) {
                console.log(`✅ [Sepay Fallback] Đã tự động map với đơn hàng ID: ${bookingPayment.order_id} do khớp số tiền.`);
            } else {
                console.log(`❌ [Sepay] Không tìm thấy đơn hàng nào đang chờ thanh toán khớp với số tiền ${transferAmount} VND. Cần kiểm tra thủ công.`);
            }
        }

        // Cập nhật trạng thái nếu tìm thấy
        if (bookingPayment) {
            await bookingPayment.update({
                payment_status: 'PAID',
                transaction_code: code,
                paid_at: transactionDate ? new Date(transactionDate) : new Date(),
            });
            console.log(`✅ [Sepay] Đã cập nhật Booking_Payments (ID: ${bookingPayment.id}) thành PAID`);
        }

        // 3. Luôn luôn lưu giao dịch vào Payment_Transactions để backup/đối soát
        const transaction = await db.Payment_Transactions.create({
            payment_id: bookingPayment ? bookingPayment.id : null, 
            gateway: gateway || 'BANK',
            transaction_date: transactionDate ? new Date(transactionDate) : new Date(),
            account_number: accountNumber,
            sub_account: subAccount,
            amount_in: transferAmount,
            amount_out: 0,
            accumulated: accumulated,
            code: code,
            transaction_content: content,
            reference_number: referenceCode,
            raw_body: JSON.stringify(paymentData)
        });

        console.log(`✅ [Sepay] Đã lưu giao dịch vào Payment_Transactions (ID: ${transaction.id})`);

        return { success: true };
    } catch (error) {
        console.error("❌ Lỗi trong service xử lý Sepay:", error);
        throw error;
    }
};

const checkPaymentStatus = async (bookingCode) => {
    try {
        const bookingPayment = await db.Booking_Payments.findOne({
            where: { order_id: bookingCode }
        });

        if (bookingPayment && bookingPayment.payment_status === 'PAID') {
            return { isPaid: true };
        } else {
            return { isPaid: false };
        }
    } catch (error) {
        console.error("❌ Lỗi trong service checkPaymentStatus:", error);
        throw error;
    }
};

module.exports = {
    handleSepayTransaction,
    checkPaymentStatus
};
