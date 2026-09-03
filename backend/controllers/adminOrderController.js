import Order, { ORDER_STATUSES } from "../models/Order.js";
import Admin from "../models/Admin.js";
import { sendOrderStatusUpdate } from "../config/mailer.js";

const TERMINAL_STATUSES = ["delivered", "cancelled"];

// GET /api/admin/orders  (?status=&from=&to=&page=&limit=)
// from/to are ISO date strings (e.g. "2026-09-01"), inclusive of the whole "to" day.
export async function listOrders(req, res, next) {
  try {
    const { status, from, to, page = 1, limit = 20 } = req.query;
    const filter = {};
    if (status && status !== "all") filter.status = status;
    if (from || to) {
      filter.createdAt = {};
      if (from) filter.createdAt.$gte = new Date(from);
      if (to) {
        const end = new Date(to);
        end.setHours(23, 59, 59, 999);
        filter.createdAt.$lte = end;
      }
    }

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

// DELETE /api/admin/orders/reset-all — permanently wipes every order (and
// with it, every revenue figure, since stats are computed live from orders,
// not stored separately). Requires the admin's current password as an extra
// confirmation layer beyond the frontend's own confirm dialog, since this
// can't be undone.
export async function resetAllOrders(req, res, next) {
  try {
    const { password } = req.body;
    if (!password) {
      return res.status(400).json({ message: "Password is required to confirm this action" });
    }

    const admin = await Admin.findById(req.admin._id).select("+password");
    if (!(await admin.comparePassword(password))) {
      return res.status(401).json({ message: "Incorrect password" });
    }

    const { deletedCount } = await Order.deleteMany({});
    res.json({ deletedCount });
  } catch (err) {
    next(err);
  }
}
