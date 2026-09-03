import Order, { ORDER_STATUSES } from "../models/Order.js";
import { sendOrderStatusUpdate } from "../config/mailer.js";

const TERMINAL_STATUSES = ["delivered", "cancelled"];

// GET /api/admin/orders  (?status=&page=&limit=)
export async function listOrders(req, res, next) {
  try {
    const { status, page = 1, limit = 20 } = req.query;
    const filter = {};
    if (status && status !== "all") filter.status = status;

    const skip = (Number(page) - 1) * Number(limit);
    const [orders, total] = await Promise.all([
      Order.find(filter).sort({ createdAt: -1 }).skip(skip).limit(Number(limit)),
      Order.countDocuments(filter),
    ]);

    res.json({ orders, total, page: Number(page), limit: Number(limit) });
  } catch (err) {
    next(err);
  }
}

// GET /api/admin/orders/:id
export async function getOrderById(req, res, next) {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ message: "Order not found" });
    res.json(order);
  } catch (err) {
    next(err);
  }
}

// PATCH /api/admin/orders/:id/status
export async function updateOrderStatus(req, res, next) {
  try {
    const { status, reason } = req.body;

    if (!ORDER_STATUSES.includes(status)) {
      return res.status(400).json({ message: `Status must be one of: ${ORDER_STATUSES.join(", ")}` });
    }
    if (status === "cancelled" && !reason?.trim()) {
      return res.status(400).json({ message: "A reason is required to cancel an order" });
    }

    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ message: "Order not found" });

    if (TERMINAL_STATUSES.includes(order.status)) {
      return res.status(400).json({ message: `This order is already ${order.status} and can't be changed further` });
    }

    order.status = status;
    order.statusHistory.push({
      status,
      reason: status === "cancelled" ? reason.trim() : "",
      changedAt: new Date(),
    });
    await order.save();

    sendOrderStatusUpdate(order); // fire-and-forget, same pattern as order confirmation

    res.json(order);
  } catch (err) {
    next(err);
  }
}
