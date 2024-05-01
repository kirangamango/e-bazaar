import { RequestHandler } from "express";
import { BannerFunction } from "../functions";

export const BannerController: {
  create: RequestHandler;
  getById: RequestHandler;
  getByUser: RequestHandler;
  update: RequestHandler;
  getAll: RequestHandler;
  delete: RequestHandler;
  deleteMany: RequestHandler;
  deleteAll: RequestHandler;
} = {
  async create(req, res, next) {
    try {
      const currUser = req?.user;
      let images: any = req?.files?.images;
      images = Array.isArray(images) ? images : [images];
      await BannerFunction.addImages(images, currUser?.id as string);
      res.json({
        success: true,
        msg: "images added successfully",
      });
      res.json({
        success: true,
        msg: "Banner created successfully",
      });
    } catch (error) {
      next(error);
    }
  },
  async getById(req, res, next) {
    try {
      const { id } = req.params;
      const banner = await BannerFunction.getById(id);
      res.json({
        success: true,
        data: banner,
      });
    } catch (error) {
      next(error);
    }
  },
  async update(req, res, next) {
    try {
      const { id } = req.params;
      const { displayStatus } = req.body;
      const banner = await BannerFunction.update(id, displayStatus);
      res.json({
        success: true,
        msg: "Updated banner successfully",
        data: banner,
      });
    } catch (error) {
      next(error);
    }
  },
  async getAll(req, res, next) {
    try {
      const { page, limit, isDisplayStatus } = req?.query;
      const banners = await BannerFunction.getAll({
        page: typeof page === "string" ? Number(page) : undefined,
        limit: typeof limit === "string" ? Number(limit) : undefined,
        isDisplayStatus: isDisplayStatus === "true" ? true : false,
      });
      res.json({
        success: true,
        data: banners,
      });
    } catch (error) {
      next(error);
    }
  },
  async getByUser(req, res, next) {
    try {
      const { page, limit, isDisplayStatus } = req?.query;
      const currUser = req?.user;
      const banners = await BannerFunction.getAll({
        page: typeof page === "string" ? Number(page) : undefined,
        limit: typeof limit === "string" ? Number(limit) : undefined,
        isDisplayStatus: isDisplayStatus === "true" ? true : false,
        userId: currUser?.id,
      });
      res.json({
        success: true,
        data: banners,
      });
    } catch (error) {
      next(error);
    }
  },
  async delete(req, res, next) {
    try {
      const { id } = req.params;
      await BannerFunction.delete(id);
      res.json({
        success: true,
        msg: "Banner deleted successfully",
      });
    } catch (error) {
      next(error);
    }
  },
  async deleteMany(req, res, next) {
    try {
      const { bannerIds } = req.body;
      await BannerFunction.deleteMany(bannerIds);
      res.json({
        success: true,
        msg: "Banners deleted successfully",
      });
    } catch (error) {
      next(error);
    }
  },
  async deleteAll(req, res, next) {
    try {
      await BannerFunction.deleteAll();
      res.json({
        success: true,
        msg: "All Banners deleted successfully",
      });
    } catch (error) {
      next(error);
    }
  },
};
