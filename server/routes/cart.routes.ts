import { Router } from "express";
import { userValidation } from "../validations";
import { authenticate, validate } from "../middlewares";
import { CartController } from "../controllers";

const router = Router();
// router.post("/", userValidation.create, validate, userController.create);
router.post("/add-to-cart", authenticate.allUser, CartController.addToCart);

router.get(
  "/get-cart-items-by-user-id",
  authenticate.allUser,
  CartController.getCartItemByUserId
);

router.put(
  "/increase-quantity",
  authenticate.allUser,
  CartController.increaseQty
);

router.put(
  "/decrease-quantity",
  authenticate.allUser,
  CartController.decreaseQty
);

router.delete(
  "/remove-from-cart/:id",
  authenticate.allUser,
  CartController.removeFromCart
);

export default router;
