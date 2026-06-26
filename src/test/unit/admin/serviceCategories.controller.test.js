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
    it("should return categories list successfully with default pagination", async () => {
      const fakeResult = {
        page: 1,
        limit: 20,
        total: 2,
        items: [
          { id: 1, category_name: "Maintenance", is_active: true },
          { id: 2, category_name: "Repair", is_active: true },
        ],
      };
      mockListCategories.mockResolvedValue(fakeResult);

      const req = {
        query: {},
      };
      const res = createMockResponse();

      await controller.listServiceCategories(req, res);

      expect(mockListCategories).toHaveBeenCalledWith({
        page: 1,
        limit: 20,
        include_services: "true",
      });
      expect(res.json).toHaveBeenCalledWith({ success: true, data: fakeResult });
    });

    it("should return categories list with custom query parameters", async () => {
      const fakeResult = {
        page: 2,
        limit: 10,
        total: 2,
        items: [],
      };
      mockListCategories.mockResolvedValue(fakeResult);

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
        include_services: false,
      });
      expect(res.json).toHaveBeenCalledWith({ success: true, data: fakeResult });
    });

    it("should return 400 when validation fails on query parameters", async () => {
      const req = {
        query: {
          include_services: "invalid-boolean",
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

    it("should return 500 when service fails", async () => {
      const error = new Error("Database error");
      mockListCategories.mockRejectedValue(error);

      const req = {
        query: {},
      };
      const res = createMockResponse();

      await controller.listServiceCategories(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ success: false, message: "Database error" });
    });
  });

  // 2. createServiceCategories
  describe("createServiceCategories", () => {
    it("should create service category successfully with status 201", async () => {
      const fakeCreated = {
        id: 3,
        category_name: "Detailing",
        is_active: true,
      };
      mockCreateCategories.mockResolvedValue(fakeCreated);

      const req = {
        body: {
          category_name: "Detailing",
          is_active: true,
        },
      };
      const res = createMockResponse();

      await controller.createServiceCategories(req, res);

      expect(mockCreateCategories).toHaveBeenCalledWith({
        category_name: "Detailing",
        is_active: true,
      });
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith({ success: true, data: fakeCreated });
    });

    it("should return 400 when category_name is missing", async () => {
      const req = {
        body: {
          is_active: true,
        },
      };
      const res = createMockResponse();

      await controller.createServiceCategories(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: false,
          errors: expect.arrayContaining([
            expect.objectContaining({
              field: "category_name",
              message: "Invalid input: expected string, received undefined",
            }),
          ]),
        })
      );
      expect(mockCreateCategories).not.toHaveBeenCalled();
    });

    it("should return 400 when category_name is empty", async () => {
      const req = {
        body: {
          category_name: "",
        },
      };
      const res = createMockResponse();

      await controller.createServiceCategories(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: false,
          errors: expect.arrayContaining([
            expect.objectContaining({
              field: "category_name",
              message: "category_name cannot be empty",
            }),
          ]),
        })
      );
    });

    it("should return 500 when service fails to create category", async () => {
      mockCreateCategories.mockRejectedValue(new Error("Database error"));

      const req = {
        body: {
          category_name: "Detailing",
        },
      };
      const res = createMockResponse();

      await controller.createServiceCategories(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ success: false, message: "Database error" });
    });
  });

  // 3. updateServiceCategories
  describe("updateServiceCategories", () => {
    it("should update service category successfully with status 200", async () => {
      const fakeUpdated = {
        id: 1,
        category_name: "Updated Maintenance",
        is_active: false,
      };
      mockUpdateCategories.mockResolvedValue(fakeUpdated);

      const req = {
        params: { id: "1" },
        body: {
          category_name: "Updated Maintenance",
          is_active: false,
        },
      };
      const res = createMockResponse();

      await controller.updateServiceCategories(req, res);

      expect(mockUpdateCategories).toHaveBeenCalledWith(1, {
        category_name: "Updated Maintenance",
        is_active: false,
      });
      expect(res.json).toHaveBeenCalledWith({ success: true, data: fakeUpdated });
    });

    it("should return 400 when ID is invalid (not integer)", async () => {
      const req = {
        params: { id: "abc" },
        body: {
          category_name: "Updated",
        },
      };
      const res = createMockResponse();

      await controller.updateServiceCategories(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ success: false, message: "invalid id" });
      expect(mockUpdateCategories).not.toHaveBeenCalled();
    });

    it("should return 400 when body has no fields to update", async () => {
      const req = {
        params: { id: "1" },
        body: {},
      };
      const res = createMockResponse();

      await controller.updateServiceCategories(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: false,
          errors: expect.arrayContaining([
            expect.objectContaining({
              message: "Body must have at least one field to update",
            }),
          ]),
        })
      );
    });

    it("should return 500 when service fails or category not found", async () => {
      mockUpdateCategories.mockRejectedValue(new Error("Category not found"));

      const req = {
        params: { id: "1" },
        body: {
          category_name: "Updated Maintenance",
        },
      };
      const res = createMockResponse();

      await controller.updateServiceCategories(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ success: false, message: "Category not found" });
    });
  });

  // 4. removeServiceCategories
  describe("removeServiceCategories", () => {
    it("should delete service category successfully with status 200", async () => {
      mockDeleteCategories.mockResolvedValue({ id: 1 });

      const req = {
        params: { id: "1" },
      };
      const res = createMockResponse();

      await controller.removeServiceCategories(req, res);

      expect(mockDeleteCategories).toHaveBeenCalledWith(1);
      expect(res.json).toHaveBeenCalledWith({ success: true, data: { id: 1 } });
    });

    it("should return 400 when ID is invalid or missing", async () => {
      const req = {
        params: { id: "" },
      };
      const res = createMockResponse();

      await controller.removeServiceCategories(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ success: false, message: "invalid id" });
      expect(mockDeleteCategories).not.toHaveBeenCalled();
    });

    it("should return 500 when service fails during deletion", async () => {
      mockDeleteCategories.mockRejectedValue(new Error("Database error"));

      const req = {
        params: { id: "1" },
      };
      const res = createMockResponse();

      await controller.removeServiceCategories(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ success: false, message: "Database error" });
    });
  });
});
