const mockGetSpareParts = jest.fn();
const mockUpdateSparePart = jest.fn();

jest.mock("../../../service/inventory/sparePartManagement.service", () => ({
  getSpareParts: mockGetSpareParts,
  updateSparePart: mockUpdateSparePart,
}));

jest.mock("jsonwebtoken");
jest.mock("../../../../models", () => ({
  User: { findOne: jest.fn() },
  Role: {},
}));

const jwt = require("jsonwebtoken");
const db = require("../../../../models");
const { authenticate, authorizeRoles } = require("../../../middleware/auth.middleware");
const controller = require("../../../controller/inventory/sparePartManagement.controller");

const createMockResponse = () => {
  const res = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  res.locals = {};
  return res;
};

describe("SparePartManagement Controller", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

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
      const middleware = authorizeRoles("ADMIN");

      middleware(req, res, next);

      expect(res.status).toHaveBeenCalledWith(403);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: "Forbidden - You do not have permission",
      });
      expect(next).not.toHaveBeenCalled();
    });

  });

  describe("getSpareParts", () => {
    it("should return 200 and spare parts list", async () => {
      const fakeData = [
        { id: 1, name: "Lốp Michelin" },
        { id: 2, name: "Ắc quy Varta" },
      ];
      mockGetSpareParts.mockResolvedValue(fakeData);
      const req = {};
      const res = createMockResponse();

      await controller.getSpareParts(req, res);

      expect(mockGetSpareParts).toHaveBeenCalledTimes(1);
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({ data: fakeData });
    });

    it("should return error when service throws", async () => {
      const error = new Error("DB error");
      error.status = 500;
      mockGetSpareParts.mockRejectedValue(error);
      const req = {};
      const res = createMockResponse();

      await controller.getSpareParts(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ message: "DB error" });
    });
  });

  describe("updateSparePart", () => {
    it("should return 400 when name is not a string", async () => {
      const req = {
        params: { id: 1 },
        body: { name: 123, brand: "Michelin", retail_price: 500000 },
      };
      const res = createMockResponse();

      await controller.updateSparePart(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(mockUpdateSparePart).not.toHaveBeenCalled();
    });

    it("should return 400 when retail_price is negative", async () => {
      const req = {
        params: { id: 1 },
        body: { name: "Lốp xe", brand: "Michelin", retail_price: -100 },
      };
      const res = createMockResponse();

      await controller.updateSparePart(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(mockUpdateSparePart).not.toHaveBeenCalled();
    });

    it("should return 200 when update successfully", async () => {
      const fakeResult = { id: 1, name: "Lốp xe", brand: "Michelin" };
      mockUpdateSparePart.mockResolvedValue(fakeResult);
      const req = {
        params: { id: 1 },
        body: {
          name: "Lốp xe",
          brand: "Michelin",
          retail_price: 500000,
          warranty_period_months: 12,
          warranty_km_limit: 50000,
        },
      };
      const res = createMockResponse();

      await controller.updateSparePart(req, res);

      expect(mockUpdateSparePart).toHaveBeenCalledWith(
        1, "Lốp xe", "Michelin", 500000, 12, 50000
      );
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        message: "Cập nhật phụ tùng thành công",
        data: fakeResult,
      });
    });

    it("should return 404 when spare part not found", async () => {
      const error = new Error("Phụ tùng không tồn tại");
      error.status = 404;
      mockUpdateSparePart.mockRejectedValue(error);
      const req = {
        params: { id: 999 },
        body: { name: "Lốp xe", brand: "Michelin", retail_price: 500000 },
      };
      const res = createMockResponse();

      await controller.updateSparePart(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({
        message: "Phụ tùng không tồn tại",
      });
    });
  });
});
