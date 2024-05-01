import { Prisma } from "@prisma/client";
import { prisma } from "../configs";
import { Conflict, NotFound } from "http-errors";
import MediaService from "../services/media.service";

export const BannerFunction = {
  async addImages(images: any, userId: string) {
    const files = await new MediaService().uploadMultipleMedia(images);

    const bannerData = files.map((file) => {
      return {
        bannerPath: file.path,
        bannerUrl: file.url,
        ownerId: userId,
      };
    });

    if (bannerData.length < 1)
      throw Error("Images failed to upload! try again");

    await prisma.banner.createMany({
      data: [...bannerData],
    });
  },
  async getById(id: string) {
    const banner = await prisma.banner.findUnique({
      where: { id },
    });
    return banner;
  },
  async update(id: string, input: Prisma.BannerUpdateInput) {
    const banner = await prisma.banner.update({
      where: { id },
      data: input,
    });
    return banner;
  },
  async getAll({
    page,
    limit,
    isDisplayStatus,
    userId,
  }: {
    page?: number;
    limit?: number;
    isDisplayStatus?: boolean;
    userId?: string;
  }) {
    const filter = [];
    userId && filter.push({ ownerId: userId });
    isDisplayStatus && filter.push({ displayStatus: true });
    const where: any = filter.length ? { AND: [...filter] } : undefined;
    const banner = await prisma.banner.findMany({
      where,
      skip: page && limit ? (page - 1) * limit : undefined,
      take: page && limit ? limit : undefined,
    });
    return banner;
  },
  async delete(id: string) {
    const banner = await prisma.banner.findUnique({
      where: { id },
    });
    if (!banner) throw new NotFound("No banner found");
    await prisma.banner.delete({
      where: { id },
    });
    return;
  },
  async deleteMany(bannerIds: string[]) {
    await prisma.banner.deleteMany({
      where: { id: { in: bannerIds } },
    });
    return;
  },
  async deleteAll() {
    await prisma.banner.deleteMany({});
    return;
  },
};
