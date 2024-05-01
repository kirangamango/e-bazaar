import { RequestHandler } from "express";
import { NotFound } from "http-errors";
import { prisma } from "../configs";

export const WalletController: {
  create: RequestHandler;
  getById: RequestHandler;
  getByUserId: RequestHandler;
  getAll: RequestHandler;
  update: RequestHandler;
  delete: RequestHandler;
} = {
  async create(req, res, next) {
    try {
      res.json({
        success: true,
        msg: "Wallet created successfully",
      });
    } catch (error) {
      next(error);
    }
  },
  async getById(req, res, next) {
    try {
      const { id } = req.params;
      res.json({
        success: true,
      });
    } catch (error) {
      next(error);
    }
  },
  async getByUserId(req, res, next) {
    try {
      const currUser = req?.user;
      if (!currUser) throw new NotFound("User must be logged in");

      const wallet = await prisma.wallet.findFirst({
        where: {
          userId: currUser.id,
        },
      });

      res.json({
        success: true,
        data: wallet,
      });
    } catch (error) {
      next(error);
    }
  },
  async getAll(req, res, next) {
    try {
      res.json({
        success: true,
      });
    } catch (error) {
      next(error);
    }
  },
  async update(req, res, next) {
    try {
      const { data } = req.body;
      const { id } = req.params;
      res.json({
        success: true,
        msg: "Wallet updated successfully",
      });
    } catch (error) {
      next(error);
    }
  },
  async delete(req, res, next) {
    try {
      const { id } = req.params;
      res.json({
        success: true,
        msg: "Wallet deleted successfully",
      });
    } catch (error) {
      next(error);
    }
  },
};
