const mockGetServiceCatalog = jest.fn();
const mockGetServiceCatalogDetail = jest.fn();
const mockSearchServiceCatalog = jest.fn();

jest.mock("../../../service/common/guest.service", () => ({
  getServiceCatalog: mockGetServiceCatalog,
  getServiceCatalogDetail: mockGetServiceCatalogDetail,
  searchServiceCatalog: mockSearchServiceCatalog,
}));

const controller = require("../../../controller/common/guest.controller");

const createMockResponse = () => {
  const res = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  return res;
};

describe("Guest Controller", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("getServiceCatalogDetail", () => {
    it("should return service detail successfully", async () => {
      const fakeData = {
        id: 12,
        category_id: 3,
        service_name: "Bao duong dinh ky",
        description: "Kiem tra va bao duong xe dinh ky",
        estimated_duration: 90,
        is_active: true,
        category: {
          id: 3,
          category_name: "Bao duong",
        },
      };
      mockGetServiceCatalogDetail.mockResolvedValue(fakeData);

      const req = { params: { id: "12" } };
      const res = createMockResponse();

      await controller.getServiceCatalogDetail(req, res);

      expect(mockGetServiceCatalogDetail).toHaveBeenCalledWith(12);
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        message: "Lấy thông tin dịch vụ thành công",
        data: fakeData,
      });
    });

    it.each(["abc", "-1", "1.5", ""])("should return 400 for invalid id %s", async (id) => {
      const req = { params: { id } };
      const res = createMockResponse();

      await controller.getServiceCatalogDetail(req, res);

      expect(mockGetServiceCatalogDetail).not.toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: "ID dịch vụ không hợp lệ",
      });
    });

    it("should propagate not found error", async () => {
      const error = new Error("Dịch vụ không tồn tại");
      error.status = 404;
      mockGetServiceCatalogDetail.mockRejectedValue(error);

      const req = { params: { id: "999" } };
      const res = createMockResponse();

      await controller.getServiceCatalogDetail(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: "Dịch vụ không tồn tại",
      });
    });
  });

  describe("searchServiceCatalog", () => {
    it("should search services successfully with normalized params", async () => {
      const fakeData = {
        items: [{ id: 3, service_name: "Kiem tra he thong phanh" }],
        pagination: { page: 2, limit: 8, total: 1, totalPages: 1 },
      };
      mockSearchServiceCatalog.mockResolvedValue(fakeData);

      const req = {
        query: {
          q: "  phanh  ",
          category_id: "2",
          page: "2",
          limit: "8",
        },
      };
      const res = createMockResponse();

      await controller.searchServiceCatalog(req, res);

      expect(mockSearchServiceCatalog).toHaveBeenCalledWith({
        q: "phanh",
        category_id: 2,
        page: 2,
        limit: 8,
      });
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        message: "Tìm kiếm dịch vụ thành công",
        data: fakeData,
      });
    });

    it("should return empty-result message when no services found", async () => {
      const fakeData = {
        items: [],
        pagination: { page: 1, limit: 8, total: 0, totalPages: 0 },
      };
      mockSearchServiceCatalog.mockResolvedValue(fakeData);

      const req = { query: { q: "khong ton tai" } };
      const res = createMockResponse();

      await controller.searchServiceCatalog(req, res);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        message: "Không tìm thấy dịch vụ phù hợp",
        data: fakeData,
      });
    });

    it("should return 400 when category id is invalid", async () => {
      const req = { query: { category_id: "abc" } };
      const res = createMockResponse();

      await controller.searchServiceCatalog(req, res);

      expect(mockSearchServiceCatalog).not.toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: "Danh mục dịch vụ không hợp lệ",
      });
    });
  });
});
