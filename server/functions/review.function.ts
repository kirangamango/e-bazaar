import { Prisma } from "@prisma/client";
import { prisma } from "../configs";
import { NotFound, NotAcceptable } from "http-errors";

interface CreateReviewInput {
  rating: number;
  comment?: string;
  customerId: string;
  productId: string;
}

interface UpdateReviewInput {
  rating?: number;
  comment?: string;
  isPublished?: boolean;
}

interface GetReviewsOptions {
  skip?: number;
  take?: number;
  productId?: string;
  isPublished?: boolean;
  userId?: string;
}

export const ReviewFunction = {
  async createReview(input: CreateReviewInput) {
    const { customerId, productId, rating, ...rest } = input;
    const where: Prisma.ReviewWhereInput = {
      customerId: customerId,
      productId,
    };
    const isReviewExist = await prisma.review.findFirst({
      where,
    });

    if (isReviewExist) {
      throw new Error(
        "Review is already created for this User  on this Product"
      );
    }

    if (input?.comment && !rating)
      throw new NotAcceptable("Rate the product to give a review");

    const reviewCount = await prisma.review.count({
      where: { productId: productId, rating: { gt: 0 } },
    });

    const review = await prisma.review.create({
      data: {
        ...rest,
        rating: rating ? rating : 0,
        customerId,
        productId,
      },
    });

    const product = await prisma.product.findUnique({
      where: {
        id: productId,
      },
    });

    await prisma.product.update({
      where: {
        id: productId,
      },
      data: {
        ratingAvg:
          (product?.ratingAvg as number) +
          rating / ((product?.reviewCount as number) + 1),
        reviewCount: (product?.reviewCount as number) + 1,
      },
    });
    return review;
  },

  async getReviewById(id: string) {
    const review = await prisma.review.findUnique({
      where: { id },
      include: {
        customer: { select: { id: true, name: true, email: true } },
        product: { select: { id: true, title: true } },
      },
    });
    return review;
  },

  async getReviews(options: GetReviewsOptions) {
    const { skip = 0, take = 20, productId, userId, isPublished } = options;

    const filter = [];
    productId && filter.push({ productId });
    userId && filter.push({ customerId: userId });

    const where: Prisma.ReviewWhereInput = {
      OR: [...filter],
    };

    const reviews = await prisma.review.findMany({
      where,
      skip,
      take,

      include: {
        customer: { select: { id: true, name: true } },
        product: { select: { id: true, title: true } },
      },
    });

    const count = await prisma.review.count({ where });
    return {
      data: { reviews },
      pagination: { skip, take, total: count },
    };
  },

  async updateReview(id: string, data: UpdateReviewInput) {
    // const numberOfHighlightedReview = await prisma.review.findMany({
    //   where: { isHighlighted: true },
    // });

    // if (numberOfHighlightedReview.length > 7) {
    //   throw new Error("Limit is exceed. Please update isHighlighted");
    // }

    const isReviewExist = await prisma.review.findFirst({
      where: {
        id: id,
      },
    });
    if (!isReviewExist) throw new NotFound("Review not found");

    const updatedReview = await prisma.review.update({
      where: { id },
      data,
    });
    return updatedReview;
  },

  async deleteReview(id: string) {
    const isReviewExist = await prisma.review.findFirst({
      where: {
        id: id,
      },
    });

    if (!isReviewExist) throw new NotFound("Review not found");
    const deletedReview = await prisma.review.delete({ where: { id } });
    return deletedReview;
  },
};
