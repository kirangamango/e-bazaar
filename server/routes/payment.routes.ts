import { Router } from "express";
import { authenticate, validate } from "../middlewares";
import { paymentController } from "../controllers";

const router = Router();

router.get("/:id", paymentController.verifyPayment);

export default router;
