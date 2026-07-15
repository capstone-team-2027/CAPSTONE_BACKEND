const mockGetIssuesReports = jest.fn();
const mockGetSpareParts = jest.fn();
const mockCreateQuotation = jest.fn();
const mockUpdateQuotation = jest.fn();
const mockGetQuoteHistory = jest.fn();

jest.mock("../../../service/receptionist/quoteManagement.service", () => ({
  getIssuesReports: mockGetIssuesReports,
  getSpareParts: mockGetSpareParts,
  createQuotation: mockCreateQuotation,
  updateQuotation: mockUpdateQuotation,
  getQuoteHistory: mockGetQuoteHistory,
}));

const controller = require("../../../controller/receptionist/quoteManagement.controller");

const createMockResponse = () => {
  const res = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  return res;
};

describe("Receptionist QuoteManagement Controller Unit Tests", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("getIssueReports", () => {
    it("should return issue reports successfully", async () => {
      const fakeData = [{ id: 1, issue_name: "Broken window" }];
      mockGetIssuesReports.mockResolvedValue(fakeData);

      const req = {};
      const res = createMockResponse();

      await controller.getIssueReports(req, res);

      expect(mockGetIssuesReports).toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({ success: true, data: fakeData });
    });

    it("should handle error", async () => {
      mockGetIssuesReports.mockRejectedValue({ status: 500, message: "Server error" });

      const req = {};
      const res = createMockResponse();

      await controller.getIssueReports(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ message: "Server error" });
    });
  });

  describe("getSpareParts", () => {
    it("should return spare parts successfully", async () => {
      const fakeData = [{ id: 1, part_name: "Brake Pad" }];
      mockGetSpareParts.mockResolvedValue(fakeData);

      const req = {};
      const res = createMockResponse();

      await controller.getSpareParts(req, res);

      expect(mockGetSpareParts).toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({ data: fakeData });
    });
  });

  describe("createQuotation", () => {
    it("should create quotation successfully", async () => {
      const fakeResult = { id: 100, task_id: 1 };
      mockCreateQuotation.mockResolvedValue(fakeResult);

      const req = {
        body: {
          task_id: 1,
          items: [
            {
              issue_id: 2,
              spare_part_id: 3,
              quantity: 1,
            },
          ],
          note: "Standard quote",
          email: "customer@example.com",
        },
      };
      const res = createMockResponse();

      await controller.createQuotation(req, res);

      expect(mockCreateQuotation).toHaveBeenCalledWith(
        {
          task_id: 1,
          items: [
            {
              issue_id: 2,
              spare_part_id: 3,
              quantity: 1,
            },
          ],
          note: "Standard quote",
        },
        "customer@example.com"
      );
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith({
        message: "Tạo báo giá thành công",
        data: fakeResult,
      });
    });

    it("should reject creation on validation fail (empty items)", async () => {
      const req = {
        body: {
          task_id: 1,
          items: [],
        },
      };
      const res = createMockResponse();

      await controller.createQuotation(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenLastCalledWith({
        message: "Báo giá phải có ít nhất một dòng",
      });
    });
  });

  describe("updateQuotation", () => {
    it("should update quotation successfully", async () => {
      const fakeResult = { id: 10, itemsCount: 1 };
      mockUpdateQuotation.mockResolvedValue(fakeResult);

      const req = {
        params: { id: "10" },
        body: {
          items: [
            {
              issue_id: 2,
              spare_part_id: 5,
              quantity: 2,
            },
          ],
          note: "Updated quote note",
        },
      };
      const res = createMockResponse();

      await controller.updateQuotation(req, res);

      expect(mockUpdateQuotation).toHaveBeenCalledWith("10", {
        items: [
          {
            issue_id: 2,
            spare_part_id: 5,
            quantity: 2,
          },
        ],
        note: "Updated quote note",
      });
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        message: "Cập nhật báo giá thành công",
        data: fakeResult,
      });
    });
  });

  describe("getQuoteHistory", () => {
    it("should return quote history successfully", async () => {
      const fakeData = [{ id: 10, note: "History item" }];
      mockGetQuoteHistory.mockResolvedValue(fakeData);

      const req = {};
      const res = createMockResponse();

      await controller.getQuoteHistory(req, res);

      expect(mockGetQuoteHistory).toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({ data: fakeData });
    });
  });
});
