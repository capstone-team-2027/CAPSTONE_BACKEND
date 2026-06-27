const mockFeedbackFindOne = jest.fn();
const mockFeedbackCreate = jest.fn();
const mockFeedbackFindAll = jest.fn();
const mockServiceOrdersFindOne = jest.fn();

jest.mock("../../../../models", () => ({
  Feedback: {
    findOne: mockFeedbackFindOne,
    create: mockFeedbackCreate,
    findAll: mockFeedbackFindAll,
  },
  Service_Orders: {
    findOne: mockServiceOrdersFindOne,
  },
  Appointments: {},
  Vehicles: {},
}));

const feedbackService = require("../../../service/customer/feedback.service");

describe("Customer Feedback Service", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("submitFeedback", () => {
    it("should throw 404 when service order does not exist", async () => {
      mockServiceOrdersFindOne.mockResolvedValue(null);

      await expect(feedbackService.submitFeedback(1, 100, 5, "Tốt")).rejects.toEqual({
        status: 404,
        message: "Đơn hàng dịch vụ không tồn tại",
      });

      expect(mockServiceOrdersFindOne).toHaveBeenCalledWith(expect.objectContaining({ where: { id: 100 } }));
    });

    it("should throw 403 when service order belongs to another customer", async () => {
      mockServiceOrdersFindOne.mockResolvedValue({
        id: 101,
        appointment: { customer_id: 2 },
        status: "COMPLETED",
      });

      await expect(feedbackService.submitFeedback(1, 101, 5, "Tốt")).rejects.toEqual({
        status: 403,
        message: "Bạn không có quyền gửi phản hồi cho đơn hàng này",
      });
    });

    it("should throw 400 when service order is not completed", async () => {
      mockServiceOrdersFindOne.mockResolvedValue({
        id: 102,
        appointment: { customer_id: 1 },
        status: "IN_PROGRESS",
      });

      await expect(feedbackService.submitFeedback(1, 102, 5, "Tốt")).rejects.toEqual({
        status: 400,
        message: "Chỉ có thể gửi phản hồi khi dịch vụ đã hoàn thành",
      });
    });

    it("should throw 400 when feedback already exists", async () => {
      mockServiceOrdersFindOne.mockResolvedValue({
        id: 103,
        appointment: { customer_id: 1 },
        status: "COMPLETED",
      });
      mockFeedbackFindOne.mockResolvedValue({ id: 1 });

      await expect(feedbackService.submitFeedback(1, 103, 5, "Tốt")).rejects.toEqual({
        status: 400,
        message: "Bạn đã gửi phản hồi cho đơn hàng này rồi",
      });
    });

    it("should create feedback successfully", async () => {
      mockServiceOrdersFindOne.mockResolvedValue({
        id: 104,
        appointment: { customer_id: 1 },
        status: "COMPLETED",
      });
      mockFeedbackFindOne.mockResolvedValueOnce(null);
      mockFeedbackCreate.mockResolvedValue({ id: 5 });
      const createdFeedback = { id: 5, customer_id: 1, service_order_id: 104, rating: 5, comment: "Tốt", serviceOrder: { id: 104 } };
      mockFeedbackFindOne.mockResolvedValueOnce(createdFeedback);

      const result = await feedbackService.submitFeedback(1, 104, 5, "Tốt");

      expect(mockFeedbackCreate).toHaveBeenCalledWith({
        customer_id: 1,
        service_order_id: 104,
        rating: 5,
        comment: "Tốt",
      });
      expect(mockFeedbackFindOne).toHaveBeenCalledWith(expect.objectContaining({ where: { id: 5 } }));
      expect(result).toBe(createdFeedback);
    });
  });

  describe("getCustomerFeedbacks", () => {
    it("should return feedback list for customer", async () => {
      const fakeData = [{ id: 1, comment: "Ok" }];
      mockFeedbackFindAll.mockResolvedValue(fakeData);

      const result = await feedbackService.getCustomerFeedbacks(7);

      expect(mockFeedbackFindAll).toHaveBeenCalledWith(expect.objectContaining({ where: { customer_id: 7 } }));
      expect(result).toBe(fakeData);
    });
  });
});
