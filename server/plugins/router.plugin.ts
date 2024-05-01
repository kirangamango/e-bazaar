import { Express } from "express";
import { readdir } from "fs";
import path from "path";
import { configs } from "../configs";
import { errorHandler } from "../middlewares";

export const RouterPlugin = {
  setup(app: Express) {
    readdir(path.join(__dirname, "../routes"), (err, files) => {
      files.forEach(async (filename, index) => {
        const route = filename.split(".")[0];
        const router = await import(
          path.join(__dirname, `../routes/${filename}`)
        );
        app.use(`/${configs.API_VERSION}/${route}`, router.default);
        console.log(
          `http://${configs.HOST}:${configs.PORT}/${configs.API_VERSION}/${route}\n`
        );
        if (files?.length - 1 === index) {
          app.use(errorHandler);
          app.use((_req, res) => {
            res.status(404).json({ msg: "Route not found" });
          });
        }
      });
    });
  },
};
