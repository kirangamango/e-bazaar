import { Prisma } from "@prisma/client";
import { prisma } from "../configs";
import { Conflict, NotFound } from "http-errors";
import MediaService from "../services/media.service";
import { UploadedFile } from "express-fileupload";

export const ProductFunction = {
  async create({
    title,
    description,
    measureType,
    measureUnit,
    regularPrice,
    salePrice,
    stock,
    slug,
    color,
    size,
    image,
    categoryId,
    subcategoryId,
    parentProductId,
    userId,
  }: {
    title: string;
    description: string;
    measureType?: string;
    measureUnit?: string;
    regularPrice?: number;
    salePrice?: number;
    stock?: number;
    slug: string;
    color?: string;
    size?: string;
    image?: any;
    categoryId?: string;
    subcategoryId?: string;
    parentProductId?: string;
    userId: string;
  }) {
    const isSlugExists = await prisma.product.findFirst({
      where: { slug: slug },
    });
    if (isSlugExists)
      throw new Conflict(`Product with slug: ${slug} already exists`);

    let imagePath, imageUrl;

    if (image) {
      const file = await new MediaService().uploadMedia(
        image,
        "product-images"
      );
      imagePath = file.path;
      imageUrl = file.url;
    }

    console.log({
      measureType,
      measureUnit,
      regularPrice,
      salePrice,
      stock,
      slug,
      color,
      size,
    });

    const product = await prisma.product.create({
      data: {
        title,
        description,
        measureType: measureType ? measureType.toUpperCase() : null,
        measureUnit: measureUnit ? measureUnit : null,
        regularPrice,
        salePrice,
        stock,
        slug,
        color: color ? color : null,
        size: size ? size : null,
        imagePath,
        imageUrl,
        discount:
          (((regularPrice as number) - (salePrice as number)) /
            (regularPrice as number)) *
          100,
        allImages: image
          ? {
              create: [
                {
                  imagePath: imagePath as string,
                  imageUrl: imageUrl as string,
                },
              ],
            }
          : undefined,
        category: categoryId
          ? {
              connect: {
                id: categoryId,
              },
            }
          : undefined,
        subcategory: subcategoryId
          ? {
              connect: {
                id: subcategoryId,
              },
            }
          : undefined,
        parentProduct: parentProductId
          ? {
              connect: {
                id: parentProductId,
              },
            }
          : undefined,
        manufacturer: {
          connect: {
            id: userId,
          },
        },
      },
    });

    if (!parentProductId) {
      await prisma.product.update({
        where: { id: product.id },
        data: {
          parentProductId: product.id,
          isParentProduct: true,
        },
      });
    }

    return product;
  },
  async createVariant({
    title,
    description,
    measureType,
    measureUnit,
    regularPrice,
    salePrice,
    stock,
    slug,
    color,
    size,
    image,
    categoryId,
    subcategoryId,
    parentProductId,
    userId,
  }: {
    title: string;
    description: string;
    measureType?: string;
    measureUnit?: string;
    regularPrice?: number;
    salePrice?: number;
    stock?: number;
    slug: string;
    color?: string;
    size?: string;
    image?: any;
    categoryId?: string;
    subcategoryId?: string;
    parentProductId?: string;
    userId: string;
  }) {
    const parentProduct = await prisma.product.findFirst({
      where: { id: parentProductId },
    });

    if (!parentProduct) {
      throw new NotFound("Parent product not found");
    }

    const variantExistFilter = [];

    color && variantExistFilter.push({ color: color });
    size && variantExistFilter.push({ size: size });
    measureUnit && variantExistFilter.push({ measureUnit: measureUnit });

    const variantExist = await prisma.product.findFirst({
      where: {
        AND: [
          {
            parentProductId: parentProduct.id,
          },
          {
            status: true,
          },
          ...variantExistFilter,
        ],
      },
    });

    if (variantExist) throw new Conflict("Variant already exists");
    let imagePath, imageUrl;

    if (image) {
      const file = await new MediaService().uploadMedia(
        image,
        "product-images"
      );
      imagePath = file.path;
      imageUrl = file.url;
    }

    // const colorSlug = color ? color : undefined;

    const slugVariant = (parentProduct?.slug as string) + `-${color}-${size}`;

    const product = await prisma.product.create({
      data: {
        title: parentProduct.title,
        description: parentProduct.description,
        measureType: parentProduct?.measureType,
        measureUnit: measureUnit ? measureUnit : null,
        regularPrice,
        salePrice,
        stock,
        slug: slugVariant,
        color: color ? color : null,
        size: size ? size : null,
        imagePath,
        imageUrl,
        discount:
          (((regularPrice as number) - (salePrice as number)) /
            (regularPrice as number)) *
          100,
        allImages: image
          ? {
              create: [
                {
                  imagePath: imagePath as string,
                  imageUrl: imageUrl as string,
                },
              ],
            }
          : undefined,
        category: {
          connect: {
            id: parentProduct.categoryId as string,
          },
        },
        subcategory: {
          connect: {
            id: parentProduct.subcategoryId as string,
          },
        },
        parentProduct: parentProductId
          ? {
              connect: {
                id: parentProductId,
              },
            }
          : undefined,
        isParentProduct: false,
        manufacturer: {
          connect: {
            id: userId,
          },
        },
      },
    });

    return product;
  },
  async get(
    id: string,
    filteredColor?: string,
    filteredSize?: string,
    filteredMeasureType?: string,
    filteredMeasureUnit?: string,
    primaryAttribute?: String
  ) {
    let product: any = await prisma.product.findUnique({
      where: { id: id },
      include: {
        category: true,
        subcategory: true,
        cashPoint: true,
        allImages: true,
        parentProduct: {
          select: {
            id: true,
          },
        },
      },
    });

    const totalColors =
      product?.color && product?.colorHex
        ? await prisma.product
            .groupBy({
              where: {
                parentProductId: product.parentProduct.id,
              },
              by: ["colorHex", "color"],
              _count: { colorHex: true },
            })
            .then((colors) =>
              colors.map(({ _count, colorHex, color }) => ({
                colorHex,
                color,
                count: _count.colorHex,
              }))
            )
        : [];
    const totalSizes = product?.size
      ? await prisma.product
          .groupBy({
            where: {
              parentProductId: product.parentProduct.id,
            },
            by: ["size"],
            _count: { size: true },
          })
          .then((sizes) =>
            sizes.map(({ _count, size }) => ({ size, count: _count.size }))
          )
      : [];
    const totalMeasureTypes = product?.measureType
      ? await prisma.product
          .groupBy({
            where: {
              parentProductId: product.parentProduct.id,
            },
            by: ["measureType"],
            _count: { measureType: true },
          })
          .then((measureTypes) =>
            measureTypes.map(({ _count, measureType }) => ({
              measureType,
              count: _count.measureType,
            }))
          )
      : [];
    const totalMeasureUnits = product?.measureUnit
      ? await prisma.product
          .groupBy({
            where: {
              parentProductId: product.parentProduct.id,
            },
            by: ["measureUnit"],
            _count: { measureUnit: true },
          })
          .then((measureUnits) =>
            measureUnits.map(({ _count, measureUnit }) => ({
              measureUnit,
              count: _count.measureUnit,
            }))
          )
      : [];

    const variants = await prisma.product.findMany({
      where: {
        parentProductId: product.parentProduct.id,
        status: true,
      },
      include: {
        category: true,
        subcategory: true,
        cashPoint: true,
        allImages: true,
        parentProduct: {
          select: {
            id: true,
          },
        },
      },
    });
    console.log({ filteredColor, filteredSize });

    const variantFilter = [];
    const primaryAtrributeFilter = [];

    switch (primaryAttribute) {
      case "color":
        primaryAtrributeFilter.push({ colorHex: filteredColor });
        break;
      case "size":
        primaryAtrributeFilter.push({ size: filteredSize });
        break;
      case "measureType":
        primaryAtrributeFilter.push({ measureType: filteredMeasureType });
        break;
      case "measureUnit":
        primaryAtrributeFilter.push({ measureUnit: filteredMeasureUnit });
        break;
      default:
        primaryAtrributeFilter.push({ colorHex: filteredColor });
    }

    filteredColor && variantFilter.push({ colorHex: filteredColor });
    filteredSize && variantFilter.push({ size: filteredSize });
    filteredMeasureType &&
      variantFilter.push({ measureType: filteredMeasureType });
    filteredMeasureUnit &&
      variantFilter.push({ measureUnit: filteredMeasureUnit });

    if (variantFilter.length) {
      console.log({ filteredColor, filteredSize });
      let variantAllMatch: any = await prisma.product.findFirst({
        where: {
          AND: [{ parentProductId: product.parentProductId }, ...variantFilter],
        },
      });
      let variantOneMatch = await prisma.product.findFirst({
        where: {
          AND: [
            {
              parentProductId: product.parentProductId,
            },
            ...primaryAtrributeFilter,
            {
              OR: [...variantFilter],
            },
          ],
        },
      });
      console.log({ variantOneMatch });
      product = variantAllMatch || variantOneMatch;
    }

    const availableColors = product?.colorHex
      ? await prisma.product
          .groupBy({
            where: {
              id: product.id,
            },
            by: ["colorHex"],
          })
          .then((colors) => colors.map(({ colorHex }) => colorHex))
      : [];
    const availableSizes = product?.size
      ? await prisma.product
          .groupBy({
            where: {
              id: product.id,
            },
            by: ["size"],
          })
          .then((sizes) => sizes.map(({ size }) => size))
      : [];
    const availableMeasureTypes = product?.measureType
      ? await prisma.product
          .groupBy({
            where: {
              id: product.id,
            },
            by: ["measureType"],
          })
          .then((measureTypes) =>
            measureTypes.map(({ measureType }) => measureType)
          )
      : [];
    const availableMeasureUnits = product?.measureUnit
      ? await prisma.product
          .groupBy({
            where: {
              id: product.id,
            },
            by: ["measureUnit"],
          })
          .then((measureUnits) =>
            measureUnits.map(({ measureUnit }) => measureUnit)
          )
      : [];

    let discount = product?.discount ? Math.ceil(product.discount) : 0;

    product.variants = variants;
    product.discount = discount;
    product.totalColors = totalColors;
    product.totalSizes = totalSizes;
    product.totalMeasureTypes = totalMeasureTypes;
    product.totalMeasureUnits = totalMeasureUnits;
    product.availableColors = availableColors;
    product.availableSizes = availableSizes;
    product.availableMeasureTypes = availableMeasureTypes;
    product.availableMeasureUnits = availableMeasureUnits;

    console.log("all ok");

    return product;
  },
  async getAll({
    page,
    limit,
    search,
    title,
    slug,
    measureType,
    measureUnit,
    color,
    size,
    ratingAvg,
    categoryId,
    subcategoryId,
    id,
    startPrice,
    endPrice,
    brand,
    manufacturerId,
    loggedInUserId,
    role,
    sortByPriceAsc,
    sortByPriceDesc,
    sortByDiscount,
    sortByRating,
  }: {
    page?: number;
    limit?: number;
    search?: string;
    title?: string;
    slug?: string;
    measureType?: string;
    measureUnit?: string;
    color?: string;
    size?: string;
    ratingAvg?: number;
    categoryId?: string;
    subcategoryId?: string;
    id?: string;
    startPrice?: number;
    endPrice?: number;
    brand?: string;
    manufacturerId?: string;
    loggedInUserId?: string;
    role?: string;
    sortByPriceAsc?: string;
    sortByPriceDesc?: string;
    sortByDiscount?: string;
    sortByRating?: string;
  }) {
    // const aggregationArg = [];
    const paginationArgs = [];
    const match = [];
    const filter = [];
    const globalSearch = [];
    const sortMatch = [];

    const loggedInUserArgs = [];

    if (loggedInUserId && role === "RETAILER") {
      console.log({ loggedInUserId });
      loggedInUserArgs.push(
        {
          $lookup: {
            from: "WISHLIST",
            as: "wishlist",
            // localField: "wishListIds",
            // foreignField: "_id",
            pipeline: [
              {
                $match: {
                  $expr: {
                    $eq: [{ $toString: "$customerId" }, loggedInUserId],
                  },
                },
              },
            ],
          },
        },
        {
          $unwind: {
            path: "$wishlist",
            preserveNullAndEmptyArrays: true,
          },
        },
        // {
        //   $addFields: {
        //     wishList: {
        //       $arrayElemAt: ["$wishlit", 0],
        //     },
        //   },
        // }
        {
          $addFields: {
            wishListProductIds: {
              $map: {
                input: "$wishlist.productIds",
                as: "wishlistProductId",
                in: { $toString: "$$wishlistProductId" },
              },
            },
            // wishList: "$wishlist",
          },
        },
        {
          $addFields: {
            isAddedToWishList: {
              $cond: [
                {
                  $in: ["$id", "$wishListProductIds"],
                },
                true,
                false,
              ],
            },
          },
        }
      );
    }

    if (startPrice && endPrice) {
      filter.push(
        {
          $gte: ["$salePrice", startPrice],
        },
        {
          $lte: ["$salePrice", endPrice],
        }
      );
    } else if (startPrice) {
      filter.push({
        $gte: ["$salePrice", startPrice],
      });
    } else if (endPrice) {
      filter.push({
        $lte: ["$salePrice", endPrice],
      });
    }

    if (manufacturerId) {
      filter.push({
        $eq: [{ $toString: "$manufacturer.id" }, manufacturerId],
      });
    }
    if (brand) {
      filter.push({
        $eq: ["$manufacturer.id", brand],
      });
    }

    if (search) {
      globalSearch.push({
        $match: {
          $or: [
            {
              title: {
                $regex: search,
                $options: "i",
              },
            },
            {
              slug: {
                $regex: search,
                $options: "i",
              },
            },
            {
              measureType: {
                $regex: search,
                $options: "i",
              },
            },
            {
              measureUnit: {
                $regex: search,
                $options: "i",
              },
            },
            {
              color: {
                $regex: search,
                $options: "i",
              },
            },
            {
              size: {
                $regex: search,
                $options: "i",
              },
            },
            {
              ratingAvg: {
                $regex: search,
                $options: "i",
              },
            },
            {
              "category.title": {
                $regex: search,
                $options: "i",
              },
            },
            {
              "subcategory.title": {
                $regex: search,
                $options: "i",
              },
            },
          ],
        },
      });
    }

    if (id) {
      console.log("id--->", id);
      match.push({
        $match: {
          // parentProductId: { $toObjectId: id },
          // isParentProduct: false,
          // status: true,
          $expr: {
            $and: [
              {
                $eq: [id, "$parentProductId"],
              },
              {
                $eq: ["$isParentProduct", false],
              },
              {
                $eq: ["$status", true],
              },
            ],
          },
        },
      });
    }

    if (!id) {
      match.push({
        $match: {
          isParentProduct: true,
          status: true,
          // $expr: {
          //   $and: [
          //     {
          //       $eq: ["$status", true],
          //     },
          //     {
          //       $eq: ["$isParentProduct", true],
          //     },
          //   ],
          // },
        },
      });
    }

    if (title) {
      filter.push({
        $eq: ["$title", title],
      });
    }
    if (slug) {
      filter.push({
        $eq: ["$slug", slug],
      });
    }
    if (measureType) {
      filter.push({
        $eq: ["$measureType", measureType],
      });
    }
    if (measureUnit) {
      filter.push({
        $eq: ["$measureUnit", measureUnit],
      });
    }
    if (color) {
      filter.push({
        $eq: ["$color", color],
      });
    }
    if (size) {
      filter.push({
        $eq: ["$size", size],
      });
    }
    if (ratingAvg) {
      filter.push({
        $gte: ["$ratingAvg", Math.floor(ratingAvg)],
      });
    }
    if (categoryId) {
      filter.push({
        $eq: ["$categoryId", categoryId],
      });
    }
    if (subcategoryId) {
      filter.push({
        $eq: ["$subcategoryId", subcategoryId],
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

    // console.log({ search, searchMatch: JSON.stringify(globalSearch) });

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

    // console.log("match", JSON.stringify(match));
    if (sortByPriceAsc) {
      sortMatch.push({
        $sort: {
          salePrice: 1,
        },
      });
    }
    if (sortByPriceDesc) {
      sortMatch.push({
        $sort: {
          salePrice: -1,
        },
      });
    }
    if (sortByDiscount) {
      sortMatch.push({
        $sort: {
          discount: -1,
        },
      });
    }
    if (sortByRating) {
      sortMatch.push({
        $sort: {
          ratingAvg: -1,
        },
      });
    }

    const aggregationArgs = [
      //----------------------------------------------------------------PARENT PRODUCT----------------------------------------------------------------
      {
        $lookup: {
          from: "PRODUCTS",
          as: "parentProduct",
          localField: "parentProductId",
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
          path: "$parentProduct",
          preserveNullAndEmptyArrays: true,
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

      //-----------------------------------------SUB-CATEGORY-----------------------------
      {
        $lookup: {
          from: "CATEGORIES",
          as: "subcategory",
          localField: "subcategoryId",
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

      //-----------------------------------------REVIEWS-----------------------------
      {
        $lookup: {
          from: "REVIEWS",
          as: "reviews",
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

      //-----------------------------------------MANUFACTURER-----------------------------
      {
        $lookup: {
          from: "USERS",
          as: "manufacturer",
          localField: "manufacturerId",
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

      //-----------------------------------------CASH POINTS-----------------------------
      {
        $lookup: {
          from: "CASH_POINTS",
          as: "cashPoint",
          localField: "_id",
          foreignField: "productId",
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

      //-----------------------------------------IMAGES-----------------------------
      {
        $lookup: {
          from: "IMAGES",
          as: "allImages",
          localField: "_id",
          foreignField: "productId",
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

      //-----------------------------------------VARIANTS-----------------------------
      // {
      //   $lookup: {
      //     from: "PRODUCTS",
      //     as: "Variants",
      //     localField: "parentProductId",
      //     foreignField: "parentProduct.id",
      //     pipeline: [
      //       {
      //         $addFields: {
      //           id: {
      //             $toString: "$_id",
      //           },
      //         },
      //       },
      //     ],
      //   },
      // },

      {
        $project: {
          id: {
            $toString: "$_id",
          },
          title: 1,
          slug: 1,
          description: 1,
          measureType: 1,
          measureUnit: 1,
          color: 1,
          size: 1,
          regularPrice: 1,
          salePrice: 1,
          stock: 1,
          isParentProduct: 1,
          parentProductId: {
            $toString: "$parentProductId",
          },
          status: 1,
          imageUrl: 1,
          discount: { $ceil: "$discount" },
          ratingAvg: 1,
          reviewCount: 1,

          parentProduct: 1,

          // parentProduct: { $arrayElemAt: ["$parentProduct", 0] },
          category: { $arrayElemAt: ["$category", 0] },
          subcategory: { $arrayElemAt: ["$subcategory", 0] },
          cashPoint: { $arrayElemAt: ["$cashPoint", 0] },
          reviews: 1,
          allImages: 1,

          // Variants: 1,
          manufacturer: { $arrayElemAt: ["$manufacturer", 0] },
        },
      },
      ...loggedInUserArgs,
      ...globalSearch,
      ...match,
      ...sortMatch,
    ];

    const [products, totalDataCount]: any = await Promise.all([
      prisma.product.aggregateRaw({
        pipeline: [...aggregationArgs, ...paginationArgs],
      }),
      prisma.product.aggregateRaw({
        pipeline: [...aggregationArgs, { $count: "total" }],
      }),
    ]);

    return {
      products,
      pagination: { totalCount: totalDataCount[0]?.total, page, limit },
    };
  },
  async update(
    id: string,
    data: Prisma.ProductUpdateInput,
    image: UploadedFile
  ) {
    console.log({ id, data });
    const { regularPrice, salePrice, stock, ...rest } = data;
    const product = await prisma.product.findUnique({ where: { id: id } });

    console.log({ rest });

    if (!product) {
      throw new NotFound("Product Not Found");
    }
    let imagePath, imageUrl;

    if (image) {
      const file = await new MediaService().uploadMedia(
        image,
        "product-images"
      );
      imagePath = file.path;
      imageUrl = file.url;
    }

    console.log({ imagePath, imageUrl });

    await prisma.product.update({
      where: { id },
      data: {
        regularPrice: regularPrice
          ? Number(regularPrice)
          : product.regularPrice,
        salePrice: salePrice ? Number(salePrice) : product.salePrice,
        stock: stock ? Number(stock) : product.stock,
        imagePath: imagePath ? imagePath : undefined,
        imageUrl: imageUrl ? imageUrl : undefined,
        ...rest,
      },
    });
  },
  async delete(id: string) {
    const product = await prisma.product.findUnique({ where: { id: id } });

    if (!product) {
      throw new NotFound("Product Not Found");
    }

    if (product.isParentProduct) {
      await prisma.product.updateMany({
        where: { parentProductId: product.id },
        data: {
          status: false,
        },
      });
    }

    await prisma.product.update({
      where: { id },
      data: {
        status: false,
      },
    });
  },
  async addImages(images: any, productId: string) {
    const files = await new MediaService().uploadMultipleMedia(images);

    const imageData = files.map((file) => {
      return {
        imagePath: file.path,
        imageUrl: file.url,
        productId: productId,
      };
    });

    if (imageData.length < 1) throw Error("Images failed to upload! try again");

    await prisma.image.createMany({
      data: [...imageData],
    });
    return;
  },
  async deleteImg(imageId: string) {
    await prisma.image.delete({
      where: {
        id: imageId,
      },
    });
    return;
  },
  async deleteImages(imageIds: string[]) {
    await prisma.image.deleteMany({
      where: {
        id: { in: imageIds },
      },
    });
    return;
  },
  async deleteImagesByProduct(productId: string) {
    await prisma.image.deleteMany({
      where: {
        productId,
      },
    });
    return;
  },
};
