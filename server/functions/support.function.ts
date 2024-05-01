import { Prisma } from "@prisma/client";
import { prisma } from "../configs";
import { NotFound } from "http-errors";
import { emailService } from "../services/email.service";
import { sendReplyEmail } from "../Templates/template";

export const supportFunction = {
  async create({
    userId,
    title,
    message,
  }: {
    userId: string;
    title: string;
    message: string;
  }) {
    console.log({ userId });
    const support = await prisma.support.create({
      data: {
        title,
        message,
        user: {
          connect: {
            id: userId,
          },
        },
      },
    });
    return support;
  },
  async getAll({
    page,
    limit,
    search,
    userId,
  }: {
    page?: number;
    limit?: number;
    search?: string;
    userId?: string;
  }) {
    const searchArgs = {
      OR: [{ title: { contains: search, mode: "insensitive" } }],
    };
    const filter = [];

    console.log({ userId });

    userId && filter.push({ userId });
    const where: any =
      search || filter.length
        ? {
            AND: [searchArgs, ...filter],
          }
        : {};
    console.log("where", JSON.stringify(where));
    let supports;
    if (page && limit) {
      supports = await prisma.support.findMany({
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
      supports = await prisma.support.findMany({
        where,
        orderBy: {
          createdAt: "desc",
        },
        include: {
          user: true,
        },
      });
    }
    return { supports, pagination: { page, limit, total: supports.length } };

    // const support = await prisma.support.findMany()
    // return support;
  },
  async get(id: string) {
    const support = await prisma.support.findUnique({
      where: { id: id },
    });
    if (!support) throw new NotFound("Support not found");
    return support;
  },
  async update(id: string, data: Prisma.SupportUpdateInput) {
    const support = await prisma.support.findUnique({ where: { id: id } });

    if (!support) throw new NotFound("Support not found");

    await prisma.support.update({
      where: { id },
      data,
    });
  },
  async delete(id: string) {
    const support = await prisma.support.findUnique({ where: { id: id } });
    if (!support) throw new NotFound("Support not found");

    await prisma.support.delete({
      where: { id },
    });
  },
  async sendReply(id: string, data: string) {
    const support = await prisma.support.findUnique({
      where: { id },
      include: { user: { select: { name: true, email: true, id: true } } },
    });

    if (!support) throw new NotFound("Support not found");

    const subject = support.title;
    const template = sendReplyEmail(support.user.name, support.title, data);
    emailService.sendMail(support.user.email, subject, template);

    return;
  },
};
