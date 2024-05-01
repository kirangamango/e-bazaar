import { prisma } from "../configs";
import { NotFound } from "http-errors";
import { invoice } from "../Templates/template";
import { generateRandomHexString } from "../utils";
import { HtmlToPdf } from "../services/htmlToPdf.service";
import MediaService from "../services/media.service";

export const InvoiceFunction = {
  async create(orderId: string) {
    try {
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
    } catch (error) {
      throw new Error("Couldn't generate invoice");
    }
  },
};
