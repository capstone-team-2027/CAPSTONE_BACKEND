const express = require("express");
const request = require("supertest");

const mockGetServiceCategories = jest.fn((req, res) => res.status(200).json({ data: [] }));
const mockGetServiceCatalog = jest.fn((req, res) => res.status(200).json({ data: [] }));
const mockSearchServiceCatalog = jest.fn((req, res) => res.status(200).json({ success: true, data: { items: [] } }));
const mockGetServiceCatalogDetail = jest.fn((req, res) => res.status(200).json({ success: true, data: { id: 12 } }));
const mockGetServiceCombos = jest.fn((req, res) => res.status(200).json({ data: [] }));
const mockGetConfigurations = jest.fn((req, res) => res.status(200).json({ data: [] }));
const mockGetConfigurationByKey = jest.fn((req, res) => res.status(200).json({ data: {} }));
const mockGetAvailability = jest.fn((req, res) => res.status(200).json({ data: {} }));
const mockGetVehicleMake = jest.fn((req, res) => res.status(200).json({ data: [] }));
const mockGetVehicleModel = jest.fn((req, res) => res.status(200).json({ data: [] }));
const mockApproveQuoteFromEmail = jest.fn((req, res) => res.status(200).json({}));
const mockRejectQuoteFromEmail = jest.fn((req, res) => res.status(200).json({}));

jest.mock("../../../controller/common/guest.controller.js", () => ({
  getServiceCategories: mockGetServiceCategories,
  getServiceCatalog: mockGetServiceCatalog,
  searchServiceCatalog: mockSearchServiceCatalog,
  getServiceCatalogDetail: mockGetServiceCatalogDetail,
  getServiceCombos: mockGetServiceCombos,
}));

jest.mock("../../../controller/common/garageConfigurations.controller", () => ({
  getConfigurations: mockGetConfigurations,
  getConfigurationByKey: mockGetConfigurationByKey,
  getAvailability: mockGetAvailability,
}));

jest.mock("../../../controller/customer/vehicleMake.controller.js", () => ({
  getVehicleMake: mockGetVehicleMake,
}));

jest.mock("../../../controller/customer/vehicleModel.controller.js", () => ({
  getVehicleModel: mockGetVehicleModel,
}));

jest.mock("../../../controller/customer/quoteApproval.controller", () => ({
  approveQuoteFromEmail: mockApproveQuoteFromEmail,
  rejectQuoteFromEmail: mockRejectQuoteFromEmail,
}));

const guestRoutes = require("../../../router/common/guest.routes");

describe("Guest Routes", () => {
  let app;

  beforeEach(() => {
    jest.clearAllMocks();
    app = express();
    app.use(express.json());
    app.use("/api/guest", guestRoutes);
  });

  it("should keep existing guest service list API working without Authorization header", async () => {
    const response = await request(app).get("/api/guest/service-catalogs");

    expect(response.status).toBe(200);
    expect(mockGetServiceCatalog).toHaveBeenCalledTimes(1);
  });

  it("should allow guest service detail API without Authorization header", async () => {
    const response = await request(app).get("/api/guest/service-catalogs/12");

    expect(response.status).toBe(200);
    expect(mockGetServiceCatalogDetail).toHaveBeenCalledTimes(1);
  });

  it("should allow guest service search API without Authorization header", async () => {
    const response = await request(app).get("/api/guest/service-catalogs/search?q=phanh");

    expect(response.status).toBe(200);
    expect(mockSearchServiceCatalog).toHaveBeenCalledTimes(1);
    expect(mockGetServiceCatalogDetail).not.toHaveBeenCalled();
  });
});
