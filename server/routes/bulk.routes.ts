import { Router } from "express";
import { bulkController } from "../controllers";

const router = Router();

router.post("/user", bulkController.userUpload);
router.post("/product", bulkController.productUpload);

export default router;
