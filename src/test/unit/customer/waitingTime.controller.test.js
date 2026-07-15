const mockGetWaitingTime = jest.fn();

jest.mock("../../../service/customer/waitingTime.service", () => ({
    getWaitingTime: mockGetWaitingTime,
}));

const controller = require("../../../controller/customer/waiting-time.controller");

const createMockResponse = () => {
    const res = {};
    res.status = jest.fn().mockReturnValue(res);
    res.json = jest.fn().mockReturnValue(res);
    res.locals = { user: { id: 10, role: "CUSTOMER" } };
    return res;
};

describe("Customer WaitingTime Controller Unit Tests", () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe("getWaitingTime", () => {
        it("should return estimated waiting time successfully", async () => {
            const fakeWaitingTime = { message: "Estimated waiting time is 30 mins", duration: 30 };
            mockGetWaitingTime.mockResolvedValue(fakeWaitingTime);

            const req = {};
            const res = createMockResponse();

            await controller.getWaitingTime(req, res);

            expect(mockGetWaitingTime).toHaveBeenCalledWith(10);
            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith({
                success: true,
                message: "Estimated waiting time is 30 mins",
                data: fakeWaitingTime,
            });
        });

        it("should return 401 when user is not authorized", async () => {
            const req = {};
            const res = createMockResponse();
            res.locals.user = undefined;

            await controller.getWaitingTime(req, res);

            expect(res.status).toHaveBeenCalledWith(401);
            expect(res.json).toHaveBeenCalledWith({ message: "Unauthorized" });
        });

        it("should handle service failure", async () => {
            mockGetWaitingTime.mockRejectedValue({ status: 500, message: "Server error" });

            const req = {};
            const res = createMockResponse();

            const spyConsoleError = jest.spyOn(console, "error").mockImplementation(() => {});

            await controller.getWaitingTime(req, res);

            expect(res.status).toHaveBeenCalledWith(500);
            expect(res.json).toHaveBeenCalledWith({
                success: false,
                message: "Server error",
            });
            spyConsoleError.mockRestore();
        });
    });
});
