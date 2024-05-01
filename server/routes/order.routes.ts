import { Router } from "express";
import { userValidation } from "../validations";
import { authenticate, validate } from "../middlewares";
import { OrderController } from "../controllers";

const router = Router();
// router.post("/", userValidation.create, validate, userController.create);
router.post("/", authenticate.allUser, OrderController.create);
router.post(
  "/verify-order/:orderId",
  authenticate.allUser,
  OrderController.verifyOrder
);

router.post(
  "/assign-distributor-and-company-represenetative/:id",
  authenticate.allUser,
  OrderController.assignDistrubutorAndCompRep
);

router.get("/", OrderController.getAll);

router.get("/get-by-user", authenticate.allUser, OrderController.getByUser);

router.get("/export-all", authenticate.allUser, OrderController.exportOrder);

router.get(
  "/get-orders-by-distributor-cr",
  authenticate.allUser,
  OrderController.getByDistributorOrCR
);

router.get("/:id", OrderController.getById);

router.put("/:id", authenticate.allUser, OrderController.update);

router.put(
  "/cancel-order/:id",
  authenticate.allUser,
  OrderController.cancelOrder
);

router.delete("/:id", authenticate.allUser, OrderController.delete);

export default router;
