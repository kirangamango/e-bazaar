import { Router } from "express";
import { userValidation } from "../validations";
import { authenticate, validate } from "../middlewares";
import { CategoryController } from "../controllers";

const router = Router();
// router.post("/", userValidation.create, validate, userController.create);
router.post("/", CategoryController.create);

router.get("/", CategoryController.getAll);

router.get("/parent-categories", CategoryController.getParentCategories);

router.get("/sub-categories/:id", CategoryController.getSubCategories);

router.get("/:id", CategoryController.getById);

router.put(
  "/:id",
  authenticate.allUser,
  // userValidation.update,
  // validate,
  CategoryController.update
);

router.delete("/:id", CategoryController.delete);

export default router;
