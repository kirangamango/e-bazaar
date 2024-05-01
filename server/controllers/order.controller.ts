import { RequestHandler } from "express";
import { Parser } from "json2csv";
import { OrderFunction } from "../functions";
import { NotFound, NotAcceptable } from "http-errors";
import { prisma } from "../configs";
import { pushNotification } from "../services/notification.service";

export const OrderController: {
  create: RequestHandler;
  verifyOrder: RequestHandler;
  getById: RequestHandler;
  getAll: RequestHandler;
  getByUser: RequestHandler;
  getByDistributorOrCR: RequestHandler;
  update: RequestHandler;
  cancelOrder: RequestHandler;
  delete: RequestHandler;
  assignDistrubutorAndCompRep: RequestHandler;
  exportOrder: RequestHandler;
} = {
  async create(req, res, next) {
    try {
      if (!req.user) throw new NotFound("User must be logged in");
      console.log({ "req.body": JSON.stringify(req.body) });
      const paymentMethod = req?.body?.paymentMethod;
      if (paymentMethod !== "COD" && paymentMethod !== "ONLINE")
        throw new NotAcceptable("Please choose a payment method");

      let order;
      if (paymentMethod === "COD") {
        order = await OrderFunction.create({
          customerId: req.user.id,
          input: req.body,
        });
      } else if (paymentMethod === "ONLINE") {
        order = await OrderFunction.createOnline({
          customerId: req.user.id,
          input: req.body,
        });
      }

      res.json({
        success: true,
        msg: "Order created successfully",
        data: order,
      });
    } catch (error) {
      console.log(error);
      next(error);
    }
  },

  async verifyOrder(req, res, next) {
    try {
      const currUser = req?.user;
      const { orderId } = req?.params;
      const orderStatus = await OrderFunction.verifyOrder(orderId);

      const msg =
        orderStatus === "PAID"
          ? "Order payment successful"
          : orderStatus === "FAILED"
          ? "Order payment failed"
          : "Order payment pending";

      if (orderStatus === "PAID")
        await pushNotification({
          title: `Order placed succcessfully`,
          body: `Order(${orderId}) placed succcessfully`,
          userIds: [currUser?.id as string],
          saveToDb: true,
        });
      if (orderStatus === "FAILED")
        await pushNotification({
          title: `Order placed unsuccessful due to payment failure`,
          body: `Order(${orderId}) unsuccessful due to payment failure`,
          userIds: [currUser?.id as string],
          saveToDb: true,
        });

      res.json({
        success: true,
        msg,
      });
    } catch (error) {
      next(error);
    }
  },

  async getById(req, res, next) {
    try {
      const { id } = req.params;
      const order = await OrderFunction.getById(id);
      res.json({ success: true, data: order });
    } catch (error) {
      next(error);
    }
  },

  async getAll(req, res, next) {
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
        manufacturerId,
      } = req?.query;

      const { orders, pagination } = await OrderFunction.getAll({
        page: typeof page === "string" ? Number(page) : undefined,
        limit: typeof limit === "string" ? Number(limit) : undefined,
        search: typeof search === "string" ? search : undefined,
        startDate:
          typeof startDate === "string" ? new Date(startDate) : undefined,
        endDate: typeof endDate === "string" ? new Date(endDate) : undefined,
        productId: typeof productId === "string" ? productId : undefined,
        orderId: typeof orderId === "string" ? orderId : undefined,
        status: typeof status === "string" ? status : undefined,
        manufacturerId:
          typeof manufacturerId === "string" ? manufacturerId : undefined,
      });

      res.json({ success: true, data: orders, pagination });
    } catch (error) {
      next(error);
    }
  },
  async getByUser(req, res, next) {
    try {
      const currUser = req?.user;
      if (!currUser) throw new NotFound("User must be logged in");
      const { page, limit, search } = req?.query;

      const { orders, pagination } = await OrderFunction.getAll({
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
  async getByDistributorOrCR(req, res, next) {
    try {
      console.log("get distributor cr orders");
      const currUser = req?.user;
      if (!currUser) throw new NotFound("User must be logged in");
      const { page, limit, search, productId, orderId } = req?.query;

      const { orders, pagination } = await OrderFunction.getAllDistributorCR({
        page: typeof page === "string" ? Number(page) : undefined,
        limit: typeof limit === "string" ? Number(limit) : undefined,
        search: typeof search === "string" ? search : undefined,
        userId: currUser.id as string,
        role: currUser.role,
        productId: typeof productId === "string" ? productId : undefined,
        orderId: typeof orderId === "string" ? orderId : undefined,
      });

      res.json({ success: true, data: orders, pagination });
    } catch (error) {
      next(error);
    }
  },

  async update(req, res, next) {
    try {
      if (!req.user) throw new NotFound("User must be logged in");
      const { id } = req.params;
      const {
        paymentMethod,
        status,
        manufacturerId,
        isAssigned,
        paymentStatus,
      } = req?.body;
      await OrderFunction.update(id, {
        paymentMethod,
        status,
        isAssigned,
        manufacturerId,
        paymentStatus,
      });
      res.json({
        success: true,
        msg: "Order updated successfully",
      });
    } catch (error) {
      next(error);
    }
  },

  async cancelOrder(req, res, next) {
    try {
      if (!req.user) throw new NotFound("User must be logged in");
      const { id } = req.params;
      const cancelledOrder = await OrderFunction.cancelOrder(id);
      res.json({ success: true, msg: "Order cancelled successfully" });
    } catch (error) {
      next(error);
    }
  },

  async delete(req, res, next) {
    try {
      if (!req.user) throw new NotFound("User must be logged in");
      const { id } = req.params;

      await OrderFunction.delete(id);
      res.json({
        success: true,
        msg: "Order deleted successfully",
      });
    } catch (error) {
      next(error);
    }
  },

  async assignDistrubutorAndCompRep(req, res, next) {
    try {
      const currUser = req?.user;
      if (!currUser) throw new NotFound("User must be logged in");

      const { id } = req.params;
      const { distributorId, companyRepId } = req.body;

      if (!distributorId && !companyRepId)
        throw new NotAcceptable(
          "Distributor and Company Representative must be selected"
        );

      const order = await prisma.order.update({
        where: {
          id,
        },
        data: {
          distributor: distributorId
            ? {
                connect: {
                  id: distributorId,
                },
              }
            : undefined,
          companyRep: companyRepId
            ? {
                connect: {
                  id: companyRepId,
                },
              }
            : undefined,
          isAssigned: true,
        },
      });
      res.json({
        success: true,
        msg: "Distributor and Company representative assigned successfully",
        order,
      });
    } catch (error) {
      next(error);
    }
  },
  async exportOrder(req, res, next) {
    try {
      const currUser = req?.user;
      console.log({ currUser });
      const exportData = await OrderFunction.export(
        currUser?.id as string,
        currUser?.role as string
      );

      const file_header = [
        { label: "Order Id", value: "orderId", stringify: true },
        {
          label: "Product Name",
          value: "orderedItems.title",
          stringify: true,
        },
        { label: "Price", value: "orderedItems.salePrice", stringify: true },
        { label: "Quantitiy", value: "orderedItems.quantity", stringify: true },
        {
          label: "Order Date",
          value: "createdAt",
          stringify: true,
        },
        {
          label: "Distributor",
          value: "distributor.name",
          stringify: true,
        },
        {
          label: "Company Representative",
          value: "companyRep.name",
          stringify: true,
        },
        {
          label: "Buyer",
          value: "customer.name",
          stringify: true,
        },
        {
          label: "Shipping Address",
          value: "address.addressLineOne",
          stringify: true,
        },
        { label: "Payment Method", value: "paymentMethod", stringify: true },
        { label: "Status", value: "status", stringify: true },
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
};
