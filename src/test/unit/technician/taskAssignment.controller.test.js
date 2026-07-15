const mockGetTaskAssignment = jest.fn();
const mockGetServiceOrderDetail = jest.fn();
const mockStartTask = jest.fn();
const mockCompleteTask = jest.fn();
const mockGetAllComponents = jest.fn();
const mockCreateIssueReports = jest.fn();
const mockGetIssuesReportHistory = jest.fn();

jest.mock("../../../service/technician/taskAssignment.service", () => ({
    getTaskAssignment: mockGetTaskAssignment,
    getServiceOrderDetail: mockGetServiceOrderDetail,
    startTask: mockStartTask,
    completeTask: mockCompleteTask,
    getAllComponents: mockGetAllComponents,
    createIssueReports: mockCreateIssueReports,
    getIssuesReportHistory: mockGetIssuesReportHistory,
}));

const controller = require("../../../controller/technician/taskAssignment.controller");

const createMockResponse = () => {
    const res = {};
    res.status = jest.fn().mockReturnValue(res);
    res.json = jest.fn().mockReturnValue(res);
    res.locals = { user: { id: 4, role: "TECHNICIAN" } };
    return res;
};

describe("Technician TaskAssignment Controller Unit Tests", () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe("getTaskAssignment", () => {
        it("should return technician task assignments successfully", async () => {
            const fakeAssignments = [{ id: 1, status: "PENDING" }];
            mockGetTaskAssignment.mockResolvedValue(fakeAssignments);

            const req = {};
            const res = createMockResponse();

            await controller.getTaskAssignment(req, res);

            expect(mockGetTaskAssignment).toHaveBeenCalledWith(4);
            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith(fakeAssignments);
        });
    });

    describe("getServiceOrderDetail", () => {
        it("should return service order details successfully", async () => {
            const fakeDetails = { id: 10, customer: "John" };
            mockGetServiceOrderDetail.mockResolvedValue(fakeDetails);

            const req = { params: { id: "10" } };
            const res = createMockResponse();

            await controller.getServiceOrderDetail(req, res);

            expect(mockGetServiceOrderDetail).toHaveBeenCalledWith("10", 4);
            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith(fakeDetails);
        });
    });

    describe("startTask", () => {
        it("should start task successfully", async () => {
            const fakeResult = { id: 1, status: "IN_PROGRESS" };
            mockStartTask.mockResolvedValue(fakeResult);

            const req = { body: { taskAssignmentId: 1 } };
            const res = createMockResponse();

            await controller.startTask(req, res);

            expect(mockStartTask).toHaveBeenCalledWith(1, 4);
            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith({
                success: true,
                message: "Đã bắt đầu công việc thành công.",
                data: fakeResult,
            });
        });

        it("should return 400 when taskAssignmentId is missing", async () => {
            const req = { body: {} };
            const res = createMockResponse();

            await controller.startTask(req, res);

            expect(res.status).toHaveBeenCalledWith(400);
            expect(res.json).toHaveBeenCalledWith({
                success: false,
                message: "Vui lòng truyền taskAssignmentId vào body.",
            });
        });
    });

    describe("completeTask", () => {
        it("should complete task successfully", async () => {
            const fakeResult = { id: 1, status: "COMPLETED" };
            mockCompleteTask.mockResolvedValue(fakeResult);

            const req = { body: { taskAssignmentId: 1 } };
            const res = createMockResponse();

            await controller.completeTask(req, res);

            expect(mockCompleteTask).toHaveBeenCalledWith(1, 4);
            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith({
                success: true,
                message: "Đã hoàn thành công việc thành công.",
                data: fakeResult,
            });
        });
    });

    describe("getAllComponents", () => {
        it("should return all vehicle components successfully", async () => {
            const fakeComponents = [{ id: 1, name: "Engine Block" }];
            mockGetAllComponents.mockResolvedValue(fakeComponents);

            const req = {};
            const res = createMockResponse();

            await controller.getAllComponents(req, res);

            expect(mockGetAllComponents).toHaveBeenCalled();
            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith({
                success: true,
                data: fakeComponents,
            });
        });
    });

    describe("createIssuesReport", () => {
        it("should create issue report successfully", async () => {
            const fakeResult = { id: 1, notes: "All good" };
            mockCreateIssueReports.mockResolvedValue(fakeResult);

            const req = {
                body: {
                    task_id: 10,
                    note: "Checkup note",
                    issues: [
                        {
                            component_id: 2,
                            description: "Oil leakage",
                        },
                    ],
                },
            };
            const res = createMockResponse();

            await controller.createIssuesReport(req, res);

            expect(mockCreateIssueReports).toHaveBeenCalledWith(10, [{ component_id: 2, description: "Oil leakage" }], "Checkup note", 4);
            expect(res.status).toHaveBeenCalledWith(201);
            expect(res.json).toHaveBeenCalledWith({
                success: true,
                message: "Tạo báo cáo kiểm tra thành công",
                data: fakeResult,
            });
        });

        it("should reject creation when validation schema fails (empty issues array)", async () => {
            const req = {
                body: {
                    task_id: 10,
                    issues: [],
                },
            };
            const res = createMockResponse();

            await controller.createIssuesReport(req, res);

            expect(res.status).toHaveBeenCalledWith(400);
            expect(res.json).toHaveBeenCalledWith({
                message: "Phải có ít nhất một lỗi",
            });
        });
    });

    describe("getIssuesReportHistory", () => {
        it("should return issues report history successfully", async () => {
            const fakeHistory = [{ id: 1, task_id: 10 }];
            mockGetIssuesReportHistory.mockResolvedValue(fakeHistory);

            const req = {};
            const res = createMockResponse();

            await controller.getIssuesReportHistory(req, res);

            expect(mockGetIssuesReportHistory).toHaveBeenCalledWith(4);
            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith({
                success: true,
                data: fakeHistory,
            });
        });
    });
});
