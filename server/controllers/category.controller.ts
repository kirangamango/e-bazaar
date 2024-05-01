import { RequestHandler } from "express";
import { NotFound } from "http-errors";
import { categoryFunction } from "../functions";

export const CategoryController: {
  getAll: RequestHandler;
  create: RequestHandler;
  getById: RequestHandler;
  update: RequestHandler;
  delete: RequestHandler;
  getParentCategories: RequestHandler;
  getSubCategories: RequestHandler;
  //   bulkUpload: RequestHandler;
} = {
  async getAll(req, res, next) {
    try {
      const { search, skip, take } = req.query;
      if (search && typeof search !== "string") {
        throw new NotFound("search is not a string");
      }
      if (skip && isNaN(+skip)) {
        // check if skip is not a number
        throw new NotFound("skip is not a number");
      }
      if (take && isNaN(+take)) {
        // check if take is not a number
        throw new NotFound("take is not a number");
      }
      const { data, pagination } = await categoryFunction.getCategories({
        search,
        skip: skip ? +skip : undefined, // convert skip to a number or undefined
        take: take ? +take : undefined, // convert take to a number or undefined
      });
      res.json({
        success: true,
        msg: "success",
        data,
        pagination,
      });
    } catch (error) {
      next(error);
    }
  },

  async create(req, res, next) {
    try {
      const { parentCategoryId, ...rest } = req?.body;
      const image = req?.files?.img;
      const category = await categoryFunction.createCategory(
        rest,
        parentCategoryId,
        image
      );
      res.json({
        success: true,
        msg: "Category created successfully",
        data: category,
      });
    } catch (error) {
      next(error);
    }
  },

  async getById(req, res, next) {
    try {
      const categoryId = req.params.id;
      const category = await categoryFunction.getCategoryById(categoryId);
      if (!category) {
        throw new NotFound("Category not found");
      }
      res.json({
        success: true,
        msg: "success",
        data: category,
      });
    } catch (error) {
      next(error);
    }
  },

  async update(req, res, next) {
    try {
      const categoryId = req.params.id;
      const updatedCategory = await categoryFunction.updateCategory(
        categoryId,
        req.body
      );
      res.json({
        success: true,
        msg: "Category updated successfully",
        data: updatedCategory,
      });
    } catch (error) {
      next(error);
    }
  },

  async delete(req, res, next) {
    try {
      const categoryId = req.params.id;
      const deletedCategory = await categoryFunction.deleteCategory(categoryId);
      res.json({
        success: true,
        msg: "Category deleted successfully",
        data: deletedCategory,
      });
    } catch (error) {
      next(error);
    }
  },

  async getParentCategories(req, res, next) {
    try {
      const parentCategories = await categoryFunction.getParentCategories();
      res.json({
        success: true,
        data: parentCategories,
      });
    } catch (error) {
      next(error);
    }
  },
  async getSubCategories(req, res, next) {
    try {
      const getSubCategories = await categoryFunction.getSubCategories(
        req.params.id
      );
      res.json({
        success: true,
        data: getSubCategories,
      });
    } catch (error) {
      next(error);
    }
  },
};
