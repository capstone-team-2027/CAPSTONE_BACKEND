const mockImportSparePart = jest.fn();
const mockViewImportHistory = jest.fn();
const mockGetApprovedQuotesWithParts = jest.fn();
const mockApproveExportByQuotation = jest.fn();
const mockViewExportHistory = jest.fn();

jest.mock("../../../service/inventory/importAndExportManagement.service", () => ({
  importSparePart: mockImportSparePart,
  viewImportHistory: mockViewImportHistory,
  getApprovedQuotesWithParts: mockGetApprovedQuotesWithParts,
  approveExportByQuotation: mockApproveExportByQuotation,
  viewExportHistory: mockViewExportHistory,
}));

jest.mock("jsonwebtoken");
jest.mock("../../../../models", () => ({
  User: { findOne: jest.fn() },
  Role: {},
}));

const jwt = require("jsonwebtoken");
const { authenticate, authorizeRoles } = require("../../../middleware/auth.middleware");
const controller = require("../../../controller/inventory/importAndExportManagement.controller");

const createMockResponse = () => {
  const res = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  res.locals = { user: { id: 1 } };
  return res;
};

describe("ImportAndExportManagement Controller", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.spyOn(console, "log").mockImplementation(() => {});
  });

  afterEach(() => {
    console.log.mockRestore();
  });

  // ==================== Authorization ====================
  describe("Authorization", () => {
    let req, res, next;

    beforeEach(() => {
      req = { headers: {} };
      res = createMockResponse();
      next = jest.fn();
    });

    it("should return 401 when no token provided", async () => {
      await authenticate(req, res, next);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: "Unauthorized - No token provided",
      });
      expect(next).not.toHaveBeenCalled();
    });

    it("should return 403 when token is invalid", async () => {
      jest.spyOn(console, "error").mockImplementation(() => {});
      req.headers.authorization = "Bearer invalid-token";
      const error = new Error("invalid signature");
      error.name = "JsonWebTokenError";
      jwt.verify.mockImplementation(() => { throw error; });

      await authenticate(req, res, next);

      expect(res.status).toHaveBeenCalledWith(403);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: "Invalid token",
      });
      expect(next).not.toHaveBeenCalled();
      console.error.mockRestore();
    });

    it("should return 403 when user role is not ADMIN", () => {
      res.locals.user = { role: { roleCode: "CUSTOMER" } };
      const middleware = authorizeRoles("INVENTORY");

      middleware(req, res, next);

      expect(res.status).toHaveBeenCalledWith(403);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: "Forbidden - You do not have permission",
      });
      expect(next).not.toHaveBeenCalled();
    });
  });

  // ==================== importSparePart ====================
  describe("importSparePart", () => {
    it("should return 400 when supplier_id is missing", async () => {
      const req = {
        body: {
          items: [{ quantity: 10, unit_price: 50000, part_id: 1 }],
        },
      };
      const res = createMockResponse();

      await controller.importSparePart(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(mockImportSparePart).not.toHaveBeenCalled();
    });

    it("should return 400 when items is empty", async () => {
      const req = {
        body: {
          supplier_id: 1,
          items: [],
        },
      };
      const res = createMockResponse();

      await controller.importSparePart(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        message: "Phiếu phải có ít nhất một mặt hàng",
      });
      expect(mockImportSparePart).not.toHaveBeenCalled();
    });

    it("should return 400 when item quantity is missing", async () => {
      const req = {
        body: {
          supplier_id: 1,
          items: [{ unit_price: 50000, part_id: 1 }],
        },
      };
      const res = createMockResponse();

      await controller.importSparePart(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(mockImportSparePart).not.toHaveBeenCalled();
    });

    it("should return 400 when item quantity is not a number", async () => {
      const req = {
        body: {
          supplier_id: 1,
          items: [{ quantity: "abc", unit_price: 50000, part_id: 1 }],
        },
      };
      const res = createMockResponse();

      await controller.importSparePart(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(mockImportSparePart).not.toHaveBeenCalled();
    });

    it("should return 400 when item quantity is less than 1", async () => {
      const req = {
        body: {
          supplier_id: 1,
          items: [{ quantity: 0, unit_price: 50000, part_id: 1 }],
        },
      };
      const res = createMockResponse();

      await controller.importSparePart(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        message: "Số lượng phải lớn hơn 0",
      });
      expect(mockImportSparePart).not.toHaveBeenCalled();
    });

    it("should return 400 when unit_price is negative", async () => {
      const req = {
        body: {
          supplier_id: 1,
          items: [{ quantity: 10, unit_price: -100, part_id: 1 }],
        },
      };
      const res = createMockResponse();

      await controller.importSparePart(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        message: "Giá nhập không được âm",
      });
      expect(mockImportSparePart).not.toHaveBeenCalled();
    });

    it("should return 400 when creating new part without name", async () => {
      const req = {
        body: {
          supplier_id: 1,
          items: [{ quantity: 10, unit_price: 50000, category_id: 1 }],
        },
      };
      const res = createMockResponse();

      await controller.importSparePart(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        message: "Tên phụ tùng là bắt buộc khi tạo mới",
      });
      expect(mockImportSparePart).not.toHaveBeenCalled();
    });

    it("should return 400 when creating new part without category_id", async () => {
      const req = {
        body: {
          supplier_id: 1,
          items: [{ quantity: 10, unit_price: 50000, name: "Lốp xe" }],
        },
      };
      const res = createMockResponse();

      await controller.importSparePart(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(mockImportSparePart).not.toHaveBeenCalled();
    });

    it("should return 201 when import with existing part_id", async () => {
      const fakeResult = { id: 1 };
      mockImportSparePart.mockResolvedValue(fakeResult);
      const req = {
        body: {
          supplier_id: 1,
          items: [{ quantity: 10, unit_price: 50000, part_id: 1 }],
        },
      };
      const res = createMockResponse();

      await controller.importSparePart(req, res);

      expect(mockImportSparePart).toHaveBeenCalledWith(
        1, 1, [{ quantity: 10, unit_price: 50000, part_id: 1 }]
      );
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith({
        message: "Tạo phiếu nhập kho thành công",
        data: fakeResult,
      });
    });

    it("should return 201 when import with new part", async () => {
      const fakeResult = { id: 2 };
      mockImportSparePart.mockResolvedValue(fakeResult);
      const req = {
        body: {
          supplier_id: 1,
          items: [{
            quantity: 5,
            unit_price: 100000,
            name: "Lốp Michelin",
            brand: "Michelin",
            category_id: 1,
          }],
        },
      };
      const res = createMockResponse();

      await controller.importSparePart(req, res);

      expect(mockImportSparePart).toHaveBeenCalledTimes(1);
      expect(res.status).toHaveBeenCalledWith(201);
    });

    it("should return error when service throws", async () => {
      const error = new Error("Nhà cung cấp không tồn tại");
      error.status = 404;
      mockImportSparePart.mockRejectedValue(error);
      const req = {
        body: {
          supplier_id: 999,
          items: [{ quantity: 10, unit_price: 50000, part_id: 1 }],
        },
      };
      const res = createMockResponse();

      await controller.importSparePart(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({
        message: "Nhà cung cấp không tồn tại",
        part: undefined,
      });
    });
  });

  // ==================== viewImportHistory ====================
  describe("viewImportHistory", () => {
    it("should return 200 and import history", async () => {
      const fakeData = [{ id: 1, supplier_id: 1 }];
      mockViewImportHistory.mockResolvedValue(fakeData);
      const req = {};
      const res = createMockResponse();

      await controller.viewImportHistory(req, res);

      expect(mockViewImportHistory).toHaveBeenCalledTimes(1);
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({ data: fakeData });
    });

    it("should return error when service throws", async () => {
      const error = new Error("DB error");
      error.status = 500;
      mockViewImportHistory.mockRejectedValue(error);
      const req = {};
      const res = createMockResponse();

      await controller.viewImportHistory(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ message: "DB error" });
    });
  });

  // ==================== getApprovedQuotesWithParts ====================
  describe("getApprovedQuotesWithParts", () => {
    it("should return 200 and approved quotes", async () => {
      const fakeData = [{ id: 1, status: "approved" }];
      mockGetApprovedQuotesWithParts.mockResolvedValue(fakeData);
      const req = {};
      const res = createMockResponse();

      await controller.getApprovedQuotesWithParts(req, res);

      expect(mockGetApprovedQuotesWithParts).toHaveBeenCalledTimes(1);
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({ data: fakeData });
    });

    it("should return error when service throws", async () => {
      const error = new Error("DB error");
      error.status = 500;
      mockGetApprovedQuotesWithParts.mockRejectedValue(error);
      const req = {};
      const res = createMockResponse();

      await controller.getApprovedQuotesWithParts(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ message: "DB error" });
    });
  });

  // ==================== approveExportByQuotation ====================
  describe("approveExportByQuotation", () => {
    it("should return 400 when quotationId is missing", async () => {
      const req = { params: {} };
      const res = createMockResponse();

      await controller.approveExportByQuotation(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(mockApproveExportByQuotation).not.toHaveBeenCalled();
    });

    it("should return 400 when quotationId is not a number", async () => {
      const req = { params: { quotationId: "abc" } };
      const res = createMockResponse();

      await controller.approveExportByQuotation(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(mockApproveExportByQuotation).not.toHaveBeenCalled();
    });

    it("should return 200 when export approved successfully", async () => {
      const fakeResult = { id: 1, status: "exported" };
      mockApproveExportByQuotation.mockResolvedValue(fakeResult);
      const req = { params: { quotationId: "5" } };
      const res = createMockResponse();

      await controller.approveExportByQuotation(req, res);

      expect(mockApproveExportByQuotation).toHaveBeenCalledWith(5, 1);
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        message: "Xuất kho thành công",
        data: fakeResult,
      });
    });

    it("should return error when service throws", async () => {
      const error = new Error("Báo giá không tồn tại");
      error.status = 404;
      mockApproveExportByQuotation.mockRejectedValue(error);
      const req = { params: { quotationId: "999" } };
      const res = createMockResponse();

      await controller.approveExportByQuotation(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({
        message: "Báo giá không tồn tại",
      });
    });
  });

  // ==================== viewExportHistory ====================
  describe("viewExportHistory", () => {
    it("should return 200 and export history", async () => {
      const fakeData = [{ id: 1, quotation_id: 1 }];
      mockViewExportHistory.mockResolvedValue(fakeData);
      const req = {};
      const res = createMockResponse();

      await controller.viewExportHistory(req, res);

      expect(mockViewExportHistory).toHaveBeenCalledTimes(1);
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({ data: fakeData });
    });

    it("should return error when service throws", async () => {
      const error = new Error("DB error");
      error.status = 500;
      mockViewExportHistory.mockRejectedValue(error);
      const req = {};
      const res = createMockResponse();

      await controller.viewExportHistory(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ message: "DB error" });
    });
  });
});
