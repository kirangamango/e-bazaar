import { Prisma } from "@prisma/client";
import { prisma } from "../configs";
import { NotFound } from "http-errors";

export const commissionFunction = {
  async create({ amount, userId }: { amount: number; userId: string }) {
    const isCommissionExist = await prisma.commission.findFirst({
      where: {
        userId,
      },
    });
    const commission = await prisma.commission.upsert({
      where: {
        id: isCommissionExist?.id,
      },
      update: { amount },
      create: {
        amount,
        user: {
          connect: {
            id: userId,
          },
        },
      },
    });
    return commission;
  },
  async createDistributorCommsion({
    amount,
    userId,
  }: {
    amount: number;
    userId: string;
  }) {
    const isCommissionExist = await prisma.commission.findFirst({
      where: {
        userId,
      },
    });
    const commission = await prisma.commissionDistributor.upsert({
      where: {
        id: isCommissionExist?.id,
      },
      update: { amount },
      create: {
        amount,
        user: {
          connect: {
            id: userId,
          },
        },
      },
    });
    return commission;
  },
  async getAll({
    page,
    limit,
    search,
  }: {
    page?: number;
    limit?: number;
    search?: string;
  }) {
    const searchArgs = {
      OR: [{ amount: { contains: search, mode: "insensitive" } }],
    };
    const where: any = search
      ? {
          AND: [searchArgs],
        }
      : {};
    let commissions;
    if (page && limit) {
      commissions = await prisma.commission.findMany({
        where,
        orderBy: {
          createdAt: "desc",
        },
        skip: (page - 1) * limit,
        take: limit,
        include: {
          user: true,
        },
      });
    } else {
      commissions = await prisma.commission.findMany({
        where,
        orderBy: {
          createdAt: "desc",
        },
        include: {
          user: true,
        },
      });
    }
    return {
      commissions,
      pagination: { page, limit, total: commissions.length },
    };
  },
  async getById(id: string) {
    const commission = await prisma.commission.findUnique({
      where: { id: id },
    });
    if (!commission) throw new NotFound("NO commission found");
    return commission;
  },
  async update(id: string, data: Prisma.CommissionUpdateInput) {
    const commission = await prisma.commission.findUnique({
      where: { id: id },
    });
    if (!commission) throw new NotFound("NO commission found");
    await prisma.commission.update({
      where: { id },
      data,
    });
  },
  async delete(id: string) {
    const commission = await prisma.commission.findUnique({
      where: { id: id },
    });
    if (!commission) throw new NotFound("NO commission");
    await prisma.commission.delete({ where: { id } });
  },
};
