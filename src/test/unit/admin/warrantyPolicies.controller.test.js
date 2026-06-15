const mockListWarrantyPolicies = jest.fn();
const mockCreateWarrantyPolicy = jest.fn();
const mockUpdateWarrantyPolicy = jest.fn();

jest.mock("../../../service/admin/warrantyPolicies.service", () => ({
  listWarrantyPolicies: mockListWarrantyPolicies,
  createWarrantyPolicy: mockCreateWarrantyPolicy,
  updateWarrantyPolicy: mockUpdateWarrantyPolicy,
}));

const mockUploadToCloudinary = jest.fn();
jest.mock("../../../helper/uploadToCloudinary.helper", () => ({
  uploadToCloudinary: mockUploadToCloudinary,
}));

const controller = require("../../../controller/admin/warrantyPolicies.controller");

const createMockResponse = () => {
  const res = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  return res;
};

describe("WarrantyPolicies Controller Unit Tests", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  // 1. getWarrantyPolicies
  describe("getWarrantyPolicies", () => {
    describe("Success Case", () => {
      it("should return 200 and list of warranty policies", async () => {
        const fakeData = [
          { id: 1, policy_code: "BH-001", policy_name: "Bảo hành 1 năm", is_active: true },
          { id: 2, policy_code: "BH-002", policy_name: "Bảo hành trọn đời", is_active: false },
        ];
        mockListWarrantyPolicies.mockResolvedValue(fakeData);

        const req = {};
        const res = createMockResponse();

        await controller.getWarrantyPolicies(req, res);

        expect(mockListWarrantyPolicies).toHaveBeenCalledTimes(1);
        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.json).toHaveBeenCalledWith({
          success: true,
          message: "Lấy danh sách chính sách bảo hành thành công",
          data: fakeData,
        });
      });
    });

    describe("Error Case", () => {
      it("should return 500 when service fails", async () => {
        mockListWarrantyPolicies.mockRejectedValue(new Error("Database failure"));

        const req = {};
        const res = createMockResponse();

        await controller.getWarrantyPolicies(req, res);

        expect(res.status).toHaveBeenCalledWith(500);
        expect(res.json).toHaveBeenCalledWith({
          success: false,
          message: "Lỗi máy chủ",
          error: "Database failure",
        });
      });
    });
  });

  // 2. createWarrantyPolicy
  describe("createWarrantyPolicy", () => {
    describe("Success Cases", () => {
      it("should return 201 and created policy when data is valid without files", async () => {
        const fakeCreated = {
          id: 1,
          policy_code: "BH-12T",
          policy_name: "Bảo hành 12 tháng",
          is_active: true,
          description: null,
          image_cover_url: null,
          pdf_document_url: null,
        };
        mockCreateWarrantyPolicy.mockResolvedValue(fakeCreated);

        const req = {
          body: {
            policy_code: "BH-12T",
            policy_name: "Bảo hành 12 tháng",
            is_active: "true", // string "true" should be preprocessed to boolean true
            description: "",   // empty string should be preprocessed to null
            image_cover_url: "null", // string "null" should be preprocessed to null
            pdf_document_url: "",
          },
        };
        const res = createMockResponse();

        await controller.createWarrantyPolicy(req, res);

        expect(mockCreateWarrantyPolicy).toHaveBeenCalledTimes(1);
        expect(mockCreateWarrantyPolicy).toHaveBeenCalledWith({
          policy_code: "BH-12T",
          policy_name: "Bảo hành 12 tháng",
          is_active: true,
          description: null,
          image_cover_url: null,
          pdf_document_url: null,
        });
        expect(res.status).toHaveBeenCalledWith(201);
        expect(res.json).toHaveBeenCalledWith({
          success: true,
          message: "Tạo chính sách bảo hành thành công",
          data: fakeCreated,
        });
      });

      it("should upload files to cloudinary and assign URLs when files are provided", async () => {
        const fakeCreated = {
          id: 2,
          policy_code: "BH-FILE",
          policy_name: "Bảo hành có hình và PDF",
          image_cover_url: "https://cloudinary.com/cover.png",
          pdf_document_url: "https://cloudinary.com/doc.pdf",
          is_active: true,
        };
        mockUploadToCloudinary
          .mockResolvedValueOnce({ secure_url: "https://cloudinary.com/cover.png" })
          .mockResolvedValueOnce({ secure_url: "https://cloudinary.com/doc.pdf" });
        mockCreateWarrantyPolicy.mockResolvedValue(fakeCreated);

        const req = {
          body: {
            policy_code: "BH-FILE",
            policy_name: "Bảo hành có hình và PDF",
          },
          files: {
            image_cover: [{ buffer: Buffer.from("image_data") }],
            pdf_document: [{ buffer: Buffer.from("pdf_data") }],
          },
        };
        const res = createMockResponse();

        await controller.createWarrantyPolicy(req, res);

        expect(mockUploadToCloudinary).toHaveBeenCalledTimes(2);
        expect(mockUploadToCloudinary).toHaveBeenNthCalledWith(1, expect.any(Buffer), "WDP301", false);
        expect(mockUploadToCloudinary).toHaveBeenNthCalledWith(2, expect.any(Buffer), "WDP301", true);

        expect(mockCreateWarrantyPolicy).toHaveBeenCalledWith({
          policy_code: "BH-FILE",
          policy_name: "Bảo hành có hình và PDF",
          image_cover_url: "https://cloudinary.com/cover.png",
          pdf_document_url: "https://cloudinary.com/doc.pdf",
          is_active: true, // Zod default value
        });
        expect(res.status).toHaveBeenCalledWith(201);
      });
    });

    describe("Validation Errors", () => {
      it("should return 400 when policy_code is missing", async () => {
        const req = {
          body: {
            policy_name: "Chính sách bảo hành",
          },
        };
        const res = createMockResponse();

        await controller.createWarrantyPolicy(req, res);

        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.json).toHaveBeenCalledWith(
          expect.objectContaining({
            success: false,
            message: "Dữ liệu không hợp lệ",
            errors: expect.any(Array),
          })
        );
        expect(mockCreateWarrantyPolicy).not.toHaveBeenCalled();
      });

      it("should return 400 when policy_code is empty after trim", async () => {
        const req = {
          body: {
            policy_code: "",
            policy_name: "Chính sách bảo hành",
          },
        };
        const res = createMockResponse();

        await controller.createWarrantyPolicy(req, res);

        expect(res.status).toHaveBeenCalledWith(400);
        expect(mockCreateWarrantyPolicy).not.toHaveBeenCalled();
      });

      it("should return 400 when policy_code exceeds 50 characters", async () => {
        const req = {
          body: {
            policy_code: "a".repeat(51),
            policy_name: "Chính sách bảo hành",
          },
        };
        const res = createMockResponse();

        await controller.createWarrantyPolicy(req, res);

        expect(res.status).toHaveBeenCalledWith(400);
      });

      it("should return 400 when policy_name exceeds 255 characters", async () => {
        const req = {
          body: {
            policy_code: "BH-01",
            policy_name: "a".repeat(256),
          },
        };
        const res = createMockResponse();

        await controller.createWarrantyPolicy(req, res);

        expect(res.status).toHaveBeenCalledWith(400);
      });
    });

    describe("Error Case", () => {
      it("should return 500 when service throws an error (e.g. duplicate code)", async () => {
        mockCreateWarrantyPolicy.mockRejectedValue(new Error("Mã chính sách bảo hành đã tồn tại"));

        const req = {
          body: {
            policy_code: "BH-TRUNG",
            policy_name: "Chính sách trùng",
          },
        };
        const res = createMockResponse();

        await controller.createWarrantyPolicy(req, res);

        expect(res.status).toHaveBeenCalledWith(500);
        expect(res.json).toHaveBeenCalledWith({
          success: false,
          message: "Lỗi máy chủ",
          error: "Mã chính sách bảo hành đã tồn tại",
        });
      });
    });
  });

  // 3. updateWarrantyPolicy
  describe("updateWarrantyPolicy", () => {
    describe("Success Cases", () => {
      it("should return 200 and updated policy when data is valid", async () => {
        const fakeUpdated = {
          id: 5,
          policy_code: "BH-5NEW",
          policy_name: "Tên bảo hành mới",
          is_active: false,
        };
        mockUpdateWarrantyPolicy.mockResolvedValue(fakeUpdated);

        const req = {
          params: { id: "5" },
          body: {
            policy_code: "BH-5NEW",
            policy_name: "Tên bảo hành mới",
            is_active: "false",
          },
        };
        const res = createMockResponse();

        await controller.updateWarrantyPolicy(req, res);

        expect(mockUpdateWarrantyPolicy).toHaveBeenCalledTimes(1);
        expect(mockUpdateWarrantyPolicy).toHaveBeenCalledWith("5", {
          policy_code: "BH-5NEW",
          policy_name: "Tên bảo hành mới",
          is_active: false,
        });
        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.json).toHaveBeenCalledWith({
          success: true,
          message: "Cập nhật chính sách bảo hành thành công",
          data: fakeUpdated,
        });
      });

      it("should call uploadToCloudinary if new files are uploaded for update", async () => {
        const fakeUpdated = {
          id: 5,
          policy_code: "BH-FILE-UPDATE",
          policy_name: "Tên bảo hành mới",
          image_cover_url: "https://cloudinary.com/newcover.png",
        };
        mockUploadToCloudinary.mockResolvedValue({ secure_url: "https://cloudinary.com/newcover.png" });
        mockUpdateWarrantyPolicy.mockResolvedValue(fakeUpdated);

        const req = {
          params: { id: "5" },
          body: {
            policy_code: "BH-FILE-UPDATE",
          },
          files: {
            image_cover: [{ buffer: Buffer.from("new_image_data") }],
          },
        };
        const res = createMockResponse();

        await controller.updateWarrantyPolicy(req, res);

        expect(mockUploadToCloudinary).toHaveBeenCalledTimes(1);
        expect(mockUploadToCloudinary).toHaveBeenCalledWith(expect.any(Buffer), "WDP301", false);
        expect(mockUpdateWarrantyPolicy).toHaveBeenCalledWith("5", {
          policy_code: "BH-FILE-UPDATE",
          image_cover_url: "https://cloudinary.com/newcover.png",
        });
      });
    });

    describe("Validation Errors", () => {
      it("should return 400 when policy_code is updated to empty", async () => {
        const req = {
          params: { id: "5" },
          body: {
            policy_code: "",
          },
        };
        const res = createMockResponse();

        await controller.updateWarrantyPolicy(req, res);

        expect(res.status).toHaveBeenCalledWith(400);
        expect(mockUpdateWarrantyPolicy).not.toHaveBeenCalled();
      });
    });

    describe("Error Case", () => {
      it("should return 500 when service throws policy not found", async () => {
        mockUpdateWarrantyPolicy.mockRejectedValue(new Error("Không tìm thấy chính sách bảo hành"));

        const req = {
          params: { id: "99" },
          body: {
            policy_name: "Không tồn tại",
          },
        };
        const res = createMockResponse();

        await controller.updateWarrantyPolicy(req, res);

        expect(res.status).toHaveBeenCalledWith(500);
        expect(res.json).toHaveBeenCalledWith({
          success: false,
          message: "Lỗi máy chủ",
          error: "Không tìm thấy chính sách bảo hành",
        });
      });
    });
  });
});
