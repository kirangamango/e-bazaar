import { RequestHandler } from "express";
import { Parser } from "json2csv";
import { AnalyticsFunction } from "../functions";
import { NotFound } from "http-errors";

export const AnalyticsController: {
  create: RequestHandler;
  getById: RequestHandler;
  getAnalyticData: RequestHandler;
  getAdminDashboardData: RequestHandler;
  getManufacturerDashboardData: RequestHandler;
  getRevenueData: RequestHandler;
  getRevenueManfacturerData: RequestHandler;
  update: RequestHandler;
  delete: RequestHandler;
  exportAllRevenue: RequestHandler;
  exportManfacturerRevenue: RequestHandler;
  distributorDashboard: RequestHandler;
  companyRepDashboard: RequestHandler;
} = {
  async create(req, res, next) {
    try {
      res.json({
        status: true,
        msg: "Wallet created successfully",
      });
    } catch (error) {
      next(error);
    }
  },
  async getById(req, res, next) {
    try {
      const { id } = req.params;
      res.json({
        status: true,
      });
    } catch (error) {
      next(error);
    }
  },
  async getAnalyticData(req, res, next) {
    try {
      const {
        page,
        limit,
        search,
        startDate,
        endDate,
        productId,
        orderId,
        status,
      } = req?.query;
      const { data, pagination } = await AnalyticsFunction.getAnalytics({
        page: typeof page === "string" ? Number(page) : undefined,
        limit: typeof limit === "string" ? Number(limit) : undefined,
        search: typeof search === "string" ? search : undefined,
        startDate:
          typeof startDate === "string" ? new Date(startDate) : undefined,
        endDate: typeof endDate === "string" ? new Date(endDate) : undefined,
        productId: typeof productId === "string" ? productId : undefined,
        orderId: typeof orderId === "string" ? orderId : undefined,
        status: typeof status === "string" ? status : undefined,
      });
      res.json({
        success: true,
        data,
      });
    } catch (error) {
      next(error);
    }
  },
  async getAdminDashboardData(req, res, next) {
    try {
      const data = await AnalyticsFunction.adminDashboard();

      res.json({
        success: true,
        data,
      });
    } catch (error) {
      next(error);
    }
  },
  async getManufacturerDashboardData(req, res, next) {
    try {
      const currUser = req?.user;
      const data = await AnalyticsFunction.manfacturerDashboard(
        currUser?.id as string
      );

      res.json({
        success: true,
        data,
      });
    } catch (error) {
      next(error);
    }
  },
  async getRevenueData(req, res, next) {
    try {
      const {
        page,
        limit,
        search,
        startDate,
        endDate,
        productId,
        orderId,
        status,
      } = req?.query;
      console.log("inside revenue");
      const { data, pagination } = await AnalyticsFunction.revenueData({
        page: typeof page === "string" ? Number(page) : undefined,
        limit: typeof limit === "string" ? Number(limit) : undefined,
        search: typeof search === "string" ? search : undefined,
        startDate:
          typeof startDate === "string" ? new Date(startDate) : undefined,
        endDate: typeof endDate === "string" ? new Date(endDate) : undefined,
        productId: typeof productId === "string" ? productId : undefined,
        orderId: typeof orderId === "string" ? orderId : undefined,
        status: typeof status === "string" ? status : undefined,
      });

      res.json({
        success: true,
        data,
      });
    } catch (error) {
      next(error);
    }
  },
  async getRevenueManfacturerData(req, res, next) {
    try {
      const currUser = req?.user;
      if (!currUser) throw new NotFound("User must be logged in");
      const { page, limit, search } = req?.query;

      const { orders, pagination } =
        await AnalyticsFunction.revenueManufacturer({
          page: typeof page === "string" ? Number(page) : undefined,
          limit: typeof limit === "string" ? Number(limit) : undefined,
          search: typeof search === "string" ? search : undefined,
          userId: currUser.id as string,
        });

      res.json({ success: true, data: orders, pagination });
    } catch (error) {
      next(error);
    }
  },
  async update(req, res, next) {
    try {
      const { data } = req.body;
      const { id } = req.params;
      res.json({
        status: true,
        msg: "Wallet updated successfully",
      });
    } catch (error) {
      next(error);
    }
  },
  async delete(req, res, next) {
    try {
      const { id } = req.params;
      res.json({
        status: true,
        msg: "Wallet deleted successfully",
      });
    } catch (error) {
      next(error);
    }
  },
  async exportAllRevenue(req, res, next) {
    try {
      const exportData = await AnalyticsFunction.exportAll();

      const file_header = [
        { label: "Name", value: "name", stringify: true },
        {
          label: "Email",
          value: "email",
          stringify: true,
        },

        { label: "Quantitiy", value: "orders.quantity", stringify: true },
        {
          label: "Phone",
          value: "phone",
          stringify: true,
        },
        {
          label: "Sale Date",
          value: "orders._id",
          stringify: true,
        },
        {
          label: "Sale Price",
          value: "orders.salePrice",
          stringify: true,
        },
        {
          label: "Villoop Revenue",
          value: "orders.villopRevenue",
          stringify: true,
        },
        {
          label: "Manufacturer Revenue",
          value: "orders.maufacturerRevenue",
          stringify: true,
        },
      ];

      const json2csvParser = new Parser({ fields: file_header });
      const csvData = json2csvParser.parse([...exportData]);

      res.setHeader("Content-Type", "text/csv");
      res.setHeader("Content-Description", "attachment; filename=data.csv");
      res.end(csvData);
      // res.json({
      //   data: exportData,
      // });
    } catch (error) {
      next(error);
    }
  },
  async exportManfacturerRevenue(req, res, next) {
    try {
      const currUser = req?.user;

      const exportData = await AnalyticsFunction.exportManufacturerRevenue(
        currUser?.id as string
      );

      const file_header = [
        { label: "Order Id", value: "orderId", stringify: true },
        {
          label: "Purchase Date",
          value: "createdAt",
          stringify: true,
        },

        { label: "Villoop Revenue", value: "viloopRevenue", stringify: true },
        {
          label: "My Revenue",
          value: "myRevenue",
          stringify: true,
        },
      ];

      const json2csvParser = new Parser({ fields: file_header });
      const csvData = json2csvParser.parse([...exportData]);

      res.setHeader("Content-Type", "text/csv");
      res.setHeader("Content-Description", "attachment; filename=data.csv");
      res.end(csvData);
      // res.json({
      //   success: true,
      //   data: exportData,
      // });
    } catch (error) {
      next(error);
    }
  },
  async distributorDashboard(req, res, next) {
    try {
      const currUser = req?.user;
      const data = await AnalyticsFunction.distributorDashboard(
        currUser?.id as string
      );

      res.json({
        success: true,
        data,
      });
    } catch (error) {
      next(error);
    }
  },
  async companyRepDashboard(req, res, next) {
    try {
      const currUser = req?.user;
      const data = await AnalyticsFunction.companyRepDashboard(
        currUser?.id as string
      );

      res.json({
        success: true,
        data,
      });
    } catch (error) {
      next(error);
    }
  },
};
