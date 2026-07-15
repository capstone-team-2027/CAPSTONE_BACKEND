const mockGetMyShifts = jest.fn();

jest.mock("../../../service/technician/shift.service", () => ({
    getMyShifts: mockGetMyShifts,
}));

const controller = require("../../../controller/technician/shift.controller");

const createMockResponse = () => {
    const res = {};
    res.status = jest.fn().mockReturnValue(res);
    res.json = jest.fn().mockReturnValue(res);
    res.locals = { user: { id: 4, role: "TECHNICIAN" } };
    return res;
};

describe("Technician Shift Controller Unit Tests", () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe("getMyShifts", () => {
        it("should return technician shifts successfully", async () => {
            const fakeShifts = [{ id: 1, work_date: "2024-05-20" }];
            mockGetMyShifts.mockResolvedValue(fakeShifts);

            const req = { query: { startDate: "2024-05-20", endDate: "2024-05-26" } };
            const res = createMockResponse();

            await controller.getMyShifts(req, res);

            expect(mockGetMyShifts).toHaveBeenCalledWith(4, "2024-05-20", "2024-05-26");
            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith({
                success: true,
                data: fakeShifts,
                message: "Lấy lịch làm việc thành công",
            });
        });

        it("should handle error during shift retrieval", async () => {
            mockGetMyShifts.mockRejectedValue(new Error("Server failed"));

            const req = { query: {} };
            const res = createMockResponse();

            const spyConsoleError = jest.spyOn(console, "error").mockImplementation(() => {});

            await controller.getMyShifts(req, res);

            expect(res.status).toHaveBeenCalledWith(500);
            expect(res.json).toHaveBeenCalledWith({
                success: false,
                message: "Server failed",
            });
            spyConsoleError.mockRestore();
        });
    });
});
