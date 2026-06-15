const mockListCategories = jest.fn();
const mockCreateCategories = jest.fn();
const mockUpdateCategories = jest.fn();
const mockDeleteCategories = jest.fn();

jest.mock("../../../service/admin/serviceCategory.service", () => ({
  listCategories: mockListCategories,
  createCategories: mockCreateCategories,
  updateCategories: mockUpdateCategories,
  deleteCategories: mockDeleteCategories,
}));

const controller = require("../../../controller/admin/serviceCategories.controller");

const createMockResponse = () => {
  const res = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  return res;
};

describe("ServiceCategories Controller Unit Tests", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  // 1. listServiceCategories
  describe("listServiceCategories", () => {
    describe("Success Cases", () => {
      it("should return 200 and category list with default query params", async () => {
        const fakeData = {
          page: 1,
          limit: 20,
          total: 2,
          items: [
            { id: 1, category_name: "Bảo dưỡng", is_active: true },
            { id: 2, category_name: "Sửa chữa chung", is_active: true },
          ],
        };
        mockListCategories.mockResolvedValue(fakeData);

        const req = {
          query: {},
        };
        const res = createMockResponse();

        await controller.listServiceCategories(req, res);

        expect(mockListCategories).toHaveBeenCalledTimes(1);
        expect(mockListCategories).toHaveBeenCalledWith({
          page: 1,
          limit: 20,
          include_services: "true", // Zod schema defaults to "true" string
        });
        expect(res.json).toHaveBeenCalledWith({
          success: true,
          data: fakeData,
        });
      });

      it("should accept custom query parameters", async () => {
        const fakeData = {
          page: 2,
          limit: 10,
          total: 20,
          items: [],
        };
        mockListCategories.mockResolvedValue(fakeData);

        const req = {
          query: {
            page: "2",
            limit: "10",
            include_services: "false",
          },
        };
        const res = createMockResponse();

        await controller.listServiceCategories(req, res);

        expect(mockListCategories).toHaveBeenCalledWith({
          page: 2,
          limit: 10,
          include_services: false, // transformed from "false"
        });
        expect(res.json).toHaveBeenCalledWith({
          success: true,
          data: fakeData,
        });
      });
    });

    describe("Validation Errors", () => {
      it("should return 400 when include_services is invalid", async () => {
        const req = {
          query: {
            include_services: "yes", // Must be "true" or "false"
          },
        };
        const res = createMockResponse();

        await controller.listServiceCategories(req, res);

        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.json).toHaveBeenCalledWith(
          expect.objectContaining({
            success: false,
            errors: expect.any(Array),
          })
        );
        expect(mockListCategories).not.toHaveBeenCalled();
      });

      it("should return 400 when page is negative", async () => {
        const req = {
          query: {
            page: "-1",
          },
        };
        const res = createMockResponse();

        await controller.listServiceCategories(req, res);

        expect(res.status).toHaveBeenCalledWith(400);
        expect(mockListCategories).not.toHaveBeenCalled();
      });
    });

    describe("Error Case", () => {
      it("should return 500 when service fails", async () => {
        mockListCategories.mockRejectedValue(new Error("Database connection error"));

        const req = { query: {} };
        const res = createMockResponse();

        await controller.listServiceCategories(req, res);

        expect(res.status).toHaveBeenCalledWith(500);
        expect(res.json).toHaveBeenCalledWith({
          success: false,
          message: "Database connection error",
        });
      });
    });
  });

  // 2. createServiceCategories
  describe("createServiceCategories", () => {
    describe("Success Cases", () => {
      it("should return 201 and created data when inputs are valid", async () => {
        const fakeCreated = {
          id: 3,
          category_name: "Rửa xe & Làm đẹp",
          is_active: true,
        };
        mockCreateCategories.mockResolvedValue(fakeCreated);

        const req = {
          body: {
            category_name: "Rửa xe & Làm đẹp",
            is_active: true,
          },
        };
        const res = createMockResponse();

        await controller.createServiceCategories(req, res);

        expect(mockCreateCategories).toHaveBeenCalledTimes(1);
        expect(mockCreateCategories).toHaveBeenCalledWith({
          category_name: "Rửa xe & Làm đẹp",
          is_active: true,
        });
        expect(res.status).toHaveBeenCalledWith(201);
        expect(res.json).toHaveBeenCalledWith({
          success: true,
          data: fakeCreated,
        });
      });

      it("should default is_active to true if omitted", async () => {
        const fakeCreated = {
          id: 4,
          category_name: "Cứu hộ",
          is_active: true,
        };
        mockCreateCategories.mockResolvedValue(fakeCreated);

        const req = {
          body: {
            category_name: "Cứu hộ",
          },
        };
        const res = createMockResponse();

        await controller.createServiceCategories(req, res);

        expect(mockCreateCategories).toHaveBeenCalledWith({
          category_name: "Cứu hộ",
          is_active: true,
        });
        expect(res.status).toHaveBeenCalledWith(201);
      });
    });

    describe("Validation Errors", () => {
      it("should return 400 when category_name is empty", async () => {
        const req = {
          body: {
            category_name: "   ",
          },
        };
        const res = createMockResponse();

        await controller.createServiceCategories(req, res);

        expect(res.status).toHaveBeenCalledWith(400);
        expect(mockCreateCategories).not.toHaveBeenCalled();
      });

      it("should return 400 when category_name is too long", async () => {
        const req = {
          body: {
            category_name: "a".repeat(101),
          },
        };
        const res = createMockResponse();

        await controller.createServiceCategories(req, res);

        expect(res.status).toHaveBeenCalledWith(400);
        expect(mockCreateCategories).not.toHaveBeenCalled();
      });

      it("should return 400 when is_active is not a boolean", async () => {
        const req = {
          body: {
            category_name: "Đồng sơn",
            is_active: "yes",
          },
        };
        const res = createMockResponse();

        await controller.createServiceCategories(req, res);

        expect(res.status).toHaveBeenCalledWith(400);
        expect(mockCreateCategories).not.toHaveBeenCalled();
      });
    });

    describe("Error Case", () => {
      it("should return 500 when service fails", async () => {
        mockCreateCategories.mockRejectedValue(new Error("Unique constraint violation"));

        const req = {
          body: {
            category_name: "Trùng tên",
          },
        };
        const res = createMockResponse();

        await controller.createServiceCategories(req, res);

        expect(res.status).toHaveBeenCalledWith(500);
        expect(res.json).toHaveBeenCalledWith({
          success: false,
          message: "Unique constraint violation",
        });
      });
    });
  });

  // 3. updateServiceCategories
  describe("updateServiceCategories", () => {
    describe("Success Cases", () => {
      it("should return 200 and updated category", async () => {
        const fakeUpdated = {
          id: 1,
          category_name: "Bảo dưỡng định kỳ",
          is_active: false,
        };
        mockUpdateCategories.mockResolvedValue(fakeUpdated);

        const req = {
          params: { id: "1" },
          body: {
            category_name: "Bảo dưỡng định kỳ",
            is_active: false,
          },
        };
        const res = createMockResponse();

        await controller.updateServiceCategories(req, res);

        expect(mockUpdateCategories).toHaveBeenCalledTimes(1);
        expect(mockUpdateCategories).toHaveBeenCalledWith(1, {
          category_name: "Bảo dưỡng định kỳ",
          is_active: false,
        });
        expect(res.json).toHaveBeenCalledWith({
          success: true,
          data: fakeUpdated,
        });
      });
    });

    describe("Validation Errors", () => {
      it("should return 400 when ID is invalid", async () => {
        const req = {
          params: { id: "abc" },
          body: { category_name: "Hợp lệ" },
        };
        const res = createMockResponse();

        await controller.updateServiceCategories(req, res);

        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.json).toHaveBeenCalledWith({
          success: false,
          message: "invalid id",
        });
        expect(mockUpdateCategories).not.toHaveBeenCalled();
      });

      it("should return 400 when ID is <= 0", async () => {
        const req = {
          params: { id: "-5" },
          body: { category_name: "Hợp lệ" },
        };
        const res = createMockResponse();

        await controller.updateServiceCategories(req, res);

        expect(res.status).toHaveBeenCalledWith(400);
        expect(mockUpdateCategories).not.toHaveBeenCalled();
      });

      it("should return 400 when body is empty", async () => {
        const req = {
          params: { id: "1" },
          body: {},
        };
        const res = createMockResponse();

        await controller.updateServiceCategories(req, res);

        expect(res.status).toHaveBeenCalledWith(400);
        expect(mockUpdateCategories).not.toHaveBeenCalled();
      });
    });

    describe("Error Case", () => {
      it("should return 500 when category not found in service", async () => {
        mockUpdateCategories.mockRejectedValue(new Error("Category not found"));

        const req = {
          params: { id: "99" },
          body: { category_name: "Không tồn tại" },
        };
        const res = createMockResponse();

        await controller.updateServiceCategories(req, res);

        expect(res.status).toHaveBeenCalledWith(500);
        expect(res.json).toHaveBeenCalledWith({
          success: false,
          message: "Category not found",
        });
      });
    });
  });

  // 4. removeServiceCategories
  describe("removeServiceCategories", () => {
    describe("Success Case", () => {
      it("should return 200 and deleted category ID", async () => {
        mockDeleteCategories.mockResolvedValue({ id: 5 });

        const req = {
          params: { id: "5" },
        };
        const res = createMockResponse();

        await controller.removeServiceCategories(req, res);

        expect(mockDeleteCategories).toHaveBeenCalledTimes(1);
        expect(mockDeleteCategories).toHaveBeenCalledWith(5);
        expect(res.json).toHaveBeenCalledWith({
          success: true,
          data: { id: 5 },
        });
      });
    });

    describe("Validation Errors", () => {
      it("should return 400 when ID is missing or falsy", async () => {
        const req = {
          params: { id: "0" },
        };
        const res = createMockResponse();

        await controller.removeServiceCategories(req, res);

        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.json).toHaveBeenCalledWith({
          success: false,
          message: "invalid id",
        });
        expect(mockDeleteCategories).not.toHaveBeenCalled();
      });
    });

    describe("Error Case", () => {
      it("should return 500 when deletion fails in service", async () => {
        mockDeleteCategories.mockRejectedValue(new Error("Delete failed"));

        const req = {
          params: { id: "5" },
        };
        const res = createMockResponse();

        await controller.removeServiceCategories(req, res);

        expect(res.status).toHaveBeenCalledWith(500);
        expect(res.json).toHaveBeenCalledWith({
          success: false,
          message: "Delete failed",
        });
      });
    });
  });
});
