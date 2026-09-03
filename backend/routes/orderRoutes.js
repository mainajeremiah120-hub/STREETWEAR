import { Router } from "express";
import { createOrder, getOrderByNumber } from "../controllers/orderController.js";

const router = Router();

router.post("/", createOrder);
router.get("/:orderNumber", getOrderByNumber);

export default router;
