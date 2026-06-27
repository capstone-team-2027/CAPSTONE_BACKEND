const mockGetProfile = jest.fn();
const mockUpdateProfile = jest.fn();

jest.mock("../../../service/customer/profile.service", () => ({
  getProfile: mockGetProfile,
  updateProfile: mockUpdateProfile,
}));

const mockUpdateProfileSchema = { safeParse: jest.fn() };
jest.mock("../../../validation/customer/profile.validation", () => ({
  updateProfileSchema: mockUpdateProfileSchema,
}));

const mockUploadStream = jest.fn((options, callback) => {
  return { _callback: callback };
});

jest.mock("../../../config/cloudinary.config", () => ({
  uploader: {
    upload_stream: mockUploadStream,
  },
}));

const mockCreateReadStream = jest.fn(() => ({
  pipe: jest.fn((dest) => {
    if (typeof dest._callback === "function") {
      dest._callback(null, { secure_url: "https://example.com/avatar.jpg" });
    }
    return dest;
  }),
}));

jest.mock("streamifier", () => ({
  createReadStream: mockCreateReadStream,
}));

const controller = require("../../../controller/customer/profile.controller");

const createMockResponse = () => {
  const res = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  res.locals = {};
  return res;
};

describe("Customer Profile Controller", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("getProfile", () => {
    it("should return 401 if user is not authenticated", async () => {
      const req = {};
      const res = createMockResponse();

      await controller.getProfile(req, res);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({ message: "Unauthorized" });
      expect(mockGetProfile).not.toHaveBeenCalled();
    });

    it("should return profile data when user is authenticated", async () => {
      const req = {};
      const res = createMockResponse();
      res.locals.user = { id: 10 };
      const fakeProfile = { id: 10, fullName: "Test User" };
      mockGetProfile.mockResolvedValue(fakeProfile);

      await controller.getProfile(req, res);

      expect(mockGetProfile).toHaveBeenCalledWith(10);
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({ message: "Lấy thông tin thành công", data: fakeProfile });
    });

    it("should handle service errors with custom status", async () => {
      const req = {};
      const res = createMockResponse();
      res.locals.user = { id: 10 };
      const error = new Error("Không tìm thấy người dùng");
      error.status = 404;
      mockGetProfile.mockRejectedValue(error);

      await controller.getProfile(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ message: "Không tìm thấy người dùng" });
    });
  });

  describe("updateProfile", () => {
    it("should return 401 if user is not authenticated", async () => {
      const req = { body: { fullName: "Test User" } };
      const res = createMockResponse();

      await controller.updateProfile(req, res);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({ message: "Unauthorized" });
      expect(mockUpdateProfile).not.toHaveBeenCalled();
    });

    it("should return 400 when validation fails", async () => {
      const req = { body: { fullName: "A" } };
      const res = createMockResponse();
      res.locals.user = { id: 5 };

      mockUpdateProfileSchema.safeParse.mockReturnValue({
        success: false,
        error: {
          issues: [{ message: "Họ tên phải có ít nhất 2 ký tự" }],
        },
      });

      await controller.updateProfile(req, res);

      expect(mockUpdateProfileSchema.safeParse).toHaveBeenCalledWith({ fullName: "A" });
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ message: "Họ tên phải có ít nhất 2 ký tự" });
      expect(mockUpdateProfile).not.toHaveBeenCalled();
    });

    it("should return 400 when no profile fields or avatar file are provided", async () => {
      const req = { body: {} };
      const res = createMockResponse();
      res.locals.user = { id: 5 };

      mockUpdateProfileSchema.safeParse.mockReturnValue({
        success: true,
        data: {},
      });

      await controller.updateProfile(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ message: "Vui lòng cung cấp tên hoặc avatar" });
      expect(mockUpdateProfile).not.toHaveBeenCalled();
    });

    it("should update profile successfully when fullName is provided", async () => {
      const req = { body: { fullName: "Updated Name" } };
      const res = createMockResponse();
      res.locals.user = { id: 5 };
      const updatedProfile = { id: 5, fullName: "Updated Name" };

      mockUpdateProfileSchema.safeParse.mockReturnValue({
        success: true,
        data: { fullName: "Updated Name" },
      });
      mockUpdateProfile.mockResolvedValue(updatedProfile);

      await controller.updateProfile(req, res);

      expect(mockUpdateProfile).toHaveBeenCalledWith(5, { fullName: "Updated Name" });
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({ message: "Cập nhật thông tin thành công", data: updatedProfile });
    });

    it("should upload avatar and update profile when req.file is present", async () => {
      const req = {
        body: {},
        file: { buffer: Buffer.from("fake-image") },
      };
      const res = createMockResponse();
      res.locals.user = { id: 7 };
      const updatedProfile = { id: 7, avatar: "https://example.com/avatar.jpg" };

      mockUpdateProfileSchema.safeParse.mockReturnValue({
        success: true,
        data: {},
      });
      mockUpdateProfile.mockResolvedValue(updatedProfile);

      await controller.updateProfile(req, res);

      expect(mockUploadStream).toHaveBeenCalledWith({ folder: "WDP301" }, expect.any(Function));
      expect(mockCreateReadStream).toHaveBeenCalledWith(req.file.buffer);
      expect(mockUpdateProfile).toHaveBeenCalledWith(7, { avatar: "https://example.com/avatar.jpg" });
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({ message: "Cập nhật thông tin thành công", data: updatedProfile });
    });

    it("should return 500 when avatar upload fails", async () => {
      jest.spyOn(console, "error").mockImplementation(() => {});

      const req = {
        body: {},
        file: { buffer: Buffer.from("fake-image") },
      };
      const res = createMockResponse();
      res.locals.user = { id: 7 };

      mockUpdateProfileSchema.safeParse.mockReturnValue({
        success: true,
        data: {},
      });
      mockUploadStream.mockImplementationOnce((options, callback) => {
        const stream = { _callback: callback };
        return stream;
      });
      mockCreateReadStream.mockImplementationOnce(() => ({
        pipe: jest.fn((dest) => {
          if (typeof dest._callback === "function") {
            dest._callback(new Error("Upload failed"));
          }
          return dest;
        }),
      }));

      await controller.updateProfile(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ message: "Lỗi upload avatar" });
      expect(mockUpdateProfile).not.toHaveBeenCalled();

      console.error.mockRestore();
    });
  });
});
