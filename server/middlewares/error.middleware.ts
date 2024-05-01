import { Request, Response, NextFunction } from "express";

interface IError extends Error {
  status?: number;
  meta?: { cause?: string };
  code?: string;
}
export function errorHandler(
  err: IError,
  req: Request,
  res: Response,
  next: NextFunction
) {
  console.error(err);
  let message: string;
  let status: number;
  switch (err?.code) {
    case "P2025":
      status = 404;
      message = err?.meta?.cause || "Record not found";
      break;
    case "P2002":
      status = 409;
      message = err?.meta?.cause || "Record already exists";
      break;
    case "P2032":
      status = 500;
      message = "New Keys not added DB not updated";
      break;
    default:
      status = err?.status || 500;
      message = err?.meta?.cause || err?.message || "Something went wrong!";
  }
  res.status(status).json({ success: false, error: { msg: message } });
}
