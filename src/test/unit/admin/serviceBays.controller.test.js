const mockListServiceBays = jest.fn();
const mockCreateServiceBay = jest.fn();
const mockUpdateServiceBay = jest.fn();
const mockRemoveServiceBay = jest.fn();

jest.mock("../../../service/admin/serviceBay.service", () => ({
  listServiceBays: mockListServiceBays,
  createServiceBay: mockCreateServiceBay,
  updateServiceBay: mockUpdateServiceBay,
  removeServiceBay: mockRemoveServiceBay,
}));

const controller = require("../../../controller/admin/serviceBays.controller");

const createMockResponse = () => {
  const res = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  return res;
};

describe("ServiceBays Controller Unit Tests", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  // 1. listServiceBays
  describe("listServiceBays", () => {
    describe("Success Case", () => {
      it("should return 200 and list of service bays", async () => {
        const fakeData = [
          { id: 1, bay_name: "Cầu 1", status: "available", is_active: true },
          { id: 2, bay_name: "Cầu 2", status: "in_use", is_active: true },
        ];
        mockListServiceBays.mockResolvedValue(fakeData);

        const req = {};
        const res = createMockResponse();

        await controller.listServiceBays(req, res);

        expect(mockListServiceBays).toHaveBeenCalledTimes(1);
        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.json).toHaveBeenCalledWith({
          success: true,
          message: 'Lấy danh sách cầu sửa chữa thành công',
          data: fakeData,
        });
      });
    });

    describe("Error Case", () => {
      it("should return 500 when service fails", async () => {
        const error = new Error("Database error");
        mockListServiceBays.mockRejectedValue(error);

        const req = {};
        const res = createMockResponse();

        await controller.listServiceBays(req, res);

        expect(res.status).toHaveBeenCalledWith(500);
        expect(res.json).toHaveBeenCalledWith({
          success: false,
          message: 'Lỗi máy chủ',
          error: "Database error",
        });
      });
    });
  });

  // 2. createServiceBay
  describe("createServiceBay", () => {
    describe("Success Case", () => {
      it("should return 201 and created service bay details when data is valid", async () => {
        const fakeCreated = { id: 3, bay_name: "Cầu 3", status: "available", is_active: true };
        mockCreateServiceBay.mockResolvedValue(fakeCreated);

        const req = {
          body: {
            bay_name: "Cầu 3",
            status: "available",
            is_active: true,
          },
        };
        const res = createMockResponse();

        await controller.createServiceBay(req, res);

        expect(mockCreateServiceBay).toHaveBeenCalledTimes(1);
        expect(mockCreateServiceBay).toHaveBeenCalledWith({
          bay_name: "Cầu 3",
          status: "available",
          is_active: true,
        });
        expect(res.status).toHaveBeenCalledWith(201);
        expect(res.json).toHaveBeenCalledWith({
          success: true,
          message: 'Tạo cầu sửa chữa thành công',
          data: fakeCreated,
        });
      });

      it("should use default status and is_active if not provided", async () => {
        const fakeCreated = { id: 3, bay_name: "Cầu 3", status: "available", is_active: true };
        mockCreateServiceBay.mockResolvedValue(fakeCreated);

        const req = {
          body: {
            bay_name: "Cầu 3",
          },
        };
        const res = createMockResponse();

        await controller.createServiceBay(req, res);

        expect(mockCreateServiceBay).toHaveBeenCalledWith({
          bay_name: "Cầu 3",
          status: "available",
          is_active: true,
        });
        expect(res.status).toHaveBeenCalledWith(201);
      });
    });

    describe("Validation Errors", () => {
      it("should return 400 when bay_name is missing", async () => {
        const req = {
          body: {
            status: "available",
          },
        };
        const res = createMockResponse();

        await controller.createServiceBay(req, res);

        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.json).toHaveBeenCalledWith(
          expect.objectContaining({
            success: false,
            message: 'Dữ liệu không hợp lệ',
            errors: expect.arrayContaining([
              expect.objectContaining({
                field: "bay_name",
                message: "Invalid input: expected string, received undefined",
              }),
            ]),
          })
        );
        expect(mockCreateServiceBay).not.toHaveBeenCalled();
      });

      it("should return 400 when bay_name is empty", async () => {
        const req = {
          body: {
            bay_name: "",
          },
        };
        const res = createMockResponse();

        await controller.createServiceBay(req, res);

        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.json).toHaveBeenCalledWith(
          expect.objectContaining({
            success: false,
            message: 'Dữ liệu không hợp lệ',
            errors: expect.arrayContaining([
              expect.objectContaining({
                field: "bay_name",
                message: "Tên cầu sửa chữa không được để trống",
              }),
            ]),
          })
        );
        expect(mockCreateServiceBay).not.toHaveBeenCalled();
      });

      it("should return 400 when status is invalid", async () => {
        const req = {
          body: {
            bay_name: "Cầu 3",
            status: "invalid_status",
          },
        };
        const res = createMockResponse();

        await controller.createServiceBay(req, res);

        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.json).toHaveBeenCalledWith(
          expect.objectContaining({
            success: false,
            errors: expect.arrayContaining([
              expect.objectContaining({
                field: "status",
                message: "Status phải là available | in_use | maintenance",
              }),
            ]),
          })
        );
      });
    });

    describe("Error Case", () => {
      it("should return 500 when service fails", async () => {
        mockCreateServiceBay.mockRejectedValue(new Error("Database error"));

        const req = {
          body: {
            bay_name: "Cầu 3",
          },
        };
        const res = createMockResponse();

        await controller.createServiceBay(req, res);

        expect(res.status).toHaveBeenCalledWith(500);
        expect(res.json).toHaveBeenCalledWith({
          success: false,
          message: 'Lỗi máy chủ',
          error: "Database error",
        });
      });
    });
  });

  // 3. updateServiceBay
  describe("updateServiceBay", () => {
    describe("Success Case", () => {
      it("should return 200 and updated service bay details when data is valid", async () => {
        const fakeUpdated = { id: 1, bay_name: "Cầu 1 Sửa", status: "maintenance", is_active: true };
        mockUpdateServiceBay.mockResolvedValue(fakeUpdated);

        const req = {
          params: { id: "1" },
          body: {
            bay_name: "Cầu 1 Sửa",
            status: "maintenance",
          },
        };
        const res = createMockResponse();

        await controller.updateServiceBay(req, res);

        expect(mockUpdateServiceBay).toHaveBeenCalledTimes(1);
        expect(mockUpdateServiceBay).toHaveBeenCalledWith("1", {
          bay_name: "Cầu 1 Sửa",
          status: "maintenance",
        });
        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.json).toHaveBeenCalledWith({
          success: true,
          message: 'Cập nhật cầu sửa chữa thành công',
          data: fakeUpdated,
        });
      });
    });

    describe("Validation Errors", () => {
      it("should return 400 when bay_name is empty", async () => {
        const req = {
          params: { id: "1" },
          body: {
            bay_name: "",
          },
        };
        const res = createMockResponse();

        await controller.updateServiceBay(req, res);

        expect(res.status).toHaveBeenCalledWith(400);
        expect(mockUpdateServiceBay).not.toHaveBeenCalled();
      });

      it("should return 400 when status is invalid", async () => {
        const req = {
          params: { id: "1" },
          body: {
            status: "invalid_status",
          },
        };
        const res = createMockResponse();

        await controller.updateServiceBay(req, res);

        expect(res.status).toHaveBeenCalledWith(400);
      });
    });

    describe("Error Case", () => {
      it("should return 500 when service fails", async () => {
        mockUpdateServiceBay.mockRejectedValue(new Error("Database error"));

        const req = {
          params: { id: "1" },
          body: {
            bay_name: "Cầu 1 Sửa",
          },
        };
        const res = createMockResponse();

        await controller.updateServiceBay(req, res);

        expect(res.status).toHaveBeenCalledWith(500);
        expect(res.json).toHaveBeenCalledWith({
          success: false,
          message: 'Lỗi máy chủ',
          error: "Database error",
        });
      });
    });
  });

  // 4. removeServiceBay
  describe("removeServiceBay", () => {
    describe("Success Case", () => {
      it("should return 200 on success", async () => {
        mockRemoveServiceBay.mockResolvedValue();

        const req = { params: { id: "1" } };
        const res = createMockResponse();

        await controller.removeServiceBay(req, res);

        expect(mockRemoveServiceBay).toHaveBeenCalledTimes(1);
        expect(mockRemoveServiceBay).toHaveBeenCalledWith("1");
        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.json).toHaveBeenCalledWith({
          success: true,
          message: 'Xóa cầu sửa chữa thành công',
        });
      });
    });

    describe("Error Case", () => {
      it("should return 500 when service fails", async () => {
        mockRemoveServiceBay.mockRejectedValue(new Error("Database error"));

        const req = { params: { id: "1" } };
        const res = createMockResponse();

        await controller.removeServiceBay(req, res);

        expect(res.status).toHaveBeenCalledWith(500);
        expect(res.json).toHaveBeenCalledWith({
          success: false,
          message: 'Lỗi máy chủ',
          error: "Database error",
        });
      });
    });
  });
});
