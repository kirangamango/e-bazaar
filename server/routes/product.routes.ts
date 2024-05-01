import { Router } from "express";
import { userValidation } from "../validations";
import { authenticate, validate } from "../middlewares";
import { ProductController } from "../controllers";

const router = Router();
// router.post("/", userValidation.create, validate, userController.create);
router.post("/", authenticate.allUser, ProductController.create);

router.post(
  "/create-variant",
  authenticate.allUser,
  ProductController.createVariant
);

router.post("/add-images/:id", ProductController.addImages);

router.get("/", authenticate.any, ProductController.getAll);

router.get("/update-many", ProductController.updateMany);

router.get("/get-all-variants/:id", ProductController.getAllVariants);

router.get("/:id", ProductController.getById);

router.put("/:id", ProductController.update);

router.delete("/delete-images", ProductController.deleteImages);
router.delete(
  "/delete-images-by-product",
  ProductController.deleteImageByProduct
);
router.delete("/delete-image-by-id/:id", ProductController.deleteImage);

router.delete("/:id", ProductController.deleteById);

export default router;
