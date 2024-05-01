import { RequestHandler } from "express";
import { bulkUploadService } from "../functions";
import { BadRequest } from "http-errors";
import { UploadedFile } from "express-fileupload";

export const bulkController: {
  userUpload: RequestHandler;
  productUpload: RequestHandler;
} = {
  async userUpload(req, res, next) {
    try {
      const excel = req.files?.excel as UploadedFile;
      console.log(excel);
      if (!excel) throw new BadRequest("Excel file is required.");
      const extend = excel.name.split(".")[1];
      //throw error if not an xlsx file
      if (extend !== "xlsx")
        throw new BadRequest("Please upload a excel file with xlsx extension.");

      const bank = await bulkUploadService.uploadUser(excel);

      res.json({
        success: true,
        msg: "new filed added successfully..",
        data: bank,
      });
    } catch (error) {
      next(error);
    }
  },
  async productUpload(req, res, next) {
    try {
      const excel = req.files?.excel as UploadedFile;
      console.log(excel);
      if (!excel) throw new BadRequest("Excel file is required.");
      const extend = excel.name.split(".")[1];
      //throw error if not an xlsx file
      if (extend !== "xlsx" && extend !== "csv")
        throw new BadRequest("Please upload a excel file with xlsx extension.");

      await bulkUploadService.uploadProduct(excel);

      res.json({
        success: true,
        msg: "product import sucessfull",
      });
    } catch (error) {
      next(error);
    }
  },
};
