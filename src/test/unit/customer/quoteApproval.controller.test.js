const mockApproveQuotation = jest.fn();
const mockRejectQuotation = jest.fn();

jest.mock("../../../service/customer/quoteApproval.service", () => ({
    approveQuotation: mockApproveQuotation,
    rejectQuotation: mockRejectQuotation,
}));

const mockVerifyToken = jest.fn();
jest.mock("../../../util/jwt.util", () => ({
    verifyQuotationActionToken: mockVerifyToken,
}));

const controller = require("../../../controller/customer/quoteApproval.controller");

const createMockResponse = () => {
    const res = {};
    res.status = jest.fn().mockReturnValue(res);
    res.json = jest.fn().mockReturnValue(res);
    res.redirect = jest.fn();
    return res;
};

describe("Customer QuoteApproval Controller Unit Tests", () => {
    beforeEach(() => {
        jest.clearAllMocks();
        process.env.FRONTEND_URL = "http://frontend.com";
    });

    describe("approveQuote", () => {
        it("should approve quote successfully", async () => {
            mockApproveQuotation.mockResolvedValue();

            const req = { params: { id: "1" } };
            const res = createMockResponse();

            await controller.approveQuote(req, res);

            expect(mockApproveQuotation).toHaveBeenCalledWith("1");
            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith({ message: "Đồng ý báo giá thành công" });
        });

        it("should handle error during approve", async () => {
            mockApproveQuotation.mockRejectedValue({ status: 500, message: "Error" });

            const req = { params: { id: "1" } };
            const res = createMockResponse();

            await controller.approveQuote(req, res);

            expect(res.status).toHaveBeenCalledWith(500);
            expect(res.json).toHaveBeenCalledWith({ message: "Error" });
        });
    });

    describe("rejectQuote", () => {
        it("should reject quote successfully", async () => {
            mockRejectQuotation.mockResolvedValue();

            const req = { params: { id: "1" } };
            const res = createMockResponse();

            await controller.rejectQuote(req, res);

            expect(mockRejectQuotation).toHaveBeenCalledWith("1");
            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith({ message: "Từ chối báo giá thành công" });
        });
    });

    describe("approveQuoteFromEmail", () => {
        it("should approve from email and redirect to approved page when token matches", async () => {
            mockVerifyToken.mockReturnValue({ quotationId: "1" });
            mockApproveQuotation.mockResolvedValue();

            const req = { params: { id: "1" }, query: { token: "TOKEN123", email: "a@a.com" } };
            const res = createMockResponse();

            await controller.approveQuoteFromEmail(req, res);

            expect(mockVerifyToken).toHaveBeenCalledWith("TOKEN123");
            expect(mockApproveQuotation).toHaveBeenCalledWith("1", "a@a.com");
            expect(res.redirect).toHaveBeenCalledWith("http://frontend.com/quotation-result?status=approved");
        });

        it("should redirect to error page when token quotationId does not match params.id", async () => {
            mockVerifyToken.mockReturnValue({ quotationId: "2" }); // Mismatch

            const req = { params: { id: "1" }, query: { token: "TOKEN123", email: "a@a.com" } };
            const res = createMockResponse();

            await controller.approveQuoteFromEmail(req, res);

            expect(res.redirect).toHaveBeenCalledWith("http://frontend.com/quotation-result?status=error");
        });

        it("should redirect to error page when service fails", async () => {
            mockVerifyToken.mockReturnValue({ quotationId: "1" });
            mockApproveQuotation.mockRejectedValue(new Error("Fail"));

            const req = { params: { id: "1" }, query: { token: "TOKEN123", email: "a@a.com" } };
            const res = createMockResponse();

            await controller.approveQuoteFromEmail(req, res);

            expect(res.redirect).toHaveBeenCalledWith("http://frontend.com/quotation-result?status=error");
        });
    });

    describe("rejectQuoteFromEmail", () => {
        it("should reject from email and redirect to rejected page when token matches", async () => {
            mockVerifyToken.mockReturnValue({ quotationId: "1" });
            mockRejectQuotation.mockResolvedValue();

            const req = { params: { id: "1" }, query: { token: "TOKEN123" } };
            const res = createMockResponse();

            await controller.rejectQuoteFromEmail(req, res);

            expect(mockVerifyToken).toHaveBeenCalledWith("TOKEN123");
            expect(mockRejectQuotation).toHaveBeenCalledWith("1");
            expect(res.redirect).toHaveBeenCalledWith("http://frontend.com/quotation-result?status=rejected");
        });
    });
});
