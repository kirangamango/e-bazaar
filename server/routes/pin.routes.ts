import { Router } from "express";
// import { admin } from "../configs";
import { pinController } from "../controllers";

const router = Router();

router.get("/", pinController.getAll);
router.put("/", pinController.updateMany);

export default router;
