// One-time migration: run once via `node scripts/migrateOrderStatus.js` from
// backend/, before deploying the new Order status enum. Maps any order still
// using the old "pending" status (or missing statusHistory entirely, since
// those documents predate that field) onto the new scheme.
import dotenv from "dotenv";
import mongoose from "mongoose";
import { connectDB } from "../config/db.js";
import Order from "../models/Order.js";

dotenv.config();

const OLD_TO_NEW = { pending: "received", paid: "packaged", shipped: "packaged" };

async function migrate() {
  await connectDB();
  try {
    const orders = await Order.find({});
    let updated = 0;

    for (const order of orders) {
      let changed = false;

      if (OLD_TO_NEW[order.status]) {
        order.status = OLD_TO_NEW[order.status];
        changed = true;
      }

      if (!order.statusHistory || order.statusHistory.length === 0) {
        order.statusHistory = [{ status: order.status, changedAt: order.createdAt || new Date() }];
        changed = true;
      }

      if (changed) {
        await order.save();
        updated += 1;
      }
    }

    console.log(`Migrated ${updated} of ${orders.length} orders.`);
  } catch (err) {
    console.error("Migration failed:", err.message);
  } finally {
    await mongoose.connection.close();
    process.exit(0);
  }
}

migrate();
