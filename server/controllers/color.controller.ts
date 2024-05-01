import { RequestHandler } from "express";
import { colorFunction } from "../functions/color.function";
import { prisma } from "../configs";
export const colorController: {
  create: RequestHandler;
  getAll: RequestHandler;
  getById: RequestHandler;
  update: RequestHandler;
  delete: RequestHandler;
  updateMany: RequestHandler;
} = {
  async create(req, res, next) {
    try {
      const { name, hexCode } = req.body;
      const color = await colorFunction.create({ name, hexCode });
      res.json({
        success: true,
        data: color,
      });
    } catch (error) {
      next(error);
    }
  },

  async getAll(req, res, next) {
    try {
      const { page, limit, search } = req?.query;
      const { colors, pagination } = await colorFunction.getAll({
        page: typeof page === "string" ? Number(page) : undefined,
        limit: typeof limit === "string" ? Number(limit) : undefined,
        search: typeof search === "string" ? search : undefined,
      });
      res.json({
        success: true,
        data: colors,
        pagination,
      });
    } catch (error) {
      next(error);
    }
  },

  async getById(req, res, next) {
    try {
      const color = await colorFunction.getById(req.params.id);
      res.json({
        success: true,
        data: color,
      });
    } catch (error) {
      next(error);
    }
  },
  async update(req, res, next) {
    try {
      const data = req.body;
      await colorFunction.update(req.params.id, data);
      res.json({
        success: true,
        msg: "Successfully updated",
      });
    } catch (error) {
      next(error);
    }
  },
  async delete(req, res, next) {
    try {
      await colorFunction.delete(req.params.id);
      res.json({
        success: true,
        msg: "Successfully deleted",
      });
    } catch (error) {
      next(error);
    }
  },
  async updateMany(req, res, next) {
    try {
      // const colors = await prisma.order.findMany();

      // for (const color of colors) {
      //   await prisma.order.update({
      //     where: {
      //       id: color.id,
      //     },
      //     data: {
      //       isAssigned: false,
      //     },
      //   });
      // }
      res.json({
        success: true,
        msg: "update many successfully",
      });
    } catch (error) {
      next(error);
    }
  },
};
