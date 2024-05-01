import cors from "cors";
import express from "express";
import fileUpload from "express-fileupload";
import { ListenerPlugin, RouterPlugin } from "./plugins";

const app = express();

app
  .use(cors())
  .use(express.json({ limit: "50mb" }))
  .use(express.urlencoded({ extended: true }))
  .use(fileUpload());

RouterPlugin.setup(app);
ListenerPlugin.listen(app);
