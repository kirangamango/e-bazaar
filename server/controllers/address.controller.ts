import { RequestHandler } from "express";
import { NotFound } from "http-errors";
// import xlsx from "xlsx";
import { AddressFunction } from "../functions";
import { prisma } from "../configs";
export const AddressController: {
  create: RequestHandler;
  getById: RequestHandler;
  getAll: RequestHandler;
  update: RequestHandler;
  delete: RequestHandler;
  assignAddress: RequestHandler;
  test: RequestHandler;
  // createBulkUpload: RequestHandler;
} = {
  async create(req, res, next) {
    try {
      if (!req.user) throw new NotFound("User not found");
      const address = await AddressFunction.createAddress({
        ...req.body,
        customerId: req?.user?.id,
      });
      res.json({
        success: true,
        msg: "Address created successfully",
        data: address,
      });
    } catch (error) {
      next(error);
    }
  },
  // async createBulkUpload(req, res, next) {
  //   try {
  //     if (!req.files || !req.files.data) {
  //       throw new NotFound("Address not found");
  //     } else {
  //       const csvFile: any = req.files.data;
  //       const workbook = xlsx.read(csvFile?.data, { type: "buffer" });
  //       const sheetName = workbook.SheetNames[0];
  //       const worksheet = workbook.Sheets[sheetName];
  //       const jsonData: any = xlsx.utils.sheet_to_json(worksheet);

  //       let createAddress;
  //       for (const address of jsonData) {
  //         createAddress = await AddressFunction.createAddress(address);
  //       }
  //       res.json({
  //         success: true,
  //         msg: "Address created Successfully",
  //         data: createAddress,
  //       });
  //     }
  //   } catch (error) {
  //     next(error);
  //   }
  // },

  async getById(req, res, next) {
    try {
      const { id } = req.params;
      const address = await AddressFunction.getAddressById(id);

      res.json({ success: true, data: address });
    } catch (error) {
      next(error);
    }
  },

  async getAll(req, res, next) {
    try {
      if (!req.user) throw new NotFound("User not found");
      const { skip, take } = req.query;
      const { addresses, pagination } = await AddressFunction.getAddresses({
        customerId: req.user?.id as string,
        skip: skip ? parseInt(skip as string) : undefined,
        take: take ? parseInt(take as string) : undefined,
      });

      res.json({ success: true, data: addresses, pagination });
    } catch (error) {
      next(error);
    }
  },

  async update(req, res, next) {
    try {
      const { id } = req.params;
      const updatedAddress = await AddressFunction.updateAddress(id, req.body);
      res.json({ success: true, msg: "Address updated", data: updatedAddress });
    } catch (error) {
      next(error);
    }
  },

  async delete(req, res, next) {
    try {
      const { id } = req.params;
      const deletedAddress = await AddressFunction.deleteAddress(id);
      res.json({
        success: true,
        msg: "Address deleted successfully",
        data: deletedAddress,
      });
    } catch (error) {
      next(error);
    }
  },
  async assignAddress(req, res, next) {
    try {
      // if (!req.user) throw new NotFound("User not found");

      const address = await AddressFunction.assignAddress({
        ...req.body,
      });
      res.json({
        success: true,
        msg: "Area assigned successfully",
        data: address,
      });
    } catch (error) {
      next(error);
    }
  },
  async test(req, res, next) {
    try {
      // const addresses = await prisma.address.findMany({
      //   where: {
      //     OR: [
      //       {
      //         customerId: null,
      //       },
      //       {
      //         customerId: { isSet: false },
      //       },
      //       {
      //         customer: null,
      //       },
      //     ],
      //   },
      // });

      // const customerIds = addresses.map((address) => address.customerId);

      // const customers = await prisma.address.findMany({
      //   where: { id: { in: customerIds as string[] } },
      // });

      //----------------------------------------------------------------UPDATE MANY----------------------------------------------------------------
      // const address = await prisma.address.updateMany({
      //   where: {
      //     customer: {
      //       OR: [
      //         {
      //           role: "COMPANY_REPRESENTATIVE",
      //         },
      //         {
      //           role: "DISTRIBUTOR",
      //         },
      //       ],
      //     },
      //   },
      //   data: {
      //     type: "HEADQUARTER",
      //   },
      // });

      res.json({
        success: true,
        // data: address,
        // total: address.length,
        // customers,
      });
    } catch (error) {
      next(error);
    }
  },
};
