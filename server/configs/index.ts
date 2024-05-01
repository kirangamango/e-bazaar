import { PrismaClient } from "@prisma/client";
import { config } from "dotenv";
const prisma = new PrismaClient();
config();

const configs = {
  PORT: process.env.PORT,
  API_VERSION: `api/v1`,
  HOST: `${process.env.HOST}`,
  USER_PASSWORD: `${process.env.USER_PASSWORD}`,
  JWT_SECRET: `${process.env.JWT_SECRET}`,

  MAIL_USER: `${process.env.MAIL_FROM}`,
  MAIL_PASS: `${process.env.MAIL_PASS}`,

  CLIENT_EMAIL: `${process.env.CLIENT_EMAIL}`,
  PRIVATE_KEY: `${process.env.PRIVATE_KEY}`,
  PROJECT_ID: `${process.env.PROJECT_ID}`,

  CASHFREE_CLIENT_ID: `${process.env.CASHFREE_CLIENT_ID}`,
  CASHFREE_ACCESS_KEY: `${process.env.CASHFREE_SECRET_ACCESS_KEY}`,
  CASHFREE_ENV: process.env.CASHFREE_ENV,
};

export { configs, prisma };
