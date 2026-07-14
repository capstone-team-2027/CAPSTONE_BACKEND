const { Op } = require("sequelize");

const mockFindOne = jest.fn();
const mockFindAndCountAll = jest.fn();
const mockGetDialect = jest.fn();
const mockFn = jest.fn((name, value) => ({ fnName: name, value }));
const mockCol = jest.fn((value) => ({ colName: value }));
const mockWhere = jest.fn((left, right) => ({ left, right }));

jest.mock("../../../../models", () => ({
  Service_Categories: {},
  Service_Catalog: {
    findOne: mockFindOne,
    findAndCountAll: mockFindAndCountAll,
  },
  Service_Combo: {},
  sequelize: {
    getDialect: mockGetDialect,
    fn: mockFn,
    col: mockCol,
    where: mockWhere,
  },
}));

const guestService = require("../../../service/common/guest.service");

describe("Guest Service", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("searchServiceCatalog", () => {
    it("should search active services with postgres iLike and pagination", async () => {
      mockGetDialect.mockReturnValue("postgres");
      mockFindAndCountAll.mockResolvedValue({ count: 1, rows: [{ id: 3 }] });

      const result = await guestService.searchServiceCatalog({
        q: "  Phanh  ",
        category_id: 2,
        page: 2,
        limit: 8,
      });

      expect(mockFindAndCountAll).toHaveBeenCalledWith(
        expect.objectContaining({
          where: {
            is_active: true,
            category_id: 2,
            [Op.or]: [
              { service_name: { [Op.iLike]: "%phanh%" } },
              { description: { [Op.iLike]: "%phanh%" } },
            ],
          },
          limit: 8,
          offset: 8,
          distinct: true,
          order: [["createdAt", "DESC"], ["id", "DESC"]],
        })
      );
      expect(result).toEqual({
        items: [{ id: 3 }],
        pagination: {
          page: 2,
          limit: 8,
          total: 1,
          totalPages: 1,
        },
      });
    });

    it("should use dialect-safe lower-case search for non-postgres", async () => {
      mockGetDialect.mockReturnValue("mysql");
      mockFindAndCountAll.mockResolvedValue({ count: 0, rows: [] });

      const result = await guestService.searchServiceCatalog({
        q: "Kiem",
        page: 1,
        limit: 8,
      });

      expect(mockFn).toHaveBeenCalledWith("LOWER", expect.anything());
      expect(mockCol).toHaveBeenCalledWith("Service_Catalog.service_name");
      expect(mockCol).toHaveBeenCalledWith("Service_Catalog.description");
      expect(mockWhere).toHaveBeenCalledTimes(2);
      expect(mockFindAndCountAll).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            is_active: true,
          }),
        })
      );
      expect(result).toEqual({
        items: [],
        pagination: {
          page: 1,
          limit: 8,
          total: 0,
          totalPages: 0,
        },
      });
    });

    it("should normalize invalid page and limit safely", async () => {
      mockGetDialect.mockReturnValue("postgres");
      mockFindAndCountAll.mockResolvedValue({ count: 0, rows: [] });

      await guestService.searchServiceCatalog({
        q: "",
        page: 0,
        limit: 999,
      });

      expect(mockFindAndCountAll).toHaveBeenCalledWith(
        expect.objectContaining({
          limit: 100,
          offset: 0,
        })
      );
    });
  });

  describe("getServiceCatalogDetail", () => {
    it("should return active service detail with category", async () => {
      const fakeData = {
        id: 12,
        category_id: 3,
        service_name: "Bao duong dinh ky",
        category: { id: 3, category_name: "Bao duong" },
      };
      mockFindOne.mockResolvedValue(fakeData);

      const result = await guestService.getServiceCatalogDetail(12);

      expect(mockFindOne).toHaveBeenCalledWith({
        where: {
          id: 12,
          is_active: true,
        },
        attributes: ["id", "category_id", "service_name", "description", "estimated_duration", "is_active"],
        include: [
          {
            model: expect.anything(),
            as: "category",
            attributes: ["id", "category_name"],
          },
        ],
      });
      expect(result).toBe(fakeData);
    });

    it("should return 404 when service id does not exist", async () => {
      mockFindOne.mockResolvedValue(null);

      await expect(guestService.getServiceCatalogDetail(999)).rejects.toEqual({
        status: 404,
        message: "Dịch vụ không tồn tại",
      });
    });

    it("should return 404 when service is inactive", async () => {
      mockFindOne.mockResolvedValue(null);

      await expect(guestService.getServiceCatalogDetail(15)).rejects.toEqual({
        status: 404,
        message: "Dịch vụ không tồn tại",
      });

      expect(mockFindOne).toHaveBeenCalledWith(
        expect.objectContaining({
          where: {
            id: 15,
            is_active: true,
          },
        })
      );
    });
  });
});
