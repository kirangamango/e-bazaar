import { Prisma } from "@prisma/client";
import { prisma } from "../configs";
import { Conflict, NotFound } from "http-errors";

export const AnalyticsFunction = {
  async getAnalytics({
    page,
    limit,
    search,
    userId,
    startDate,
    endDate,
    productId,
    orderId,
    status,
  }: {
    page?: number;
    limit?: number;
    search?: string;
    userId?: string;
    startDate?: Date;
    endDate?: Date;
    productId?: string;
    orderId?: string;
    status?: string;
  }) {
    const paginationArgs = [];

    const filter = [];
    const match = [];

    if (startDate && endDate) {
      filter.push(
        {
          $addFields: {
            startDate: {
              $dateFromParts: {
                year: new Date(startDate).getFullYear(),
                month: new Date(startDate).getMonth() + 1,
                day: new Date(startDate).getDate(),
                hour: new Date(startDate).getHours(),
                minute: new Date(startDate).getMinutes(),
                timezone: "Asia/Kolkata",
              },
            },
            endDate: {
              $dateFromParts: {
                year: new Date(endDate).getFullYear(),
                month: new Date(endDate).getMonth() + 1,
                day: new Date(endDate).getDate(),
                hour: new Date(endDate).getHours(),
                minute: new Date(endDate).getMinutes(),
                timezone: "Asia/Kolkata",
              },
            },
          },
        },
        {
          $match: {
            $expr: {
              $and: [
                {
                  $gte: ["$createdAt", startDate],
                },
                {
                  $lte: ["$createdAt", endDate],
                },
              ],
            },
          },
        }
      );
    } else if (startDate) {
      filter.push(
        {
          $addFields: {
            startDate: {
              $dateFromParts: {
                year: new Date(startDate).getFullYear(),
                month: new Date(startDate).getMonth() + 1,
                day: new Date(startDate).getDate(),
                hour: new Date(startDate).getHours(),
                minute: new Date(startDate).getMinutes(),
                timezone: "Asia/Kolkata",
              },
            },
          },
        },
        {
          $match: {
            $expr: {
              $and: [
                {
                  $gte: ["$createdAt", startDate],
                },
              ],
            },
          },
        }
      );
    } else if (endDate) {
      filter.push(
        {
          $addFields: {
            endDate: {
              $dateFromParts: {
                year: new Date(endDate).getFullYear(),
                month: new Date(endDate).getMonth() + 1,
                day: new Date(endDate).getDate(),
                hour: new Date(endDate).getHours(),
                minute: new Date(endDate).getMinutes(),
                timezone: "Asia/Kolkata",
              },
            },
          },
        },
        {
          $match: {
            $expr: {
              $lte: ["$createdAt", endDate],
            },
          },
        }
      );
    }

    if (userId) {
      console.log("userId", userId);
      filter.push({
        $eq: ["$customer.id", userId],
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

    //----------------------------------------------------------------RETAILERS----------------------------------------------------------------
    const retailers = await prisma.user.findMany({
      where: {
        isVerified: true,
        status: true,
        role: "RETAILER",
      },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        Orders: true,
      },
    });

    //----------------------------------------------------------------MANUFACUTRERS-------------------------------------------------------------
    const manfacturers = await prisma.user.findMany({
      where: {
        isVerified: true,
        status: true,
        role: "MANUFACTURER",
      },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        Orders: true,
      },
    });

    //----------------------------------------------------------------DISTRIBUTORS--------------------------------------------------------------
    const distributors = await prisma.user.findMany({
      where: {
        isVerified: true,
        status: true,
        role: "DISTRIBUTOR",
      },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        Orders: true,
      },
    });

    //----------------------------------------------------------------COMPANY REPRESENTATIVES---------------------------------------------------
    const companyRep = await prisma.user.findMany({
      where: {
        isVerified: true,
        status: true,
        role: "COMPANY_REPRESENTATIVE",
      },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        Orders: true,
      },
    });

    //----------------------------------------------------------------MANUFACUTRERS-------------------------------------------------------------
    const aggArgsManufacturer = [
      //----------------------------------------------------------------MATCH ACIVE MANFACUTRERS------------------------------------------------
      {
        $match: {
          $expr: {
            $and: [
              {
                $eq: ["$isVerified", true],
              },
              {
                $eq: ["$status", true],
              },
              {
                $eq: ["$role", "MANUFACTURER"],
              },
            ],
          },
        },
      },

      //----------------------------------------------------------------ORDER ITEMS------------------------------------------------
      {
        $lookup: {
          from: "ORDER_ITEMS",
          as: "orderedItems",
          localField: "_id",
          foreignField: "orderId",
          pipeline: [
            {
              $lookup: {
                from: "PRODUCTS",
                as: "product",
                localField: "productId",
                foreignField: "_id",
                pipeline: [
                  {
                    $addFields: {
                      id: {
                        $toString: "$_id",
                      },
                    },
                  },
                ],
              },
            },
            {
              $unwind: {
                path: "$product",
                preserveNullAndEmptyArrays: true,
              },
            },

            {
              $project: {
                _id: 0,
                id: {
                  $toString: "$_id",
                },
                quantity: 1,
                price: 1,
                productId: "$product.id",
                title: "$product.title",
                description: "$product.description",
                slug: "$product.slug",
                measureType: "$product.measureType",
                measureUnit: "$product.measureUnit",
                color: "$product.color",
                size: "$product.size",
                regularPrice: "$product.regularPrice",
                salePrice: "$product.salePrice",
                stock: "$product.stock",
                isParentProduct: "$product.isParentProduct",
                ratingAvg: "$product.ratingAvg",
                reviewCount: "$product.reviewCount",
                status: "$product.status",
                imageUrl: "$product.imageUrl",
                imagePath: "$product.imagePath",
              },
            },
          ],
        },
      },
    ];

    //----------------------------------------------------------------RETAILERS----------------------------------------------------------------
    const aggArgsRetailer = [
      //----------------------------------------------------------------MATCH ACIVE RETAILERS------------------------------------------------
      {
        $match: {
          $expr: {
            $and: [
              {
                $eq: ["$isVerified", true],
              },
              {
                $eq: ["$status", true],
              },
              {
                $eq: ["$role", "RETAILER"],
              },
            ],
          },
        },
      },

      //----------------------------------------------------------------ORDERs------------------------------------------------
      {
        $lookup: {
          from: "ORDERS",
          as: "orders",
          localField: "_id",
          foreignField: "customerId",
          pipeline: [
            {
              $lookup: {
                from: "ORDER_ITEMS",
                as: "orderedItems",
                localField: "_id",
                foreignField: "orderId",
                pipeline: [
                  {
                    $lookup: {
                      from: "PRODUCTS",
                      as: "product",
                      localField: "productId",
                      foreignField: "_id",
                      pipeline: [
                        {
                          $addFields: {
                            id: {
                              $toString: "$_id",
                            },
                          },
                        },
                      ],
                    },
                  },
                  {
                    $unwind: {
                      path: "$product",
                      preserveNullAndEmptyArrays: true,
                    },
                  },

                  {
                    $project: {
                      _id: 0,
                      id: {
                        $toString: "$_id",
                      },
                      quantity: 1,
                      price: 1,
                      productId: "$product.id",
                      title: "$product.title",
                      description: "$product.description",
                      slug: "$product.slug",
                      measureType: "$product.measureType",
                      measureUnit: "$product.measureUnit",
                      color: "$product.color",
                      size: "$product.size",
                      regularPrice: "$product.regularPrice",
                      salePrice: "$product.salePrice",
                      stock: "$product.stock",
                      isParentProduct: "$product.isParentProduct",
                      ratingAvg: "$product.ratingAvg",
                      reviewCount: "$product.reviewCount",
                      status: "$product.status",
                      imageUrl: "$product.imageUrl",
                      imagePath: "$product.imagePath",
                    },
                  },
                ],
              },
            },
          ],
        },
      },
    ];

    const aggregationArgs = [
      {
        $match: {
          activeStatus: true,
        },
      },
      //----------------------------------------------------------------CUSTOMERS----------------------------------------------------------------
      {
        $lookup: {
          from: "USERS",
          as: "customer",
          localField: "customerId",
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

      //----------------------------------------------------------------ADDRESS------------------------------------------------
      {
        $lookup: {
          from: "ADDRESSES",
          as: "address",
          localField: "deliveryAddressId",
          foreignField: "_id",
          pipeline: [
            {
              $addFields: {
                id: {
                  $toString: "$_id",
                },
              },
            },
          ],
        },
      },

      //----------------------------------------------------------------ORDER ITEMS------------------------------------------------
      {
        $lookup: {
          from: "ORDER_ITEMS",
          as: "orderedItems",
          localField: "_id",
          foreignField: "orderId",
          pipeline: [
            {
              $lookup: {
                from: "PRODUCTS",
                as: "product",
                localField: "productId",
                foreignField: "_id",
                pipeline: [
                  {
                    $addFields: {
                      id: {
                        $toString: "$_id",
                      },
                    },
                  },
                ],
              },
            },
            {
              $unwind: {
                path: "$product",
                preserveNullAndEmptyArrays: true,
              },
            },

            {
              $project: {
                id: {
                  $toString: "$_id",
                },
                quantity: 1,
                price: 1,
                productId: "$product.id",
                title: "$product.title",
                description: "$product.description",
                slug: "$product.slug",
                measureType: "$product.measureType",
                measureUnit: "$product.measureUnit",
                color: "$product.color",
                size: "$product.size",
                regularPrice: "$product.regularPrice",
                salePrice: "$product.salePrice",
                stock: "$product.stock",
                isParentProduct: "$product.isParentProduct",
                ratingAvg: "$product.ratingAvg",
                reviewCount: "$product.reviewCount",
                status: "$product.status",
                imageUrl: "$product.imageUrl",
                imagePath: "$product.imagePath",
              },
            },
          ],
        },
      },

      {
        $unwind: {
          path: "$orderedItems",
          preserveNullAndEmptyArrays: true,
        },
      },

      //----------------------------------------------------------------DISTRIBUTORS----------------------------------------------------------------
      {
        $lookup: {
          from: "USERS",
          as: "distributor",
          localField: "distributorId",
          foreignField: "_id",
          pipeline: [
            {
              $lookup: {
                from: "ADDRESSES",
                as: "distributorAddress",
                localField: "_id",
                foreignField: "customerId",
                pipeline: [
                  {
                    $match: {
                      $expr: {
                        $eq: ["$type", "HEADQUARTER"],
                      },
                    },
                  },
                  {
                    $limit: 1,
                  },
                ],
              },
            },
            // {
            //   $unwind: {
            //     path: "$address",
            //     preserveNullAndEmptyArrays: true,
            //   },
            // },

            {
              $project: {
                _id: 0,
                id: {
                  $toString: "$_id",
                },
                name: 1,
                email: 1,
                phone: 1,
                storeAddress: {
                  $arrayElemAt: ["$distributorAddress.addressLineOne", 0],
                },
              },
            },
          ],
        },
      },

      //---------------------------------------------------------------COMPANY REPRESENTATIVE-------------------------------------------
      {
        $lookup: {
          from: "USERS",
          as: "companyRep",
          localField: "companyRepId",
          foreignField: "_id",
          pipeline: [
            // {
            //   $lookup: {
            //     from: "ADDRESSES",
            //     as: "address",
            //     localField: "customerId",
            //     foreignField: "_id",
            //   },
            // },
            // {
            //   $unwind: {
            //     path: "$address",
            //     preserveNullAndEmptyArrays: true,
            //   },
            // },
            {
              $project: {
                _id: 0,
                id: {
                  $toString: "$_id",
                },
                name: 1,
                email: 1,
                phone: 1,
                // address: "$address",
              },
            },
          ],
        },
      },

      {
        $project: {
          id: {
            $toString: "$_id",
          },
          orderId: 1,
          total: 1,
          paymentMethod: 1,
          paymentResponse: 1,
          status: 1,
          activeStatus: 1,

          address: { $arrayElemAt: ["$address", 0] },
          customer: { $arrayElemAt: ["$customer", 0] },
          distributor: { $arrayElemAt: ["$distributor", 0] },
          companyRep: { $arrayElemAt: ["$companyRep", 0] },

          orderedItems: 1,
        },
      },
      ...match,
    ];

    const [data, totalDataCount]: any = await Promise.all([
      prisma.order.aggregateRaw({
        pipeline: [...aggregationArgs, ...paginationArgs],
      }),
      prisma.order.aggregateRaw({
        pipeline: [...aggregationArgs, { $count: "total" }],
      }),
    ]);
    return {
      data,
      pagination: { totalCount: totalDataCount[0]?.total, page, limit },
    };
  },
  async adminDashboard() {
    //----------------------------------------------------------------RETAILERS----------------------------------------------------------------
    const retailers = await prisma.user.count({
      where: {
        isVerified: true,
        status: true,
        role: "RETAILER",
      },
    });

    //----------------------------------------------------------------MANUFACUTRERS-------------------------------------------------------------
    const manfacturers = await prisma.user.count({
      where: {
        isVerified: true,
        status: true,
        role: "MANUFACTURER",
      },
    });

    const totalUsers = retailers + manfacturers;

    const retailPercent = ((retailers / totalUsers) * 100).toFixed(2);
    const manfacturerPercent = ((manfacturers / totalUsers) * 100).toFixed(2);

    const revenue = await prisma.order.aggregate({
      where: {
        status: "DELIVERED",
      },
      _sum: {
        total: true,
      },
    });
    const platformRevenue = await prisma.order.aggregate({
      where: {
        status: "DELIVERED",
      },
      _sum: {
        platformRevenue: true,
      },
    });

    const currDate = new Date();
    const twelveMonthsAgo = new Date();

    twelveMonthsAgo.setMonth(currDate.getMonth() - 11);
    twelveMonthsAgo.setDate(1);
    twelveMonthsAgo.setHours(0, 0, 0);

    // console.log({ currDate, twelveMonthsAgo });

    const months = [
      "Jan",
      "Feb",
      "Mar",
      "Apr",
      "May",
      "June",
      "July",
      "Aug",
      "Sept",
      "Oct",
      "Nov",
      "Dec",
    ];

    const ordersByMonthAgg = [
      {
        $match: {
          $expr: {
            $and: [
              {
                $eq: ["$status", "DELIVERED"],
              },
              {
                $gte: ["$createdAt", { $toDate: twelveMonthsAgo }],
              },
              {
                $lte: ["$createdAt", { $toDate: currDate }],
              },
            ],
          },
        },
      },
      {
        $addFields: {
          month: { $month: "$createdAt" },
        },
      },
      {
        $group: {
          _id: "$month",
          sales: {
            $sum: 1,
          },
        },
      },
    ];

    const twelveYearsAgo = new Date();

    twelveYearsAgo.setFullYear(twelveYearsAgo.getFullYear() - 9);

    twelveYearsAgo.setMonth(0);
    twelveYearsAgo.setDate(1);
    twelveYearsAgo.setHours(0, 0, 0);

    console.log({ currDate, twelveMonthsAgo, twelveYearsAgo });

    const ordersByYearAgg = [
      {
        $match: {
          $expr: {
            $and: [
              {
                $eq: ["$status", "DELIVERED"],
              },
              {
                $gte: ["$createdAt", { $toDate: twelveYearsAgo }],
              },
              {
                $lte: ["$createdAt", { $toDate: currDate }],
              },
            ],
          },
        },
      },
      {
        $addFields: {
          year: { $year: "$createdAt" },
        },
      },
      {
        $group: {
          _id: "$year",
          sales: {
            $sum: 1,
          },
        },
      },
    ];

    const [ordersByMonth, ordersByYear]: any = await Promise.all([
      prisma.order.aggregateRaw({ pipeline: [...ordersByMonthAgg] }),
      prisma.order.aggregateRaw({ pipeline: [...ordersByYearAgg] }),
    ]);

    const monthIds = ordersByMonth?.map((item: any) => item._id);

    let ordersByMonthFormatted = months.map((month, i) => {
      const monthIndex = i + 1;
      if (monthIds.includes(monthIndex)) {
        const orderMonth = ordersByMonth.filter((item: any) => {
          if (item._id === monthIndex) return item;
        });
        console.log(orderMonth);
        return {
          month: months[orderMonth[0]._id - 1],
          sales: orderMonth[0].sales,
        };
      } else
        return {
          month: months[i],
          sales: 0,
        };
    });

    let orderByYearFormatted = [];

    const yearIds = ordersByYear.map((item: any) => item._id);

    for (
      let i = twelveYearsAgo.getFullYear();
      i <= currDate.getFullYear();
      i++
    ) {
      if (yearIds.includes(i)) {
        const orderYear = ordersByYear.filter((item: any) => {
          if (item._id === i) return item;
        });
        orderByYearFormatted.push({
          year: i,
          sales: orderYear[0].sales,
        });
      } else
        orderByYearFormatted.push({
          year: i,
          sales: 0,
        });
    }

    console.log({ orderByYearFormatted });

    return {
      retailers,
      manfacturers,
      retailPercent,
      manfacturerPercent,
      platformRevenue: platformRevenue?._sum?.platformRevenue,
      revenue: revenue?._sum?.total,
      ordersByMonthFormatted,
      orderByYearFormatted,
    };
  },
  async manfacturerDashboard(userId: string) {
    const manafacturer = await prisma.user.findUnique({
      where: {
        id: userId,
      },
    });
    //----------------------------------------------------------------DISTRIBUTORS--------------------------------------------------------------
    const distributors = await prisma.user.count({
      where: {
        isVerified: true,
        status: true,
        role: "DISTRIBUTOR",
        id: { in: manafacturer?.distributorsOnMeIds },
      },
    });

    //----------------------------------------------------------------COMPANY REPRESENTATIVES---------------------------------------------------
    const companyRep = await prisma.user.count({
      where: {
        isVerified: true,
        status: true,
        role: "COMPANY_REPRESENTATIVE",
        assignedManufacturerId: userId,
      },
    });

    // const totalUsers = retailers + manfacturers;

    // const retailPercent = ((retailers / totalUsers) * 100).toFixed(2);
    // const manfacturerPercent = ((manfacturers / totalUsers) * 100).toFixed(2);

    const revenue = await prisma.order.aggregate({
      where: {
        status: "DELIVERED",
        manufacturerId: userId,
      },
      _sum: {
        total: true,
      },
    });

    const totalOrders = await prisma.order.count({
      where: {
        status: "DELIVERED",
        manufacturerId: userId,
      },
    });

    const totalProducts = await prisma.product.count({
      where: { status: true, manufacturerId: userId },
    });

    const productsByCategory = [
      {
        $match: {
          $expr: {
            $and: [
              {
                $eq: [{ $toString: "$manufacturerId" }, userId],
              },
            ],
          },
        },
      },
      //-----------------------------------------CATEGORY-----------------------------
      {
        $lookup: {
          from: "CATEGORIES",
          as: "category",
          localField: "categoryId",
          foreignField: "_id",
          pipeline: [
            {
              $addFields: {
                id: {
                  $toString: "$_id",
                },
              },
            },
          ],
        },
      },
      {
        $unwind: {
          path: "$category",
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $match: {
          status: true,
        },
      },
      {
        $group: {
          _id: "$category.id",
          category: { $first: "$category" },
          count: { $count: {} },
        },
      },
      {
        $addFields: {
          categoryPercent: { $multiply: ["$count", 100, 1 / totalProducts] },
        },
      },
    ];

    const currDate = new Date();
    const twelveMonthsAgo = new Date();

    twelveMonthsAgo.setMonth(currDate.getMonth() - 11);
    twelveMonthsAgo.setDate(1);
    twelveMonthsAgo.setHours(0, 0, 0);

    // console.log({ currDate, twelveMonthsAgo });

    const months = [
      "Jan",
      "Feb",
      "Mar",
      "Apr",
      "May",
      "June",
      "July",
      "Aug",
      "Sept",
      "Oct",
      "Nov",
      "Dec",
    ];

    const ordersByMonthAgg = [
      {
        $match: {
          $expr: {
            $and: [
              {
                $eq: [{ $toString: "$manufacturerId" }, userId],
              },
              {
                $eq: ["$status", "DELIVERED"],
              },
              {
                $gte: ["$createdAt", { $toDate: twelveMonthsAgo }],
              },
              {
                $lte: ["$createdAt", { $toDate: currDate }],
              },
            ],
          },
        },
      },
      {
        $addFields: {
          month: { $month: "$createdAt" },
        },
      },
      {
        $group: {
          _id: "$month",
          sales: {
            $sum: 1,
          },
        },
      },
    ];

    const twelveYearsAgo = new Date();

    twelveYearsAgo.setFullYear(twelveYearsAgo.getFullYear() - 9);

    twelveYearsAgo.setMonth(0);
    twelveYearsAgo.setDate(1);
    twelveYearsAgo.setHours(0, 0, 0);

    console.log({ currDate, twelveMonthsAgo, twelveYearsAgo });

    const ordersByYearAgg = [
      {
        $match: {
          $expr: {
            $and: [
              {
                $eq: [{ $toString: "$manufacturerId" }, userId],
              },
              {
                $eq: ["$status", "DELIVERED"],
              },
              {
                $gte: ["$createdAt", { $toDate: twelveYearsAgo }],
              },
              {
                $lte: ["$createdAt", { $toDate: currDate }],
              },
            ],
          },
        },
      },
      {
        $addFields: {
          year: { $year: "$createdAt" },
        },
      },
      {
        $group: {
          _id: "$year",
          sales: {
            $sum: 1,
          },
        },
      },
    ];

    const [ordersByMonth, ordersByYear, categories]: any = await Promise.all([
      prisma.order.aggregateRaw({ pipeline: [...ordersByMonthAgg] }),
      prisma.order.aggregateRaw({ pipeline: [...ordersByYearAgg] }),
      prisma.product.aggregateRaw({ pipeline: [...productsByCategory] }),
    ]);

    const monthIds = ordersByMonth?.map((item: any) => item._id);

    let ordersByMonthFormatted = months.map((month, i) => {
      const monthIndex = i + 1;
      if (monthIds.includes(monthIndex)) {
        const orderMonth = ordersByMonth.filter((item: any) => {
          if (item._id === monthIndex) return item;
        });
        console.log(orderMonth);
        return {
          month: months[orderMonth[0]._id - 1],
          sales: orderMonth[0].sales,
        };
      } else
        return {
          month: months[i],
          sales: 0,
        };
    });

    let orderByYearFormatted = [];

    const yearIds = ordersByYear.map((item: any) => item._id);

    for (
      let i = twelveYearsAgo.getFullYear();
      i <= currDate.getFullYear();
      i++
    ) {
      if (yearIds.includes(i)) {
        const orderYear = ordersByYear.filter((item: any) => {
          if (item._id === i) return item;
        });
        orderByYearFormatted.push({
          year: i,
          sales: orderYear[0].sales,
        });
      } else
        orderByYearFormatted.push({
          year: i,
          sales: 0,
        });
    }

    console.log({ orderByYearFormatted });

    return {
      distributors,
      companyRep,
      totalOrders,
      totalProducts,
      revenue: revenue?._sum?.total,
      categories,
      ordersByMonthFormatted,
      orderByYearFormatted,
    };
  },
  async revenueData({
    page,
    limit,
    search,
    userId,
    startDate,
    endDate,
    productId,
    orderId,
    status,
  }: {
    page?: number;
    limit?: number;
    search?: string;
    userId?: string;
    startDate?: Date;
    endDate?: Date;
    productId?: string;
    orderId?: string;
    status?: string;
  }) {
    const paginationArgs = [];

    const filter = [];
    const match = [];

    if (startDate && endDate) {
      filter.push(
        {
          $addFields: {
            startDate: {
              $dateFromParts: {
                year: new Date(startDate).getFullYear(),
                month: new Date(startDate).getMonth() + 1,
                day: new Date(startDate).getDate(),
                hour: new Date(startDate).getHours(),
                minute: new Date(startDate).getMinutes(),
                timezone: "Asia/Kolkata",
              },
            },
            endDate: {
              $dateFromParts: {
                year: new Date(endDate).getFullYear(),
                month: new Date(endDate).getMonth() + 1,
                day: new Date(endDate).getDate(),
                hour: new Date(endDate).getHours(),
                minute: new Date(endDate).getMinutes(),
                timezone: "Asia/Kolkata",
              },
            },
          },
        },
        {
          $match: {
            $expr: {
              $and: [
                {
                  $gte: ["$createdAt", startDate],
                },
                {
                  $lte: ["$createdAt", endDate],
                },
              ],
            },
          },
        }
      );
    } else if (startDate) {
      filter.push(
        {
          $addFields: {
            startDate: {
              $dateFromParts: {
                year: new Date(startDate).getFullYear(),
                month: new Date(startDate).getMonth() + 1,
                day: new Date(startDate).getDate(),
                hour: new Date(startDate).getHours(),
                minute: new Date(startDate).getMinutes(),
                timezone: "Asia/Kolkata",
              },
            },
          },
        },
        {
          $match: {
            $expr: {
              $and: [
                {
                  $gte: ["$createdAt", startDate],
                },
              ],
            },
          },
        }
      );
    } else if (endDate) {
      filter.push(
        {
          $addFields: {
            endDate: {
              $dateFromParts: {
                year: new Date(endDate).getFullYear(),
                month: new Date(endDate).getMonth() + 1,
                day: new Date(endDate).getDate(),
                hour: new Date(endDate).getHours(),
                minute: new Date(endDate).getMinutes(),
                timezone: "Asia/Kolkata",
              },
            },
          },
        },
        {
          $match: {
            $expr: {
              $lte: ["$createdAt", endDate],
            },
          },
        }
      );
    }

    if (userId) {
      console.log("userId", userId);
      filter.push({
        $eq: ["$customer.id", userId],
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
    const aggregationArgs = [
      {
        $match: {
          role: "MANUFACTURER",
        },
      },
      //----------------------------------------------------------------ORDER ITEMS------------------------------------------------
      {
        $lookup: {
          from: "ORDERS",
          as: "orders",
          localField: "_id",
          foreignField: "manufacturerId",
          pipeline: [
            // {
            //   $match: {
            //     activeStatus: true,
            //     status: "DELIVERED",
            //   },
            // },
            {
              $group: {
                _id: "$createdAt",
                salePrice: { $sum: "$total" },
                villopRevenue: { $sum: "$total" },
                maufacturerRevenue: { $sum: "$total" },
              },
            },

            // {
            //   $lookup: {
            //     from: "ORDER_ITEMS",
            //     as: "orderedItems",
            //     localField: "_id",
            //     foreignField: "orderId",
            //     pipeline: [
            //       {
            //         $lookup: {
            //           from: "PRODUCTS",
            //           as: "product",
            //           localField: "productId",
            //           foreignField: "_id",
            //           pipeline: [
            //             {
            //               $addFields: {
            //                 id: {
            //                   $toString: "$_id",
            //                 },
            //               },
            //             },
            //           ],
            //         },
            //       },
            //       {
            //         $unwind: {
            //           path: "$product",
            //           preserveNullAndEmptyArrays: true,
            //         },
            //       },

            //       {
            //         $project: {
            //           id: {
            //             $toString: "$_id",
            //           },
            //           quantity: 1,
            //           price: 1,
            //           productId: "$product.id",
            //           title: "$product.title",
            //           description: "$product.description",
            //           slug: "$product.slug",
            //           measureType: "$product.measureType",
            //           measureUnit: "$product.measureUnit",
            //           color: "$product.color",
            //           size: "$product.size",
            //           regularPrice: "$product.regularPrice",
            //           salePrice: "$product.salePrice",
            //           stock: "$product.stock",
            //           isParentProduct: "$product.isParentProduct",
            //           ratingAvg: "$product.ratingAvg",
            //           reviewCount: "$product.reviewCount",
            //           status: "$product.status",
            //           imageUrl: "$product.imageUrl",
            //           imagePath: "$product.imagePath",
            //           manafacturer: "$product.manufacturer",
            //         },
            //       },
            //     ],
            //   },
            // },
            // {
            //   $unwind: {
            //     path: "$orderedItems",
            //     preserveNullAndEmptyArrays: true,
            //   },
            // },
          ],
        },
      },

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
          totalSales: {
            $reduce: {
              input: "$orders",
              initialValue: 0,
              in: { $add: ["$$value", "$$this.salePrice"] },
            },
          },
          // myRevenue: {
          //   $reduce: {
          //     input: "$orders",
          //     initialValue: 0,
          //     in: { $add: ["$$value", "$$this.total"] },
          //   },
          // },

          orders: 1,
        },
      },

      // ...match,
    ];

    const [data, totalDataCount]: any = await Promise.all([
      prisma.user.aggregateRaw({
        pipeline: [...aggregationArgs, ...paginationArgs],
      }),
      prisma.user.aggregateRaw({
        pipeline: [...aggregationArgs, { $count: "total" }],
      }),
    ]);
    return {
      data,
      pagination: { totalCount: totalDataCount[0]?.total, page, limit },
    };
  },
  async revenueManufacturer({
    page,
    limit,
    search,
    userId,
    startDate,
    endDate,
    productId,
    orderId,
    status,
  }: {
    page?: number;
    limit?: number;
    search?: string;
    userId?: string;
    startDate?: Date;
    endDate?: Date;
    productId?: string;
    orderId?: string;
    status?: string;
  }) {
    const paginationArgs = [];

    const filter = [];
    const match = [];

    // console.log({ userId });

    if (orderId && productId) {
      console.log({ orderId, productId });
      filter.push(
        {
          $eq: ["$id", orderId],
        },
        {
          $eq: ["$orderedItems.id", productId],
        }
      );
    }

    if (status) {
      filter.push({
        $eq: ["$status", status],
      });
    }

    if (startDate && endDate) {
      filter.push(
        {
          $addFields: {
            startDate: {
              $dateFromParts: {
                year: new Date(startDate).getFullYear(),
                month: new Date(startDate).getMonth() + 1,
                day: new Date(startDate).getDate(),
                hour: new Date(startDate).getHours(),
                minute: new Date(startDate).getMinutes(),
                timezone: "Asia/Kolkata",
              },
            },
            endDate: {
              $dateFromParts: {
                year: new Date(endDate).getFullYear(),
                month: new Date(endDate).getMonth() + 1,
                day: new Date(endDate).getDate(),
                hour: new Date(endDate).getHours(),
                minute: new Date(endDate).getMinutes(),
                timezone: "Asia/Kolkata",
              },
            },
          },
        },
        {
          $match: {
            $expr: {
              $and: [
                {
                  $gte: ["$createdAt", startDate],
                },
                {
                  $lte: ["$createdAt", endDate],
                },
              ],
            },
          },
        }
      );
    } else if (startDate) {
      filter.push(
        {
          $addFields: {
            startDate: {
              $dateFromParts: {
                year: new Date(startDate).getFullYear(),
                month: new Date(startDate).getMonth() + 1,
                day: new Date(startDate).getDate(),
                hour: new Date(startDate).getHours(),
                minute: new Date(startDate).getMinutes(),
                timezone: "Asia/Kolkata",
              },
            },
          },
        },
        {
          $match: {
            $expr: {
              $and: [
                {
                  $gte: ["$createdAt", startDate],
                },
              ],
            },
          },
        }
      );
    } else if (endDate) {
      filter.push(
        {
          $addFields: {
            endDate: {
              $dateFromParts: {
                year: new Date(endDate).getFullYear(),
                month: new Date(endDate).getMonth() + 1,
                day: new Date(endDate).getDate(),
                hour: new Date(endDate).getHours(),
                minute: new Date(endDate).getMinutes(),
                timezone: "Asia/Kolkata",
              },
            },
          },
        },
        {
          $match: {
            $expr: {
              $lte: ["$createdAt", endDate],
            },
          },
        }
      );
    }

    if (userId) {
      console.log("userId", userId);
      filter.push({
        $eq: ["$manufacturerId", userId],
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

    const aggregationArgs = [
      {
        $match: {
          activeStatus: true,
          status: "DELIVERED",
        },
      },

      //----------------------------------------------------------------ORDER ITEMS------------------------------------------------
      {
        $lookup: {
          from: "ORDER_ITEMS",
          as: "orderedItems",
          localField: "_id",
          foreignField: "orderId",
          pipeline: [
            {
              $lookup: {
                from: "PRODUCTS",
                as: "product",
                localField: "productId",
                foreignField: "_id",
                pipeline: [
                  {
                    $addFields: {
                      id: {
                        $toString: "$_id",
                      },
                    },
                  },
                ],
              },
            },
            {
              $unwind: {
                path: "$product",
                preserveNullAndEmptyArrays: true,
              },
            },

            {
              $project: {
                id: {
                  $toString: "$_id",
                },
                quantity: 1,
                price: 1,
                productId: "$product.id",
                title: "$product.title",
                description: "$product.description",
                slug: "$product.slug",
                measureType: "$product.measureType",
                measureUnit: "$product.measureUnit",
                color: "$product.color",
                size: "$product.size",
                regularPrice: "$product.regularPrice",
                salePrice: "$product.salePrice",
                stock: "$product.stock",
                isParentProduct: "$product.isParentProduct",
                ratingAvg: "$product.ratingAvg",
                reviewCount: "$product.reviewCount",
                status: "$product.status",
                imageUrl: "$product.imageUrl",
                imagePath: "$product.imagePath",
              },
            },
          ],
        },
      },

      // {
      //   $unwind: {
      //     path: "$orderedItems",
      //     preserveNullAndEmptyArrays: true,
      //   },
      // },

      {
        $project: {
          id: {
            $toString: "$_id",
          },
          orderId: 1,
          total: 1,
          paymentMethod: 1,
          paymentResponse: 1,
          status: 1,
          activeStatus: 1,
          createdAt: { $toString: "$createdAt" },
          manufacturerId: { $toString: "$manufacturerId" },
          myRevenue: { $sum: "$total" },
          viloopRevenue: { $sum: "$total" },

          orderedItems: 1,
        },
      },
      ...match,
    ];

    const [orders, totalDataCount]: any = await Promise.all([
      prisma.order.aggregateRaw({
        pipeline: [...aggregationArgs, ...paginationArgs],
      }),
      prisma.order.aggregateRaw({
        pipeline: [...aggregationArgs, { $count: "total" }],
      }),
    ]);
    return {
      orders,
      pagination: { totalCount: totalDataCount[0]?.total, page, limit },
    };
  },
  async exportAll() {
    const aggregationArgs = [
      {
        $match: {
          role: "MANUFACTURER",
        },
      },
      //----------------------------------------------------------------ORDER ITEMS------------------------------------------------
      {
        $lookup: {
          from: "ORDERS",
          as: "orders",
          localField: "_id",
          foreignField: "manufacturerId",
          pipeline: [
            // {
            //   $match: {
            //     activeStatus: true,
            //     status: "DELIVERED",
            //   },
            // },
            {
              $group: {
                _id: "$createdAt",
                salePrice: { $sum: "$total" },
                villopRevenue: { $sum: "$total" },
                maufacturerRevenue: { $sum: "$total" },
              },
            },
          ],
        },
      },

      {
        $unwind: {
          path: "$orders",
          preserveNullAndEmptyArrays: true,
        },
      },

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
          // totalSales: {
          //   $reduce: {
          //     input: "$orders",
          //     initialValue: 0,
          //     in: { $add: ["$$value", "$$this.salePrice"] },
          //   },
          // },

          orders: 1,
        },
      },

      // ...match,
    ];

    const [data, totalDataCount]: any = await Promise.all([
      prisma.user.aggregateRaw({
        pipeline: [...aggregationArgs],
      }),
    ]);
    return data;
  },
  async exportManufacturerRevenue(userId: string) {
    console.log({ userId });
    const aggregationArgs = [
      {
        $match: {
          $expr: {
            $and: [
              {
                $eq: ["$status", "DELIVERED"],
              },
              {
                $eq: [{ $toString: "$manufacturerId" }, userId],
              },
            ],
          },
        },
      },

      //----------------------------------------------------------------ORDER ITEMS------------------------------------------------
      {
        $lookup: {
          from: "ORDER_ITEMS",
          as: "orderedItems",
          localField: "_id",
          foreignField: "orderId",
          pipeline: [
            {
              $lookup: {
                from: "PRODUCTS",
                as: "product",
                localField: "productId",
                foreignField: "_id",
                pipeline: [
                  {
                    $addFields: {
                      id: {
                        $toString: "$_id",
                      },
                    },
                  },
                ],
              },
            },
            {
              $unwind: {
                path: "$product",
                preserveNullAndEmptyArrays: true,
              },
            },

            {
              $project: {
                id: {
                  $toString: "$_id",
                },
                quantity: 1,
                price: 1,
                productId: "$product.id",
                title: "$product.title",
                description: "$product.description",
                slug: "$product.slug",
                measureType: "$product.measureType",
                measureUnit: "$product.measureUnit",
                color: "$product.color",
                size: "$product.size",
                regularPrice: "$product.regularPrice",
                salePrice: "$product.salePrice",
                stock: "$product.stock",
                isParentProduct: "$product.isParentProduct",
                ratingAvg: "$product.ratingAvg",
                reviewCount: "$product.reviewCount",
                status: "$product.status",
                imageUrl: "$product.imageUrl",
                imagePath: "$product.imagePath",
              },
            },
          ],
        },
      },

      // {
      //   $unwind: {
      //     path: "$orderedItems",
      //     preserveNullAndEmptyArrays: true,
      //   },
      // },

      {
        $project: {
          id: {
            $toString: "$_id",
          },
          orderId: 1,
          total: 1,
          paymentMethod: 1,
          paymentResponse: 1,
          status: 1,
          activeStatus: 1,
          createdAt: { $toString: "$createdAt" },
          manufacturerId: { $toString: "$manufacturerId" },
          myRevenue: { $sum: "$total" },
          viloopRevenue: { $sum: "$total" },

          orderedItems: 1,
        },
      },
    ];

    const [orders]: any = await Promise.all([
      prisma.order.aggregateRaw({
        pipeline: [...aggregationArgs],
      }),
    ]);

    return orders;
  },
  async distributorDashboard(userId: string) {
    const totalOrders = await prisma.order.count({
      where: {
        distributorId: userId,
      },
    });
    const pendingOrders = await prisma.order.count({
      where: {
        distributorId: userId,
        status: { not: "DELIVERED" },
      },
    });

    const completedOrders = await prisma.order.count({
      where: {
        distributorId: userId,
        status: "DELIVERED",
      },
    });

    const myManufacturers = await prisma.user.findFirst({
      where: {
        id: userId,
      },
      select: {
        ManagedManufacturers: true,
      },
    });

    return {
      totalOrders,
      completedOrders,
      pendingOrders,
      manufacturer: myManufacturers?.ManagedManufacturers?.length || 0,
    };
  },
  async companyRepDashboard(userId: string) {
    const totalOrders = await prisma.order.count({
      where: {
        companyRepId: userId,
      },
    });
    const pendingOrders = await prisma.order.count({
      where: {
        companyRepId: userId,
        status: { not: "DELIVERED" },
      },
    });

    const completedOrders = await prisma.order.count({
      where: {
        companyRepId: userId,
        status: "DELIVERED",
      },
    });

    return {
      totalOrders,
      completedOrders,
      pendingOrders,
    };
  },
};
