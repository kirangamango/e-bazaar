import { RequestHandler } from "express";
import { CartFunction } from "../functions";
import { NotFound } from "http-errors";

export const CartController: {
  addToCart: RequestHandler;
  getCartItemByUserId: RequestHandler;
  increaseQty: RequestHandler;
  decreaseQty: RequestHandler;
  removeFromCart: RequestHandler;
  deleteCart: RequestHandler;
} = {
  async addToCart(req, res, next) {
    try {
      const currUser = req?.user;
      if (!currUser) throw new NotFound("You must be logged in!");
      const { productId, quantity } = req.body;
      await CartFunction.addCart(currUser.id, productId, Number(quantity));
      res.json({
        success: true,
        msg: "Product added to cart successfully",
      });
    } catch (error) {
      next(error);
    }
  },
  async getCartItemByUserId(req, res, next) {
    try {
      const currUser = req?.user;
      if (!currUser) throw new NotFound("You must be logged in!");

      const cartItems = await CartFunction.getCartItems(currUser.id);
      res.json({
        success: true,
        data: cartItems,
      });
    } catch (error) {
      next(error);
    }
  },
  async increaseQty(req, res, next) {
    try {
      const currUser = req?.user;
      if (!currUser) throw new NotFound("You must be logged in!");
      const { productId } = req.body;
      await CartFunction.increaseQty(currUser.id, productId);
      res.json({
        success: true,
        msg: "Increased quantity by one",
      });
    } catch (error) {
      next(error);
    }
  },
  async decreaseQty(req, res, next) {
    try {
      const currUser = req?.user;
      if (!currUser) throw new NotFound("You must be logged in!");
      const { productId } = req.body;
      await CartFunction.decreaseQty(currUser.id, productId);
      res.json({
        success: true,
        msg: "Decreased quantity by one",
      });
    } catch (error) {
      next(error);
    }
  },
  async removeFromCart(req, res, next) {
    try {
      const currUser = req?.user;
      if (!currUser) throw new NotFound("You must be logged in!");
      const { id } = req.params;

      await CartFunction.removeFromCart(currUser.id, id);
      res.json({
        success: true,
        msg: "Product removed from cart successfully",
      });
    } catch (error) {
      next(error);
    }
  },
  async deleteCart(req, res, next) {
    try {
      const currUser = req?.user;
      if (!currUser) throw new NotFound("You must be logged in!");
      const { cartId } = req.body;

      await CartFunction.deleteCart(cartId);
      res.json({
        success: true,
        msg: "Product removed from cart successfully",
      });
    } catch (error) {
      next(error);
    }
  },
};
