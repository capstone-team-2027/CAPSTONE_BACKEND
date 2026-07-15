const mockGetNotifications = jest.fn();
const mockMarkAsRead = jest.fn();
const mockMarkAllAsRead = jest.fn();
const mockGetUnreadCount = jest.fn();

jest.mock("../../../service/technician/notification.service", () => ({
    getNotifications: mockGetNotifications,
    markAsRead: mockMarkAsRead,
    markAllAsRead: mockMarkAllAsRead,
    getUnreadCount: mockGetUnreadCount,
}));

const controller = require("../../../controller/technician/notification.controller");

const createMockResponse = () => {
    const res = {};
    res.status = jest.fn().mockReturnValue(res);
    res.json = jest.fn().mockReturnValue(res);
    res.locals = { user: { id: 4, role: "TECHNICIAN" } };
    return res;
};

describe("Technician Notification Controller Unit Tests", () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe("getNotifications", () => {
        it("should return technician notifications successfully", async () => {
            const fakeData = [{ id: 1, message: "New assignment notification" }];
            mockGetNotifications.mockResolvedValue(fakeData);

            const req = {};
            const res = createMockResponse();

            await controller.getNotifications(req, res);

            expect(mockGetNotifications).toHaveBeenCalledWith(4);
            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith(fakeData);
        });

        it("should handle error during fetching notifications", async () => {
            mockGetNotifications.mockRejectedValue({ status: 500, message: "Server error" });

            const req = {};
            const res = createMockResponse();

            const spyConsoleError = jest.spyOn(console, "error").mockImplementation(() => {});

            await controller.getNotifications(req, res);

            expect(res.status).toHaveBeenCalledWith(500);
            expect(res.json).toHaveBeenCalledWith({
                message: "Server error",
            });
            spyConsoleError.mockRestore();
        });
    });

    describe("markAsRead", () => {
        it("should mark single notification as read successfully", async () => {
            const fakeResult = { id: 1, is_read: true };
            mockMarkAsRead.mockResolvedValue(fakeResult);

            const req = { params: { id: "1" } };
            const res = createMockResponse();

            await controller.markAsRead(req, res);

            expect(mockMarkAsRead).toHaveBeenCalledWith("1", 4);
            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith({
                success: true,
                message: "Đã đánh dấu đọc",
                data: fakeResult,
            });
        });
    });

    describe("markAllAsRead", () => {
        it("should mark all notifications as read successfully", async () => {
            const fakeResult = { count: 10 };
            mockMarkAllAsRead.mockResolvedValue(fakeResult);

            const req = {};
            const res = createMockResponse();

            await controller.markAllAsRead(req, res);

            expect(mockMarkAllAsRead).toHaveBeenCalledWith(4);
            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith({
                success: true,
                message: "Đã đánh dấu đọc tất cả",
                data: fakeResult,
            });
        });
    });

    describe("getUnreadCount", () => {
        it("should return count of unread notifications successfully", async () => {
            mockGetUnreadCount.mockResolvedValue(2);

            const req = {};
            const res = createMockResponse();

            await controller.getUnreadCount(req, res);

            expect(mockGetUnreadCount).toHaveBeenCalledWith(4);
            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith({ count: 2 });
        });
    });
});
