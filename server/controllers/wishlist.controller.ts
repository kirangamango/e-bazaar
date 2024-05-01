import { RequestHandler } from "express";
import { NotFound } from "http-errors";
import { WishListFunction } from "../functions";

export const WishListController: {
  getWishListByUserId: RequestHandler;
  addProductToWishList: RequestHandler;
  deleteWishListItem: RequestHandler;
} = {
  async getWishListByUserId(req, res, next) {
    try {
      if (!req.user) throw new NotFound("User is not found");
      const getItem = await WishListFunction.getWishListByUserId(req?.user?.id);
      if (!getItem) throw new NotFound("Item not found");
      res.json({
        success: true,
        msg: "WishList retrieved successfully",
        data: getItem,
      });
    } catch (error) {
      next(error);
    }
  },

  async addProductToWishList(req, res, next) {
    try {
      if (!req.user) {
        throw new NotFound("User not logged in");
      }
      const { productId } = req.body;
      await WishListFunction.addProductToWishList({
        userId: req.user.id,
        productId,
      });
      res.json({
        success: true,
        msg: "Product added to wishlist successfully",
      });
    } catch (error) {
      next(error);
    }
  },

  async deleteWishListItem(req, res, next) {
    try {
      if (!req.user) throw new NotFound("User is not found");
      const id = req.user.id;
      const { productId } = req.body;
      const deleteWishlist = await WishListFunction.deleteWishListItem(
        id,
        productId
      );
      res.json({
        success: true,
        msg: "Product removed from wishlist Successfully",
        data: deleteWishlist,
      });
    } catch (error) {
      next(error);
    }
  },
};
