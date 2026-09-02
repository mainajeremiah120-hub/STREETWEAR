import mongoose from "mongoose";

const productSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true, lowercase: true },
    sku: { type: String, required: true, unique: true },
    category: {
      type: String,
      required: true,
      enum: ["medicines", "vitamins", "skincare", "personal-care"],
    },
    drop: { type: String, default: "VERIFIED" }, // trust badge shown on the product card, e.g. "VERIFIED"
    price: { type: Number, required: true, min: 0 }, // stored in KES
    description: { type: String, default: "" },
    // hex color used to render the flat product tile when there's no image
    color: { type: String, default: "#f1f5f9" },
    image: { type: String, default: "" }, // optional image URL
    sizes: { type: [String], default: ["Standard"] }, // pack sizes / dosages, e.g. "20 Tablets", "100ml"
    stock: { type: Number, default: 0, min: 0 },
    featured: { type: Boolean, default: false },
    soldOut: { type: Boolean, default: false },
  },
  { timestamps: true }
);

const Product = mongoose.model("Product", productSchema);
export default Product;
