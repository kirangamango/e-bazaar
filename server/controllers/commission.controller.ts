import { RequestHandler } from "express";
import { commissionFunction } from "../functions/commission.function";

export const commissionController: {
  create: RequestHandler;
  createDistributor: RequestHandler;
  getAll: RequestHandler;
  getById: RequestHandler;
  update: RequestHandler;
  deleteById: RequestHandler;
} = {
  async create(req, res, next) {
    try {
      const currUser = req?.user;

      const { amount, userId } = req.body;
      const commission = await commissionFunction.create({
        amount: Number(amount),
        userId,
      });

      res.json({
        success: true,
        data: commission,
      });
    } catch (error) {
      next(error);
    }
  },
  async createDistributor(req, res, next) {
    try {
      const currUser = req?.user;

      const { amount, userId } = req.body;
      const commission = await commissionFunction.create({
        amount: Number(amount),
        userId,
      });

      res.json({
        success: true,
        data: commission,
      });
    } catch (error) {
      next(error);
    }
  },
  async getAll(req, res, next) {
    try {
      // console.log("commission")
      const { page, limit, search } = req?.query;
      const { commissions, pagination } = await commissionFunction.getAll({
        page: typeof page === "string" ? Number(page) : undefined,
        limit: typeof limit === "string" ? Number(limit) : undefined,
        search: typeof search === "string" ? search : undefined,
      });
      res.json({
        success: true,
        data: commissions,
        pagination,
      });
    } catch (error) {
      next(error);
    }
  },
  async getById(req, res, next) {
    try {
      const commission = await commissionFunction.getById(req.params.id);
      res.json({
        success: true,
        data: commission,
      });
    } catch (error) {
      next(error);
    }
  },
  async update(req, res, next) {
    try {
      const data = req.body;
      await commissionFunction.update(req.params.id, data);
      res.json({
        success: true,
        msg: "Updated successfully",
      });
    } catch (error) {
      next(error);
    }
  },
  async deleteById(req, res, next) {
    try {
      await commissionFunction.delete(req.params.id);
      res.json({
        success: true,
        msg: "Deleted successfully",
      });
    } catch (error) {
      next(error);
    }
  },
};
