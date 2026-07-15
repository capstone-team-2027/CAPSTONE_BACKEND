const mockCreatePricingRule = jest.fn();
const mockGetAllPricingRules = jest.fn();
const mockGetPricingRuleById = jest.fn();
const mockUpdatePricingRule = jest.fn();
const mockDeletePricingRule = jest.fn();

jest.mock("../../../service/admin/pricingRules.service", () => ({
    createPricingRule: mockCreatePricingRule,
    getAllPricingRules: mockGetAllPricingRules,
    getPricingRuleById: mockGetPricingRuleById,
    updatePricingRule: mockUpdatePricingRule,
    deletePricingRule: mockDeletePricingRule,
}));

const controller = require("../../../controller/admin/pricingRules.controller");

const createMockResponse = () => {
    const res = {};
    res.status = jest.fn().mockReturnValue(res);
    res.json = jest.fn().mockReturnValue(res);
    return res;
};

describe("Admin PricingRules Controller Unit Tests", () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe("createPricingRules", () => {
        it("should create pricing rule successfully", async () => {
            const fakeRule = { id: 1, category: "SUV", markup_rate: 10 };
            mockCreatePricingRule.mockResolvedValue(fakeRule);

            const req = {
                body: {
                    category: "SUV",
                    markup_rate: 10,
                    discount_rate: 5,
                },
            };
            const res = createMockResponse();

            await controller.createPricingRules(req, res);

            expect(mockCreatePricingRule).toHaveBeenCalled();
            expect(res.status).toHaveBeenCalledWith(201);
            expect(res.json).toHaveBeenCalledWith({
                success: true,
                message: "Pricing rule created successfully",
                data: fakeRule,
            });
        });

        it("should reject creation when validation schema fails", async () => {
            const req = {
                body: {
                    category: "", // invalid empty string
                },
            };
            const res = createMockResponse();

            await controller.createPricingRules(req, res);

            expect(res.status).toHaveBeenCalledWith(400);
            expect(res.json).toHaveBeenCalledWith(
                expect.objectContaining({
                    success: false,
                    message: "Dữ liệu không hợp lệ",
                })
            );
        });

        it("should handle service failure", async () => {
            mockCreatePricingRule.mockRejectedValue(new Error("Database error"));

            const req = {
                body: {
                    category: "SUV",
                    markup_rate: 10,
                },
            };
            const res = createMockResponse();

            const spyConsoleError = jest.spyOn(console, "error").mockImplementation(() => {});

            await controller.createPricingRules(req, res);

            expect(res.status).toHaveBeenCalledWith(500);
            expect(res.json).toHaveBeenCalledWith({
                success: false,
                message: "Internal server error",
                error: "Database error",
            });
            spyConsoleError.mockRestore();
        });
    });

    describe("getAllPricingRules", () => {
        it("should return all pricing rules", async () => {
            const fakeRules = [{ id: 1, category: "SUV" }];
            mockGetAllPricingRules.mockResolvedValue(fakeRules);

            const req = {};
            const res = createMockResponse();

            await controller.getAllPricingRules(req, res);

            expect(mockGetAllPricingRules).toHaveBeenCalled();
            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith({
                success: true,
                message: "Lấy danh sách quy tắc giá thành công",
                data: fakeRules,
            });
        });
    });

    describe("getPricingRuleById", () => {
        it("should return pricing rule detail by id", async () => {
            const fakeRule = { id: 1, category: "SUV" };
            mockGetPricingRuleById.mockResolvedValue(fakeRule);

            const req = { params: { id: "1" } };
            const res = createMockResponse();

            await controller.getPricingRuleById(req, res);

            expect(mockGetPricingRuleById).toHaveBeenCalledWith("1");
            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith({
                success: true,
                message: "Lấy quy tắc giá thành công",
                data: fakeRule,
            });
        });

        it("should return 404 when pricing rule is not found", async () => {
            mockGetPricingRuleById.mockResolvedValue(null);

            const req = { params: { id: "99" } };
            const res = createMockResponse();

            await controller.getPricingRuleById(req, res);

            expect(res.status).toHaveBeenCalledWith(404);
            expect(res.json).toHaveBeenCalledWith({
                success: false,
                message: "Không tìm thấy quy tắc giá",
            });
        });
    });

    describe("updatePricingRule", () => {
        it("should update pricing rule successfully", async () => {
            const fakeRule = { id: 1, category: "Sedan Updated" };
            mockUpdatePricingRule.mockResolvedValue(fakeRule);

            const req = {
                params: { id: "1" },
                body: {
                    category: "Sedan Updated",
                },
            };
            const res = createMockResponse();

            await controller.updatePricingRule(req, res);

            expect(mockUpdatePricingRule).toHaveBeenCalled();
            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith({
                success: true,
                message: "Cập nhật quy tắc giá thành công",
                data: fakeRule,
            });
        });
    });

    describe("deletePricingRule", () => {
        it("should delete pricing rule successfully", async () => {
            mockDeletePricingRule.mockResolvedValue({ id: 1 });

            const req = { params: { id: "1" } };
            const res = createMockResponse();

            await controller.deletePricingRule(req, res);

            expect(mockDeletePricingRule).toHaveBeenCalledWith("1");
            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith({
                success: true,
                message: "Xóa quy tắc giá thành công",
            });
        });
    });
});
