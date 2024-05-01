import { RequestHandler } from "express";
import { supportFunction } from "../functions/support.function";

export const supportController: {
  create: RequestHandler;
  getById: RequestHandler;
  update: RequestHandler;
  deleteById: RequestHandler;
  getAll: RequestHandler;
  sendReply: RequestHandler;
} = {
  async create(req, res, next) {
    try {
      const currUser = req?.user;
      const { title, message } = req.body;
      const support = await supportFunction.create({
        userId: currUser?.id as string,
        title,
        message,
      });
      res.json({
        success: true,
        data: support,
      });
    } catch (error) {
      next(error);
    }
  },
  async getAll(req, res, next) {
    try {
      const currUser = req?.user;
      const { page, limit, search, isAll } = req?.query;

      const userId = isAll === "true" ? undefined : currUser?.id;
      const { supports, pagination } = await supportFunction.getAll({
        page: typeof page === "string" ? Number(page) : undefined,
        limit: typeof limit === "string" ? Number(limit) : undefined,
        search: typeof search === "string" ? search : undefined,
        userId,
      });
      res.json({
        success: true,
        data: supports,
        pagination,
      });
    } catch (error) {
      next(error);
    }
  },
  async getById(req, res, next) {
    try {
      const support = await supportFunction.get(req.params.id);
      res.json({
        success: true,
        data: support,
      });
    } catch (error) {
      next(error);
    }
  },
  async update(req, res, next) {
    try {
      const data = req.body;
      await supportFunction.update(req.params.id, data);
      res.json({
        success: true,
        msg: "Successfully update",
      });
    } catch (error) {
      next(error);
    }
  },
  async deleteById(req, res, next) {
    try {
      await supportFunction.delete(req.params.id);
      res.json({
        success: true,
        msg: "Deleted successfully",
      });
    } catch (error) {
      next(error);
    }
  },
  async sendReply(req, res, next) {
    try {
      const id = req.params.id;
      const { reply } = req.body;
      await supportFunction.sendReply(id, reply);
      res.json({
        success: true,
        msg: "Reply sent successfully",
      });
    } catch (error) {
      next(error);
    }
  },
};
