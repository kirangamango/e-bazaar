import { Router } from "express";
import { authenticate, validate } from "../middlewares";
import { colorController } from "../controllers";

const router = Router();

router.post("/", colorController.create);

router.get("/", colorController.getAll);
router.get("/update-many", colorController.updateMany);

router.get("/:id", colorController.getById); 

router.put("/:id", colorController.update);

router.delete("/:id", colorController.delete);

export default router;
