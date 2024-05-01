import { Router } from "express";
import { userValidation } from "../validations";
import { authenticate, validate } from "../middlewares";
import { WalletController } from "../controllers";

const router = Router();
// router.post("/", userValidation.create, validate, userController.create);
router.post("/", WalletController.create);

router.get("/", WalletController.getAll);

router.get(
  "/wallet-by-user",
  authenticate.allUser,
  WalletController.getByUserId
);
router.get("/:id", WalletController.getById);

router.put("/:id", WalletController.update);

router.delete("/:id", WalletController.delete);

export default router;
