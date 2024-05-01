import { Prisma } from "@prisma/client";
import { prisma } from "../configs";
import { NotFound } from "http-errors";

export const CashPointFunction = {
  async create(input: Prisma.CashPointCreateInput & { productId: string }) {
    const { productId, measureUnitQty, cashPoints } = input;

    const isCashPointExists = await prisma.cashPoint.findUnique({
      where: {
        productId,
      },
    });

    let cashPoint;

    if (isCashPointExists) {
      cashPoint = await prisma.cashPoint.update({
        where: {
          id: isCashPointExists.id,
        },
        data: {
          measureUnitQty: measureUnitQty,
          cashPoints,
        },
      });
      return cashPoint;
    }
    cashPoint = prisma.cashPoint.create({
      data: {
        measureUnitQty,
        cashPoints,
        product: {
          connect: {
            id: productId,
          },
        },
      },
    });
    return cashPoint;
  },
};
