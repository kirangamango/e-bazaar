import { Router } from "express";
import { userValidation } from "../validations";
import { authenticate, validate } from "../middlewares";
import { userController } from "../controllers";

const router = Router();

router.get("/", userController.getAll);
// router.post("/", userValidation.create, validate, userController.create);
router.post("/", userController.create);

router.post("/login", userValidation.login, validate, userController.login);

router.post("/add-distributor-cr", userController.addDistributorOrCR);
router.post("/download-file", userController.downloadFile);

router.put(
  "/change-password",
  authenticate.allUser,
  // userValidation.changePassword,
  // validate,
  userController.changePassword
);

router.put("/forgot-password", userController.forgotPassword);

router.put("/set-new-password", userController.setNewPassword);

router.get("/update-many", userController.updateMany);

router.put(
  "/:id",
  authenticate.allUser,
  userValidation.update,
  validate,
  userController.update
);

router.get("/self", authenticate.allUser, userController.self);

router.get("/:id", userController.getById);

router.get(
  "/get-all/distributor-cr",
  authenticate.allUser,
  userController.getAllDistributorAndCR
);

router.delete("/:id", userController.delete);

router.delete("/delete-record/:id", userController.deleteRecord);

export default router;
