const mockGetStaffList = jest.fn();
const mockCreateStaff = jest.fn();
const mockUpdateStaff = jest.fn();

jest.mock("../../../service/admin/manageStaff.service", () => ({
  getStaffList: mockGetStaffList,
  createStaff: mockCreateStaff,
  updateStaff: mockUpdateStaff,
}));

const mockCreateStaffSchema = { safeParse: jest.fn() };
const mockUpdateStaffSchema = { safeParse: jest.fn() };

jest.mock("../../../validation/admin/manageStaff.validation", () => ({
  createStaffSchema: mockCreateStaffSchema,
  updateStaffSchema: mockUpdateStaffSchema,
}));

const controller = require("../../../controller/admin/manageStaff.controller");

const createMockResponse = () => {
  const res = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  return res;
};

describe("ManageStaff Controller", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("getStaffList", () => {
    it("should return staff list with pagination on success", async () => {
      const fakeData = {
        data: [
          { id: 1, fullName: "Staff 1", phoneNumber: "0987654321" },
          { id: 2, fullName: "Staff 2", phoneNumber: "0987654322" },
        ],
        pagination: {
          page: 1,
          limit: 20,
          total: 2,
          totalPages: 1,
        },
      };
      mockGetStaffList.mockResolvedValue(fakeData);

      const req = { query: { page: 1, limit: 20 } };
      const res = createMockResponse();

      await controller.getStaffList(req, res);

      expect(mockGetStaffList).toHaveBeenCalledWith({
        page: 1,
        limit: 20,
        search: undefined,
        roleCode: undefined,
      });
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        message: "Lấy danh sách nhân sự thành công",
        data: fakeData.data,
        pagination: fakeData.pagination,
      });
    });

    it("should pass search and role filter parameters", async () => {
      const fakeData = { data: [], pagination: { page: 1, limit: 20, total: 0, totalPages: 0 } };
      mockGetStaffList.mockResolvedValue(fakeData);

      const req = { query: { page: 1, limit: 10, search: "John", role: "TECHNICIAN" } };
      const res = createMockResponse();

      await controller.getStaffList(req, res);

      expect(mockGetStaffList).toHaveBeenCalledWith({
        page: 1,
        limit: 10,
        search: "John",
        roleCode: "TECHNICIAN",
      });
      expect(res.status).toHaveBeenCalledWith(200);
    });

    it("should handle service errors", async () => {
      const error = new Error("Database error");
      error.status = 500;
      mockGetStaffList.mockRejectedValue(error);

      const req = { query: {} };
      const res = createMockResponse();

      await controller.getStaffList(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ message: "Database error" });
    });
  });

  describe("createStaff", () => {
    it("should return 400 when fullName is missing", async () => {
      const req = {
        body: { phoneNumber: "0987654321", roleCode: "TECHNICIAN", password: "password123" },
      };
      const res = createMockResponse();

      mockCreateStaffSchema.safeParse.mockReturnValue({
        success: false,
        error: { issues: [{ message: "Họ tên là bắt buộc" }] },
      });

      await controller.createStaff(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ message: "Họ tên là bắt buộc" });
      expect(mockCreateStaff).not.toHaveBeenCalled();
    });

    it("should return 400 when fullName length < 2", async () => {
      const req = {
        body: { fullName: "A", phoneNumber: "0987654321", roleCode: "TECHNICIAN" },
      };
      const res = createMockResponse();

      mockCreateStaffSchema.safeParse.mockReturnValue({
        success: false,
        error: { issues: [{ message: "Họ tên phải có ít nhất 2 ký tự" }] },
      });

      await controller.createStaff(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ message: "Họ tên phải có ít nhất 2 ký tự" });
    });

    it("should return 400 when password and confirmPassword do not match", async () => {
      const req = {
        body: {
          fullName: "Test Staff",
          phoneNumber: "0987654321",
          roleCode: "TECHNICIAN",
          password: "password123",
          confirmPassword: "password456",
        },
      };
      const res = createMockResponse();

      mockCreateStaffSchema.safeParse.mockReturnValue({
        success: false,
        error: { issues: [{ message: "Mật khẩu xác nhận không khớp" }] },
      });

      await controller.createStaff(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ message: "Mật khẩu xác nhận không khớp" });
    });

    it("should successfully create staff and return tempPassword", async () => {
      const req = {
        body: {
          fullName: "New Staff",
          phoneNumber: "0987654321",
          roleCode: "TECHNICIAN",
          password: "password123",
          confirmPassword: "password123",
        },
      };
      const res = createMockResponse();
      const createdUser = { id: 5, fullName: "New Staff", phoneNumber: "0987654321" };
      const tempPassword = "tempPass123";

      mockCreateStaffSchema.safeParse.mockReturnValue({
        success: true,
        data: {
          fullName: "New Staff",
          phoneNumber: "0987654321",
          roleCode: "TECHNICIAN",
          password: "password123",
          confirmPassword: "password123",
        },
      });
      mockCreateStaff.mockResolvedValue({ user: createdUser, tempPassword });

      await controller.createStaff(req, res);

      expect(mockCreateStaff).toHaveBeenCalledWith(expect.objectContaining({
        fullName: "New Staff",
        phoneNumber: "0987654321",
        roleCode: "TECHNICIAN",
      }));
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith({
        message: "Tạo nhân sự thành công",
        data: createdUser,
        tempPassword,
      });
    });

    it("should handle service error when phone already exists", async () => {
      const req = {
        body: {
          fullName: "New Staff",
          phoneNumber: "0987654321",
          roleCode: "TECHNICIAN",
        },
      };
      const res = createMockResponse();
      const error = new Error("Số điện thoại đã tồn tại");
      error.status = 400;

      mockCreateStaffSchema.safeParse.mockReturnValue({
        success: true,
        data: {
          fullName: "New Staff",
          phoneNumber: "0987654321",
          roleCode: "TECHNICIAN",
        },
      });
      mockCreateStaff.mockRejectedValue(error);

      await controller.createStaff(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ message: "Số điện thoại đã tồn tại" });
    });

    it("should handle service error when role is invalid", async () => {
      const req = {
        body: {
          fullName: "New Staff",
          phoneNumber: "0987654321",
          roleCode: "INVALID_ROLE",
        },
      };
      const res = createMockResponse();
      const error = new Error("Vai trò không hợp lệ");
      error.status = 400;

      mockCreateStaffSchema.safeParse.mockReturnValue({
        success: true,
        data: expect.any(Object),
      });
      mockCreateStaff.mockRejectedValue(error);

      await controller.createStaff(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ message: "Vai trò không hợp lệ" });
    });
  });

  describe("updateStaff", () => {
    it("should return 400 when no field is provided for update", async () => {
      const req = { body: {}, params: { userId: 5 } };
      const res = createMockResponse();

      mockUpdateStaffSchema.safeParse.mockReturnValue({
        success: false,
        error: {
          issues: [{ message: "Vui lòng cung cấp ít nhất một trường để cập nhật" }],
        },
      });

      await controller.updateStaff(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        message: "Vui lòng cung cấp ít nhất một trường để cập nhật",
      });
      expect(mockUpdateStaff).not.toHaveBeenCalled();
    });

    it("should return 400 when status is invalid enum", async () => {
      const req = {
        body: { status: "INVALID_STATUS" },
        params: { userId: 5 },
      };
      const res = createMockResponse();

      mockUpdateStaffSchema.safeParse.mockReturnValue({
        success: false,
        error: { issues: [{ message: "Trạng thái tài khoản không hợp lệ" }] },
      });

      await controller.updateStaff(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        message: "Trạng thái tài khoản không hợp lệ",
      });
    });

    it("should successfully update staff with fullName only", async () => {
      const req = {
        body: { fullName: "Updated Name" },
        params: { userId: 5 },
      };
      const res = createMockResponse();
      const updatedUser = { id: 5, fullName: "Updated Name", phoneNumber: "0987654321" };

      mockUpdateStaffSchema.safeParse.mockReturnValue({
        success: true,
        data: { fullName: "Updated Name" },
      });
      mockUpdateStaff.mockResolvedValue(updatedUser);

      await controller.updateStaff(req, res);

      expect(mockUpdateStaff).toHaveBeenCalledWith(5, { fullName: "Updated Name" });
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        message: "Cập nhật nhân sự thành công",
        data: updatedUser,
      });
    });

    it("should successfully update staff with multiple fields", async () => {
      const req = {
        body: { fullName: "Updated Name", status: "INACTIVE" },
        params: { userId: 5 },
      };
      const res = createMockResponse();
      const updatedUser = { id: 5, fullName: "Updated Name", status: "INACTIVE" };

      mockUpdateStaffSchema.safeParse.mockReturnValue({
        success: true,
        data: { fullName: "Updated Name", status: "INACTIVE" },
      });
      mockUpdateStaff.mockResolvedValue(updatedUser);

      await controller.updateStaff(req, res);

      expect(mockUpdateStaff).toHaveBeenCalledWith(5, {
        fullName: "Updated Name",
        status: "INACTIVE",
      });
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        message: "Cập nhật nhân sự thành công",
        data: updatedUser,
      });
    });

    it("should handle service error when staff not found", async () => {
      const req = {
        body: { fullName: "Updated Name" },
        params: { userId: 999 },
      };
      const res = createMockResponse();
      const error = new Error("Nhân viên không tồn tại");
      error.status = 404;

      mockUpdateStaffSchema.safeParse.mockReturnValue({
        success: true,
        data: { fullName: "Updated Name" },
      });
      mockUpdateStaff.mockRejectedValue(error);

      await controller.updateStaff(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ message: "Nhân viên không tồn tại" });
    });

    it("should handle service error when phone already exists", async () => {
      const req = {
        body: { phoneNumber: "0987654322" },
        params: { userId: 5 },
      };
      const res = createMockResponse();
      const error = new Error("Số điện thoại đã tồn tại");
      error.status = 400;

      mockUpdateStaffSchema.safeParse.mockReturnValue({
        success: true,
        data: { phoneNumber: "0987654322" },
      });
      mockUpdateStaff.mockRejectedValue(error);

      await controller.updateStaff(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ message: "Số điện thoại đã tồn tại" });
    });

    it("should handle service error when role is invalid", async () => {
      const req = {
        body: { roleCode: "INVALID_ROLE" },
        params: { userId: 5 },
      };
      const res = createMockResponse();
      const error = new Error("Vai trò không hợp lệ");
      error.status = 400;

      mockUpdateStaffSchema.safeParse.mockReturnValue({
        success: true,
        data: { roleCode: "INVALID_ROLE" },
      });
      mockUpdateStaff.mockRejectedValue(error);

      await controller.updateStaff(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ message: "Vai trò không hợp lệ" });
    });
  });
});
