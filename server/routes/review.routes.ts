import { Router } from "express";
import { ReviewController } from "../controllers";
import { authenticate } from "../middlewares";

const router = Router({ mergeParams: true });

router.post("/", authenticate.allUser, ReviewController.create);
// router.post(
//   "/bulk-Upload",
//   authenticate.allUser,
//   ReviewController.createBulkUpload
// );
router.get("/", ReviewController.getAll);
router.get("/:id", ReviewController.getById);
router.put("/:id", authenticate.allUser, ReviewController.update);
router.delete("/:id", authenticate.allUser, ReviewController.delete);

export default router;
