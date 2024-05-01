import { RequestHandler } from "express";
import { sizeFunction } from "../functions/size.function";

export const sizeController: {
  create: RequestHandler;
  getById: RequestHandler;
  update: RequestHandler;
  deleteById: RequestHandler;
  getAll: RequestHandler;
} = {
  async create(req, res, next) {
    try {
      const { name } = req.body;
      const size = await sizeFunction.create({ name });
      res.json({
        success: true,
        data: size,
      });
    } catch (error) {
      next(error);
    }
  },
  async getAll(req, res, next) {
    try {
      const { page, limit, search } = req?.query;
      const { sizes, pagination } = await sizeFunction.getAll({
        page: typeof page === "string" ? Number(page) : undefined,
        limit: typeof limit === "string" ? Number(limit) : undefined,
        search: typeof search === "string" ? search : undefined,
      });
      res.json({
        success: true,
        data: sizes,
        pagination,
      });
    } catch (error) {
      next(error);
    }
  },
  async getById(req, res, next) {
    try {
      const size = await sizeFunction.getById(req.params.id);
      res.json({
        success: true,
        data: size,
      });
    } catch (error) {
      next(error);
    }
  },
  async update(req, res, next) {
    try {
      const data = req.body;
      await sizeFunction.update(req.params.id, data);
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
      await sizeFunction.delete(req.params.id);
      res.json({
        success: true,
        msg: "Deleted successfully",
      });
    } catch (error) {
      next(error);
    }
  },
};
