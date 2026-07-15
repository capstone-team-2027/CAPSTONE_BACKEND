const mockGetVehicleByCustomer = jest.fn();

jest.mock("../../../service/customer/vehicle.service", () => ({
    getVehicleByCustomer: mockGetVehicleByCustomer,
}));

const controller = require("../../../controller/customer/vehicle.controller");

const createMockResponse = () => {
    const res = {};
    res.status = jest.fn().mockReturnValue(res);
    res.json = jest.fn().mockReturnValue(res);
    res.locals = { user: { id: 10, role: "CUSTOMER" } };
    return res;
};

describe("Customer Vehicle Controller Unit Tests", () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe("getVehicleByCustomer", () => {
        it("should return customer vehicles successfully", async () => {
            const fakeVehicles = [{ id: 1, license_plate: "30F-12345" }];
            mockGetVehicleByCustomer.mockResolvedValue(fakeVehicles);

            const req = {};
            const res = createMockResponse();

            await controller.getVehicleByCustomer(req, res);

            expect(mockGetVehicleByCustomer).toHaveBeenCalledWith(10);
            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith({
                success: true,
                message: "Lấy danh sách xe thành công",
                data: fakeVehicles,
            });
        });

        it("should return 401 when user is not logged in", async () => {
            const req = {};
            const res = createMockResponse();
            res.locals.user = undefined;

            await controller.getVehicleByCustomer(req, res);

            expect(res.status).toHaveBeenCalledWith(401);
            expect(res.json).toHaveBeenCalledWith({ message: "Unauthorized" });
        });

        it("should handle service failure", async () => {
            mockGetVehicleByCustomer.mockRejectedValue({ status: 500, message: "Server error" });

            const req = {};
            const res = createMockResponse();

            await controller.getVehicleByCustomer(req, res);

            expect(res.status).toHaveBeenCalledWith(500);
            expect(res.json).toHaveBeenCalledWith({
                success: false,
                message: "Server error",
            });
        });
    });
});
