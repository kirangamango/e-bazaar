import { Prisma } from "@prisma/client";
import { prisma } from "../configs";
import { NotFound, NotAcceptable } from "http-errors";
import crypto from "crypto";
import { PaymentService } from "../services/payment.service";
import { pushNotification } from "../services/notification.service";
import { InvoiceFunction } from "./invoice.function";

export const OrderFunction = {
  async create({
    customerId,
    input,
  }: {
    customerId: string;
    input: Prisma.OrderCreateInput & {
      deliveryAddressId: string;
      total: number;
    } & { orderItems: Prisma.OrderItemUncheckedCreateWithoutOrderInput[] };
  }) {
    console.log({ customerId, input });

    const deliveryAddressId = input.deliveryAddressId;

    console.log({ deliveryAddressId });

    const productIds = (input?.orderItems as Prisma.JsonObject[])?.map(
      (item) => {
        return item.productId;
      }
    );

    const products = await prisma.product.findMany({
      where: { id: { in: productIds as string[] } },
      include: {
        manufacturer: { select: { id: true, name: true } },
        cashPoint: true,
      },
    });

    // console.log({ orderdItems: input.orderItems, productIds });

    if (products.length < 1) {
      throw new NotFound("Products not found");
    }

    // Extracting manufacturer IDs from products
    const manufacturerIds = products.map(
      (product) => product?.manufacturer?.id
    );

    // Check if all manufacturer IDs are the same
    const allSameManufacturer = manufacturerIds.every(
      (id) => id === manufacturerIds[0]
    );

    console.log({ manufacturerIds, allSameManufacturer });

    if (!allSameManufacturer) {
      throw new NotAcceptable(
        `Order can be placed for one manfacturer's products at a time.`
      );
    }

    //DAILY FRESH PRODUCT LOGIC
    const DailyFreshProductCategory = await prisma.category.findFirst({
      where: {
        slug: "daily-fresh-products",
      },
      include: {
        Products: {
          select: {
            id: true,
          },
        },
      },
    });

    const currDate = new Date();
    currDate.setHours(12, 0, 0);

    if (
      DailyFreshProductCategory?.Products.some((item) =>
        productIds?.includes(item.id)
      ) &&
      currDate < new Date()
    )
      throw new NotFound(
        "Daily fresh products can only be ordered before 12:00PM"
      );

    const commission = await prisma.commission.findFirst({
      where: {
        userId: products[0]?.manufacturer?.id,
      },
    });

    let calcTotal = input.total;
    let commissionCut = 0;

    if (commission) {
      commissionCut = Number(
        ((commission.amount * input.total) / 100).toFixed(2)
      );
      calcTotal = input.total - commissionCut;
    }

    console.log({ total: input.total });

    if (!input.total) {
      throw new NotAcceptable("Amount is empty");
    }

    const orderId = `viloop_${crypto.randomUUID()}`;

    //CREATE ORDER

    const order = await prisma.order.create({
      data: {
        orderId: orderId,
        total: input.total,
        platformRevenue: commissionCut,
        manufacturerRevenue: calcTotal,
        customer: {
          connect: {
            id: customerId,
          },
        },
        deliveryAddress: {
          connect: {
            id: deliveryAddressId,
          },
        },
        OrderedItems: {
          create: [...input.orderItems],
        },
        manufacturer: {
          connect: {
            id: products[0].manufacturer?.id,
          },
        },
        Payment: {
          create: {
            amount: input.total,
            currency: "INR",
          },
        },
      },
      include: {
        customer: true,
        deliveryAddress: true,
        OrderedItems: true,
      },
    });

    await pushNotification({
      title: `Order placed succcessfully`,
      body: `Order(${orderId}) placed succcessfully`,
      userIds: [customerId as string],
      saveToDb: true,
    });

    const cart = await prisma.cart.findFirst({
      where: {
        customerId,
      },
    });

    cart &&
      (await prisma.cartProduct.deleteMany({
        where: {
          cartId: cart?.id,
        },
      }));

    cart &&
      (await prisma.cart.delete({
        where: {
          id: cart?.id,
        },
      }));
    console.log({ order });
    return order;
  },
  async createOnline({
    customerId,
    input,
  }: {
    customerId: string;
    input: Prisma.OrderCreateInput & {
      deliveryAddressId: string;
      total: number;
    } & { orderItems: Prisma.OrderItemUncheckedCreateWithoutOrderInput[] };
  }) {
    console.log({ customerId, input });

    const deliveryAddressId = input.deliveryAddressId;

    console.log({ deliveryAddressId });

    const productIds = (input?.orderItems as Prisma.JsonObject[])?.map(
      (item) => {
        return item.productId;
      }
    );

    const products = await prisma.product.findMany({
      where: { id: { in: productIds as string[] } },
      include: {
        manufacturer: { select: { id: true, name: true } },
        cashPoint: true,
      },
    });

    // console.log({ orderdItems: input.orderItems, productIds });

    if (products.length < 1) {
      throw new NotFound("Products not found");
    }

    // Extracting manufacturer IDs from products
    const manufacturerIds = products.map(
      (product) => product?.manufacturer?.id
    );

    // Check if all manufacturer IDs are the same
    const allSameManufacturer = manufacturerIds.every(
      (id) => id === manufacturerIds[0]
    );

    console.log({ manufacturerIds, allSameManufacturer });

    if (!allSameManufacturer) {
      throw new NotAcceptable(
        `Order can be placed for one manfacturer's products at a time.`
      );
    }

    //DAILY FRESH PRODUCT LOGIC
    const DailyFreshProductCategory = await prisma.category.findFirst({
      where: {
        slug: "daily-fresh-products",
      },
      include: {
        Products: {
          select: {
            id: true,
          },
        },
      },
    });

    const currDate = new Date();
    currDate.setHours(12, 0, 0);

    if (
      DailyFreshProductCategory?.Products.some((item) =>
        productIds?.includes(item.id)
      ) &&
      currDate < new Date()
    )
      throw new NotFound(
        "Daily fresh products can only be ordered before 12:00PM"
      );

    const commission = await prisma.commission.findFirst({
      where: {
        userId: products[0]?.manufacturer?.id,
      },
    });

    let calcTotal = input.total;
    let commissionCut = 0;

    if (commission) {
      commissionCut = Number(
        ((commission.amount * input.total) / 100).toFixed(2)
      );
      calcTotal = input.total - commissionCut;
    }

    if (!input.total) {
      throw new NotAcceptable("Amount is empty");
    }

    const orderId = `viloop_${crypto.randomUUID()}`;

    //CREATE ORDER
    const orderData = await PaymentService.placeOrder(input.total);

    console.log({ orderData });
    const order = await prisma.order.create({
      data: {
        orderId: orderId,
        total: input.total,
        paymentGatewayOrderId: orderData?.order_id,
        platformRevenue: commissionCut,
        manufacturerRevenue: calcTotal,
        customer: {
          connect: {
            id: customerId,
          },
        },
        deliveryAddress: {
          connect: {
            id: deliveryAddressId,
          },
        },
        OrderedItems: {
          create: [...input.orderItems],
        },
        manufacturer: {
          connect: {
            id: products[0].manufacturer?.id,
          },
        },
        Payment: {
          create: {
            amount: input.total,
            currency: "INR",
            paymentResponse: orderData,
          },
        },
      },
      include: {
        customer: true,
        deliveryAddress: true,
        OrderedItems: true,
      },
    });

    const cart = await prisma.cart.findFirst({
      where: {
        customerId,
      },
    });

    cart &&
      (await prisma.cartProduct.deleteMany({
        where: {
          cartId: cart?.id,
        },
      }));

    cart &&
      (await prisma.cart.delete({
        where: {
          id: cart?.id,
        },
      }));
    console.log({ order });
    orderData;
  },
  async verifyOrder(orderId: string) {
    const paymentOrder = await PaymentService.verify(orderId);
    const order = await prisma.order.findFirst({
      where: {
        paymentGatewayOrderId: orderId,
      },
      include: {
        Payment: true,
        OrderedItems: {
          select: {
            product: {
              select: {
                cashPoint: true,
              },
            },
          },
        },
      },
    });
    if (paymentOrder?.order_status === "PAID") {
      await prisma.payment.update({
        where: {
          id: order?.Payment?.id,
        },
        data: {
          status: "PAID",
        },
      });
    } else if (paymentOrder?.order_status === "FAILED") {
      await prisma.order.update({
        where: {
          id: order?.id,
        },
        data: {
          status: "FAILED",
          Payment: {
            update: {
              data: {
                status: "FAILED",
              },
            },
          },
        },
      });
    }
    return paymentOrder?.order_status;
  },
  async getById(id: string) {
    const order: any = await prisma.order.findUnique({
      where: { id: id },
      include: {
        customer: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
            userId: true,
          },
        },
        deliveryAddress: true,
        OrderedItems: { include: { product: true } },
        distributor: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
            userId: true,
          },
        },
        companyRep: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
            userId: true,
          },
        },
        manufacturer: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
            userId: true,
          },
        },
      },
    });

    order.orderedItems = order.OrderedItems;
    order.assignedBy = [order?.distributor?.id, order?.companyRep?.id];

    delete order.OrderedItems;

    return order;
  },
  async getAll({
    page,
    limit,
    search,
    userId,
    startDate,
    endDate,
    productId,
    orderId,
    status,
    manufacturerId,
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
    manufacturerId?: string;
  }) {
    const paginationArgs = [];

    const filter = [];
    const match = [];

    // console.log({ userId });

    if (manufacturerId) {
      console.log({ manufacturerId });
      filter.push({
        $eq: [{ $toString: "$manufacturer.id" }, manufacturerId],
      });
    }

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
      match.push(
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
      match.push(
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
      match.push(
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
                userId: 1,
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
                userId: 1,
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
                userId: 1,
                // address: "$address",
              },
            },
          ],
        },
      },

      //---------------------------------------------------------------MANUFACTURER-------------------------------------------
      {
        $lookup: {
          from: "USERS",
          as: "manufacturer",
          localField: "manufacturerId",
          foreignField: "_id",
          pipeline: [
            {
              $lookup: {
                from: "ADDRESSES",
                as: "manufacturerAddress",
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
            {
              $project: {
                _id: 0,
                id: {
                  $toString: "$_id",
                },
                name: 1,
                email: 1,
                phone: 1,
                userId: 1,
                address: {
                  $arrayElemAt: ["$manufacturerAddress.addressLineOne", 0],
                },
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
          isAssigned: 1,
          createdAt: { $toString: "$createdAt" },

          address: { $arrayElemAt: ["$address", 0] },
          customer: { $arrayElemAt: ["$customer", 0] },
          distributor: { $arrayElemAt: ["$distributor", 0] },
          companyRep: { $arrayElemAt: ["$companyRep", 0] },
          manufacturer: { $arrayElemAt: ["$manufacturer", 0] },

          orderedItems: 1,
        },
      },
      {
        $addFields: {
          assignedBy: ["$distributor.id", "$companyRep.id"],
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
  async getAllDistributorCR({
    page,
    limit,
    search,
    userId,
    startDate,
    endDate,
    productId,
    orderId,
    status,
    role,
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
    role: string;
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
      console.log({ userId, role });
      if (role === "DISTRIBUTOR") {
        filter.push({
          $eq: ["$distributor.id", userId],
        });
      } else if (role === "COMPANY_REPRESENTATIVE") {
        filter.push({
          $eq: ["$companyRep.id", userId],
        });
      } else return { orders: [] };
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

      // {
      //   $unwind: {
      //     path: "$orderedItems",
      //     preserveNullAndEmptyArrays: true,
      //   },
      // },

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

      //---------------------------------------------------------------MANUFACTURER-------------------------------------------
      {
        $lookup: {
          from: "USERS",
          as: "manufacturer",
          localField: "manufacturerId",
          foreignField: "_id",
          pipeline: [
            {
              $lookup: {
                from: "ADDRESSES",
                as: "manufacturerAddress",
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
            {
              $project: {
                _id: 0,
                id: {
                  $toString: "$_id",
                },
                name: 1,
                email: 1,
                phone: 1,
                userId: 1,
                address: {
                  $arrayElemAt: ["$manufacturerAddress.addressLineOne", 0],
                },
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
          isAssigned: 1,
          createdAt: { $toString: "$createdAt" },

          address: { $arrayElemAt: ["$address", 0] },
          customer: { $arrayElemAt: ["$customer", 0] },
          distributor: { $arrayElemAt: ["$distributor", 0] },
          companyRep: { $arrayElemAt: ["$companyRep", 0] },
          manufacturer: { $arrayElemAt: ["$manufacturer", 0] },

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
  async update(
    id: string,
    input: Prisma.OrderUncheckedUpdateInput & { paymentStatus: string }
  ) {
    const order = await prisma.order.findUnique({
      where: { id: id },
    });

    console.log({ input });

    if (!order) throw new NotFound("Order does not exist");

    let deliveredDate,
      distributorCommission: number = 0;
    if (input?.status === "DELIVERED") {
      deliveredDate = new Date();
      const isDistributorExist = await prisma.user.findFirst({
        where: {
          id: order?.distributorId as string,
        },
        include: {
          CommissionDistributor: true,
        },
      });
      if (!isDistributorExist) throw new NotFound("Distributor not found");
      let calcTotal =
        (isDistributorExist?.CommissionDistributor[0]?.amount *
          (order?.total as number)) /
        100;
      distributorCommission = Number(calcTotal.toFixed(2));

      //GENERATE INVOICE
      await InvoiceFunction.create(order.id);
    }

    const updatedOrder = await prisma.order.update({
      where: { id },
      data: {
        ...input,
        deliveredDate: deliveredDate ? deliveredDate : undefined,
        distributorRevenue: distributorCommission
          ? distributorCommission
          : undefined,
        platformRevenue: distributorCommission
          ? {
              decrement: distributorCommission,
            }
          : undefined,
        Payment:
          input?.paymentStatus === "PAID"
            ? {
                update: {
                  status: "PAID",
                },
              }
            : undefined,
      },
      include: {
        Payment: true,
        OrderedItems: {
          select: {
            product: {
              select: {
                cashPoint: true,
              },
            },
          },
        },
      },
    });
    if (updatedOrder.status === "DELIVERED") {
      await pushNotification({
        title: `Order delivered succcessfully`,
        body: `Order(${order.orderId}) delivered succcessfully`,
        userIds: [order.customerId as string],
        saveToDb: true,
      });
    }
    if (
      updatedOrder?.Payment?.status === "PAID" &&
      updatedOrder.status === "DELIVERED"
    ) {
      const cashPointEarned = updatedOrder?.OrderedItems?.reduce(
        (accumulator, item) => {
          const cashPoint = item?.product?.cashPoint
            ? Number(item?.product?.cashPoint?.cashPoints)
            : 0;
          return accumulator + cashPoint;
        },
        0
      );
      await prisma.wallet.update({
        where: {
          userId: updatedOrder?.customerId,
        },
        data: {
          point: {
            increment: cashPointEarned,
          },
        },
      });
      await pushNotification({
        title: `Cashpoints Earned`,
        body: `Your wallet has been credited ${cashPointEarned} points on order ${order?.orderId}`,
        userIds: [order?.customerId as string],
        saveToDb: true,
      });
    }
    console.log({ updatedOrder });
    return;
  },
  async cancelOrder(id: string) {
    const order = await prisma.order.findUnique({
      where: { id: id },
    });

    if (!order) throw new NotFound("Order does not exist");

    const cancelledOrder = await prisma.order.update({
      where: { id },
      data: {
        status: "CANCELLED",
      },
    });
    await pushNotification({
      title: `Order cancelled succcessfully`,
      body: `Order(${order.orderId}) cancelled succcessfully`,
      userIds: [order.customerId as string],
      saveToDb: true,
    });
    return cancelledOrder;
  },
  async delete(id: string) {
    const order = await prisma.order.findUnique({
      where: { id: id },
    });

    if (!order) throw new NotFound("Order does not exist");

    const deletedOrder = await prisma.order.update({
      where: { id },
      data: {
        activeStatus: false,
      },
    });
    console.log({ deletedOrder });
  },
  async export(userId: string, role: string) {
    const match = [];

    if (role === "MANUFACTURER" && userId) {
      match.push({
        $match: {
          $expr: {
            $and: {
              $eq: ["$manufacturer.id", userId],
            },
          },
        },
      });
    }
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
          isAssigned: 1,
          createdAt: { $toString: "$createdAt" },

          address: { $arrayElemAt: ["$address", 0] },
          customer: { $arrayElemAt: ["$customer", 0] },
          distributor: { $arrayElemAt: ["$distributor", 0] },
          companyRep: { $arrayElemAt: ["$companyRep", 0] },

          orderedItems: 1,
        },
      },

      //---------------------------------------------------------------MANUFACTURER-------------------------------------------
      {
        $lookup: {
          from: "USERS",
          as: "manufacturer",
          localField: "manufacturerId",
          foreignField: "_id",
          pipeline: [
            {
              $lookup: {
                from: "ADDRESSES",
                as: "manufacturerAddress",
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
            {
              $project: {
                _id: 0,
                id: {
                  $toString: "$_id",
                },
                name: 1,
                email: 1,
                phone: 1,
                userId: 1,
                address: {
                  $arrayElemAt: ["$manufacturerAddress.addressLineOne", 0],
                },
                manufacturer: { $arrayElemAt: ["$manufacturer", 0] },
              },
            },
          ],
        },
      },

      ...match,
    ];

    const [orders]: any = await Promise.all([
      prisma.order.aggregateRaw({
        pipeline: [...aggregationArgs],
      }),
    ]);

    return orders;
  },
};
