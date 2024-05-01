import { RequestHandler } from "express";
import https from "https";
import fs from "fs";
import { UserFunction } from "../functions";
import { prisma } from "../configs";
import { UploadedFile } from "express-fileupload";
import { NotFound, Conflict } from "http-errors";
import { generateRandomHexString } from "../utils";

export const userController: {
  create: RequestHandler;
  login: RequestHandler;
  changePassword: RequestHandler;
  update: RequestHandler;
  self: RequestHandler;
  forgotPassword: RequestHandler;
  setNewPassword: RequestHandler;
  getAll: RequestHandler;
  getById: RequestHandler;
  addDistributorOrCR: RequestHandler;
  updateMany: RequestHandler;
  delete: RequestHandler;
  deleteRecord: RequestHandler;
  getAllDistributorAndCR: RequestHandler;
  downloadFile: RequestHandler;
} = {
  async create(req, res, next) {
    try {
      const {
        name,
        email,
        password,
        avatar,
        avatarPath,
        role,
        gender,
        phone,
        companyName,
        companyHeadquarter,
        businessAddress,
        gstNo,
        aadharNo,
        categories,
        businessName,
        businessType,
      } = req?.body;

      const { isManufacturer } = req?.query;

      const categoriesIds = categories
        ? Array.isArray(categories)
          ? categories.map((category: any) => ({ id: category }))
          : [{ id: categories }]
        : undefined;

      console.log({ categoriesIds });

      const gstFile = req?.files?.gst as UploadedFile;
      const aadharFile = req?.files?.aadhar as UploadedFile;
      const aadharFileBack = req?.files?.aadharBack as UploadedFile;

      console.log({ gstFile, aadharFile });

      let gst, aadhar, aadharBack;

      if (aadharNo && aadharFile) {
        aadhar = {
          aadharNo: aadharNo,
          aadharFile: aadharFile,
        };
      }

      if (aadharNo && aadharFileBack) {
        aadharBack = {
          aadharNo: aadharNo,
          aadharFileBack: aadharFileBack,
        };
      }

      if (gstNo && gstFile) {
        gst = {
          gstNo: gstNo,
          gstFile: gstFile,
        };
      }

      console.log({ gstFile, aadharFile, aadharFileBack });

      const userId = generateRandomHexString(10);

      const isUserIdExists = await prisma.user.findFirst({
        where: { userId: userId },
      });
      if (isUserIdExists) throw new Conflict("Unable to create user try again");

      await UserFunction.createUser(
        {
          name,
          email,
          password,
          avatar,
          avatarPath,
          role,
          gender,
          phone,
          companyName,
          companyHeadquarter,
          businessAddress,
          Categories: categoriesIds
            ? {
                connect: categoriesIds,
              }
            : undefined,
          userId,
          businessName,
          businessType,
        },
        gst,
        aadhar,
        aadharBack,
        isManufacturer as string
      );
      res.json({
        success: true,
        msg: `Registration was successful. Thank you for signing up.`,
      });
    } catch (error) {
      next(error);
    }
  },
  async login(req, res, next) {
    try {
      const user = await UserFunction.loginUser(req.body);
      const { data, token } = user;
      const { password, ...rest } = data;
      res.json({
        success: true,
        msg: `Login successful`,
        data: {
          token,
          user: rest,
        },
      });
    } catch (error) {
      next(error);
    }
  },
  async changePassword(req, res, next) {
    try {
      const userId = req?.user?.id;
      const { oldPassword, newPassword } = req.body;
      await UserFunction.changeUserPassword({
        userId: userId as string,
        oldPassword: oldPassword as string,
        newPassword: newPassword as string,
      });
      res.json({
        success: true,
        msg: `Password changed successfully`,
      });
    } catch (error) {
      next(error);
    }
  },
  async self(req, res, next) {
    try {
      const userId = req.user?.id;
      const user = await UserFunction.selfData(userId);
      res.json({
        success: true,
        data: user,
      });
    } catch (error) {
      next(error);
    }
  },
  async update(req, res, next) {
    try {
      const { id } = req.params;
      await UserFunction.updateUser(req.body, id);
      res.json({
        success: true,
        msg: `Profile updated successfully`,
      });
    } catch (error) {
      next(error);
    }
  },
  async forgotPassword(req, res, next) {
    try {
      const email = req?.body?.email as string;
      // console.log({ email });
      await UserFunction.forgotPassword(email);
      res.json({
        success: true,
        msg: "Otp sent to email!!",
      });
    } catch (error) {
      next(error);
    }
  },
  async setNewPassword(req, res, next) {
    try {
      const { otp, password, email } = req?.body;

      await UserFunction.setPassword(otp, password, email);

      res.json({
        success: true,
        msg: "New password set successfully",
      });
    } catch (error) {
      next(error);
    }
  },
  async getAll(req, res, next) {
    try {
      const { page, limit, search, role } = req?.query;
      const { users, pagination } = await UserFunction.getAllAgg({
        page: typeof page === "string" ? Number(page) : undefined,
        limit: typeof limit === "string" ? Number(limit) : undefined,
        search: typeof search === "string" ? search : undefined,
        role: typeof role === "string" ? role : undefined,
      });
      res.json({
        success: true,
        data: users,
        pagination,
      });
    } catch (error) {
      next(error);
    }
  },
  async getById(req, res, next) {
    try {
      const user: any = await prisma.user.findUnique({
        where: { id: req.params.id },
        select: {
          name: true,
          email: true,
          avatar: true,
          avatarPath: true,
          role: true,
          phone: true,
          companyName: true,
          isBlocked: true,
          isVerified: true,
          userId: true,
          status: true,
          businessName: true,
          businessType: true,
          aadharNo: true,
          aadharFrontPath: true,
          aadharFrontUrl: true,
          aadharBackPath: true,
          aadharBackUrl: true,
          dob: true,
          empId: true,
          createdAt: true,

          gst: true,
          wallet: true,
          Addresses: true,
          Categories: true,

          ManagedManufacturers: {
            select: {
              name: true,
              id: true,
              email: true,
              phone: true,
            },
          },
          assignedManufacturer: {
            select: {
              name: true,
              id: true,
              email: true,
              phone: true,
            },
          },
          AssignedArea: true,
          DistributorsOnMe: true,
          // CompanyRep: true,
        },
      });
      if (!user) throw new NotFound("User not found");

      user.Manufacturers = user.ManagedManufacturers;
      user.CrManufacturer = user.assignedManufacturer;

      delete user.ManagedManufacturers;
      delete user.assignedManufacturer;
      res.json({
        success: true,
        data: user,
      });
    } catch (error) {
      next(error);
    }
  },
  async addDistributorOrCR(req, res, next) {
    try {
      const { isDistributor } = req?.query;

      const userId = generateRandomHexString(10);

      const isUserIdExists = await prisma.user.findFirst({
        where: { userId: userId },
      });
      if (isUserIdExists) throw new Conflict("Unable to create user try again");
      req.body.userId = userId;
      const user = await UserFunction.addDistributorOrCR(req.body, {
        isDistributor: isDistributor === "true" ? true : false,
      });

      return res.json({
        success: true,
        data: user,
      });
    } catch (error) {
      next(error);
    }
  },
  async updateMany(req, res, next) {
    try {
      const users = await prisma.user.findMany();

      for (const user of users) {
        await prisma.user.update({
          where: {
            id: user.id,
          },
          data: {
            status: true,
          },
        });
      }
      res.json({
        success: true,
        msg: "Users updated successfully",
      });
    } catch (error) {
      next(error);
    }
  },
  async delete(req, res, next) {
    try {
      const user = await UserFunction.delete(req.params.id);
      res.json({
        success: true,
        data: user,
        msg: "user deleted successfully",
      });
    } catch (error) {
      console.log(error);
      next(error);
    }
  },
  async deleteRecord(req, res, next) {
    try {
      const user = await prisma.user.delete({ where: { id: req.params.id } });
      res.json({
        success: true,
        data: user,
        msg: "user deleted successfully",
      });
    } catch (error) {
      console.log(error);
      next(error);
    }
  },
  async getAllDistributorAndCR(req, res, next) {
    try {
      const currUser = req.user;

      // const restrict = [""]
      const {
        page,
        limit,
        search,
        role,
        state,
        district,
        city,
        zip,
        isVerified,
      } = req?.query;
      const { users, pagination } = await UserFunction.allDistributorAndCR({
        page: typeof page === "string" ? Number(page) : undefined,
        limit: typeof limit === "string" ? Number(limit) : undefined,
        search: typeof search === "string" ? search : undefined,
        role: typeof role === "string" ? role : undefined,
        state: typeof state === "string" ? state : undefined,
        district: typeof district === "string" ? district : undefined,
        city: typeof city === "string" ? city : undefined,
        zip: typeof zip === "string" ? zip : undefined,
        isVerified: isVerified === "true" ? true : false,
        userId: currUser?.id as string,
      });
      res.json({
        success: true,
        data: users,
        pagination,
      });
    } catch (error) {
      next(error);
    }
  },
  async downloadFile(req, res, next) {
    try {
      // const { fileUrl } = req?.body;
      // if (!fileUrl) throw NotFound("File not found");

      const fileUrl = "https://example.com/path/to/your/file.ext"; // Replace this with your file URL
      const fileName = "downloaded_file.ext"; // Change the name of the downloaded file if needed

      console.log({ fileUrl, fileName });

      const file = fs.createWriteStream(fileName);

      https
        .get(fileUrl, function (response) {
          console.log({ response });
          response.pipe(file);

          file.on("finish", function () {
            file.close(function () {
              res.download(`/../../${fileName}`, fileName, function (err) {
                if (err) {
                  console.log("if error downloading file--->");
                  console.error(err);
                  res.status(500).send("Internal Server Error");
                } else {
                  fs.unlink(fileName, function (err) {
                    console.log("if no error");
                    if (err) {
                      console.error(err);
                    }
                  });
                }
              });
            });
          });
        })
        .on("error", function (err) {
          fs.unlink(fileName, function (err) {
            if (err) {
              console.error(err);
            }
          });
          console.error(err);
          res.status(500).send("Internal Server Error");
        });

      res.download(fileUrl);
    } catch (error) {
      next(error);
    }
  },
};
