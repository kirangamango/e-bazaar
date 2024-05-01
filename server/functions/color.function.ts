import { Prisma } from "@prisma/client";
import { prisma } from "../configs";
import { NotFound } from "http-errors";

export const colorFunction = {
  async create({ name, hexCode }: { name: string; hexCode: string }) {
    const color = await prisma.color.create({
      data: {
        name: name.toUpperCase(),
        hexCode: hexCode,
      },
    });
    console.log({ color });
    return color;
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
      OR: [{ name: { contains: search, mode: "insensitive" } }],
    };
    const where: any = search
      ? {
          AND: [searchArgs],
        }
      : {};
    let colors;
    if (page && limit) {
      colors = await prisma.color.findMany({
        where,
        // orderBy: {
        //   createdAt: "desc",
        // },
        skip: (page - 1) * limit,
        take: limit,
        // include:{
        //   user: true,
        // }
      });
    } else {
      colors = await prisma.color.findMany({
        where,
        // orderBy: {
        //   createdAt: "desc",
        // },
        // include: {
        //  user: true,
        // },
      });
    }
    return { colors, pagination: { page, limit, total: colors.length } };
  },
  async getById(id: string) {
    const color = await prisma.color.findUnique({
      where: { id: id },
    });
    if (!color) throw new NotFound("Could not find color");
    return color;
  },
  async update(id: string, data: Prisma.ColorUpdateInput) {
    const color = await prisma.color.findUnique({ where: { id: id } });
    if (!color) throw new NotFound("Could not find color");
    await prisma.color.update({
      where: { id },
      data,
    });
  },
  async delete(id: string) {
    const support = await prisma.color.findUnique({ where: { id: id } });
    if (!support) throw new NotFound("Could not find color");
    await prisma.color.delete({
      where: { id },
    });
  },
};
