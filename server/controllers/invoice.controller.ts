import { RequestHandler } from "express";

import { prisma } from "../configs";
import { NotFound } from "http-errors";
import { invoice } from "../Templates/template";
import { generateRandomHexString } from "../utils";
import { HtmlToPdf } from "../services/htmlToPdf.service";
import MediaService from "../services/media.service";

export const InvoiceController: {
  create: RequestHandler;
  getInvoiceByOrderId: RequestHandler;
} = {
  async create(req, res, next) {
    try {
      const { orderId } = req?.query as any;
      const isOrderExists = await prisma.order.findUnique({
        where: {
          id: orderId,
        },
        include: {
          customer: true,
          manufacturer: true,
          OrderedItems: {
            include: {
              product: true,
            },
          },
          deliveryAddress: true,
        },
      });
      console.log({ orderId, OrderedItems: isOrderExists?.OrderedItems });

      if (!isOrderExists) throw new NotFound("Order not found");

      const invoiceNo = "#" + generateRandomHexString(12).toUpperCase();
      const invoiceTemplate = invoice(
        isOrderExists,
        isOrderExists?.total,
        invoiceNo
      );

      const file = await HtmlToPdf(invoiceTemplate);

      // const file = await pdfParse(invoiceBuffer);

      console.log({ file });

      let invoicePath, invoiceUrl;

      if (file) {
        const filePdf = (await new MediaService().uploadPdf({
          file,
          dir: "invoice",
        })) as { key: string; Location: string; allData: any };

        invoicePath = filePdf.Location;
        invoiceUrl = filePdf.key;
      }

      console.log({ invoicePath, invoiceUrl });

      const invoiceRecord = await prisma.invoice.create({
        data: {
          invoiceNo,
          invoicePath: invoicePath as string,
          invoiceUrl: invoiceUrl as string,
          Order: {
            connect: {
              id: orderId,
            },
          },
        },
      });
      res.json({
        success: true,
        msg: "Invoice generated successfully",
        data: invoiceRecord,
      });
    } catch (error) {
      next(error);
    }
  },
  async getInvoiceByOrderId(req, res, next) {
    try {
      const { orderId } = req?.params;

      const invoice = await prisma.invoice.findUnique({
        where: {
          orderId,
        },
      });

      if (!invoice) throw new NotFound("Invoice not found");

      res.redirect(invoice?.invoiceUrl);
    } catch (error) {
      next(error);
    }
  },
};
