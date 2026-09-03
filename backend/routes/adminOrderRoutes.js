import { Router } from "express";
import { listOrders, getOrderById, updateOrderStatus } from "../controllers/adminOrderController.js";
import { protect } from "../middleware/auth.js";

const router = Router();

router.use(protect);

router.get("/", listOrders);
router.get("/:id", getOrderById);
router.patch("/:id/status", updateOrderStatus);

export default router;
