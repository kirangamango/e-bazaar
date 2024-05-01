import { RequestHandler } from "express";
import { NotFound } from "http-errors";
import { prisma } from "../configs";

export const CheckoutController: {
  getOrUpdate: RequestHandler;
} = {
  async getOrUpdate(req, res, next) {
    try {
      const currUser = req.user;
      if (!currUser) throw NotFound("User must be logged in");

      const { addressId, isWalletRedeemed } = req?.body;

      const cart: any = await prisma.cart.findFirst({
        where: {
          customerId: currUser.id,
        },
        include: {
          CartsInProduct: {
            include: { product: true },
          },
        },
      });

      const productInCart = cart?.CartsInProduct.map((cartItem: any) => {
        return {
          // id: cartItem.id,
          quantity: cartItem.quantity,
          productId: cartItem.productId,
          cartId: cartItem.cartId,
          createdAt: cartItem.createdAt,
          updatedAt: cartItem.updatedAt,
          id: cartItem.product.id,
          title: cartItem.product.title,
          slug: cartItem.product.slug,
          imageUrl: cartItem.product.imageUrl,
          imagePath: cartItem.product.imagePath,
          description: cartItem.product.description,
          measureType: cartItem.product.measureType,
          measureUnit: cartItem.product.measureUnit,
          color: cartItem.product.color,
          size: cartItem.product.size,
          regularPrice: cartItem.product.regularPrice,
          salePrice: cartItem.product.salePrice,
          discount: cartItem.product.discount,
          stock: cartItem.product.stock,
          isParentProduct: cartItem.product.isParentProduct,
          ratingAvg: cartItem.product.ratingAvg,
          reviewCount: cartItem.product.reviewCount,
          status: cartItem.product.status,
        };
      });

      // delete cart?.CartsInProduct;
      cart.CartsInProduct = productInCart;

      const basePrice = productInCart.reduce(
        (accumulator: any, item: any) =>
          accumulator + item.quantity * item.salePrice,
        0
      );
      let totalPrice = basePrice;

      console.log({ productInCart, totalPrice, basePrice });

      const address = addressId
        ? await prisma.address.findFirst({
            where: {
              id: addressId,
            },
          })
        : await prisma.address.findFirst({
            where: {
              customerId: currUser.id,
              isDefault: true,
            },
          });

      const wallet = await prisma.wallet.findFirst({
        where: {
          userId: currUser.id,
        },
      });

      if (isWalletRedeemed) {
        totalPrice = basePrice - (wallet?.point as number);

        await prisma.wallet.update({
          where: {
            id: wallet?.id,
          },
          data: {
            point: 0,
          },
        });
      }

      cart.totalPrice = totalPrice;
      cart.basePrice = basePrice;

      res.json({
        success: true,
        data: {
          address,
          cart,
          wallet,
        },
      });
    } catch (error) {
      next(error);
    }
  },
};
