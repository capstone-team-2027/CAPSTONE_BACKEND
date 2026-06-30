const quoteApprovalService = require("../../service/customer/quoteApproval.service");
const { verifyQuotationActionToken } = require("../../util/jwt.util");

module.exports.approveQuote = async (req,res) => {
    try {
        const {id} = req.params;
        await quoteApprovalService.approveQuotation(id);
        return res.status(200).json({ message: "Đồng ý báo giá thành công"});
    } catch (error) {
        return res.status(error.status || 500).json({ message: error.message || "Internal server error" });
    };
};
module.exports.rejectQuote = async (req,res) => {
    try {
        const {id} = req.params;
        await quoteApprovalService.rejectQuotation(id);
        return res.status(200).json({ message: "Từ chối báo giá thành công"});
    } catch (error) {
        return res.status(error.status || 500).json({ message: error.message || "Internal server error" });
    };
};

module.exports.approveQuoteFromEmail = async (req, res) => {
    try {
        const { id } = req.params;
        const { token } = req.query;
        const decoded = verifyQuotationActionToken(token);
        if (String(decoded.quotationId) !== String(id)) {
            throw { status: 400, message: "Token không hợp lệ" };
        }
        await quoteApprovalService.approveQuotation(id);
        return res.redirect(`${process.env.FRONTEND_URL}/quotation-result?status=approved`);
    } catch (error) {
        return res.redirect(`${process.env.FRONTEND_URL}/quotation-result?status=error`);
    }
};

module.exports.rejectQuoteFromEmail = async (req, res) => {
    try {
        const { id } = req.params;
        const { token } = req.query;
        const decoded = verifyQuotationActionToken(token);
        if (String(decoded.quotationId) !== String(id)) {
            throw { status: 400, message: "Token không hợp lệ" };
        }
        await quoteApprovalService.rejectQuotation(id);
        return res.redirect(`${process.env.FRONTEND_URL}/quotation-result?status=rejected`);
    } catch (error) {
        return res.redirect(`${process.env.FRONTEND_URL}/quotation-result?status=error`);
    }
};