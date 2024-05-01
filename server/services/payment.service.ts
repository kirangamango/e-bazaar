import { resolve } from "path";
import { Cashfree } from "../configs/cashfree.config";
import axios from "axios";

export const PaymentService = {
  placeOrder: (amount: number) => {
    try {
      const request = {
        order_amount: 1,
        order_currency: "INR",
        customer_details: {
          customer_id: "walterwNrcMi",
          customer_phone: "9999999999",
        },
        order_meta: {
          return_url:
            "https://www.cashfree.com/devstudio/preview/pg/web/checkout?order_id={order_id}",
        },
      };
      const orderData = new Promise<any>((resolve, reject) => {
        Cashfree.PGCreateOrder("2022-09-01", request)
          .then((order) => {
            resolve(order.data);
          })
          .catch((error) => {
            reject(error);
          });
      });
      return orderData;
    } catch (error) {
      throw new Error("Could not place order! try again");
    }
  },
  verify: async (orderId: string) => {
    try {
      const dataRes = await axios({
        method: "GET",
        url: `${process.env.PAYMENT_END_POINT}/orders/${orderId}`,
        headers: {
          "x-client-id": Cashfree.XClientId,
          "x-client-secret": Cashfree.XClientSecret,
          "x-api-version": "2023-08-01",
          "Content-Type": "application/json",
          Accept: "application/json",
        },
      });
      return dataRes?.data;
    } catch (error) {
      console.log(error);
    }
  },
};
