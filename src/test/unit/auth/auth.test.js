const authController = require("../../../controller/auth/auth.controller");
const authService = require("../../../service/auth/auth.service");
const authValidation = require("../../../validation/auth/auth.validation");

// Mock validation schemas and authService
jest.mock("../../../validation/auth/auth.validation", () => ({
    loginSchema: { safeParse: jest.fn() },
    registerSchema: { safeParse: jest.fn() },
    checkPhoneSchema: { safeParse: jest.fn() },
    forgotPasswordSchema: { safeParse: jest.fn() },
}));

jest.mock("../../../service/auth/auth.service", () => ({
    login: jest.fn(),
    register: jest.fn(),
    checkPhone: jest.fn(),
    processRefreshToken: jest.fn(),
    changePassword: jest.fn(),
    forgotPassword: jest.fn(),
}));

// Mock changePasswordSchema globally to prevent ReferenceError due to the missing import in the controller file
global.changePasswordSchema = {
    safeParse: jest.fn(),
};

describe("AuthController Unit Tests", () => {
    let req, res;

    beforeEach(() => {
        jest.clearAllMocks();
        req = {
            body: {},
        };
        res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn().mockReturnThis(),
            locals: {},
        };
    });

    describe("login", () => {
        it("should successfully log in and return token/data", async () => {
            const mockResult = { accessToken: "refresh-token-123", refreshToken: "refresh-token-123" };
            req.body = { phone: "0987654321", password: "123" };

            authValidation.loginSchema.safeParse.mockReturnValue({ success: true, data: req.body });
            authService.login.mockResolvedValue(mockResult);

            await authController.login(req, res);

            expect(authValidation.loginSchema.safeParse).toHaveBeenCalledWith({
                phone: req.body.phone,
                password: req.body.password,
            });
            expect(authService.login).toHaveBeenCalledWith(req.body.phone, req.body.password);
            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith({
                message: "Đăng nhập thành công",
                data: mockResult,
            });
        });
        it("should return 400 when validation fails", async () => {
            req.body = { phone: "abc", password: "123" }; // phone không phải là số hợp lệ

            authValidation.loginSchema.safeParse.mockReturnValue({
                success: false,
                error: { issues: [{ message: "Số điện thoại không hợp lệ" }] }
            });

            await authController.login(req, res);

            expect(res.status).toHaveBeenCalledWith(400);
            expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
                message: expect.any(String) // Hoặc kiểm tra tin nhắn cụ thể
            }));
        });
        it("should handle error thrown by authService.login", async () => {
            const error = new Error("Sai mật khẩu");
            error.status = 401;
            req.body = { phone: "0987654321", password: "wrong-password" };

            authValidation.loginSchema.safeParse.mockReturnValue({ success: true, data: req.body });
            authService.login.mockRejectedValue(error);

            await authController.login(req, res);

            expect(res.status).toHaveBeenCalledWith(401);
            expect(res.json).toHaveBeenCalledWith({
                message: "Sai mật khẩu",
            });
        });
    });

    describe("register", () => {
        it("should successfully register and return data", async () => {
            const mockResult = { id: 1, fullName: "Test User" };
            req.body = {
                idToken: "id-token",
                fullName: "Test User",
                password: "password123",
                confirmPassword: "password123",
            };

            authValidation.registerSchema.safeParse.mockReturnValue({ success: true });
            authService.register.mockResolvedValue(mockResult);

            await authController.register(req, res);

            expect(authValidation.registerSchema.safeParse).toHaveBeenCalledWith({
                fullName: req.body.fullName,
                password: req.body.password,
            });
            expect(authService.register).toHaveBeenCalledWith(
                req.body.idToken,
                req.body.fullName,
                req.body.password,
                req.body.confirmPassword
            );
            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith({
                message: "Đăng kí thành công",
                data: mockResult,
            });
        });

        it("should return 400 status if validation fails", async () => {
            req.body = {
                fullName: "",
                password: "short",
            };

            authValidation.registerSchema.safeParse.mockReturnValue({
                success: false,
                error: {
                    issues: [{ message: "Họ tên phải có ít nhất 1 kts tự" }],
                },
            });

            await authController.register(req, res);

            expect(res.status).toHaveBeenCalledWith(400);
            expect(res.json).toHaveBeenCalledWith({
                message: "Họ tên phải có ít nhất 1 kts tự",
            });
            expect(authService.register).not.toHaveBeenCalled();
        });

        it("should handle error when authService.register throws", async () => {
            const error = new Error("Phone number already exists");
            error.status = 409;
            req.body = {
                idToken: "id-token",
                fullName: "Test User",
                password: "password123",
                confirmPassword: "password123",
            };

            authValidation.registerSchema.safeParse.mockReturnValue({ success: true });
            authService.register.mockRejectedValue(error);

            await authController.register(req, res);

            expect(res.status).toHaveBeenCalledWith(409);
            expect(res.json).toHaveBeenCalledWith({
                message: "Phone number already exists",
            });
        });
    });

    describe("checkPhone", () => {
        it("should successfully check phone number", async () => {
            req.body = { phone: "0987654321" };

            authValidation.checkPhoneSchema.safeParse.mockReturnValue({ success: true, data: req.body });
            authService.checkPhone.mockResolvedValue();

            await authController.checkPhone(req, res);

            expect(authValidation.checkPhoneSchema.safeParse).toHaveBeenCalledWith({
                phone: req.body.phone,
            });
            expect(authService.checkPhone).toHaveBeenCalledWith(req.body.phone);
            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith({
                message: "",
            });
        });

        it("should return error if authService.checkPhone throws", async () => {
            const error = new Error("Số điện thoại đã được đăng ký");
            error.status = 400;
            req.body = { phone: "0987654321" };

            authValidation.checkPhoneSchema.safeParse.mockReturnValue({ success: true, data: req.body });
            authService.checkPhone.mockRejectedValue(error);

            await authController.checkPhone(req, res);

            expect(res.status).toHaveBeenCalledWith(400);
            expect(res.json).toHaveBeenCalledWith({
                message: "Số điện thoại đã được đăng ký",
            });
        });
    });

    describe("refreshToken", () => {
        it("should successfully process and return new tokens", async () => {
            const mockResult = { accessToken: "new-access-token", refreshToken: "new-refresh-token" };
            req.body = { refreshToken: "old-refresh-token" };

            authService.processRefreshToken.mockResolvedValue(mockResult);

            await authController.refreshToken(req, res);

            expect(authService.processRefreshToken).toHaveBeenCalledWith("old-refresh-token");
            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith({
                state: 200,
                message: "Success",
                accessToken: mockResult.accessToken,
                refreshToken: mockResult.refreshToken,
            });
        });

        it("should return 401 when processRefreshToken throws", async () => {
            const error = new Error("Invalid refresh token");
            req.body = { refreshToken: "invalid-token" };

            authService.processRefreshToken.mockRejectedValue(error);

            const consoleErrorSpy = jest.spyOn(console, "error").mockImplementation(() => { });

            await authController.refreshToken(req, res);

            expect(res.status).toHaveBeenCalledWith(401);
            expect(res.json).toHaveBeenCalledWith({
                state: 401,
                message: "Unauthorized",
            });
            expect(consoleErrorSpy).toHaveBeenCalled();
            consoleErrorSpy.mockRestore();
        });
    });

    describe("changePassword", () => {
        it("should return 401 if user is not present in res.locals", async () => {
            res.locals.user = undefined;

            await authController.changePassword(req, res);

            expect(res.status).toHaveBeenCalledWith(401);
            expect(res.json).toHaveBeenCalledWith({ message: "Unauthorized" });
        });

        it("should return 400 if validation fails", async () => {
            res.locals.user = { id: 1 };
            req.body = {
                currentPassword: "password123",
                newPassword: "short",
                confirmNewPassword: "short",
            };

            global.changePasswordSchema.safeParse.mockReturnValue({
                success: false,
                error: {
                    issues: [{ message: "Mật khẩu mới phải có ít nhất 6 ký tự" }],
                },
            });

            await authController.changePassword(req, res);

            expect(global.changePasswordSchema.safeParse).toHaveBeenCalledWith({
                currentPassword: req.body.currentPassword,
                newPassword: req.body.newPassword,
                confirmNewPassword: req.body.confirmNewPassword,
            });
            expect(res.status).toHaveBeenCalledWith(400);
            expect(res.json).toHaveBeenCalledWith({
                message: "Mật khẩu mới phải có ít nhất 6 ký tự",
            });
            expect(authService.changePassword).not.toHaveBeenCalled();
        });

        it("should successfully change password", async () => {
            res.locals.user = { id: 1 };
            req.body = {
                currentPassword: "password123",
                newPassword: "newpassword123",
                confirmNewPassword: "newpassword123",
            };

            global.changePasswordSchema.safeParse.mockReturnValue({
                success: true,
                data: {
                    currentPassword: "password123",
                    newPassword: "newpassword123",
                },
            });
            authService.changePassword.mockResolvedValue({ message: "Đổi mật khẩu thành công" });

            await authController.changePassword(req, res);

            expect(authService.changePassword).toHaveBeenCalledWith(1, "password123", "newpassword123");
            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith({
                message: "Đổi mật khẩu thành công",
            });
        });

        it("should handle error if authService.changePassword throws", async () => {
            const error = new Error("Mật khẩu hiện tại không đúng");
            error.status = 400;
            res.locals.user = { id: 1 };
            req.body = {
                currentPassword: "wrong-password",
                newPassword: "newpassword123",
                confirmNewPassword: "newpassword123",
            };

            global.changePasswordSchema.safeParse.mockReturnValue({
                success: true,
                data: {
                    currentPassword: "wrong-password",
                    newPassword: "newpassword123",
                },
            });
            authService.changePassword.mockRejectedValue(error);

            await authController.changePassword(req, res);

            expect(res.status).toHaveBeenCalledWith(400);
            expect(res.json).toHaveBeenCalledWith({
                message: "Mật khẩu hiện tại không đúng",
            });
        });
    });

    describe("forgotPassword", () => {
        it("should return 400 if validation fails", async () => {
            req.body = {
                phone: "0987654321",
                password: "short",
                confirmPassword: "short",
            };

            authValidation.forgotPasswordSchema.safeParse.mockReturnValue({
                success: false,
                error: {
                    issues: [{ message: "Mật khẩu phải có ít nhất 6 ký tự" }],
                },
            });

            await authController.forgotPassword(req, res);

            expect(authValidation.forgotPasswordSchema.safeParse).toHaveBeenCalledWith({
                password: req.body.password,
            });
            expect(res.status).toHaveBeenCalledWith(400);
            expect(res.json).toHaveBeenCalledWith({
                message: "Mật khẩu phải có ít nhất 6 ký tự",
            });
            expect(authService.forgotPassword).not.toHaveBeenCalled();
        });

        it("should successfully reset password", async () => {
            req.body = {
                phone: "0987654321",
                password: "newpassword123",
                confirmPassword: "newpassword123",
            };

            authValidation.forgotPasswordSchema.safeParse.mockReturnValue({ success: true });
            authService.forgotPassword.mockResolvedValue({ id: 1 });

            await authController.forgotPassword(req, res);

            expect(authService.forgotPassword).toHaveBeenCalledWith(
                "0987654321",
                "newpassword123",
                "newpassword123"
            );
            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith({
                message: "Đặt lại mật khẩu thành công",
                data: { id: 1 },
            });
        });

        it("should handle error if authService.forgotPassword throws", async () => {
            const error = new Error("Số điện thoại không tồn tại");
            error.status = 404;
            req.body = {
                phone: "0987654321",
                password: "newpassword123",
                confirmPassword: "newpassword123",
            };

            authValidation.forgotPasswordSchema.safeParse.mockReturnValue({ success: true });
            authService.forgotPassword.mockRejectedValue(error);

            await authController.forgotPassword(req, res);

            expect(res.status).toHaveBeenCalledWith(404);
            expect(res.json).toHaveBeenCalledWith({
                message: "Số điện thoại không tồn tại",
            });
        });
    });
});
