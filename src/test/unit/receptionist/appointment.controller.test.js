const mockGetAppointment = jest.fn();
const mockGetAppointmentByKey = jest.fn();
const mockReceiveAppointment = jest.fn();
const mockUpdateVehicleVin = jest.fn();
const mockCheckVehicleInfo = jest.fn();

jest.mock("../../../service/receptionist/appointment.service", () => ({
    getAppointment: mockGetAppointment,
    getAppointmentByKey: mockGetAppointmentByKey,
    receiveAppointment: mockReceiveAppointment,
    updateVehicleVin: mockUpdateVehicleVin,
    checkVehicleInfo: mockCheckVehicleInfo,
}));

const controller = require("../../../controller/receptionist/appointment.controller");

const createMockResponse = () => {
    const res = {};
    res.status = jest.fn().mockReturnValue(res);
    res.json = jest.fn().mockReturnValue(res);
    res.locals = { user: { id: 2, role: "RECEPTIONIST" } };
    return res;
};

describe("Receptionist Appointment Controller Unit Tests", () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe("getAppointment", () => {
        it("should return all appointments successfully", async () => {
            const fakeData = [{ id: 1, customer_name: "Customer A" }];
            mockGetAppointment.mockResolvedValue(fakeData);

            const req = {};
            const res = createMockResponse();

            await controller.getAppointment(req, res);

            expect(mockGetAppointment).toHaveBeenCalled();
            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith({
                success: true,
                message: "Lấy danh sách tất cả lịch hẹn thành công",
                data: fakeData,
            });
        });

        it("should return 401 when user is not authorized", async () => {
            const req = {};
            const res = createMockResponse();
            res.locals.user = undefined;

            await controller.getAppointment(req, res);

            expect(res.status).toHaveBeenCalledWith(401);
            expect(res.json).toHaveBeenCalledWith({ message: "Unauthorized" });
        });

        it("should handle service failure", async () => {
            mockGetAppointment.mockRejectedValue({ status: 500, message: "Server error" });

            const req = {};
            const res = createMockResponse();

            await controller.getAppointment(req, res);

            expect(res.status).toHaveBeenCalledWith(500);
            expect(res.json).toHaveBeenCalledWith({
                success: false,
                message: "Server error",
            });
        });
    });

    describe("getAppointmentByKey", () => {
        it("should return appointment details successfully", async () => {
            const fakeData = { id: 1, key: "KEY123" };
            mockGetAppointmentByKey.mockResolvedValue(fakeData);

            const req = { params: { key: "KEY123" } };
            const res = createMockResponse();

            await controller.getAppointmentByKey(req, res);

            expect(mockGetAppointmentByKey).toHaveBeenCalledWith("KEY123");
            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith({
                success: true,
                message: "Lấy chi tiết lịch hẹn thành công",
                data: fakeData,
            });
        });

        it("should return 401 when unauthorized", async () => {
            const req = { params: { key: "KEY123" } };
            const res = createMockResponse();
            res.locals.user = undefined;

            await controller.getAppointmentByKey(req, res);

            expect(res.status).toHaveBeenCalledWith(401);
        });
    });

    describe("receiveAppointment", () => {
        it("should receive appointment successfully", async () => {
            const fakeData = { id: 1, status: "RECEIVED" };
            mockReceiveAppointment.mockResolvedValue(fakeData);

            const req = { params: { key: "KEY123" } };
            const res = createMockResponse();

            await controller.receiveAppointment(req, res);

            expect(mockReceiveAppointment).toHaveBeenCalledWith("KEY123");
            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith({
                success: true,
                message: "Tiếp nhận lịch hẹn thành công",
                data: fakeData,
            });
        });

        it("should reject when key is empty", async () => {
            const req = { params: { key: "" } };
            const res = createMockResponse();

            await controller.receiveAppointment(req, res);

            expect(res.status).toHaveBeenCalledWith(400);
            expect(res.json).toHaveBeenCalledWith({
                success: false,
                message: "Mã lịch hẹn không được để trống",
            });
        });
    });

    describe("updateVehicleVin", () => {
        it("should update vehicle VIN successfully", async () => {
            const fakeData = { id: 1, vin: "VIN123456" };
            mockUpdateVehicleVin.mockResolvedValue(fakeData);

            const req = { params: { key: "KEY123" }, body: { vin_number: "VIN123456" } };
            const res = createMockResponse();

            await controller.updateVehicleVin(req, res);

            expect(mockUpdateVehicleVin).toHaveBeenCalledWith("KEY123", "VIN123456");
            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith({
                success: true,
                message: "Cập nhật số khung thành công",
                data: fakeData,
            });
        });

        it("should reject when vin_number is too long", async () => {
            const req = { params: { key: "KEY123" }, body: { vin_number: "A".repeat(21) } };
            const res = createMockResponse();

            await controller.updateVehicleVin(req, res);

            expect(res.status).toHaveBeenCalledWith(400);
            expect(res.json).toHaveBeenCalledWith({
                success: false,
                message: "Số khung không được vượt quá 20 ký tự",
            });
        });
    });

    describe("checkVehicleInfo", () => {
        it("should check vehicle info successfully", async () => {
            const fakeData = { make: "Honda", model: "Civic" };
            mockCheckVehicleInfo.mockResolvedValue(fakeData);

            const req = { params: { key: "KEY123" } };
            const res = createMockResponse();

            await controller.checkVehicleInfo(req, res);

            expect(mockCheckVehicleInfo).toHaveBeenCalledWith("KEY123");
            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith({
                success: true,
                message: "Kiểm tra thông tin xe thành công",
                data: fakeData,
            });
        });
    });
});
