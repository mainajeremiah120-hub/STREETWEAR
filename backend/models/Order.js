import mongoose from "mongoose";

const orderItemSchema = new mongoose.Schema(
  {
    product: { type: mongoose.Schema.Types.ObjectId, ref: "Product", required: true },
    name: { type: String, required: true },
    size: { type: String, required: true },
    price: { type: Number, required: true },
    qty: { type: Number, required: true, min: 1 },
  },
  { _id: false }
);

const ORDER_STATUSES = ["received", "packaged", "delivered", "cancelled"];

const statusHistorySchema = new mongoose.Schema(
  {
    status: { type: String, enum: ORDER_STATUSES, required: true },
    reason: { type: String, default: "" }, // required only when status is "cancelled" — enforced in the controller
    changedAt: { type: Date, default: Date.now },
  },
  { _id: false }
);

const orderSchema = new mongoose.Schema(
  {
    customer: {
      name: { type: String, required: true },
      email: { type: String, required: true },
      phone: { type: String, required: true },
    },
    shipping: {
      address: { type: String, required: true },
      city: { type: String, required: true },
      country: { type: String, default: "Kenya" },
    },
    items: { type: [orderItemSchema], required: true },
    subtotal: { type: Number, required: true },
    shippingFee: { type: Number, default: 0 },
    total: { type: Number, required: true },
    paymentMethod: { type: String, enum: ["mpesa", "cod"], default: "mpesa" },
    status: {
      type: String,
      enum: ORDER_STATUSES,
      default: "received",
    },
    statusHistory: { type: [statusHistorySchema], default: [] },
    orderNumber: { type: String, unique: true },
  },
  { timestamps: true }
);

// Generate a human-friendly order number before saving
orderSchema.pre("save", function (next) {
  if (!this.orderNumber) {
    const rand = Math.random().toString(36).slice(2, 7).toUpperCase();
    this.orderNumber = `SW-${rand}`;
  }
  next();
});

const Order = mongoose.model("Order", orderSchema);
export default Order;
export { ORDER_STATUSES };
