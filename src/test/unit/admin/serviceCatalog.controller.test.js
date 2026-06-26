const mockGetServiceCategories = jest.fn();
const mockCreateServiceCatalog = jest.fn();
const mockGetServiceCatalog = jest.fn();
const mockUpdateServiceCatalog = jest.fn();

jest.mock("../../../service/admin/serviceCatalog.service", () => ({
  getServiceCategories: mockGetServiceCategories,
  createServiceCatalog: mockCreateServiceCatalog,
  getServiceCatalog: mockGetServiceCatalog,
  updateServiceCatalog: mockUpdateServiceCatalog,
}));

const controller = require("../../../controller/admin/serviceCatalog.controller");

const createMockResponse = () => {
  const res = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  return res;
};

describe("ServiceCatalog Controller Unit Tests", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  // 1. getServiceCategories
  describe("getServiceCategories", () => {
    it("should return service categories successfully with status 200", async () => {
      const fakeCategories = [
        { id: 1, category_name: "Maintenance" },
        { id: 2, category_name: "Repair" },
      ];
      mockGetServiceCategories.mockResolvedValue(fakeCategories);

      const req = {};
      const res = createMockResponse();

      await controller.getServiceCategories(req, res);

      expect(mockGetServiceCategories).toHaveBeenCalledTimes(1);
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({ data: fakeCategories });
    });

    it("should handle error when service fails", async () => {
      const error = new Error("Database error");
      error.status = 500;
      mockGetServiceCategories.mockRejectedValue(error);

      const req = {};
      const res = createMockResponse();

      await controller.getServiceCategories(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ message: "Database error" });
    });
  });

  // 2. createServiceCatalog
  describe("createServiceCatalog", () => {
    it("should create new service catalog successfully with status 201", async () => {
      const fakeCreated = {
        id: 10,
        category_id: 1,
        service_name: "Oil Change",
        description: "Standard oil change",
        estimated_duration: 30,
        is_active: true,
      };
      mockCreateServiceCatalog.mockResolvedValue(fakeCreated);

      const req = {
        body: {
          category_id: 1,
          service_name: "Oil Change",
          description: "Standard oil change",
          estimated_duration: 30,
          is_active: true,
        },
      };
      const res = createMockResponse();

      await controller.createServiceCatalog(req, res);

      expect(mockCreateServiceCatalog).toHaveBeenCalledWith(1, "Oil Change", "Standard oil change", 30, true);
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith({
        message: "Tạo mới dịch vụ thành công",
        data: fakeCreated,
      });
    });

    it("should return error code and message when service throws error", async () => {
      const error = { status: 404, message: "Danh mục không tồn tại" };
      mockCreateServiceCatalog.mockRejectedValue(error);

      const req = {
        body: {
          category_id: 999,
          service_name: "Oil Change",
        },
      };
      const res = createMockResponse();

      await controller.createServiceCatalog(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ message: "Danh mục không tồn tại" });
    });
  });

  // 3. getServiceCatalog
  describe("getServiceCatalog", () => {
    it("should return service catalog successfully with status 200", async () => {
      const fakeCatalog = [
        {
          id: 10,
          category_id: 1,
          service_name: "Oil Change",
          description: "Standard oil change",
          estimated_duration: 30,
          is_active: true,
          category: { category_name: "Maintenance" },
        },
      ];
      mockGetServiceCatalog.mockResolvedValue(fakeCatalog);

      const req = {};
      const res = createMockResponse();

      await controller.getServiceCatalog(req, res);

      expect(mockGetServiceCatalog).toHaveBeenCalledTimes(1);
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({ data: fakeCatalog });
    });

    it("should handle error when service fails to retrieve catalog", async () => {
      const error = new Error("Database error");
      mockGetServiceCatalog.mockRejectedValue(error);

      const req = {};
      const res = createMockResponse();

      await controller.getServiceCatalog(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ message: "Database error" });
    });
  });

  // 4. updateServiceCatalog
  describe("updateServiceCatalog", () => {
    it("should update service catalog successfully with status 201", async () => {
      const fakeUpdated = {
        id: 10,
        category_id: 1,
        service_name: "Oil Change Updated",
        description: "Updated description",
        estimated_duration: 40,
        is_active: true,
      };
      mockUpdateServiceCatalog.mockResolvedValue(fakeUpdated);

      const req = {
        params: { id: "10" },
        body: {
          category_id: 1,
          service_name: "Oil Change Updated",
          description: "Updated description",
          estimated_duration: 40,
          is_active: true,
        },
      };
      const res = createMockResponse();

      await controller.updateServiceCatalog(req, res);

      expect(mockUpdateServiceCatalog).toHaveBeenCalledWith("10", 1, "Oil Change Updated", "Updated description", 40, true);
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith({
        message: "Cập nhật dịch vụ thành công",
        data: fakeUpdated,
      });
    });

    it("should return error status and message when service throws error during update", async () => {
      const error = { status: 404, message: "Dịch vụ không tồn tại" };
      mockUpdateServiceCatalog.mockRejectedValue(error);

      const req = {
        params: { id: "999" },
        body: {
          category_id: 1,
          service_name: "Oil Change",
        },
      };
      const res = createMockResponse();

      await controller.updateServiceCatalog(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ message: "Dịch vụ không tồn tại" });
    });
  });
});
