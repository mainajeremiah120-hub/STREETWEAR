import { Router } from "express";
import { listOrders, getOrderById, updateOrderStatus, resetAllOrders } from "../controllers/adminOrderController.js";
import { protect } from "../middleware/auth.js";

const router = Router();

router.use(protect);

router.get("/", listOrders);
router.delete("/reset-all", resetAllOrders); // must come before "/:id" below
router.get("/:id", getOrderById);
router.patch("/:id/status", updateOrderStatus);

export default router;
