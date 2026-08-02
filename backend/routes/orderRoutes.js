import { Router } from "express";
import {
  createOrder,
  getOrderByNumber,
  getOrders,
} from "../controllers/orderController.js";

const router = Router();

router.route("/").post(createOrder).get(getOrders);
router.get("/:orderNumber", getOrderByNumber);

export default router;
