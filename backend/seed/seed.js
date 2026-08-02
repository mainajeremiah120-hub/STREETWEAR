import dotenv from "dotenv";
import { connectDB } from "../config/db.js";
import Product from "../models/Product.js";
import { products } from "./products.js";
import mongoose from "mongoose";

dotenv.config();

async function seed() {
  await connectDB();
  try {
    await Product.deleteMany({});
    await Product.insertMany(products);
    console.log(`Seeded ${products.length} products into the STREETWEAR catalog.`);
  } catch (err) {
    console.error("Seed failed:", err.message);
  } finally {
    await mongoose.connection.close();
    process.exit(0);
  }
}

seed();
