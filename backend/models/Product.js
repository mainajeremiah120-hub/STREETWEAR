import mongoose from "mongoose";

const productSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true, lowercase: true },
    sku: { type: String, required: true, unique: true },
    category: {
      type: String,
      required: true,
      enum: ["tshirts", "hoodies", "jeans", "caps"],
    },
    drop: { type: String, default: "DROP 01" },
    price: { type: Number, required: true, min: 0 }, // stored in KES
    description: { type: String, default: "" },
    // hex color used to render the flat product tile on the frontend
    color: { type: String, default: "#1A1A1A" },
    image: { type: String, default: "" }, // optional image URL
    sizes: { type: [String], default: ["S", "M", "L", "XL"] },
    stock: { type: Number, default: 0, min: 0 },
    featured: { type: Boolean, default: false },
    soldOut: { type: Boolean, default: false },
  },
  { timestamps: true }
);

const Product = mongoose.model("Product", productSchema);
export default Product;
