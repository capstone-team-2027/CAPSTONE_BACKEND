const mockCreateQuotation = jest.fn();
const mockUpdateQuotation = jest.fn();
const mockGetQuoteHistory = jest.fn();

jest.mock("../../../service/technician/quoteManagement.service", () => ({
  createQuotation: mockCreateQuotation,
  updateQuotation: mockUpdateQuotation,
  getQuoteHistory: mockGetQuoteHistory,
}));

const controller = require("../../../controller/technician/quoteManagement.controller");

const createMockResponse = () => {
  const res = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  return res;
};

describe("QuoteManagement Controller Unit Tests", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  // 1. createQuotation
  describe("createQuotation", () => {
    describe("Success Case", () => {
      it("should return 201 on success with valid input", async () => {
        const fakeCreated = { id: 1, service_order_id: 10, total_amount: 100000, status: "PENDING" };
        mockCreateQuotation.mockResolvedValue(fakeCreated);

        const req = {
          body: {
            service_order_id: 10,
            items: [
              {
                service_catalog_id: 1,
                quantity: 1,
                unit_price: 100000,
              },
            ],
            note: "Yêu cầu thêm má phanh",
          },
        };
        const res = createMockResponse();

        await controller.createQuotation(req, res);

        expect(mockCreateQuotation).toHaveBeenCalledWith({
          service_order_id: 10,
          items: [
            {
              service_catalog_id: 1,
              quantity: 1,
              unit_price: 100000,
            },
          ],
          note: "Yêu cầu thêm má phanh",
        });
        expect(res.status).toHaveBeenCalledWith(201);
        expect(res.json).toHaveBeenCalledWith({
          message: "Tạo báo giá thành công",
          data: fakeCreated,
        });
      });
    });

    describe("Validation Errors", () => {
      it("should return 400 when items array is empty", async () => {
        const req = {
          body: {
            service_order_id: 10,
            items: [],
          },
        };
        const res = createMockResponse();

        await controller.createQuotation(req, res);

        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.json).toHaveBeenCalledWith(
          expect.objectContaining({
            message: "Báo giá phải có ít nhất một dòng",
          })
        );
        expect(mockCreateQuotation).not.toHaveBeenCalled();
      });

      it("should return 400 when item misses both service and spare part", async () => {
        const req = {
          body: {
            service_order_id: 10,
            items: [
              {
                quantity: 1,
                unit_price: 100,
              },
            ],
          },
        };
        const res = createMockResponse();

        await controller.createQuotation(req, res);

        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.json).toHaveBeenCalledWith(
          expect.objectContaining({
            message: "Phải có dịch vụ hoặc phụ tùng",
          })
        );
      });
    });

    describe("Error Case", () => {
      it("should return error status and message when service fails", async () => {
        const error = new Error("Dịch vụ #1 không tồn tại");
        error.status = 404;
        mockCreateQuotation.mockRejectedValue(error);

        const req = {
          body: {
            service_order_id: 10,
            items: [
              {
                service_catalog_id: 1,
                quantity: 1,
                unit_price: 100,
              },
            ],
          },
        };
        const res = createMockResponse();

        await controller.createQuotation(req, res);

        expect(res.status).toHaveBeenCalledWith(404);
        expect(res.json).toHaveBeenCalledWith({
          message: "Dịch vụ #1 không tồn tại",
        });
      });
    });
  });

  // 2. updateQuotation
  describe("updateQuotation", () => {
    describe("Success Case", () => {
      it("should return 200 on success", async () => {
        const fakeUpdated = { id: 1, total_amount: 150000 };
        mockUpdateQuotation.mockResolvedValue(fakeUpdated);

        const req = {
          params: { id: "1" },
          body: {
            items: [
              {
                service_catalog_id: 1,
                quantity: 2,
                unit_price: 75000,
              },
            ],
            note: "Updated note",
          },
        };
        const res = createMockResponse();

        await controller.updateQuotation(req, res);

        expect(mockUpdateQuotation).toHaveBeenCalledWith("1", {
          items: [
            {
              service_catalog_id: 1,
              quantity: 2,
              unit_price: 75000,
            },
          ],
          note: "Updated note",
        });
        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.json).toHaveBeenCalledWith({
          message: "Cập nhật báo giá thành công",
          data: fakeUpdated,
        });
      });
    });

    describe("Validation Errors", () => {
      it("should return 400 when quantity is invalid", async () => {
        const req = {
          params: { id: "1" },
          body: {
            items: [
              {
                service_catalog_id: 1,
                quantity: -5,
                unit_price: 100,
              },
            ],
          },
        };
        const res = createMockResponse();

        await controller.updateQuotation(req, res);

        expect(res.status).toHaveBeenCalledWith(400);
        expect(mockUpdateQuotation).not.toHaveBeenCalled();
      });
    });

    describe("Error Case", () => {
      it("should return 500 when service fails", async () => {
        const error = new Error("Database connection failure");
        mockUpdateQuotation.mockRejectedValue(error);

        const req = {
          params: { id: "1" },
          body: {
            items: [
              {
                service_catalog_id: 1,
                quantity: 1,
                unit_price: 100,
              },
            ],
          },
        };
        const res = createMockResponse();

        await controller.updateQuotation(req, res);

        expect(res.status).toHaveBeenCalledWith(500);
        expect(res.json).toHaveBeenCalledWith({
          message: "Database connection failure",
        });
      });
    });
  });

  // 3. getQuoteHistory
  describe("getQuoteHistory", () => {
    describe("Success Case", () => {
      it("should return 200 and history details", async () => {
        const fakeHistory = [{ id: 1, total_amount: 1000 }];
        mockGetQuoteHistory.mockResolvedValue(fakeHistory);

        const req = {};
        const res = createMockResponse();

        await controller.getQuoteHistory(req, res);

        expect(mockGetQuoteHistory).toHaveBeenCalledTimes(1);
        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.json).toHaveBeenCalledWith({
          data: fakeHistory,
        });
      });
    });

    describe("Error Case", () => {
      it("should return 500 when service fails", async () => {
        const error = new Error("Database error");
        mockGetQuoteHistory.mockRejectedValue(error);

        const req = {};
        const res = createMockResponse();

        await controller.getQuoteHistory(req, res);

        expect(res.status).toHaveBeenCalledWith(500);
        expect(res.json).toHaveBeenCalledWith({
          message: "Database error",
        });
      });
    });
  });
});
