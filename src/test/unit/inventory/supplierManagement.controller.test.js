const mockCreateSupplier = jest.fn();
const mockGetSupplier = jest.fn();
const mockUpdateSupplier = jest.fn();

jest.mock("../../../service/inventory/supplierManagement.service", () => ({
    createSupplier: mockCreateSupplier,
    getSupplier: mockGetSupplier,
    updateSupplier: mockUpdateSupplier,
}));

const controller = require("../../../controller/inventory/supplierManagement.controller");

const createMockResponse = () => {
    const res = {};
    res.status = jest.fn().mockReturnValue(res);
    res.json = jest.fn().mockReturnValue(res);
    return res;
};

describe("Inventory SupplierManagement Controller Unit Tests", () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe("createSupplier", () => {
        it("should create supplier successfully", async () => {
            const fakeSupplier = { id: 1, name: "Supplier A" };
            mockCreateSupplier.mockResolvedValue(fakeSupplier);

            const req = {
                body: {
                    name: "Supplier A",
                    phone: "0123456789",
                    address: "123 Main Street Hanoi",
                    is_active: true,
                },
            };
            const res = createMockResponse();

            await controller.createSupplier(req, res);

            expect(mockCreateSupplier).toHaveBeenCalledWith(
                "Supplier A",
                "0123456789",
                "123 Main Street Hanoi",
                true
            );
            expect(res.status).toHaveBeenCalledWith(201);
            expect(res.json).toHaveBeenCalledWith({
                message: "Tạo nhà cung thành công",
                data: fakeSupplier,
            });
        });

        it("should reject creation when phone is invalid", async () => {
            const req = {
                body: {
                    name: "Supplier A",
                    phone: "invalid-phone",
                    address: "123 Main Street Hanoi",
                },
            };
            const res = createMockResponse();

            await controller.createSupplier(req, res);

            expect(res.status).toHaveBeenCalledWith(400);
            expect(res.json).toHaveBeenCalledWith({
                message: "Số điện thoại chỉ được chứa ký tự số",
            });
        });
    });

    describe("getSupplier", () => {
        it("should return supplier list successfully", async () => {
            const fakeSuppliers = [{ id: 1, name: "Supplier A" }];
            mockGetSupplier.mockResolvedValue(fakeSuppliers);

            const req = {};
            const res = createMockResponse();

            await controller.getSupplier(req, res);

            expect(mockGetSupplier).toHaveBeenCalled();
            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith({ data: fakeSuppliers });
        });
    });

    describe("updateSupplier", () => {
        it("should update supplier successfully", async () => {
            const fakeSupplier = { id: 1, name: "Supplier B" };
            mockUpdateSupplier.mockResolvedValue(fakeSupplier);

            const req = {
                params: { id: "1" },
                body: {
                    name: "Supplier B",
                    phone: "0987654321",
                    address: "456 Side Street Hanoi",
                    is_active: false,
                },
            };
            const res = createMockResponse();

            await controller.updateSupplier(req, res);

            expect(mockUpdateSupplier).toHaveBeenCalledWith(
                "1",
                "Supplier B",
                "0987654321",
                "456 Side Street Hanoi",
                false
            );
            expect(res.status).toHaveBeenCalledWith(201);
            expect(res.json).toHaveBeenCalledWith({
                message: "Cập nhật nhà cung thành công",
                data: fakeSupplier,
            });
        });
    });
});
