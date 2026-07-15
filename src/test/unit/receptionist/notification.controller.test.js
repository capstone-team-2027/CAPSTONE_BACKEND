const mockGetNotifications = jest.fn();
const mockGetNotificationById = jest.fn();
const mockMarkAsRead = jest.fn();
const mockGetUnreadCount = jest.fn();

jest.mock("../../../service/receptionist/notification.service", () => ({
    getNotifications: mockGetNotifications,
    getNotificationById: mockGetNotificationById,
    markAsRead: mockMarkAsRead,
    getUnreadCount: mockGetUnreadCount,
}));

const controller = require("../../../controller/receptionist/notification.controller");

const createMockResponse = () => {
    const res = {};
    res.status = jest.fn().mockReturnValue(res);
    res.json = jest.fn().mockReturnValue(res);
    return res;
};

describe("Receptionist Notification Controller Unit Tests", () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe("getNotification", () => {
        it("should return notifications successfully", async () => {
            const fakeData = [{ id: 1, message: "New appointment" }];
            mockGetNotifications.mockResolvedValue(fakeData);

            const req = {};
            const res = createMockResponse();

            await controller.getNotification(req, res);

            expect(mockGetNotifications).toHaveBeenCalled();
            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith(fakeData);
        });

        it("should handle error", async () => {
            mockGetNotifications.mockRejectedValue({ status: 500, message: "Error" });

            const req = {};
            const res = createMockResponse();

            await controller.getNotification(req, res);

            expect(res.status).toHaveBeenCalledWith(500);
            expect(res.json).toHaveBeenCalledWith({
                message: "Error",
            });
        });
    });

    describe("getNotificationById", () => {
        it("should return single notification successfully", async () => {
            const fakeData = { id: 1, message: "New appointment" };
            mockGetNotificationById.mockResolvedValue(fakeData);

            const req = { params: { id: "1" } };
            const res = createMockResponse();

            await controller.getNotificationById(req, res);

            expect(mockGetNotificationById).toHaveBeenCalledWith("1");
            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith(fakeData);
        });
    });

    describe("markAsRead", () => {
        it("should mark notification as read successfully", async () => {
            const fakeResult = { id: 1, is_read: true };
            mockMarkAsRead.mockResolvedValue(fakeResult);

            const req = { params: { id: "1" } };
            const res = createMockResponse();

            await controller.markAsRead(req, res);

            expect(mockMarkAsRead).toHaveBeenCalledWith("1");
            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith({
                success: true,
                message: "Đã đánh dấu đọc",
                data: fakeResult,
            });
        });
    });

    describe("getUnreadCount", () => {
        it("should return count successfully", async () => {
            mockGetUnreadCount.mockResolvedValue(5);

            const req = {};
            const res = createMockResponse();

            await controller.getUnreadCount(req, res);

            expect(mockGetUnreadCount).toHaveBeenCalled();
            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith({ count: 5 });
        });
    });
});
