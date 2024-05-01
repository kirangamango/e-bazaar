import { RequestHandler } from "express";
import { ProductFunction } from "../functions";
import { prisma } from "../configs";
import { UploadedFile } from "express-fileupload";

export const ProductController: {
  create: RequestHandler;
  createVariant: RequestHandler;
  getAll: RequestHandler;
  getById: RequestHandler;
  update: RequestHandler;
  deleteById: RequestHandler;
  updateMany: RequestHandler;
  getAllVariants: RequestHandler;
  addImages: RequestHandler;
  deleteImage: RequestHandler;
  deleteImages: RequestHandler;
  deleteImageByProduct: RequestHandler;
} = {
  async create(req, res, next) {
    try {
      const currUser = req?.user;
      const {
        title,
        slug,
        description,
        measureType,
        measureUnit,
        color,
        size,
        regularPrice,
        salePrice,
        stock,
        categoryId,
        subcategoryId,
        parentProductId,
      } = req?.body;

      const image = req?.files?.img;

      const product = await ProductFunction.create({
        title,
        description,
        measureType,
        measureUnit,
        regularPrice: Number(regularPrice),
        salePrice: Number(salePrice),
        stock: Number(stock),
        slug,
        color,
        size,
        image,
        categoryId,
        subcategoryId,
        parentProductId,
        userId: currUser?.id as string,
      });
      res.json({
        success: true,
        msg: "Product created successfully",
        data: product,
      });
    } catch (error) {
      console.log(error);
      next(error);
    }
  },
  async createVariant(req, res, next) {
    try {
      const currUser = req?.user;
      const {
        title,
        slug,
        description,
        measureType,
        measureUnit,
        color,
        size,
        regularPrice,
        salePrice,
        stock,
        categoryId,
        subcategoryId,
        parentProductId,
      } = req?.body;

      const image = req?.files?.img;

      const product = await ProductFunction.createVariant({
        title,
        description,
        measureType,
        measureUnit,
        regularPrice: Number(regularPrice),
        salePrice: Number(salePrice),
        stock: Number(stock),
        slug,
        color,
        size,
        image,
        categoryId,
        subcategoryId,
        parentProductId,
        userId: currUser?.id as string,
      });
      res.json({
        success: true,
        msg: "Product created successfully",
        data: product,
      });
    } catch (error) {
      console.log(error);
      next(error);
    }
  },
  async getAll(req, res, next) {
    try {
      const currUser = req?.user;
      const {
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
        startPrice,
        endPrice,
        brand,
        manufacturerId,
        sortByPriceAsc,
        sortByPriceDesc,
        sortByDiscount,
        sortByRating,
      } = req?.query;

      const { products, pagination } = await ProductFunction.getAll({
        page: typeof page === "string" ? Number(page) : undefined,
        limit: typeof limit === "string" ? Number(limit) : undefined,
        search: typeof search === "string" ? search : undefined,
        title: typeof title === "string" ? title : undefined,
        slug: typeof slug === "string" ? slug : undefined,
        measureType: typeof measureType === "string" ? measureType : undefined,
        measureUnit: typeof measureUnit === "string" ? measureUnit : undefined,
        color: typeof color === "string" ? color : undefined,
        size: typeof size === "string" ? size : undefined,
        ratingAvg:
          typeof ratingAvg === "string" ? Number(ratingAvg) : undefined,
        categoryId: typeof categoryId === "string" ? categoryId : undefined,
        subcategoryId:
          typeof subcategoryId === "string" ? subcategoryId : undefined,
        startPrice:
          typeof startPrice === "string" ? Number(startPrice) : undefined,
        endPrice: typeof endPrice === "string" ? Number(endPrice) : undefined,
        brand: typeof brand === "string" ? brand : undefined,
        manufacturerId:
          typeof manufacturerId === "string" ? manufacturerId : undefined,
        loggedInUserId: currUser?.id,
        role: currUser?.role,
        sortByPriceAsc:
          typeof sortByPriceAsc === "string" ? sortByPriceAsc : undefined,
        sortByPriceDesc:
          typeof sortByPriceDesc === "string" ? sortByPriceDesc : undefined,
        sortByDiscount:
          typeof sortByDiscount === "string" ? sortByDiscount : undefined,
        sortByRating:
          typeof sortByRating === "string" ? sortByRating : undefined,
      });
      res.json({
        success: true,
        data: products,
        pagination,
      });
    } catch (error) {
      next(error);
    }
  },
  async getAllVariants(req, res, next) {
    try {
      const {
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
        startPrice,
        endPrice,
        brand,
        manufacturerId,
      } = req?.query;

      const id = req.params.id;

      console.log({ id });

      const { products, pagination } = await ProductFunction.getAll({
        page: typeof page === "string" ? Number(page) : undefined,
        limit: typeof limit === "string" ? Number(limit) : undefined,
        search: typeof search === "string" ? search : undefined,
        title: typeof title === "string" ? title : undefined,
        slug: typeof slug === "string" ? slug : undefined,
        measureType: typeof measureType === "string" ? measureType : undefined,
        measureUnit: typeof measureUnit === "string" ? measureUnit : undefined,
        color: typeof color === "string" ? color : undefined,
        size: typeof size === "string" ? size : undefined,
        ratingAvg:
          typeof ratingAvg === "string" ? Number(ratingAvg) : undefined,
        categoryId: typeof categoryId === "string" ? categoryId : undefined,
        subcategoryId:
          typeof subcategoryId === "string" ? subcategoryId : undefined,
        id: typeof id === "string" ? id : undefined,
        startPrice:
          typeof startPrice === "string" ? Number(startPrice) : undefined,
        endPrice: typeof endPrice === "string" ? Number(endPrice) : undefined,
        brand: typeof brand === "string" ? brand : undefined,
        manufacturerId:
          typeof manufacturerId === "string" ? manufacturerId : undefined,
      });
      res.json({
        success: true,
        data: products,
        pagination,
      });
    } catch (error) {
      next(error);
    }
  },
  async getById(req, res, next) {
    try {
      const {
        filteredColor,
        filteredSize,
        filteredMeasureType,
        filteredMeasureUnit,
        primaryAttribute,
      } = req?.query;
      const product = await ProductFunction.get(
        req.params.id,
        filteredColor as string,
        filteredSize as string,
        filteredMeasureType as string,
        filteredMeasureUnit as string,
        primaryAttribute as string
      );
      console.log({ product });
      res.json({
        success: true,
        data: product,
      });
    } catch (error) {
      next(error);
    }
  },
  async update(req, res, next) {
    try {
      // console.log({ "req.body": req.body });
      const image = req?.files?.img as UploadedFile;
      const data = req?.body;
      await ProductFunction.update(req.params.id, data, image);
      res.json({
        success: true,
        msg: "Product updated successfully",
      });
    } catch (error) {
      next(error);
    }
  },
  async deleteById(req, res, next) {
    try {
      await ProductFunction.delete(req.params.id);
      res.json({
        success: true,
        msg: "Product deleted successfully",
      });
    } catch (error) {
      next(error);
    }
  },
  async updateMany(req, res, next) {
    try {
      await prisma.product.updateMany({
        data: {
          status: true,
        },
      });
      res.json({
        success: true,
        msg: "update many successfully",
      });
    } catch (error) {
      next(error);
    }
  },
  async addImages(req, res, next) {
    try {
      let images: any = req?.files?.images;
      images = Array.isArray(images) ? images : [images];
      console.log(req?.files);
      await ProductFunction.addImages(images, req.params.id);
      res.json({
        success: true,
        msg: "images added successfully",
      });
    } catch (error) {
      next(error);
    }
  },
  async deleteImage(req, res, next) {
    try {
      const { id } = req?.params;
      await ProductFunction.deleteImg(id);
      res.json({ success: true, msg: "delete images successfully" });
    } catch (error) {
      next(error);
    }
  },
  async deleteImages(req, res, next) {
    try {
      const { imageIds } = req?.body;
      await ProductFunction.deleteImages(imageIds);
      res.json({ success: true, msg: "delete images successfully" });
    } catch (error) {
      next(error);
    }
  },
  async deleteImageByProduct(req, res, next) {
    const { productId } = req?.body;
    await ProductFunction.deleteImagesByProduct(productId);
    res.json({ success: true, msg: "delete images successfully" });
  },
};
