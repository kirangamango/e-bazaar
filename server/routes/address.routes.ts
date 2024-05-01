import { Router } from "express";
import { userValidation } from "../validations";
import { authenticate, validate } from "../middlewares";
import { AddressController } from "../controllers";

const router = Router();
// router.post("/", userValidation.create, validate, userController.create);
router.post("/", authenticate.allUser, AddressController.create);

router.post("/assign-area", AddressController.assignAddress);

router.get("/", authenticate.allUser, AddressController.getAll);

router.get("/test-api", authenticate.allUser, AddressController.test);

router.get("/:id", AddressController.getById);

router.put("/:id", AddressController.update);

router.delete("/:id", AddressController.delete);

export default router;
