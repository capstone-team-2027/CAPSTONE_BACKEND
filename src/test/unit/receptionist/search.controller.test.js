const mockGetCustomerInfoByPhone = jest.fn();

jest.mock("../../../service/receptionist/search.service", () => ({
    getCustomerInfoByPhone: mockGetCustomerInfoByPhone,
}));

const controller = require("../../../controller/receptionist/search.controller");

const createMockResponse = () => {
    const res = {};
    res.status = jest.fn().mockReturnValue(res);
    res.json = jest.fn().mockReturnValue(res);
    res.locals = { user: { id: 2, role: "RECEPTIONIST" } };
    return res;
};

describe("Receptionist Search Controller Unit Tests", () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe("getCustomerInfoByPhone", () => {
        it("should return customer info successfully when valid phone is provided", async () => {
            const fakeCustomer = { id: 5, fullname: "Alice", phone: "0987654321" };
            mockGetCustomerInfoByPhone.mockResolvedValue(fakeCustomer);

            const req = { body: { phone: "0987654321" } };
            const res = createMockResponse();

            await controller.getCustomerInfoByPhone(req, res);

            expect(mockGetCustomerInfoByPhone).toHaveBeenCalledWith("0987654321");
            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith({
                success: true,
                message: "Lấy thông tin khách hàng thành công",
                data: fakeCustomer,
            });
        });

        it("should return 401 when unauthorized", async () => {
            const req = { body: { phone: "0987654321" } };
            const res = createMockResponse();
            res.locals.user = undefined;

            await controller.getCustomerInfoByPhone(req, res);

            expect(res.status).toHaveBeenCalledWith(401);
            expect(res.json).toHaveBeenCalledWith({ message: "Unauthorized" });
        });

        it("should return 400 when phone is missing", async () => {
            const req = { body: {} };
            const res = createMockResponse();

            await controller.getCustomerInfoByPhone(req, res);

            expect(res.status).toHaveBeenCalledWith(400);
            expect(res.json).toHaveBeenCalledWith({
                success: false,
                message: "Vui lòng cung cấp số điện thoại",
            });
        });

        it("should handle service errors", async () => {
            mockGetCustomerInfoByPhone.mockRejectedValue({ status: 500, message: "DB Error" });

            const req = { body: { phone: "0987654321" } };
            const res = createMockResponse();

            await controller.getCustomerInfoByPhone(req, res);

            expect(res.status).toHaveBeenCalledWith(500);
            expect(res.json).toHaveBeenCalledWith({
                success: false,
                message: "DB Error",
            });
        });
    });
});
