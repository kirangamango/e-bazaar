import { RequestHandler } from "express";
import { NotFound } from "http-errors";
// import xlsx from "xlsx";
import { ReviewFunction } from "../functions";

export const ReviewController: {
  create: RequestHandler;
  getById: RequestHandler;
  getAll: RequestHandler;
  update: RequestHandler;
  delete: RequestHandler;
  // createBulkUpload: RequestHandler;
} = {
  async create(req, res, next) {
    try {
      if (!req.user) throw new NotFound("User must be logged in");
      const review = await ReviewFunction.createReview({
        ...req.body,
        customerId: req.user.id,
      });
      res.json({
        success: true,
        msg: "Review created successfully",
        data: review,
      });
    } catch (error) {
      next(error);
    }
  },

  async getById(req, res, next) {
    try {
      const { id } = req.params;
      const review = await ReviewFunction.getReviewById(id);
      if (!review) throw new NotFound("Review not found");
      res.json({ success: true, data: review });
    } catch (error) {
      next(error);
    }
  },

  async getAll(req, res, next) {
    try {
      const { skip, take, isPublished, productId, userId } = req.query;

      // check if skip is not a number
      if (skip && isNaN(+skip)) throw new NotFound("skip is not a number");

      // check if take is not a number
      if (take && isNaN(+take)) throw new NotFound("take is not a number");

      // check if isPublished is not a boolean
      if (isPublished && isPublished !== "true" && isPublished !== "false")
        throw new NotFound("isPublished is not a boolean");

      // check if productId is not a string
      if (productId && typeof productId !== "string")
        throw new NotFound("productId is not a string");

      const { data, pagination } = await ReviewFunction.getReviews({
        productId: productId ? productId : undefined,
        skip: skip ? parseInt(skip as string) : undefined,
        take: take ? parseInt(take as string) : undefined,
        isPublished: isPublished ? true : undefined,
        userId: userId ? (userId as string) : undefined,
      });
      res.json({ success: true, data, pagination });
    } catch (error) {
      next(error);
    }
  },

  async update(req, res, next) {
    try {
      if (!req.user) throw new NotFound("User must be logged in");
      const { id } = req.params;
      const updatedReview = await ReviewFunction.updateReview(id, req.body);
      res.json({ success: true, msg: "Review updated", data: updatedReview });
    } catch (error) {
      next(error);
    }
  },

  async delete(req, res, next) {
    try {
      const { id } = req.params;
      const review = await ReviewFunction.getReviewById(id);
      if (!review) {
        throw new NotFound("Review not found");
      }
      const deletedReview = await ReviewFunction.deleteReview(id);
      res.json({
        success: true,
        msg: "Review deleted successfully",
        data: deletedReview,
      });
    } catch (error) {
      next(error);
    }
  },
};
