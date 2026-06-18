const mockSubmitFeedback = jest.fn();
const mockGetCustomerFeedbacks = jest.fn();

jest.mock("../../../service/customer/feedback.service", () => ({
  submitFeedback: mockSubmitFeedback,
  getCustomerFeedbacks: mockGetCustomerFeedbacks,
}));

const controller = require("../../../controller/customer/feedback.controller");

const createMockResponse = () => {
  const res = {
    locals: {},
  };
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  return res;
};

describe("Customer Feedback Controller", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("submitFeedback", () => {
    it("should return 401 when user is not authenticated", async () => {
      const req = { body: {} };
      const res = createMockResponse();

      await controller.submitFeedback(req, res);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({ message: "Unauthorized" });
      expect(mockSubmitFeedback).not.toHaveBeenCalled();
    });

    it("should return 400 when validation fails", async () => {
      const req = { body: { service_order_id: 0, rating: 6, comment: "bad" } };
      const res = createMockResponse();
      res.locals.user = { id: 1 };

      await controller.submitFeedback(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(mockSubmitFeedback).not.toHaveBeenCalled();
    });

    it("should return 201 and created feedback when valid", async () => {
      const fakeResult = { id: 1, rating: 5, comment: "Rất tốt" };
      mockSubmitFeedback.mockResolvedValue(fakeResult);

      const req = {
        body: { service_order_id: 10, rating: 5, comment: "Dịch vụ rất tốt" },
      };
      const res = createMockResponse();
      res.locals.user = { id: 2 };

      await controller.submitFeedback(req, res);

      expect(mockSubmitFeedback).toHaveBeenCalledWith(2, 10, 5, "Dịch vụ rất tốt");
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith({ message: "Gửi phản hồi thành công", data: fakeResult });
    });

    it("should return error status when service throws", async () => {
      mockSubmitFeedback.mockRejectedValue({ status: 403, message: "Forbidden" });
      const req = {
        body: { service_order_id: 10, rating: 5, comment: "Dịch vụ tốt" },
      };
      const res = createMockResponse();
      res.locals.user = { id: 2 };

      await controller.submitFeedback(req, res);

      expect(res.status).toHaveBeenCalledWith(403);
      expect(res.json).toHaveBeenCalledWith({ message: "Forbidden" });
    });
  });

  describe("getMyFeedbacks", () => {
    it("should return 401 when user is not authenticated", async () => {
      const req = {};
      const res = createMockResponse();

      await controller.getMyFeedbacks(req, res);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({ message: "Unauthorized" });
      expect(mockGetCustomerFeedbacks).not.toHaveBeenCalled();
    });

    it("should return 200 and data when authenticated", async () => {
      const fakeFeedbacks = [{ id: 1, rating: 5, comment: "Ok" }];
      mockGetCustomerFeedbacks.mockResolvedValue(fakeFeedbacks);
      const res = createMockResponse();
      res.locals.user = { id: 3 };

      await controller.getMyFeedbacks({}, res);

      expect(mockGetCustomerFeedbacks).toHaveBeenCalledWith(3);
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({ data: fakeFeedbacks });
    });

    it("should return 500 when unexpected error occurs", async () => {
      mockGetCustomerFeedbacks.mockRejectedValue(new Error("Database failure"));
      const res = createMockResponse();
      res.locals.user = { id: 3 };

      await controller.getMyFeedbacks({}, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ message: "Database failure" });
    });
  });
});
