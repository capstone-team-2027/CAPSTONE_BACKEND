const mockGetCustomers = jest.fn();
const mockGetCustomerById = jest.fn();

jest.mock("../../../service/admin/manageCustomer.service", () => ({
    getCustomers: mockGetCustomers,
    getCustomerById: mockGetCustomerById,
}));

const controller = require("../../../controller/admin/manageCustomer.controller");

const createMockResponse = () => {
    const res = {};
    res.status = jest.fn().mockReturnValue(res);
    res.json = jest.fn().mockReturnValue(res);
    return res;
};

describe("Admin ManageCustomer Controller Unit Tests", () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe("getCustomer", () => {
        it("should return customers list successfully", async () => {
            const fakeCustomers = [{ id: 1, fullname: "John Doe" }];
            mockGetCustomers.mockResolvedValue(fakeCustomers);

            const req = { query: { search: "John" } };
            const res = createMockResponse();

            await controller.getCustomer(req, res);

            expect(mockGetCustomers).toHaveBeenCalledWith("John");
            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith(fakeCustomers);
        });

        it("should handle error during get customers", async () => {
            mockGetCustomers.mockRejectedValue(new Error("Database error"));

            const req = { query: {} };
            const res = createMockResponse();

            await controller.getCustomer(req, res);

            expect(res.status).toHaveBeenCalledWith(500);
            expect(res.json).toHaveBeenCalledWith({
                success: false,
                message: "Lỗi Server",
                error: "Database error",
            });
        });
    });

    describe("getCustomerDetail", () => {
        it("should return customer details by ID", async () => {
            const fakeCustomer = { id: 5, fullname: "Alice" };
            mockGetCustomerById.mockResolvedValue(fakeCustomer);

            const req = { params: { id: "5" } };
            const res = createMockResponse();

            await controller.getCustomerDetail(req, res);

            expect(mockGetCustomerById).toHaveBeenCalledWith("5");
            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith(fakeCustomer);
        });

        it("should return 400 when ID is missing", async () => {
            const req = { params: {} };
            const res = createMockResponse();

            await controller.getCustomerDetail(req, res);

            expect(res.status).toHaveBeenCalledWith(400);
            expect(res.json).toHaveBeenCalledWith({
                success: false,
                message: "ID không hợp lệ",
            });
        });
    });
});
