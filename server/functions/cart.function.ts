import { Prisma } from "@prisma/client";
import { prisma } from "../configs";
import { NotFound, NotAcceptable } from "http-errors";

export const CartFunction = {
  async addCart(customerId: string, productId: string, quantity: number) {
    const isProductExists = await prisma.product.findFirst({
      where: { id: productId },
      include: {
        category: true,
      },
    });

    if (!isProductExists) throw new NotFound("Product not found!!");

    if ((isProductExists.stock as number) < 1)
      throw new NotAcceptable("Product out of stock!!");

    //DAILY FRESH PRODUCT LOGIC
    const currDate = new Date();
    currDate.setHours(12, 0, 0);

    if (
      isProductExists?.category?.slug === "daily-fresh-products" &&
      currDate < new Date()
    )
      throw new NotFound(
        "Daily fresh products can only be ordered before 12:00PM"
      );

    //Add Product to cart
    const isCartCreated = await prisma.cart.findFirst({
      where: { customerId },
      include: { CartsInProduct: true },
    });
    let isProductAddedToCart;
    if (isCartCreated) {
      isProductAddedToCart = await prisma.cartProduct.findFirst({
        where: {
          cartId: isCartCreated?.id,
          productId,
        },
      });
    }
    if (isCartCreated) {
      await prisma.cart.update({
        where: { id: isCartCreated.id },
        data: {
          CartsInProduct: isProductAddedToCart
            ? {
                update: {
                  where: {
                    id: isProductAddedToCart.id,
                    productId,
                  },
                  data: {
                    quantity: isProductAddedToCart.quantity + 1,
                  },
                },
              }
            : {
                create: {
                  quantity: quantity ? quantity : 1,
                  product: {
                    connect: {
                      id: productId,
                    },
                  },
                },
              },
          totalQuantity: quantity
            ? isCartCreated.totalQuantity + quantity
            : isCartCreated.totalQuantity + 1,
        },
      });
    } else {
      const cart = await prisma.cart.create({
        data: {
          totalQuantity: quantity ? quantity : 1,

          customer: {
            connect: {
              id: customerId,
            },
          },
        },
      });
      await prisma.cartProduct.create({
        data: {
          quantity: quantity ? quantity : 1,
          cart: {
            connect: {
              id: cart.id,
            },
          },
          product: {
            connect: {
              id: productId,
            },
          },
        },
      });
    }
    return;
  },
  async getCartItems(customerId: string) {
    const cartItems: any = await prisma.cart.findFirst({
      where: {
        customerId,
      },
      include: {
        CartsInProduct: {
          include: { product: true },
        },
      },
    });

    const productInCart = cartItems?.CartsInProduct.map((cartItem: any) => {
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

    const totalPrice = productInCart?.reduce(
      (accumulator: any, item: any) =>
        accumulator + item.quantity * item.salePrice,
      0
    );

    console.log({ productInCart, totalPrice });

    // delete cartItems?.CartsInProduct;
    if (productInCart?.length) {
      cartItems.CartsInProduct = productInCart;
      cartItems.totalPrice = totalPrice;
    }

    console.log({ cartItems });

    return cartItems;
  },
  async increaseQty(customerId: string, productId: string) {
    const isProductExists = await prisma.product.findFirst({
      where: { id: productId },
    });

    if (!isProductExists) throw new NotFound("Product not found!!");

    if ((isProductExists.stock as number) < 1)
      throw new NotAcceptable("Product out of stock!!");

    const isProductAddedToCart = await prisma.cartProduct.findFirst({
      where: {
        productId,
        cart: {
          customerId: customerId,
        },
      },
      include: {
        cart: true,
      },
    });

    if (!isProductAddedToCart)
      throw new NotFound("Product not added to the cart!!");

    await prisma.cart.update({
      where: { id: isProductAddedToCart.cartId },
      data: {
        totalQuantity: isProductAddedToCart.cart.totalQuantity + 1,

        CartsInProduct: {
          update: {
            where: {
              id: isProductAddedToCart.id,
            },
            data: {
              quantity: isProductAddedToCart.quantity + 1,
            },
          },
        },
      },
    });
    return;
  },
  async decreaseQty(customerId: string, productId: string) {
    const isProductExists = await prisma.product.findFirst({
      where: { id: productId },
    });

    if (!isProductExists) throw new NotFound("Product not found!!");

    if ((isProductExists.stock as number) < 1)
      throw new NotAcceptable("Product out of stock!!");

    const isProductAddedToCart = await prisma.cartProduct.findFirst({
      where: {
        productId,
        cart: {
          customerId: customerId,
        },
      },
      include: {
        cart: true,
      },
    });

    if (!isProductAddedToCart)
      throw new NotFound("Product not added to the cart!!");

    if (isProductAddedToCart.quantity < 1)
      throw new NotAcceptable("Product already removed");

    await prisma.cart.update({
      where: { id: isProductAddedToCart.cartId },
      data: {
        totalQuantity: isProductAddedToCart.cart.totalQuantity - 1,

        CartsInProduct:
          isProductAddedToCart.quantity === 1
            ? {
                delete: {
                  id: isProductAddedToCart.id,
                  productId,
                },
              }
            : {
                update: {
                  where: {
                    id: isProductAddedToCart.id,
                  },
                  data: {
                    quantity: isProductAddedToCart.quantity - 1,
                  },
                },
              },
      },
    });
    return;
  },
  async removeFromCart(customerId: string, productId: string) {
    const isProductExists = await prisma.product.findFirst({
      where: { id: productId },
    });

    if (!isProductExists) throw new NotFound("Product not found!!");

    const isProductAddedToCart = await prisma.cartProduct.findFirst({
      where: {
        productId,
        cart: {
          customerId: customerId,
        },
      },
      include: {
        cart: true,
      },
    });

    console.log({ isProductAddedToCart });

    if (!isProductAddedToCart)
      throw new NotFound("Product not added to the cart!!");

    // if (isProductAddedToCart.quantity < 1)
    //   throw new NotAcceptable("Product already removed");

    await prisma.cart.update({
      where: {
        id: isProductAddedToCart.cartId,
      },
      data: {
        totalQuantity:
          isProductAddedToCart.cart.totalQuantity -
          isProductAddedToCart.quantity,

        // CartsInProduct: {
        //   disconnect: [{ id: isProductAddedToCart.id }],
        // },
      },
    });

    //DELETE CART PRODUCT
    const deletedCartProduct = await prisma.cartProduct.deleteMany({
      where: {
        cartId: isProductAddedToCart?.cart?.id,
        productId: productId,
      },
    });

    console.log({ deletedCartProduct });

    return;
  },
  async deleteCart(cartId: string) {
    const cart = await prisma.cart.findFirst({ where: { id: cartId } });

    if (!cart) throw new NotFound("No items exist in cart");

    await prisma.cart.delete({
      where: {
        id: cartId,
      },
    });
  },
};
