const mockCreateServiceOrder = jest.fn();
const mockGetServiceOrders = jest.fn();
const mockGetServiceOrderById = jest.fn();
const mockUpdateServiceOrderOdo = jest.fn();

jest.mock("../../../service/receptionist/serviceOrder.service", () => ({
    createServiceOrder: mockCreateServiceOrder,
    getServiceOrders: mockGetServiceOrders,
    getServiceOrderById: mockGetServiceOrderById,
    updateServiceOrderOdo: mockUpdateServiceOrderOdo,
}));

const controller = require("../../../controller/receptionist/serviceOrder.controller");

const createMockResponse = () => {
    const res = {};
    res.status = jest.fn().mockReturnValue(res);
    res.json = jest.fn().mockReturnValue(res);
    res.locals = { user: { id: 3, role: "RECEPTIONIST" } };
    return res;
};

describe("Receptionist ServiceOrder Controller Unit Tests", () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe("createServiceOrder", () => {
        it("should create service order successfully with vehicle_id", async () => {
            const fakeResult = { id: 10, current_odo: 12000 };
            mockCreateServiceOrder.mockResolvedValue(fakeResult);

            const req = {
                body: {
                    vehicle_id: 1,
                    current_odo: 12000,
                    bay_id: 2,
                },
            };
            const res = createMockResponse();

            await controller.createServiceOrder(req, res);

            expect(mockCreateServiceOrder).toHaveBeenCalledWith(
                {
                    vehicle_id: 1,
                    current_odo: 12000,
                    bay_id: 2,
                },
                3
            );
            expect(res.status).toHaveBeenCalledWith(201);
            expect(res.json).toHaveBeenCalledWith({
                success: true,
                message: "Tạo lệnh sửa chữa thành công",
                data: fakeResult,
            });
        });

        it("should reject creation when validation schema fails (no vehicle_id and no walk_in)", async () => {
            const req = {
                body: {
                    current_odo: -5, // invalid negative odo
                },
            };
            const res = createMockResponse();

            await controller.createServiceOrder(req, res);

            expect(res.status).toHaveBeenCalledWith(400);
            expect(res.json).toHaveBeenCalledWith(
                expect.objectContaining({
                    success: false,
                    message: "Dữ liệu không hợp lệ",
                })
            );
        });
    });

    describe("getServiceOrders", () => {
        it("should return all service orders", async () => {
            const fakeOrders = [{ id: 1, current_odo: 500 }];
            mockGetServiceOrders.mockResolvedValue(fakeOrders);

            const req = {};
            const res = createMockResponse();

            await controller.getServiceOrders(req, res);

            expect(mockGetServiceOrders).toHaveBeenCalled();
            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith({
                success: true,
                data: fakeOrders,
            });
        });
    });

    describe("getServiceOrderById", () => {
        it("should return service order details", async () => {
            const fakeOrder = { id: 5, current_odo: 1000 };
            mockGetServiceOrderById.mockResolvedValue(fakeOrder);

            const req = { params: { id: "5" } };
            const res = createMockResponse();

            await controller.getServiceOrderById(req, res);

            expect(mockGetServiceOrderById).toHaveBeenCalledWith("5");
            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith({
                success: true,
                data: fakeOrder,
            });
        });
    });

    describe("updateServiceOrderOdo", () => {
        it("should update service order odometer successfully", async () => {
            const fakeResult = { id: 5, current_odo: 1500 };
            mockUpdateServiceOrderOdo.mockResolvedValue(fakeResult);

            const req = { params: { id: "5" }, body: { current_odo: 1500 } };
            const res = createMockResponse();

            await controller.updateServiceOrderOdo(req, res);

            expect(mockUpdateServiceOrderOdo).toHaveBeenCalledWith("5", 1500);
            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith({
                success: true,
                message: "Cập nhật số km tiếp nhận thành công",
                data: fakeResult,
            });
        });

        it("should reject when current_odo is missing", async () => {
            const req = { params: { id: "5" }, body: {} };
            const res = createMockResponse();

            await controller.updateServiceOrderOdo(req, res);

            expect(res.status).toHaveBeenCalledWith(400);
            expect(res.json).toHaveBeenCalledWith({
                success: false,
                message: "Thiếu thông tin số ODO (current_odo)",
            });
        });
    });
});
