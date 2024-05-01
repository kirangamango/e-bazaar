import { Router } from "express";
import { userValidation } from "../validations";
import { authenticate, validate } from "../middlewares";
import { commissionController } from "../controllers";

const router = Router();

router.post("/", authenticate.allUser, commissionController.create);
router.post(
  "/distributor-commission",
  authenticate.allUser,
  commissionController.createDistributor
);

router.get("/", commissionController.getAll);

router.get("/:id", commissionController.getById);

router.put("/:id", commissionController.update);

router.delete("/:id", commissionController.deleteById);

export default router;
