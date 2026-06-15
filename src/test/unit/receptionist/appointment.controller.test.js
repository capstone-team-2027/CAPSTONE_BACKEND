const mockGetAppointment = jest.fn();
const mockGetAppointmentByKey = jest.fn();
const mockReceiveAppointment = jest.fn();
const mockUpdateVehicleVin = jest.fn();

jest.mock("../../../service/receptionist/appointment.service", () => ({
  getAppointment: mockGetAppointment,
  getAppointmentByKey: mockGetAppointmentByKey,
  receiveAppointment: mockReceiveAppointment,
  updateVehicleVin: mockUpdateVehicleVin,
}));

const controller = require("../../../controller/receptionist/appointment.controller");

const createMockResponse = () => {
  const res = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  res.locals = {};
  return res;
};

describe("Receptionist Appointment Controller Unit Tests", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  // 1. getAppointment (View Appointment List)
  describe("getAppointment", () => {
    describe("Success Case", () => {
      it("should return 200 and list of appointments when authorized", async () => {
        const fakeAppointments = [
          { id: 1, scheduled_time: "2026-06-15T10:00:00.000Z", status: "CONFIRMED" },
          { id: 2, scheduled_time: "2026-06-15T11:00:00.000Z", status: "PENDING" },
        ];
        mockGetAppointment.mockResolvedValue(fakeAppointments);

        const req = {};
        const res = createMockResponse();
        res.locals.user = { id: 1, role: "receptionist" };

        await controller.getAppointment(req, res);

        expect(mockGetAppointment).toHaveBeenCalledTimes(1);
        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.json).toHaveBeenCalledWith({
          success: true,
          message: "Lấy danh sách tất cả lịch hẹn thành công",
          data: fakeAppointments,
        });
      });
    });

    describe("Auth Errors", () => {
      it("should return 401 when user is not authorized", async () => {
        const req = {};
        const res = createMockResponse();
        res.locals.user = undefined;

        await controller.getAppointment(req, res);

        expect(res.status).toHaveBeenCalledWith(401);
        expect(res.json).toHaveBeenCalledWith({ message: "Unauthorized" });
        expect(mockGetAppointment).not.toHaveBeenCalled();
      });
    });

    describe("Error Cases", () => {
      it("should return 500 when service fails", async () => {
        mockGetAppointment.mockRejectedValue(new Error("Database failure"));

        const req = {};
        const res = createMockResponse();
        res.locals.user = { id: 1, role: "receptionist" };

        await controller.getAppointment(req, res);

        expect(res.status).toHaveBeenCalledWith(500);
        expect(res.json).toHaveBeenCalledWith({
          success: false,
          message: "Database failure",
        });
      });
    });
  });

  // 2. getAppointmentByKey (View Appointment Details)
  describe("getAppointmentByKey", () => {
    describe("Success Case", () => {
      it("should return 200 and appointment details when key is valid", async () => {
        const fakeAppointment = {
          id: 1,
          scheduled_time: "2026-06-15T10:00:00.000Z",
          status: "CONFIRMED",
          customer: { id: 10, phone: "0987654321" },
        };
        mockGetAppointmentByKey.mockResolvedValue(fakeAppointment);

        const req = {
          params: { key: "1" },
        };
        const res = createMockResponse();
        res.locals.user = { id: 1, role: "receptionist" };

        await controller.getAppointmentByKey(req, res);

        expect(mockGetAppointmentByKey).toHaveBeenCalledTimes(1);
        expect(mockGetAppointmentByKey).toHaveBeenCalledWith("1");
        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.json).toHaveBeenCalledWith({
          success: true,
          message: "Lấy chi tiết lịch hẹn thành công",
          data: fakeAppointment,
        });
      });
    });

    describe("Auth Errors", () => {
      it("should return 401 when user is not authorized", async () => {
        const req = { params: { key: "1" } };
        const res = createMockResponse();
        res.locals.user = undefined;

        await controller.getAppointmentByKey(req, res);

        expect(res.status).toHaveBeenCalledWith(401);
        expect(res.json).toHaveBeenCalledWith({ message: "Unauthorized" });
        expect(mockGetAppointmentByKey).not.toHaveBeenCalled();
      });
    });

    describe("Error Cases", () => {
      it("should return 404 when appointment does not exist", async () => {
        const error = new Error("Lịch hẹn không tồn tại");
        error.status = 404;
        mockGetAppointmentByKey.mockRejectedValue(error);

        const req = { params: { key: "99" } };
        const res = createMockResponse();
        res.locals.user = { id: 1, role: "receptionist" };

        await controller.getAppointmentByKey(req, res);

        expect(res.status).toHaveBeenCalledWith(404);
        expect(res.json).toHaveBeenCalledWith({
          success: false,
          message: "Lịch hẹn không tồn tại",
        });
      });
    });
  });

  // 3. receiveAppointment (Tiếp nhận lịch hẹn)
  describe("receiveAppointment", () => {
    describe("Success Case", () => {
      it("should return 200 and updated appointment", async () => {
        const fakeUpdated = { id: 1, status: "IN_PROGRESS" };
        mockReceiveAppointment.mockResolvedValue(fakeUpdated);

        const req = {
          params: { key: "1" },
        };
        const res = createMockResponse();
        res.locals.user = { id: 1, role: "receptionist" };

        await controller.receiveAppointment(req, res);

        expect(mockReceiveAppointment).toHaveBeenCalledTimes(1);
        expect(mockReceiveAppointment).toHaveBeenCalledWith("1");
        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.json).toHaveBeenCalledWith({
          success: true,
          message: "Tiếp nhận lịch hẹn thành công",
          data: fakeUpdated,
        });
      });
    });

    describe("Auth Errors", () => {
      it("should return 401 when user is not authorized", async () => {
        const req = { params: { key: "1" } };
        const res = createMockResponse();
        res.locals.user = undefined;

        await controller.receiveAppointment(req, res);

        expect(res.status).toHaveBeenCalledWith(401);
        expect(mockReceiveAppointment).not.toHaveBeenCalled();
      });
    });

    describe("Validation Errors", () => {
      it("should return 400 when key is empty", async () => {
        const req = {
          params: { key: "" },
        };
        const res = createMockResponse();
        res.locals.user = { id: 1, role: "receptionist" };

        await controller.receiveAppointment(req, res);

        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.json).toHaveBeenCalledWith(
          expect.objectContaining({
            success: false,
            message: "Mã lịch hẹn không được để trống",
          })
        );
        expect(mockReceiveAppointment).not.toHaveBeenCalled();
      });
    });

    describe("Error Cases", () => {
      it("should return error status and message when service fails", async () => {
        const error = new Error("Lịch hẹn này đã được tiếp nhận hoặc đã hủy");
        error.status = 400;
        mockReceiveAppointment.mockRejectedValue(error);

        const req = { params: { key: "1" } };
        const res = createMockResponse();
        res.locals.user = { id: 1, role: "receptionist" };

        await controller.receiveAppointment(req, res);

        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.json).toHaveBeenCalledWith({
          success: false,
          message: "Lịch hẹn này đã được tiếp nhận hoặc đã hủy",
        });
      });
    });
  });

  // 4. updateVehicleVin (Cập nhật số khung xe)
  describe("updateVehicleVin", () => {
    describe("Success Case", () => {
      it("should return 200 and updated vehicle info", async () => {
        const fakeVehicle = { id: 10, license_plate: "30A-12345", vin_number: "VIN123456789" };
        mockUpdateVehicleVin.mockResolvedValue(fakeVehicle);

        const req = {
          params: { key: "1" },
          body: { vin_number: "VIN123456789" },
        };
        const res = createMockResponse();
        res.locals.user = { id: 1, role: "receptionist" };

        await controller.updateVehicleVin(req, res);

        expect(mockUpdateVehicleVin).toHaveBeenCalledTimes(1);
        expect(mockUpdateVehicleVin).toHaveBeenCalledWith("1", "VIN123456789");
        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.json).toHaveBeenCalledWith({
          success: true,
          message: "Cập nhật số khung thành công",
          data: fakeVehicle,
        });
      });
    });

    describe("Auth Errors", () => {
      it("should return 401 when user is not authorized", async () => {
        const req = {
          params: { key: "1" },
          body: { vin_number: "VIN123456789" },
        };
        const res = createMockResponse();
        res.locals.user = undefined;

        await controller.updateVehicleVin(req, res);

        expect(res.status).toHaveBeenCalledWith(401);
        expect(mockUpdateVehicleVin).not.toHaveBeenCalled();
      });
    });

    describe("Validation Errors", () => {
      it("should return 400 when vin_number is empty", async () => {
        const req = {
          params: { key: "1" },
          body: { vin_number: "" },
        };
        const res = createMockResponse();
        res.locals.user = { id: 1, role: "receptionist" };

        await controller.updateVehicleVin(req, res);

        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.json).toHaveBeenCalledWith(
          expect.objectContaining({
            success: false,
            message: "Vui lòng cung cấp số khung",
          })
        );
        expect(mockUpdateVehicleVin).not.toHaveBeenCalled();
      });

      it("should return 400 when vin_number is too long", async () => {
        const req = {
          params: { key: "1" },
          body: { vin_number: "A".repeat(21) },
        };
        const res = createMockResponse();
        res.locals.user = { id: 1, role: "receptionist" };

        await controller.updateVehicleVin(req, res);

        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.json).toHaveBeenCalledWith(
          expect.objectContaining({
            success: false,
            message: "Số khung không được vượt quá 20 ký tự",
          })
        );
        expect(mockUpdateVehicleVin).not.toHaveBeenCalled();
      });
    });

    describe("Error Cases", () => {
      it("should return error status and message when service fails", async () => {
        const error = new Error("Số khung này đã tồn tại trên hệ thống");
        error.status = 400;
        mockUpdateVehicleVin.mockRejectedValue(error);

        const req = {
          params: { key: "1" },
          body: { vin_number: "VIN-DUPLICATE" },
        };
        const res = createMockResponse();
        res.locals.user = { id: 1, role: "receptionist" };

        await controller.updateVehicleVin(req, res);

        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.json).toHaveBeenCalledWith({
          success: false,
          message: "Số khung này đã tồn tại trên hệ thống",
        });
      });
    });
  });
});
