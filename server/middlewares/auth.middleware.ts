import { NextFunction, Request, Response } from "express";
import { User } from "@prisma/client";
import { Unauthorized } from "http-errors";
import { configs, prisma } from "../configs";
import jwt from "jsonwebtoken";

interface JwtPayload {
  userId: string;
}
declare global {
  namespace Express {
    interface Request {
      user?: User;
    }
  }
}

export const verifyToken = async (req: Request) => {
  const authorizationHeader = req.headers.authorization;
  if (!authorizationHeader)
    throw new Unauthorized("Authorization header is missing");

  const token = authorizationHeader.split(" ")[1];
  if (!token) throw new Unauthorized("Token is missing");

  const decodedToken = jwt.verify(token, configs.JWT_SECRET) as JwtPayload;

  const user = await prisma.user.findUnique({
    where: { id: decodedToken.userId },
  });

  if (!user) throw new Unauthorized("User not found");
  return user;
};

export const authenticate = {
  admin: async (req: Request, _res: Response, next: NextFunction) => {
    try {
      const user = await verifyToken(req);
      if (user.role !== "SUPER_ADMIN")
        throw Unauthorized("Unauthorized, You can't perform this action!");
      req.user = user;
      next();
    } catch (error) {
      next(error);
    }
  },
  // user: async (req: Request, _res: Response, next: NextFunction) => {
  //   try {
  //     const user = await verifyToken(req);
  //     if (user.role !== "user")
  //       throw Unauthorized("You can't perform this action!");
  //     req.user = user;
  //     next();
  //   } catch (error) {
  //     next(error);
  //   }
  // },
  allUser: async (req: Request, _res: Response, next: NextFunction) => {
    try {
      const user = await verifyToken(req);
      if (!user.role) throw Unauthorized("You can't perform this action!");
      req.user = user;
      next();
    } catch (error) {
      next(error);
    }
  },
  any: async (req: Request, _res: Response, next: NextFunction) => {
    try {
      const authorizationHeader = req?.headers?.authorization;

      const token = authorizationHeader?.split(" ")[1];

      const decodedToken = token
        ? (jwt.verify(token, configs.JWT_SECRET) as JwtPayload)
        : undefined;

      const user = decodedToken
        ? await prisma.user.findUnique({
            where: { id: decodedToken.userId },
          })
        : undefined;

      if (user) {
        req.user = user;
      }
      next();
    } catch (error) {
      next(error);
    }
  },
};
