import { body, param, query } from "express-validator";
export const NotificationValidation = {
  create: [
    body("title")
      .trim()
      .notEmpty()
      .withMessage("Title is required")
      .bail()
      .isLength({ max: 255 })
      .withMessage("Title must be less than 255 characters"),
    body("body")
      .trim()
      .notEmpty()
      .withMessage("Body is required")
      .bail()
      .isLength({ max: 1000 })
      .withMessage("Body must be less than 1000 characters"),
    body("userId")
      .trim()
      .notEmpty()
      .withMessage("User ID is required")
      .bail()
      .isMongoId()
      .withMessage("User ID must be a valid MongoDB ID"),
  ],

  update: [
    param("id").notEmpty().withMessage("ID is required").bail(),
    body("title")
      .optional({ nullable: true })
      .trim()
      .notEmpty()
      .withMessage("Title is required")
      .bail()
      .isLength({ max: 255 })
      .withMessage("Title must be less than 255 characters"),
    body("body")
      .optional({ nullable: true })
      .trim()
      .notEmpty()
      .withMessage("Body is required")
      .bail()
      .isLength({ max: 1000 })
      .withMessage("Body must be less than 1000 characters"),
    body("userId")
      .optional({ nullable: true })
      .trim()
      .notEmpty()
      .withMessage("User ID is required")
      .bail()
      .isMongoId()
      .withMessage("User ID must be a valid MongoDB ID"),
  ],

  sendMany: [
    body("title")
      .trim()
      .notEmpty()
      .withMessage("Title is required")
      .bail()
      .isLength({ max: 255 })
      .withMessage("Title must be less than 255 characters"),
    body("body")
      .trim()
      .notEmpty()
      .withMessage("Body is required")
      .bail()
      .isLength({ max: 1000 })
      .withMessage("Body must be less than 1000 characters"),
    body("userIds").custom((value, { req }) => {
      // Check that either userIds or sendAll is provided, but not both
      if (!value && req.body.sendAll === undefined) {
        throw new Error("You must provide either userIds or sendAll");
      }
      if (value && req.body.sendAll !== undefined) {
        throw new Error(
          "You can provide either userIds or sendAll, but not both"
        );
      }

      // If userIds is provided, validate it as an array with at least one element
      if (value) {
        if (!Array.isArray(value) || value.length === 0) {
          throw new Error("userIds must be an array with at least one element");
        }

        // Validate each userId as a valid MongoDB ObjectID
        const isValidObjectId = value.every((userId) => {
          const objectIdRegex = /^[0-9a-fA-F]{24}$/;
          return objectIdRegex.test(userId);
        });

        if (!isValidObjectId) {
          throw new Error("User IDs must be valid MongoDB ObjectIDs");
        }
      }

      // If sendAll is provided, validate it as a boolean
      if (
        req.body.sendAll !== undefined &&
        typeof req.body.sendAll !== "boolean"
      ) {
        throw new Error("sendAll must be a boolean value");
      }

      return true;
    }),
  ],

  readById: [param("id").isMongoId().withMessage("Invalid ID")],

  delete: [param("id").isMongoId().withMessage("Invalid ID")],

  deleteAll: [
    query("userIds")
      .optional()
      .isArray({ min: 1 })
      .withMessage("userIds must be an array with at least one element")
      .custom((value) => {
        for (const userId of value) {
          if (!/^[0-9a-fA-F]{24}$/.test(userId)) {
            throw new Error("User IDs must be valid MongoDB IDs");
          }
        }
        return true;
      }),
    query("notificationIds")
      .optional()
      .isArray({ min: 1 })
      .withMessage("notificationIds must be an array with at least one element")
      .custom((value) => {
        for (const notificationId of value) {
          if (!/^[0-9a-fA-F]{24}$/.test(notificationId)) {
            throw new Error("Notification IDs must be valid MongoDB IDs");
          }
        }
        return true;
      }),
    query("removeReadData")
      .optional()
      .isBoolean()
      .withMessage("removeReadData must be a boolean value"),
  ],
};
