import { RequestHandler } from "express";
import { InternalServerError } from "http-errors";
import { Cashfree } from "../configs/cashfree.config";

export const paymentController: {
  verifyPayment: RequestHandler;
} = {
  async verifyPayment(req, res, next) {
    try {
      const { id: orderId } = req.params;

      console.log({ orderId });

      const payment = await fetch(
        `https://sandbox.cashfree.com/pg/orders/${orderId}`,
        {
          method: "GET",
          headers: {
            "x-client-id": Cashfree.XClientId as string,
            "x-client-secret": Cashfree.XClientSecret as string,
            "x-api-version": "2023-08-01",
          },
        }
      );
      console.log({ payment });
      res.json({
        success: true,
        data: payment,
      });
    } catch (error) {
      console.log(error);
      next(error);
    }
  },
};
