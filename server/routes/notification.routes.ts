import { Router } from "express";
import { NotificationController } from "../controllers";
import { authenticate, validate } from "../middlewares";
import { NotificationValidation } from "../validations";

const router = Router();

// Require authentication for creating a notification
router.get("/", authenticate.allUser, NotificationController.getAll);
router.get(
  "/get-all",
  authenticate.allUser,
  NotificationController.getAllAggregate
);

router.put("/read-all", authenticate.allUser, NotificationController.readAll);

// Require authentication for creating a notification
router.post(
  "/",
  authenticate.allUser,
  NotificationValidation.create,
  validate,
  NotificationController.create
);

// Require authentication for updating a notification
router.put(
  "/:id",
  authenticate.allUser,
  NotificationValidation.update,
  validate,
  NotificationController.update
);

// Require authentication for getting notification by ID
router.get(
  "/:id",
  authenticate.allUser,
  NotificationValidation.readById,
  validate,
  NotificationController.readById
);

// Require authentication for deleting a notification
router.delete(
  "/:id",
  authenticate.allUser,
  NotificationValidation.delete,
  validate,
  NotificationController.delete
);

// Require authentication for deleting all notifications
router.delete(
  "/delete/many",
  authenticate.allUser,
  NotificationController.deleteAll
);

router.delete(
  "/delete/all-by-user",
  authenticate.allUser,
  NotificationController.deletAllByUser
);

// Require authentication for sending a notification to multiple users
router.post(
  "/send/many",
  authenticate.allUser,
  NotificationValidation.sendMany,
  validate,
  NotificationController.sendToMultipleUsers
);

export default router;
