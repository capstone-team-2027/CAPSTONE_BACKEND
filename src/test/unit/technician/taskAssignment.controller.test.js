const mockGetTaskAssignment = jest.fn();
const mockGetServiceOrderDetail = jest.fn();
const mockStartTask = jest.fn();
const mockCompleteTask = jest.fn();

jest.mock("../../../service/technician/taskAssignment.service", () => ({
  getTaskAssignment: mockGetTaskAssignment,
  getServiceOrderDetail: mockGetServiceOrderDetail,
  startTask: mockStartTask,
  completeTask: mockCompleteTask,
}));

const controller = require("../../../controller/technician/taskAssignment.controller");

const createMockResponse = () => {
  const res = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  res.locals = { user: { id: 2 } };
  return res;
};

describe("TaskAssignment Controller Unit Tests", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  // 1. getTaskAssignment
  describe("getTaskAssignment", () => {
    describe("Success Case", () => {
      it("should return 200 and assignments list on success", async () => {
        const fakeData = [{ id: 1, status: "ASSIGNED" }];
        mockGetTaskAssignment.mockResolvedValue(fakeData);

        const req = {};
        const res = createMockResponse();

        await controller.getTaskAssignment(req, res);

        expect(mockGetTaskAssignment).toHaveBeenCalledWith(2);
        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.json).toHaveBeenCalledWith(fakeData);
      });
    });

    describe("Error Case", () => {
      it("should return 500 when service fails", async () => {
        const error = new Error("Database connection error");
        error.status = 500;
        mockGetTaskAssignment.mockRejectedValue(error);

        const req = {};
        const res = createMockResponse();

        await controller.getTaskAssignment(req, res);

        expect(res.status).toHaveBeenCalledWith(500);
        expect(res.json).toHaveBeenCalledWith({
          message: "Database connection error",
        });
      });
    });
  });

  // 2. getServiceOrderDetail
  describe("getServiceOrderDetail", () => {
    describe("Success Case", () => {
      it("should return 200 and service order detail on success", async () => {
        const fakeDetail = { id: 10, vehicle_id: 5, tasks: [] };
        mockGetServiceOrderDetail.mockResolvedValue(fakeDetail);

        const req = { params: { id: "10" } };
        const res = createMockResponse();

        await controller.getServiceOrderDetail(req, res);

        expect(mockGetServiceOrderDetail).toHaveBeenCalledWith("10", 2);
        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.json).toHaveBeenCalledWith(fakeDetail);
      });
    });

    describe("Error Case", () => {
      it("should return 404 when service order not found", async () => {
        const error = new Error("Không tìm thấy chi tiết Lệnh sửa chữa");
        error.status = 404;
        mockGetServiceOrderDetail.mockRejectedValue(error);

        const req = { params: { id: "99" } };
        const res = createMockResponse();

        await controller.getServiceOrderDetail(req, res);

        expect(res.status).toHaveBeenCalledWith(404);
        expect(res.json).toHaveBeenCalledWith({
          message: "Không tìm thấy chi tiết Lệnh sửa chữa",
        });
      });
    });
  });

  // 3. startTask
  describe("startTask", () => {
    describe("Success Case", () => {
      it("should return 200 and started assignment details on success", async () => {
        const fakeAssignment = { id: 1, status: "IN_PROGRESS" };
        mockStartTask.mockResolvedValue(fakeAssignment);

        const req = { body: { taskAssignmentId: 1 } };
        const res = createMockResponse();

        await controller.startTask(req, res);

        expect(mockStartTask).toHaveBeenCalledWith(1, 2);
        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.json).toHaveBeenCalledWith({
          success: true,
          message: "Đã bắt đầu công việc thành công.",
          data: fakeAssignment,
        });
      });
    });

    describe("Validation Errors", () => {
      it("should return 400 when taskAssignmentId is missing", async () => {
        const req = { body: {} };
        const res = createMockResponse();

        await controller.startTask(req, res);

        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.json).toHaveBeenCalledWith({
          success: false,
          message: "Vui lòng truyền taskAssignmentId vào body.",
        });
        expect(mockStartTask).not.toHaveBeenCalled();
      });
    });

    describe("Error Case", () => {
      it("should return error status when service fails", async () => {
        const error = new Error("Chỉ được phép bắt đầu công việc đối với những Lịch hẹn có trạng thái là WALK_IN.");
        error.status = 403;
        mockStartTask.mockRejectedValue(error);

        const req = { body: { taskAssignmentId: 1 } };
        const res = createMockResponse();

        await controller.startTask(req, res);

        expect(res.status).toHaveBeenCalledWith(403);
        expect(res.json).toHaveBeenCalledWith({
          success: false,
          message: "Chỉ được phép bắt đầu công việc đối với những Lịch hẹn có trạng thái là WALK_IN.",
        });
      });
    });
  });

  // 4. completeTask
  describe("completeTask", () => {
    describe("Success Case", () => {
      it("should return 200 and completed assignment details on success", async () => {
        const fakeAssignment = { id: 1, status: "COMPLETED" };
        mockCompleteTask.mockResolvedValue(fakeAssignment);

        const req = { body: { taskAssignmentId: 1 } };
        const res = createMockResponse();

        await controller.completeTask(req, res);

        expect(mockCompleteTask).toHaveBeenCalledWith(1, 2);
        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.json).toHaveBeenCalledWith({
          success: true,
          message: "Đã hoàn thành công việc thành công.",
          data: fakeAssignment,
        });
      });
    });

    describe("Validation Errors", () => {
      it("should return 400 when taskAssignmentId is missing", async () => {
        const req = { body: {} };
        const res = createMockResponse();

        await controller.completeTask(req, res);

        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.json).toHaveBeenCalledWith({
          success: false,
          message: "Vui lòng truyền taskAssignmentId vào body.",
        });
        expect(mockCompleteTask).not.toHaveBeenCalled();
      });
    });

    describe("Error Case", () => {
      it("should return 500 when service fails", async () => {
        const error = new Error("Database error");
        mockCompleteTask.mockRejectedValue(error);

        const req = { body: { taskAssignmentId: 1 } };
        const res = createMockResponse();

        await controller.completeTask(req, res);

        expect(res.status).toHaveBeenCalledWith(500);
        expect(res.json).toHaveBeenCalledWith({
          success: false,
          message: "Database error",
        });
      });
    });
  });
});
