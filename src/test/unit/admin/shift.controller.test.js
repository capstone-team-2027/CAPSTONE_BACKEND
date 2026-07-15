const mockGetAllShiftSlots = jest.fn();
const mockCreateShiftSlot = jest.fn();
const mockUpdateShiftSlot = jest.fn();
const mockGetShiftTemplates = jest.fn();
const mockAssignShift = jest.fn();
const mockAutoGenerateSchedule = jest.fn();
const mockConfirmSchedule = jest.fn();

jest.mock("../../../service/admin/shift.service", () => ({
    getAllShiftSlots: mockGetAllShiftSlots,
    createShiftSlot: mockCreateShiftSlot,
    updateShiftSlot: mockUpdateShiftSlot,
    getShiftTemplates: mockGetShiftTemplates,
    assignShift: mockAssignShift,
    autoGenerateSchedule: mockAutoGenerateSchedule,
    confirmSchedule: mockConfirmSchedule,
}));

const controller = require("../../../controller/admin/shift.controller");

const createMockResponse = () => {
    const res = {};
    res.status = jest.fn().mockReturnValue(res);
    res.json = jest.fn().mockReturnValue(res);
    return res;
};

describe("Admin Shift Controller Unit Tests", () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe("getAllShiftSlots", () => {
        it("should return all shift slots", async () => {
            const fakeSlots = [{ id: 1, slot_name: "Ca Sáng" }];
            mockGetAllShiftSlots.mockResolvedValue(fakeSlots);

            const req = {};
            const res = createMockResponse();

            await controller.getAllShiftSlots(req, res);

            expect(mockGetAllShiftSlots).toHaveBeenCalled();
            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith({ success: true, data: fakeSlots });
        });
    });

    describe("createShiftSlot", () => {
        it("should create shift slot successfully", async () => {
            const fakeSlot = { id: 1, slot_name: "Ca Sáng" };
            mockCreateShiftSlot.mockResolvedValue(fakeSlot);

            const req = {
                body: {
                    slot_name: "Ca Sáng",
                    start_time: "08:00",
                    end_time: "12:00",
                    max_technicians: 5,
                },
            };
            const res = createMockResponse();

            await controller.createShiftSlot(req, res);

            expect(mockCreateShiftSlot).toHaveBeenCalled();
            expect(res.status).toHaveBeenCalledWith(201);
            expect(res.json).toHaveBeenCalledWith({
                success: true,
                data: fakeSlot,
                message: "Tạo khung ca thành công",
            });
        });

        it("should reject creation when end_time is before start_time", async () => {
            const req = {
                body: {
                    slot_name: "Ca Sáng",
                    start_time: "12:00",
                    end_time: "08:00", // Mismatch
                    max_technicians: 5,
                },
            };
            const res = createMockResponse();

            await controller.createShiftSlot(req, res);

            expect(res.status).toHaveBeenCalledWith(400);
            expect(res.json).toHaveBeenCalledWith({
                success: false,
                message: "Giờ bắt đầu phải nhỏ hơn giờ kết thúc",
            });
        });
    });

    describe("updateShiftSlot", () => {
        it("should update shift slot successfully", async () => {
            const fakeSlot = { id: 1, slot_name: "Ca Sáng Updated" };
            mockUpdateShiftSlot.mockResolvedValue(fakeSlot);

            const req = {
                params: { id: "1" },
                body: {
                    slot_name: "Ca Sáng Updated",
                },
            };
            const res = createMockResponse();

            await controller.updateShiftSlot(req, res);

            expect(mockUpdateShiftSlot).toHaveBeenCalledWith("1", {
                slot_name: "Ca Sáng Updated",
            });
            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith({
                success: true,
                data: fakeSlot,
                message: "Cập nhật khung ca thành công",
            });
        });
    });

    describe("getShiftTemplates", () => {
        it("should return shift templates when valid date range query parameters are provided", async () => {
            const fakeTemplates = [{ id: 1, date: "2024-05-20" }];
            mockGetShiftTemplates.mockResolvedValue(fakeTemplates);

            const req = { query: { startDate: "2024-05-20", endDate: "2024-05-26" } };
            const res = createMockResponse();

            await controller.getShiftTemplates(req, res);

            expect(mockGetShiftTemplates).toHaveBeenCalledWith("2024-05-20", "2024-05-26");
            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith({ success: true, data: fakeTemplates });
        });

        it("should reject when query parameters are missing", async () => {
            const req = { query: {} };
            const res = createMockResponse();

            await controller.getShiftTemplates(req, res);

            expect(res.status).toHaveBeenCalledWith(400);
            expect(res.json).toHaveBeenCalledWith({
                success: false,
                message: "Invalid input: expected string, received undefined",
            });
        });
    });

    describe("assignShift", () => {
        it("should assign shift successfully", async () => {
            const fakeResult = { count: 1 };
            mockAssignShift.mockResolvedValue(fakeResult);

            const req = {
                body: {
                    userId: 1,
                    slotIds: [2],
                    workDate: "2024-05-20",
                },
            };
            const res = createMockResponse();

            await controller.assignShift(req, res);

            expect(mockAssignShift).toHaveBeenCalledWith(1, [2], "2024-05-20");
            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith({
                success: true,
                data: fakeResult,
                message: "Đã cập nhật lịch làm việc",
            });
        });
    });

    describe("autoGenerateSchedule", () => {
        it("should auto-generate schedule successfully", async () => {
            const fakeResult = { message: "Generated schedules", totalGenerated: 10 };
            mockAutoGenerateSchedule.mockResolvedValue(fakeResult);

            const req = { body: { startDate: "2024-05-20", endDate: "2024-05-26" } };
            const res = createMockResponse();

            await controller.autoGenerateSchedule(req, res);

            expect(mockAutoGenerateSchedule).toHaveBeenCalledWith("2024-05-20", "2024-05-26");
            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith({
                success: true,
                message: "Generated schedules",
                totalGenerated: 10,
            });
        });
    });

    describe("confirmSchedule", () => {
        it("should confirm schedule successfully", async () => {
            mockConfirmSchedule.mockResolvedValue();

            const req = { body: { startDate: "2024-05-20", endDate: "2024-05-26" } };
            const res = createMockResponse();

            await controller.confirmSchedule(req, res);

            expect(mockConfirmSchedule).toHaveBeenCalledWith("2024-05-20", "2024-05-26");
            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith({
                success: true,
                message: "Chốt lịch thành công! Nhân viên có thể thấy lịch này.",
            });
        });
    });
});
