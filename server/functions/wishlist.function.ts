import { Conflict, NotFound } from "http-errors";
import { prisma } from "../configs";

// import { pushNotificationService } from "./pushNotification.service";

export const WishListFunction = {
  async getWishListByUserId(userId: string) {
    const whishlist = await prisma.wishList.findFirst({
      where: { customerId: userId },
      include: {
        Products: true,
      },
    });

    whishlist?.Products?.forEach((product) => {
      product.discount = Math.ceil(product.discount as number);
    });

    return whishlist;
  },

  async addProductToWishList(input: { userId: string; productId: string }) {
    const { userId, productId } = input;
    const product = await prisma.product.findUnique({
      where: { id: productId },
    });
    if (!product) throw new Error("Product not found");

    const isWishListCreated = await prisma.wishList.findFirst({
      where: {
        customerId: userId,
      },
    });

    if (isWishListCreated) {
      await prisma.wishList.update({
        where: {
          id: isWishListCreated.id,
        },
        data: {
          Products: {
            connect: [{ id: productId }],
          },
        },
      });
    } else {
      const addItem = await prisma.wishList.create({
        data: {
          customer: {
            connect: {
              id: userId,
            },
          },
          Products: {
            connect: [
              {
                id: productId,
              },
            ],
          },
        },
      });
    }

    // pushNotificationService({
    //   title: "Item is added to you wishList",
    //   body: `${addItem?.productVariant?.salePrice}`,
    //   image: addItem?.productVariant?.images[0],
    //   userIds: [userId],
    //   saveToDb: true,
    // });

    // return addItem;
    return;
  },

  async deleteWishListItem(id: string, productId: string) {
    console.log({ id, productId });
    const isWishListItemExist = await prisma.wishList.findFirst({
      where: { customerId: id },
      include: {
        Products: true,
      },
    });

    if (!isWishListItemExist?.productIds.includes(productId)) {
      throw new NotFound("Product is not in wishlist");
    }

    if (!isWishListItemExist) throw new Error("WishList item is not Found");

    console.log({ isWishListItemExist });
    const deleteWishList = await prisma.wishList.update({
      where: { id: isWishListItemExist.id },
      data: {
        Products: {
          disconnect: [
            {
              id: productId,
            },
          ],
        },
      },
    });

    return deleteWishList;
  },
};
