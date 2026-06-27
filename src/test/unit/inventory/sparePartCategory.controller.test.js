const mockCreatePartCategory = jest.fn();
const mockGetPartCategory = jest.fn();
const mockUpdatePartCategory = jest.fn();
jest.mock("../../../service/inventory/sparePartCategoryManagement.service", () => ({
  createPartCategory: mockCreatePartCategory,
  getPartCategory: mockGetPartCategory,
  updatePartCategory: mockUpdatePartCategory,
}));

const controller = require("../../../controller/inventory/sparePartCategoryManagement.controller");

const createMockResponse = () => {
  const res = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  return res;
};

//SparePartCategory Controller
describe("SparePartCategory Controller", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });
  //createPartCategory
  describe("createPartCategory", () => {
    describe("Validation", () => {
      it("should return 400 when category_name is not string", async () => {
        const req = {
          body: {
            category_name: 123,
            description: "Phụ tùng lốp",
            is_active: true,
          },
        };
        const res = createMockResponse();
        await controller.createPartCategory(req, res);
        expect(res.status).toHaveBeenCalledWith(400);
        expect(mockCreatePartCategory).not.toHaveBeenCalled();
      });
      it("should return 400 when category_name length < 2", async () => {
        const req = {
          body: {
            category_name: "A",
            description: "Phụ tùng lốp",
            is_active: true,
          },
        };
        const res = createMockResponse();
        await controller.createPartCategory(req, res);
        expect(res.status).toHaveBeenCalledWith(400);
        expect(mockCreatePartCategory).not.toHaveBeenCalled();
      });
      it("should return 400 when is_active is not boolean", async () => {
        const req = {
          body: {
            category_name: "Lốp xe",
            description: "Phụ tùng lốp",
            is_active: "true",
          },
        };
        const res = createMockResponse();
        await controller.createPartCategory(req, res);
        expect(res.status).toHaveBeenCalledWith(400);
        expect(mockCreatePartCategory).not.toHaveBeenCalled();
      });
    });
    describe("Success Case", () => {
      it("should return 201 and data", async () => {
        const fakeData = {
          id: 1,
          category_name: "Lốp xe",
          description: "Phụ tùng lốp",
          is_active: true,
        };
        mockCreatePartCategory.mockResolvedValue(fakeData);
        const req = {
          body: {
            category_name: "Lốp xe",
            description: "Phụ tùng lốp",
            is_active: true,
          },
        };
        const res = createMockResponse();
        await controller.createPartCategory(req, res);
        expect(mockCreatePartCategory).toHaveBeenCalledTimes(1);
        expect(mockCreatePartCategory).toHaveBeenCalledWith(
          "Lốp xe",
          "Phụ tùng lốp",
          true,
        );
        expect(res.status).toHaveBeenCalledWith(201);
        expect(res.json).toHaveBeenCalledWith({
          message: "Tạo danh mục thành công",
          data: fakeData,
        });
      });
    });
  });
  // GetPartCategory
  describe("getPartCategory", () => {
    describe("Success Case", () => {
      it("should return category list", async () => {
        const fakeData = [
          { id: 1, category_name: "Lốp xe" },
          { id: 2, category_name: "Ắc quy" },
        ];
        mockGetPartCategory.mockResolvedValue(fakeData);
        const req = {};
        const res = createMockResponse();
        await controller.getPartCategory(req, res);
        expect(mockGetPartCategory).toHaveBeenCalledTimes(1);
        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.json).toHaveBeenCalledWith({
          data: fakeData,
        });
      });
    });
    describe("Error Case", () => {
      it("should return custom error", async () => {
        const error = new Error("Không tìm thấy dữ liệu");
        error.status = 404;
        mockGetPartCategory.mockRejectedValue(error);
        const req = {};
        const res = createMockResponse();
        await controller.getPartCategory(req, res);
        expect(res.status).toHaveBeenCalledWith(404);
        expect(res.json).toHaveBeenCalledWith({
          message: "Không tìm thấy dữ liệu",
        });
      });
    });
  });
  // updatePartCategory
  describe("updatePartCategory", () => {
    describe("Error Case", () => {
      it("should return 404 when category id is not found", async () => {
        const error = new Error("Không tìm thấy danh mục");
        error.status = 404;
        mockUpdatePartCategory.mockRejectedValue(error);
        const req = {
          params: { id: 999 },
          body: {
            category_name: "Lốp xe",
            description: "Phụ tùng lốp",
            is_active: true,
          },
        };
        const res = createMockResponse();
        await controller.updatePartCategory(req, res);
        expect(res.status).toHaveBeenCalledWith(404);
        expect(res.json).toHaveBeenCalledWith({
          message: "Không tìm thấy danh mục",
        });
      });
    });
  });
});
