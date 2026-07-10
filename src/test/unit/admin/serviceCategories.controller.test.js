const mockListCategories = jest.fn();
const mockViewCategorySchema = { safeParse: jest.fn() };

jest.mock("../../../service/admin/serviceCategory.service", () => ({
  listCategories: mockListCategories,
}));

jest.mock("../../../validation/admin/serviceCategory.validation", () => ({
  viewCategorySchema: mockViewCategorySchema,
}));

const controller = require("../../../controller/admin/serviceCategories.controller");

const createMockResponse = () => {
  const res = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  return res;
};

describe("ServiceCategories Controller", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("listServiceCategories", () => {
    it("should validate query, forward q/is_active to service and return data", async () => {
      const parsed = { success: true, data: { page: 1, limit: 10, include_services: false, q: "dầu", is_active: true } };
      mockViewCategorySchema.safeParse.mockReturnValue(parsed);

      const fakeData = { items: [{ id: 1, category_name: "Dầu nhớt" }], total: 1 };
      mockListCategories.mockResolvedValue(fakeData);

      const req = { query: { q: "dầu", is_active: "true" } };
      const res = createMockResponse();

      await controller.listServiceCategories(req, res);

      expect(mockViewCategorySchema.safeParse).toHaveBeenCalledWith(req.query);
      expect(mockListCategories).toHaveBeenCalledWith(expect.objectContaining({ q: "dầu", is_active: true }));
      expect(res.json).toHaveBeenCalledWith({ success: true, data: fakeData });
    });

    it("should return 400 when validation fails", async () => {
      mockViewCategorySchema.safeParse.mockReturnValue({ success: false, error: { errors: [{ path: ["q"], message: "invalid" }] } });

      const req = { query: { q: "" } };
      const res = createMockResponse();

      await controller.listServiceCategories(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ success: false, errors: expect.any(Array) }));
    });
  });
});
