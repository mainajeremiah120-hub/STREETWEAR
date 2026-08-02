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

    const shippingFee = subtotal >= 5000 ? 0 : 300; // free shipping over KES 5,000
    const total = subtotal + shippingFee;

    const order = await Order.create({
      customer,
      shipping,
      items: validatedItems,
      subtotal,
      shippingFee,
      total,
      paymentMethod: paymentMethod || "mpesa",
    });

    // Decrement stock
    for (const item of validatedItems) {
      await Product.findByIdAndUpdate(item.product, { $inc: { stock: -item.qty } });
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

// GET /api/orders  (admin)
export async function getOrders(req, res, next) {
  try {
    const orders = await Order.find().sort({ createdAt: -1 });
    res.json(orders);
  } catch (err) {
    next(err);
  }
}
