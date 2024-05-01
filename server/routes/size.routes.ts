import { Router } from "express";
import { authenticate, validate } from "../middlewares";
import { sizeController } from "../controllers";

const router = Router();

router.post("/",  sizeController.create);

router.get("/", sizeController.getAll);

router.get("/:id", sizeController.getById);

router.put("/:id", sizeController.update); 

router.delete("/:id", sizeController.deleteById);

export default router;