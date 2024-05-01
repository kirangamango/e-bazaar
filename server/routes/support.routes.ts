import { Router } from "express";
import { userValidation } from "../validations";
import { authenticate, validate } from "../middlewares";
import { supportController } from "../controllers";

const router = Router();

router.post("/", authenticate.allUser, supportController.create);

router.post("/send-reply/:id", supportController.sendReply);

router.get("/", authenticate.allUser, supportController.getAll);

router.get("/:id", supportController.getById);

router.put("/:id", supportController.update);

router.delete("/:id", supportController.deleteById);

export default router;
