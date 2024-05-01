import { Router } from "express";
import { authenticate, validate } from "../middlewares";
import { BannerController } from "../controllers";

const router = Router();

router.post("/", authenticate.allUser, BannerController.create);

router.get("/", BannerController.getAll);

router.get("/get-by-user", authenticate.allUser, BannerController.getByUser);

router.get("/:id", BannerController.getById);

router.put("/:id", BannerController.update);

router.delete("/delete-many", BannerController.deleteMany);
router.delete("/delete-all", BannerController.deleteAll);
router.delete("/:id", BannerController.delete);

export default router;
