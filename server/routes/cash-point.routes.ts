import { Router } from "express";
import { authenticate, validate } from "../middlewares";
import { CashPointController } from "../controllers";

const router = Router();

router.post("/", CashPointController.create);

router.get("/", CashPointController.getAll);

router.get("/:id", CashPointController.getById);

router.put("/:id", CashPointController.update);

router.delete("/:id", CashPointController.delete);

export default router;
