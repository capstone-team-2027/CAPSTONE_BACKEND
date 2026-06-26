const mockCreateServiceOrder = jest.fn();
const mockGetServiceOrders = jest.fn();
const mockGetServiceOrderById = jest.fn();
const mockUpdateServiceOrderOdo = jest.fn();

jest.mock("../../../service/receptionist/serviceOrder.service", () => ({
  createServiceOrder: mockCreateServiceOrder,
  getServiceOrders: mockGetServiceOrders,
  getServiceOrderById: mockGetServiceOrderById,
  updateServiceOrderOdo: mockUpdateServiceOrderOdo,
}));

const controller = require("../../../controller/receptionist/serviceOrder.controller");

const createMockResponse = () => {
  const res = {};
  res.locals = { user: { id: 1 } };
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  return res;
};

describe("ServiceOrder Controller", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("createServiceOrder", () => {
    // Unit01: create service order successfully
    it("Unit01 - should create service order successfully", async () => {
      const validBody = {
        vehicle_id: 1,
        bay_id: 2,
        current_odo: 15000,
        appointment_id: 10,
        service_ids: [1, 2]
      };
      const mockCreatedOrder = { id: 100, ...validBody, status: "INSPECTING" };
      mockCreateServiceOrder.mockResolvedValue(mockCreatedOrder);

      const req = { body: validBody };
      const res = createMockResponse();

      await controller.createServiceOrder(req, res);

      expect(mockCreateServiceOrder).toHaveBeenCalledWith(
        expect.objectContaining({
          vehicle_id: 1,
          bay_id: 2,
          current_odo: 15000,
          appointment_id: 10,
          service_ids: [1, 2]
        }),
        1
      );
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        message: "Tạo lệnh sửa chữa thành công",
        data: mockCreatedOrder
      });
    });

    // Unit02: missing appointment_id
    it("Unit02 - should return error when appointment_id is missing/invalid", async () => {
      const bodyWithoutAppointment = {
        vehicle_id: 1,
        bay_id: 2,
        current_odo: 15000,
        service_ids: [1, 2]
      };
      mockCreateServiceOrder.mockRejectedValue({
        status: 400,
        message: "Thiếu ID lịch hẹn"
      });

      const req = { body: bodyWithoutAppointment };
      const res = createMockResponse();

      await controller.createServiceOrder(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: "Thiếu ID lịch hẹn"
      });
    });

    // Unit03: missing selected services/tasks
    it("Unit03 - should return error when selected services/tasks are missing", async () => {
      const bodyWithoutServices = {
        vehicle_id: 1,
        bay_id: 2,
        current_odo: 15000,
        appointment_id: 10,
        service_ids: [],
        combo_ids: []
      };
      mockCreateServiceOrder.mockRejectedValue({
        status: 400,
        message: "Vui lòng chọn ít nhất một dịch vụ hoặc gói dịch vụ"
      });

      const req = { body: bodyWithoutServices };
      const res = createMockResponse();

      await controller.createServiceOrder(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: "Vui lòng chọn ít nhất một dịch vụ hoặc gói dịch vụ"
      });
    });

    // Unit04: appointment not found
    it("Unit04 - should return 404 when appointment is not found", async () => {
      const body = {
        vehicle_id: 1,
        bay_id: 2,
        current_odo: 15000,
        appointment_id: 999,
        service_ids: [1]
      };
      mockCreateServiceOrder.mockRejectedValue({
        status: 404,
        message: "Lịch hẹn không tồn tại"
      });

      const req = { body };
      const res = createMockResponse();

      await controller.createServiceOrder(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: "Lịch hẹn không tồn tại"
      });
    });

    // Unit05: appointment invalid status
    it("Unit05 - should return 400 when appointment has invalid status or is already processed", async () => {
      const body = {
        vehicle_id: 1,
        bay_id: 2,
        current_odo: 15000,
        appointment_id: 10,
        service_ids: [1]
      };
      mockCreateServiceOrder.mockRejectedValue({
        status: 400,
        message: "Lịch hẹn này đã được tạo lệnh sửa chữa"
      });

      const req = { body };
      const res = createMockResponse();

      await controller.createServiceOrder(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: "Lịch hẹn này đã được tạo lệnh sửa chữa"
      });
    });

    // Unit06: no available service bay
    it("Unit06 - should return error when selected service bay is busy or unavailable", async () => {
      const body = {
        vehicle_id: 1,
        bay_id: 5,
        current_odo: 15000,
        appointment_id: 10,
        service_ids: [1]
      };
      mockCreateServiceOrder.mockRejectedValue({
        status: 404,
        message: "Cầu nâng không tồn tại hoặc đã bận"
      });

      const req = { body };
      const res = createMockResponse();

      await controller.createServiceOrder(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: "Cầu nâng không tồn tại hoặc đã bận"
      });
    });

    // Unit07: no available technician
    it("Unit07 - should return error when no technicians are available to assign", async () => {
      const body = {
        vehicle_id: 1,
        bay_id: 2,
        current_odo: 15000,
        appointment_id: 10,
        service_ids: [1]
      };
      mockCreateServiceOrder.mockRejectedValue({
        status: 400,
        message: "Không có thợ máy sẵn sàng để phân công"
      });

      const req = { body };
      const res = createMockResponse();

      await controller.createServiceOrder(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: "Không có thợ máy sẵn sàng để phân công"
      });
    });

    // Unit08: selected service/combo not found
    it("Unit08 - should return error when selected service catalog/combo does not exist", async () => {
      const body = {
        vehicle_id: 1,
        bay_id: 2,
        current_odo: 15000,
        appointment_id: 10,
        service_ids: [9999]
      };
      mockCreateServiceOrder.mockRejectedValue({
        status: 404,
        message: "Một hoặc nhiều dịch vụ chọn không tồn tại"
      });

      const req = { body };
      const res = createMockResponse();

      await controller.createServiceOrder(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: "Một hoặc nhiều dịch vụ chọn không tồn tại"
      });
    });

    // Unit09: rollback transaction when task creation failed
    it("Unit09 - should return 500 and rollback transaction when task creation fails", async () => {
      const body = {
        vehicle_id: 1,
        bay_id: 2,
        current_odo: 15000,
        appointment_id: 10,
        service_ids: [1]
      };
      mockCreateServiceOrder.mockRejectedValue({
        status: 500,
        message: "Lỗi tạo công việc, đã rollback giao dịch"
      });

      const req = { body };
      const res = createMockResponse();

      await controller.createServiceOrder(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: "Lỗi tạo công việc, đã rollback giao dịch"
      });
    });

    // Unit10: database/system error
    it("Unit10 - should return 500 when database or system fails", async () => {
      const body = {
        vehicle_id: 1,
        bay_id: 2,
        current_odo: 15000,
        appointment_id: 10,
        service_ids: [1]
      };
      mockCreateServiceOrder.mockRejectedValue(new Error("Connection lost"));

      const req = { body };
      const res = createMockResponse();

      await controller.createServiceOrder(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: "Connection lost"
      });
    });
  });

  describe("getServiceOrders", () => {
    // Unit11: get all service orders successfully
    it("Unit11 - should return list of service orders on success", async () => {
      const mockList = [
        { id: 1, current_odo: 12000, status: "IN_PROGRESS" },
        { id: 2, current_odo: 80000, status: "COMPLETED" }
      ];
      mockGetServiceOrders.mockResolvedValue(mockList);

      const req = {};
      const res = createMockResponse();

      await controller.getServiceOrders(req, res);

      expect(mockGetServiceOrders).toHaveBeenCalledTimes(1);
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        data: mockList
      });
    });

    // Unit12: database failure on get all
    it("Unit12 - should return 500 when database query fails on fetching service orders", async () => {
      mockGetServiceOrders.mockRejectedValue(new Error("Database error"));

      const req = {};
      const res = createMockResponse();

      await controller.getServiceOrders(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: "Database error"
      });
    });
  });

  describe("getServiceOrderById", () => {
    // Unit13: get service order by ID successfully
    it("Unit13 - should return service order detail by ID on success", async () => {
      const mockDetail = { id: 5, current_odo: 35000, status: "INSPECTING" };
      mockGetServiceOrderById.mockResolvedValue(mockDetail);

      const req = { params: { id: "5" } };
      const res = createMockResponse();

      await controller.getServiceOrderById(req, res);

      expect(mockGetServiceOrderById).toHaveBeenCalledWith("5");
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        data: mockDetail
      });
    });

    // Unit14: service order ID not found
    it("Unit14 - should return 404 when service order ID does not exist", async () => {
      mockGetServiceOrderById.mockRejectedValue({
        status: 404,
        message: "Không tìm thấy Lệnh sửa chữa này"
      });

      const req = { params: { id: "999" } };
      const res = createMockResponse();

      await controller.getServiceOrderById(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: "Không tìm thấy Lệnh sửa chữa này"
      });
    });

    // Unit15: database failure on get by ID
    it("Unit15 - should return 500 when database fails on fetching detail by ID", async () => {
      mockGetServiceOrderById.mockRejectedValue(new Error("Connection error"));

      const req = { params: { id: "5" } };
      const res = createMockResponse();

      await controller.getServiceOrderById(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: "Connection error"
      });
    });
  });

  describe("updateServiceOrderOdo", () => {
    // Unit16: update ODO successfully
    it("Unit16 - should update ODO mileage successfully", async () => {
      const mockResult = { id: 5, current_odo: 36000 };
      mockUpdateServiceOrderOdo.mockResolvedValue(mockResult);

      const req = { params: { id: "5" }, body: { current_odo: 36000 } };
      const res = createMockResponse();

      await controller.updateServiceOrderOdo(req, res);

      expect(mockUpdateServiceOrderOdo).toHaveBeenCalledWith("5", 36000);
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        message: "Cập nhật số km tiếp nhận thành công",
        data: mockResult
      });
    });

    // Unit17: missing current_odo in request body
    it("Unit17 - should return 400 when current_odo is missing in body", async () => {
      const req = { params: { id: "5" }, body: {} };
      const res = createMockResponse();

      await controller.updateServiceOrderOdo(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: "Thiếu thông tin số ODO (current_odo)"
      });
      expect(mockUpdateServiceOrderOdo).not.toHaveBeenCalled();
    });

    // Unit18: service order not found on ODO update
    it("Unit18 - should return 404 when updating ODO for non-existent service order", async () => {
      mockUpdateServiceOrderOdo.mockRejectedValue({
        status: 404,
        message: "Không tìm thấy Lệnh sửa chữa này"
      });

      const req = { params: { id: "999" }, body: { current_odo: 30000 } };
      const res = createMockResponse();

      await controller.updateServiceOrderOdo(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: "Không tìm thấy Lệnh sửa chữa này"
      });
    });

    // Unit19: database failure on ODO update
    it("Unit19 - should return 500 when database fails during ODO update", async () => {
      mockUpdateServiceOrderOdo.mockRejectedValue(new Error("DB Save Error"));

      const req = { params: { id: "5" }, body: { current_odo: 36000 } };
      const res = createMockResponse();

      await controller.updateServiceOrderOdo(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: "DB Save Error"
      });
    });
  });
});
