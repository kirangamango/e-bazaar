import { Prisma } from "@prisma/client";
import { prisma } from "../configs";
import MediaService from "../services/media.service";

type GetCategoriesOptions = {
  skip?: number;
  take?: number;
  search?: string;
};

export const categoryFunction = {
  async createCategory(
    category: Prisma.CategoryCreateInput,
    parentCategoryId: string | undefined,
    image: any
  ) {
    console.log({ category });
    // Before creating check the slug already exists or not
    const isSlugExists = await prisma.category.findFirst({
      where: { slug: category.slug, status: true },
    });
    if (isSlugExists) throw new Error("Slug already exists!");

    let imagePath, imageUrl;
    if (image) {
      const file = await new MediaService().uploadMedia(
        image,
        "category-images"
      );
      imagePath = file.path;
      imageUrl = file.url;
    }

    // Create the category and return it
    const createdCategory = await prisma.category.create({
      data: {
        ...category,
        parentCategory: parentCategoryId
          ? { connect: { id: parentCategoryId as string } }
          : undefined,
        attributes: parentCategoryId ? category.attributes : undefined,
        imagePath,
        imageUrl,
      },
    });
    return createdCategory;
  },

  async getCategoryById(id: string) {
    const category = await prisma.category.findUnique({
      where: { id },
      //   include: {
      //     // _count: true,
      //     products: {
      //       include: {
      //         categories: { select: { id: true, title: true, slug: true } },
      //         variants: true,
      //         reviews: true,
      //       },
      //     },
      //   },
    });
    return category;
  },

  async getCategories(options: GetCategoriesOptions = {}) {
    const { skip, take, search } = options;

    const filter = [];

    filter.push({ status: true });
    const orderBy: Prisma.CategoryOrderByWithRelationInput = {
      title: "asc",
    };
    const where: Prisma.CategoryWhereInput = filter.length
      ? {
          // OR: [{ title: { contains: search, mode: "insensitive" } }],
          AND: [...filter],
        }
      : {};

    const data = await prisma.category.findMany({
      where,
      skip,
      take,
      orderBy,
    });

    return {
      data,
      pagination: { skip, take, total: await prisma.category.count({ where }) },
    };
  },

  async getParentCategories() {
    const parentCategories = await prisma.category.findMany({
      where: {
        status: true,
        OR: [
          {
            parentCategoryId: { isSet: false },
          },
          {
            parentCategoryId: null,
          },
        ],
      },
    });

    return parentCategories;
  },

  async getSubCategories(parentCategoryId: string) {
    const getSubCategories = await prisma.category.findMany({
      where: {
        AND: [
          {
            parentCategoryId: { isSet: true },
          },
          {
            parentCategoryId: { not: null },
          },
          {
            parentCategoryId: parentCategoryId,
          },
          {
            status: true,
          },
        ],
      },
    });

    return getSubCategories;
  },

  async updateCategory(id: string, data: Prisma.CategoryUpdateInput) {
    // check the category exists or not
    const isCategoryExists = await prisma.category.findUnique({
      where: { id },
    });
    if (!isCategoryExists) throw new Error("Category not found!");
    const { slug } = data;
    // Before updating slug check the slug already exists or not
    const isSlugExists =
      slug === isCategoryExists.slug
        ? false
        : typeof slug === "string"
        ? await prisma.category.findFirst({ where: { slug } })
        : false;
    if (isSlugExists) throw new Error("Slug already exists!");
    const updatedCategory = await prisma.category.update({
      where: { id },
      data: {
        icon: data.icon,
        title: data.title,
        slug: data.slug,
        // image: data.image,
        isFeatured: data.isFeatured,
        isPublished: data.isPublished,
        metaDesc: data.metaDesc,
        metaKeywords: data.metaKeywords,
        metaTitle: data.metaTitle,
      },
    });
    return updatedCategory;
  },

  async deleteCategory(id: string) {
    // check the category exists or not
    const isCategoryExists = await prisma.category.findUnique({
      where: { id },
    });
    if (!isCategoryExists) throw new Error("Category not found!");
    if (!isCategoryExists?.parentCategoryId) {
      await prisma.category.updateMany({
        where: { parentCategoryId: isCategoryExists.id },
        data: {
          status: false,
        },
      });
      await prisma.product.updateMany({
        where: {
          categoryId: isCategoryExists.id,
        },
        data: { status: false },
      });
    }
    const deletedCategory = await prisma.category.update({
      where: { id },
      data: { status: false },
    });

    await prisma.product.updateMany({
      where: {
        subcategoryId: id,
      },
      data: { status: false },
    });

    //set status false of all relevant products

    console.log(deletedCategory);
    return deletedCategory;
  },
};
