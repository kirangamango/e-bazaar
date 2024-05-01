import { Prisma } from "@prisma/client";
import { prisma } from "../configs";
import { NotFound } from "http-errors";

export const sizeFunction = {
  async create({
    name,
  }:{
    name:string
  }){
    const size = await prisma.size.create({
      data:{
        name:name.toUpperCase(),
      }
    })
    return size;
  },
  async getAll ({
    page,
    limit,
    search,
  }:{
    page?:number,
    limit?:number,
    search?:string,
  }){
    const searchArgs = {
      OR: [
      {name: {contains: search, mode:"insensitive"}}
      ],
    };
    const where: any = search ? {
      AND: [searchArgs],
    }
    :{};
    let sizes;
    if(page && limit){
      sizes = await prisma.size.findMany({
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
      sizes = await prisma.size.findMany({
        where,
        // orderBy: {
        //   createdAt: "desc",
        // },
        // include: {
        //  user: true,
        // },
      });
    }
    return { sizes, pagination: { page, limit, total: sizes.length } };
  },
  async getById(id: string){
    const size = await prisma.size.findUnique({
      where: {id: id},
    })
    if(!size) throw new NotFound("No such size found")
    return size;
  },
  async update(id: string, data: Prisma.SizeUpdateInput){
    const size = await prisma.size.findUnique({where: {id: id}});
    if(!size) throw new NotFound("No such size found")
    await prisma.size.update({
    where: {id},
    data,
    });
  },
  async delete(id: string){
    const size = await prisma.size.findUnique({where: {id: id}});
    if(!size) throw new NotFound("No such size");
    await prisma.size.delete({where: {id},});
  }
}