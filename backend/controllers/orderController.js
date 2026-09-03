import Order from "../models/Order.js";
import Product from "../models/Product.js";
import { sendOrderConfirmation, sendOwnerAlert } from "../config/mailer.js";

// POST /api/orders
export async function createOrder(req, res, next) {
  try {
    const { customer, shipping, items, paymentMethod } = req.body;

    if (!items || items.length === 0) {
      return res.status(400).json({ message: "Cart is empty" });
    }

    // Re-price on the server from the DB so the client can't fake prices
    let subtotal = 0;
    const validatedItems = [];

    for (const item of items) {
      const product = await Product.findById(item.product);
      if (!product) {
        return res.status(400).json({ message: `Product not found: ${item.name}` });
      }
      if (product.soldOut || product.stock < item.qty) {
        return res.status(400).json({ message: `${product.name} is out of stock` });
      }
      subtotal += product.price * item.qty;
      validatedItems.push({
        product: product._id,
        name: product.name,
        size: item.size,
        price: product.price,
        qty: item.qty,
      });
    }

    const shippingFee = subtotal >= 1500 ? 0 : 100; // free shipping over KES 1,500
    const total = subtotal + shippingFee;

    const order = await Order.create({
      customer,
      shipping,
      items: validatedItems,
      subtotal,
      shippingFee,
      total,
      paymentMethod: paymentMethod || "mpesa",
      statusHistory: [{ status: "received", changedAt: new Date() }],
    });

    // Decrement stock, and mark sold out (clamped at 0) once it runs out
    for (const item of validatedItems) {
      const updated = await Product.findByIdAndUpdate(
        item.product,
        { $inc: { stock: -item.qty } },
        { new: true }
      );
      if (updated.stock <= 0) {
        await Product.findByIdAndUpdate(item.product, { stock: 0, soldOut: true });
      }
    }

    // Fire-and-forget — a failed email shouldn't fail the order
    sendOrderConfirmation(order);
    sendOwnerAlert(order);

    res.status(201).json(order);
  } catch (err) {
    next(err);
  }
}

// GET /api/orders/:orderNumber
export async function getOrderByNumber(req, res, next) {
  try {
    const order = await Order.findOne({ orderNumber: req.params.orderNumber });
    if (!order) return res.status(404).json({ message: "Order not found" });
    res.json(order);
  } catch (err) {
    next(err);
  }
}
