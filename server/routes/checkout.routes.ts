import { Router } from "express";
import { userValidation } from "../validations";
import { authenticate, validate } from "../middlewares";
import { CheckoutController } from "../controllers";

const router = Router();
// router.post("/", userValidation.create, validate, userController.create);

router.post("/", authenticate.allUser, CheckoutController.getOrUpdate);

export default router;
