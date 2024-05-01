import { RequestHandler } from "express";
import { prisma } from "../configs";

export const pinController: {
  getAll: RequestHandler;
  updateMany: RequestHandler;
} = {
  async getAll(req, res, next) {
    try {
      const pincode = parseInt(req?.query?.pincode as string);
      // console.log(pincode);
      const pincodes = await prisma.pincode.findMany({
        where: { pincode: pincode ? pincode : undefined },
      });
      // console.log(pincodes, "pincodes---->");
      res.json({ success: true, data: pincodes });
    } catch (error) {
      console.log(error);
      next(error);
    }
  },
  async updateMany(req, res, next) {
    try {
      const pincodes = await prisma.pincode.updateMany({
        data: { updatedAt: new Date(), createdAt: new Date() },
      });
      console.log(pincodes, "pincodes---->");
      res.json({ success: true, data: pincodes });
    } catch (error) {
      console.log(error);
      next(error);
    }
  },
};
