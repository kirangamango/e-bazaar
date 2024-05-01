import { Express } from "express";
import http from "http";
import { configs } from "../configs";
export const ListenerPlugin = {
  listen(app: Express) {
    const server = http.createServer(app);
    server.listen(configs.PORT, () => {
      console.log(`\nServer is running on port ${configs.PORT}\n`);
    });
  },
};
