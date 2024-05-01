import { RequestHandler } from "express";
import { CashPointFunction } from "../functions";

export const CashPointController: {
  create: RequestHandler;
  getById: RequestHandler;
  getAll: RequestHandler;
  update: RequestHandler;
  delete: RequestHandler;
} = {
  async create(req, res, next) {
    try {
      const cashPoint = await CashPointFunction.create(req?.body);
      res.json({
        success: true,
        msg: "Cashpoint created successfully",
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
