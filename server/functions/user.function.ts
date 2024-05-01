import { Prisma } from "@prisma/client";
import { configs, prisma } from "../configs";
import {
  Conflict,
  Forbidden,
  NotFound,
  Unauthorized,
  NotAcceptable,
} from "http-errors";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
// import { cryptoRandomStringAsync } from "crypto-random-string";
import { UploadedFile } from "express-fileupload";
import { emailService } from "../services/email.service";
import {
  forgotPassword,
  addUser,
  addUserCr,
  UserSignUp,
} from "../Templates/template";
import { generateRandomHexString, getPassword } from "../utils";
import MediaService from "../services/media.service";
import { pushNotification } from "../services/notification.service";

export const UserFunction = {
  async createUser(
    inputData: Prisma.UserCreateInput & {
      businessName?: string;
      businessType?: string;
      companyHeadquarter?: string;
      businessAddress?: string;
      country?: string;
    },
    gstFile: any,
    aadharFile: any,
    aadharFileBack: any,
    isManufacturer: string
  ) {
    console.log({ inputData });
    const isEmailExists = await prisma.user.findFirst({
      where: {
        email: inputData.email,
        status: true,
      },
    });
    if (isEmailExists) throw new Conflict("Email already exists!");
    const { password, companyHeadquarter, businessAddress, country, ...rest } =
      inputData;
    const hashedPassword = await bcrypt.hash(password as string, 10);

    // console.log({ isManufacturer });
    // console.log(!aadharFile, !gstFile);

    if (
      isManufacturer !== "true" &&
      (!aadharFile || !gstFile || !aadharFileBack)
    ) {
      throw new NotAcceptable(
        "gst no, gst file and aadhar no, aadhar file are required"
      );
    }

    const addressLine = inputData?.companyHeadquarter
      ? inputData?.businessAddress
        ? inputData.businessAddress
        : inputData.companyHeadquarter
      : undefined;
    console.log({ addressLine, rest });

    let aadharFilePath,
      aadharFileUrl,
      gstFilePath,
      gstFileUrl,
      aadharFileBackPath,
      aadharFileBackUrl;

    if (aadharFile) {
      const file = await new MediaService().uploadMedia(
        aadharFile.aadharFile,
        "aadhar"
      );
      aadharFilePath = file.path;
      aadharFileUrl = file.url;
    }

    if (aadharFileBack) {
      const file = await new MediaService().uploadMedia(
        aadharFileBack.aadharFileBack,
        "aadhar"
      );
      aadharFileBackPath = file.path;
      aadharFileBackUrl = file.url;
    }

    if (aadharFile && (!aadharFilePath || !aadharFileUrl))
      throw new Error("Aadhar file could not uploaded! please try again!");

    if (gstFile) {
      const file = await new MediaService().uploadMedia(gstFile.gstFile, "gst");
      gstFilePath = file.path;
      gstFileUrl = file.url;
    }

    console.log({ aadharFileBackPath, aadharFileBackUrl });

    if (gstFile && (!gstFilePath || !gstFileUrl))
      throw new Error("Gst file could not uploaded! please try again!");

    const user = await prisma.user.create({
      data: {
        ...rest,
        aadharNo: aadharFile.aadharNo,
        aadharFrontPath: aadharFilePath ? aadharFilePath : undefined,
        aadharFrontUrl: aadharFileUrl ? aadharFileUrl : undefined,
        aadharBackPath: aadharFileBackPath ? aadharFileBackPath : undefined,
        aadharBackUrl: aadharFileBackUrl ? aadharFileBackUrl : undefined,
        gst: gstFile
          ? {
              create: {
                gstNo: gstFile.gstNo,
                gstFilePath,
                gstFileUrl,
              },
            }
          : undefined,

        role: isManufacturer === "true" ? "MANUFACTURER" : "RETAILER",
        password: hashedPassword,
        wallet: {
          create: {
            point: 0,
          },
        },
      },
      include: {
        Categories: true,
      },
    });

    // console.log({ user: JSON.stringify(user.Categories) });

    //create adddress

    const address = await prisma.address.create({
      data: {
        addressLineOne: addressLine ? addressLine : null,
        country: country ? country : null,
        type: "HEADQUARTER",
        customer: {
          connect: {
            id: user.id,
          },
        },
      },
    });
    console.log({ user });
    return user;
  },
  async loginUser(inputData: Prisma.UserCreateInput) {
    const { email, password } = inputData;
    const user = await prisma.user.findFirst({
      where: {
        email: email,
      },
    });

    if (!user) throw new NotFound("Invalid login attempt. User not found");
    if (user.isBlocked) throw new Forbidden("You account has blocked.");
    if (!user.isVerified) throw new NotAcceptable("You are not verified yet");
    const isPasswordValid = await bcrypt.compare(
      password as string,
      user.password as string
    );
    if (!isPasswordValid) throw new Unauthorized("Invalid password");

    const token = jwt.sign({ userId: user.id }, configs.JWT_SECRET);
    await prisma.user.update({
      where: { id: user.id },
      data: { lastLogin: new Date().toISOString() },
    });

    return {
      data: user,
      token,
    };
  },
  async changeUserPassword({
    userId,
    oldPassword,
    newPassword,
  }: {
    userId: string;
    oldPassword: string;
    newPassword: string;
  }) {
    const user = await prisma.user.findFirst({
      where: {
        id: userId,
      },
    });
    if (!user) throw new NotFound("User not found.");
    const isPasswordValid = await bcrypt.compare(
      oldPassword,
      user.password as string
    );
    if (!isPasswordValid) throw new Unauthorized("Incorrect Old password.");

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    const updatePassword = await prisma.user.update({
      where: {
        id: userId,
      },
      data: {
        password: hashedPassword,
      },
    });
    return updatePassword;
  },
  async forgotPassword(email: string) {
    const isUserExist = await prisma.user.findFirst({
      where: {
        email,
      },
    });
    if (!isUserExist) throw new NotFound("User not found");
    let otp = Math.floor(Math.random() * 999999);

    otp = Number(otp.toString().padEnd(6, "0"));

    console.log({ otp });

    const currentDate = new Date();

    const otpExpiry = new Date(
      currentDate.setSeconds(currentDate.getSeconds() + 620)
    );

    await prisma.user.update({
      where: {
        id: isUserExist.id,
      },
      data: {
        otp,
        otpExpiry,
      },
    });

    const subject = "Password Reset";
    const template = forgotPassword(otp);
    emailService.sendMail(email, subject, template);
    return;
  },
  async setPassword(otp: string, newPassword: string, email: string) {
    const isUserExist = await prisma.user.findFirst({
      where: {
        email,
      },
    });
    if (!isUserExist) throw new NotFound("User not found");

    if (isUserExist.otp !== Number(otp)) {
      throw new NotFound("Invalid otp");
    }

    if ((isUserExist.otpExpiry as Date) < new Date())
      throw new NotAcceptable("otp has expired please resend otp!");

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await prisma.user.update({
      where: {
        id: isUserExist.id,
      },
      data: {
        password: hashedPassword,
      },
    });
  },
  async updateUser(inputData: Prisma.UserCreateInput, id: string) {
    console.log({ inputData });
    const isUserExist = await prisma.user.findUnique({
      where: {
        id,
      },
    });
    if (!isUserExist) throw new NotFound("User not found");
    const { fcmToken, ...rest } = inputData;
    const web = fcmToken?.web;
    const ios = fcmToken?.ios;
    const android = fcmToken?.android;
    const user = await prisma.user.update({
      where: { id },
      data: {
        ...rest,
        fcmToken: {
          web: web || isUserExist?.fcmToken?.web,
          ios: ios || isUserExist?.fcmToken?.ios,
          android: android || isUserExist?.fcmToken?.android,
        },
      },
    });
    if (inputData?.isVerified) {
      await pushNotification({
        title: `Welcome to viloop`,
        body: `Congratulation you have been verified successfully`,
        userIds: [user?.id as string],
        saveToDb: true,
      });
    }
    return user;
  },
  async selfData(id: string | undefined) {
    const user = await prisma.user.findUnique({
      where: {
        id: id,
      },
      select: {
        id: true,
        name: true,
        email: true,
        avatar: true,
        avatarPath: true,
        role: true,
        isBlocked: true,
        isVerified: true,
        fcmToken: true,
        lastLogin: true,
        createdAt: true,
        updatedAt: true,
        phone: true,
        gst: true,

        wallet: true,
      },
    });
    if (!user) throw new NotFound("Account not found");
    return user;
  },

  async getAll({
    page,
    limit,
    search,
    userId,
    role,
  }: {
    page?: number;
    limit?: number;
    search?: string;
    userId?: string;
    role?: string;
  }) {
    const searchArgs = {
      OR: [
        { name: { contains: search, mode: "insensitive" } },
        { email: { contains: search, mode: "insensitive" } },
        { phone: { contains: search, mode: "insensitive" } },
        { companyName: { contains: search, mode: "insensitive" } },
        { businessName: { contains: search, mode: "insensitive" } },
        { businessType: { contains: search, mode: "insensitive" } },
        { gst: { gstNo: { contains: search, mode: "insensitive" } } },
        { aadhar: { aadharNo: { contains: search, mode: "insensitive" } } },
      ],
    };

    const filter = [];

    userId && filter.push({ id: userId });
    role && filter.push({ role: role });
    filter.push({ status: true });

    if (search) {
    }
    const where: any =
      search || filter.length
        ? {
            AND: [...filter],
          }
        : {};

    console.log("where", JSON.stringify(where));

    let users;

    if (page && limit) {
      users = await prisma.user.findMany({
        where,
        orderBy: {
          createdAt: "desc",
        },
        skip: (page - 1) * limit,
        take: limit,
        select: {
          gst: true,

          Categories: true,
          Addresses: true,
          wallet: true,
        },
      });
    } else {
      users = await prisma.user.findMany({
        where,
        orderBy: {
          createdAt: "desc",
        },
        include: {
          gst: true,

          Categories: true,
          Addresses: true,
          wallet: true,
        },
      });
    }

    return { users, pagination: { page, limit, total: users.length } };
  },

  async getAllAgg({
    page,
    limit,
    search,
    userId,
    role,
  }: {
    page?: number;
    limit?: number;
    search?: string;
    userId?: string;
    role?: string;
  }) {
    const paginationArgs = [];

    const filter = [];

    const match = [];

    if (page) {
      console.log({ page });
      paginationArgs.push({
        $skip: (limit || 0) * (page - 1),
      });
    }
    if (limit) {
      paginationArgs.push({
        $limit: limit || 0,
      });
    }

    if (userId) {
      filter.push({
        $eq: ["$id", userId],
      });
    }

    if (role) {
      filter.push({
        $eq: ["$role", role],
      });
    }

    if (filter.length) {
      match.push({
        $match: {
          $expr: {
            $and: [...filter],
          },
        },
      });
    }

    const aggregationArgs = [
      {
        $match: {
          status: true,
        },
      },
      //----------------------------------------------------------------CATEGORIES----------------------------------------------------------------
      {
        $lookup: {
          from: "CATEGORIES",
          as: "Categories",
          localField: "categoriesIds",
          foreignField: "userIds",
          pipeline: [
            {
              $project: {
                _id: 0,
                id: {
                  $toString: "$_id",
                },
                title: 1,
                slug: 1,
                description: 1,
                imageUrl: 1,
                imagePath: 1,
                // icon: 1,
                // isFeatured: 1,
                // isPublished: 1,
                createdAt: {
                  $toString: "$createdAt",
                },
                updatedAt: {
                  $toString: "$createdAt",
                },
                // metaTitle: 1,
                // metaDesc: 1,
                // metaKeywords: 1,
                status: 1,

                parentCategoryId: 1,
              },
            },
          ],
        },
      },

      //----------------------------------------------------------------ADDRESSES----------------------------------------------------------------
      {
        $lookup: {
          from: "ADDRESSES",
          as: "Addresses",
          localField: "_id",
          foreignField: "customerId",
          pipeline: [
            {
              $project: {
                _id: 0,
                id: {
                  $toString: "$_id",
                },
                type: 1,
                name: 1,
                phone: 1,
                zip: 1,
                city: 1,
                state: 1,
                country: 1,
                addressLineOne: 1,
                addressLineTwo: 1,
                landmark: 1,
                isDefault: 1,
                status: 1,
                createdAt: {
                  $toString: "$createdAt",
                },
                updatedAt: {
                  $toString: "$createdAt",
                },
              },
            },
          ],
        },
      },

      //----------------------------------------------------------------WALLET----------------------------------------------------------------
      {
        $lookup: {
          from: "WALLET",
          as: "wallet",
          localField: "_id",
          foreignField: "customerId",
          pipeline: [
            {
              $project: {
                _id: 0,
                id: {
                  $toString: "$_id",
                },
                point: 1,
                userId: 1,
                createdAt: {
                  $toString: "$createdAt",
                },
                updatedAt: {
                  $toString: "$createdAt",
                },
              },
            },
          ],
        },
      },

      //----------------------------------------------------------------MANUFACTURERS----------------------------------------------------------------
      {
        $lookup: {
          from: "USERS",
          as: "Manufacturers",
          localField: "managedManufacturersIds",
          foreignField: "_id",
          pipeline: [
            {
              $project: {
                _id: 0,
                id: {
                  $toString: "$_id",
                },
                name: 1,
                email: 1,
                phone: 1,
                address: "$address.addressLineOne",
              },
            },
          ],
        },
      },

      //----------------------------------------------------------------DISTRIBUTORS----------------------------------------------------------------
      {
        $lookup: {
          from: "USERS",
          as: "Distributors",
          localField: "distributorsOnMeIds",
          foreignField: "_id",
          pipeline: [
            {
              $project: {
                _id: 0,
                id: {
                  $toString: "$_id",
                },
                name: 1,
                email: 1,
                phone: 1,
                address: "$address.addressLineOne",
              },
            },
          ],
        },
      },

      //----------------------------------------------------------------COMPANY REPRESENTATIVE MANAFACTURERS----------------------------------------------------------------
      {
        $lookup: {
          from: "USERS",
          as: "CrManufacturer",
          localField: "assignedManufacturerId",
          foreignField: "_id",
          pipeline: [
            {
              $project: {
                _id: 0,
                id: {
                  $toString: "$_id",
                },
                name: 1,
                email: 1,
                phone: 1,
                address: "$address.addressLineOne",
              },
            },
          ],
        },
      },

      //----------------------------------------------------------------COMMISSION----------------------------------------------------------------
      {
        $lookup: {
          from: "COMMISSION",
          as: "Commission",
          localField: "_id",
          foreignField: "userId",
          pipeline: [
            {
              $project: {
                _id: 0,
                id: {
                  $toString: "$_id",
                },
                amount: 1,
                createdAt: { $toString: "$createdAt" },
              },
            },
          ],
        },
      },

      //----------------------------------------------------------------DISTRIBUTOR COMMISSION----------------------------------------------------------------
      {
        $lookup: {
          from: "COMMISSION_DISTRIBUTOR",
          as: "CommissionDistributor",
          localField: "_id",
          foreignField: "userId",
          pipeline: [
            {
              $project: {
                _id: 0,
                id: {
                  $toString: "$_id",
                },
                amount: 1,
                createdAt: { $toString: "$createdAt" },
              },
            },
          ],
        },
      },
      //----------------------------------------------------------------PROJECTION----------------------------------------------------------------
      {
        $project: {
          _id: 0,
          id: {
            $toString: "$_id",
          },
          name: 1,
          email: 1,
          avatar: 1,
          avatarPath: 1,
          role: 1,
          phone: 1,
          companyName: 1,
          isBlocked: 1,
          isVerified: 1,
          createdAt: {
            $toString: "$createdAt",
          },
          updatedAt: {
            $toString: "$createdAt",
          },
          lastLogin: {
            $toString: "$createdAt",
          },
          userId: 1,
          status: 1,
          businessName: 1,
          businessType: 1,
          dob: 1,
          empId: 1,
          // categoriesIds: 1,

          Categories: 1,
          Addresses: 1,
          Manufacturers: 1,
          Distributors: 1,
          CrManufacturer: { $arrayElemAt: ["$CrManufacturer", 0] },
          Commission: { $arrayElemAt: ["$Commission", 0] },
          CommissionDistributor: {
            $arrayElemAt: ["$CommissionDistributor", 0],
          },

          wallet: {
            $arrayElemAt: ["$wallet", 0],
          },
        },
      },

      ...match,
    ];

    const [users, totalDataCount]: any = await Promise.all([
      prisma.user.aggregateRaw({
        pipeline: [...aggregationArgs, ...paginationArgs],
      }),
      prisma.user.aggregateRaw({
        pipeline: [...aggregationArgs, { $count: "total" }],
      }),
    ]);
    return {
      users,
      pagination: { totalCount: totalDataCount[0]?.total, page, limit },
    };
  },
  async addDistributorOrCR(
    input: Prisma.UserCreateInput & {
      manufacturerIds: string | string[];
      storeAddress: string;
    },
    { isDistributor }: { isDistributor: boolean }
  ) {
    const { storeAddress, password, manufacturerIds, dob, ...rest } = input;

    console.log("input", input);

    let manfacturerIdsCreate;
    if (Array.isArray(manufacturerIds)) {
      manfacturerIdsCreate = manufacturerIds.map((id) => ({ id: id }));
    } else {
      manfacturerIdsCreate = manufacturerIds;
    }

    console.log({ manfacturerIdsCreate });

    const isEmailExists = await prisma.user.findFirst({
      where: {
        email: input.email,
      },
    });
    if (isEmailExists) throw new Conflict("Email already exists!");

    const generatedPassword = getPassword(
      input.name,
      new Date(input.dob as string)
    );

    const hashedPassword = password
      ? await bcrypt.hash(password, 10)
      : await bcrypt.hash(generatedPassword, 10);

    const user = await prisma.user.create({
      data: {
        ...rest,
        dob: dob ? new Date(dob as string | Date) : null,
        role: isDistributor ? "DISTRIBUTOR" : "COMPANY_REPRESENTATIVE",
        Addresses: {
          create: {
            addressLineOne: storeAddress,
            type: "HEADQUARTER",
          },
        },
        password: hashedPassword,
        wallet: {
          create: {
            point: 0,
          },
        },
        assignedManufacturer: isDistributor
          ? undefined
          : { connect: { id: manfacturerIdsCreate as string } },
        ManagedManufacturers: isDistributor
          ? Array.isArray(manfacturerIdsCreate)
            ? {
                connect: [...manfacturerIdsCreate],
              }
            : {
                connect: {
                  id: manfacturerIdsCreate,
                },
              }
          : undefined,
      },
      include: {
        ManagedManufacturers: true,
        DistributorsOnMe: true,
      },
    });

    console.log({ user });

    if (!isDistributor) {
      const subject = "Welcome To Viloop";
      const template = addUserCr(
        user.name,
        user.email,
        user.role,
        generatedPassword
      );
      emailService.sendMail(user.email, subject, template);
    } else {
      const subject = "Welcome To Viloop";
      const template = addUser(user.name, user.email, user.role);
      emailService.sendMail(user.email, subject, template);
    }

    // if (user.role === "COMPANY_REPRESENTATIVE") {
    //   console.log("inside comapny");
    //   const manufacturerIds = input?.manufacturerIds as string;
    //   await prisma.user.update({
    //     where: {
    //       id: user.id,
    //     },
    //     data: {
    //       assignedManufacturerId: manufacturerIds,
    //     },
    //   });
    //   const subject = "Welcome To Viloop";
    //   const template = addUser(user.name, user.email, user.role);
    //   emailService.sendMail(user.email, subject, template);
    // } else if (user.role === "DISTRIBUTOR") {
    //   const manufacturerIds = input?.manufacturerIds;
    //   console.log({ manufacturerIds });
    //   if (manufacturerIds.length) {
    //     for (const manufacturerId of manufacturerIds) {
    //       await prisma.distributorManufacturer.create({
    //         data: {
    //           distributor: {
    //             connect: {
    //               id: user.id,
    //             },
    //           },
    //           manufacturer: {
    //             connect: {
    //               id: manufacturerId,
    //             },
    //           },
    //         },
    //       });
    //     }
    //   }
    //   const subject = "Welcome To Viloop";
    //   const template = UserSignUp(user.name, user.email);
    //   emailService.sendMail(user.email, subject, template);
    // }

    return user;
  },
  async delete(id: string) {
    const user = await prisma.user.findUnique({
      where: { id },
      include: {
        AssignedArea: true,
        Addresses: true,
      },
    });
    if (!user) throw new NotFound("User not found");

    // // DELETE ADDRESSES
    // await prisma.address.deleteMany({
    //   where: { customerId: user.id },
    // });

    // await prisma.address.deleteMany({
    //   where: { assignedUserId: user.id },
    // });

    const deletedUser = await prisma.user.update({
      where: { id },
      data: {
        status: false,
      },
    });
    return deletedUser;
  },

  async allDistributorAndCR({
    page,
    limit,
    search,
    role,
    userId,
    state,
    district,
    city,
    zip,
    isVerified,
  }: {
    page?: number;
    limit?: number;
    search?: string;
    role?: string;
    userId: string;
    state?: string;
    district?: string;
    city?: string;
    zip?: string;
    isVerified: boolean;
  }) {
    const paginationArgs = [];

    const filter = [];

    const match = [];

    const roleMatch = [];

    if (isVerified === false || isVerified) {
      filter.push({
        $eq: ["$isVerified", isVerified],
      });
    }

    if (!role) {
      console.log("not role");
      roleMatch.push(
        {
          $addFields: {
            managedManufacturersIds: {
              $map: {
                input: "$managedManufacturersIds",
                as: "manufacturerId",
                in: { $toString: "$$manufacturerId" },
              },
            },
          },
        },
        {
          $match: {
            $expr: {
              $cond: [
                { $eq: ["$role", "DISTRIBUTOR"] },
                {
                  $in: [userId, "$managedManufacturersIds"],
                },
                {
                  $eq: [{ $toString: "$assignedManufacturerId" }, userId],
                },
              ],
            },
          },
        },
        {
          $match: {
            $expr: {
              $and: [{ $eq: ["$status", true] }],
            },
          },
        }
      );
    }
    if (role && role === "DISTRIBUTOR") {
      roleMatch.push(
        {
          $addFields: {
            managedManufacturersIds: {
              $map: {
                input: "$managedManufacturersIds",
                as: "manufacturerId",
                in: { $toString: "$$manufacturerId" },
              },
            },
          },
        },
        {
          $match: {
            $expr: {
              $and: [
                {
                  $in: [userId, "$managedManufacturersIds"],
                },
                {
                  $eq: ["$role", "DISTRIBUTOR"],
                },
                {
                  $eq: ["$status", true],
                },
              ],
            },
          },
        }
      );
    }
    if (role && role === "COMPANY_REPRESENTATIVE") {
      console.log("role match ---->", userId);
      roleMatch.push({
        $match: {
          $expr: {
            $and: [
              {
                $eq: [{ $toString: "$assignedManufacturerId" }, userId],
              },
              {
                $eq: ["$role", "COMPANY_REPRESENTATIVE"],
              },
              {
                $eq: ["$status", true],
              },
            ],
          },
        },
      });
    }

    if (state) {
      console.log({ state });
      filter.push({
        $in: [state.toUpperCase(), "$AssignedArea.state"],
      });
    }
    if (district) {
      filter.push({
        $in: [district.toUpperCase(), "$AssignedArea.district"],
      });
    }
    if (city) {
      filter.push({
        $in: [city.toUpperCase(), "$AssignedArea.city"],
      });
    }
    if (zip) {
      filter.push({
        $in: [zip, "$AssignedArea.zip"],
      });
    }

    if (page) {
      console.log({ page });
      paginationArgs.push({
        $skip: (limit || 0) * (page - 1),
      });
    }
    if (limit) {
      paginationArgs.push({
        $limit: limit || 0,
      });
    }

    if (filter.length) {
      match.push({
        $match: {
          $expr: {
            $and: [...filter],
          },
        },
      });
    }

    console.log("match--->", JSON.stringify(match));

    const aggregationArgs = [
      ...roleMatch,
      //----------------------------------------------------------------CATEGORIES----------------------------------------------------------------
      {
        $lookup: {
          from: "CATEGORIES",
          as: "Categories",
          localField: "categoriesIds",
          foreignField: "userIds",
          pipeline: [
            {
              $project: {
                _id: 0,
                id: {
                  $toString: "$_id",
                },
                title: 1,
                slug: 1,
                description: 1,
                imageUrl: 1,
                imagePath: 1,
                // icon: 1,
                // isFeatured: 1,
                // isPublished: 1,
                createdAt: {
                  $toString: "$createdAt",
                },
                updatedAt: {
                  $toString: "$createdAt",
                },
                // metaTitle: 1,
                // metaDesc: 1,
                // metaKeywords: 1,
                status: 1,

                parentCategoryId: 1,
              },
            },
          ],
        },
      },

      //----------------------------------------------------------------ADDRESSES----------------------------------------------------------------
      {
        $lookup: {
          from: "ADDRESSES",
          as: "Addresses",
          localField: "_id",
          foreignField: "customerId",
          pipeline: [
            {
              $project: {
                _id: 0,
                id: {
                  $toString: "$_id",
                },
                type: 1,
                name: 1,
                phone: 1,
                zip: 1,
                city: 1,
                state: 1,
                country: 1,
                addressLineOne: 1,
                addressLineTwo: 1,
                landmark: 1,
                isDefault: 1,
                status: 1,
                createdAt: {
                  $toString: "$createdAt",
                },
                updatedAt: {
                  $toString: "$createdAt",
                },
              },
            },
          ],
        },
      },

      //----------------------------------------------------------------MANUFACTURERS----------------------------------------------------------------
      {
        $lookup: {
          from: "USERS",
          as: "Manufacturers",
          localField: "managedManufacturersIds",
          foreignField: "_id",
          pipeline: [
            {
              $project: {
                _id: 0,
                id: {
                  $toString: "$_id",
                },
                name: 1,
                email: 1,
                phone: 1,
              },
            },
          ],
        },
      },

      // //----------------------------------------------------------------ASSIGNED AREA----------------------------------------------------------------
      // //----------------------------------------------------------------ADDRESSES----------------------------------------------------------------
      {
        $lookup: {
          from: "ADDRESSES",
          as: "AssignedArea",
          localField: "_id",
          foreignField: "assignedUserId",
          pipeline: [
            {
              $project: {
                _id: 0,
                id: {
                  $toString: "$_id",
                },
                type: 1,
                name: 1,
                phone: 1,
                zip: 1,
                city: 1,
                state: 1,
                district: 1,
                country: 1,
                addressLineOne: 1,
                addressLineTwo: 1,
                landmark: 1,
                isDefault: 1,
                status: 1,
                createdAt: {
                  $toString: "$createdAt",
                },
                updatedAt: {
                  $toString: "$createdAt",
                },
              },
            },
          ],
        },
      },
      {
        $project: {
          _id: 0,
          id: { $toString: "$_id" },
          name: "$name",
          email: "$email",

          role: 1,
          phone: "$phone",
          // companyName: 1,
          isBlocked: "$isBlocked",
          isVerified: "$isVerified",
          createdAt: "$createdAt",
          updatedAt: "$updatedAt",
          lastLogin: "$lastLogin",
          userId: "$userId",
          status: "$status",
          manufacturerIds: "$managedManufacturersIds",

          dob: 1,
          empId: 1,
          // categoriesIds: 1,

          // Categories: 1,
          // Addresses: 1,
          // Manufacturers: 1,
          // manufacturersIds: {
          //   $map: {
          //     input: "$Manufacturers",
          //     as: "manufacturer",
          //     in: { $toString: "$$manufacturer.id" },
          //   },
          // },
          // Distributors: 1,
          // CrManufacturer: 1,
          AssignedArea: 1,
          // Distributors: 1,
        },
      },

      ...match,
    ];

    const [users, totalDataCount]: any = await Promise.all([
      prisma.user.aggregateRaw({
        pipeline: [...aggregationArgs, ...paginationArgs],
      }),
      prisma.user.aggregateRaw({
        pipeline: [...aggregationArgs, { $count: "total" }],
      }),
    ]);
    return {
      users,
      pagination: { totalCount: totalDataCount[0]?.total, page, limit },
    };
  },
};
