import { Router } from "express";
import { InvoiceController } from "../controllers";

const router = Router();

router.get("/", InvoiceController.create);
router.get("/:orderId", InvoiceController.getInvoiceByOrderId);

export default router;
