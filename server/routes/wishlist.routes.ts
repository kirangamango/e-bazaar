import { Router } from "express";
import { userValidation } from "../validations";
import { authenticate, validate } from "../middlewares";
import { WishListController } from "../controllers";

const router = Router();
// router.post("/", userValidation.create, validate, userController.create);
router.post("/", authenticate.allUser, WishListController.addProductToWishList);

router.get(
  "/get-products-by-id",
  authenticate.allUser,
  WishListController.getWishListByUserId
);

router.delete("/", authenticate.allUser, WishListController.deleteWishListItem);

export default router;
