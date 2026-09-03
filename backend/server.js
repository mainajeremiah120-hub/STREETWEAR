import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
import { connectDB } from "./config/db.js";
import { ensureAdminBootstrap } from "./config/bootstrapAdmin.js";
import productRoutes from "./routes/productRoutes.js";
import orderRoutes from "./routes/orderRoutes.js";
import adminAuthRoutes from "./routes/adminAuthRoutes.js";
import settingsRoutes from "./routes/settingsRoutes.js";
import adminSettingsRoutes from "./routes/adminSettingsRoutes.js";
import adminOrderRoutes from "./routes/adminOrderRoutes.js";
import adminProductRoutes from "./routes/adminProductRoutes.js";
import adminStatsRoutes from "./routes/adminStatsRoutes.js";
import ticketRoutes from "./routes/ticketRoutes.js";
import adminTicketRoutes from "./routes/adminTicketRoutes.js";
import { notFound, errorHandler } from "./middleware/errorHandler.js";

dotenv.config();

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const app = express();

app.use(express.json());
app.use(
  cors({
    origin: (process.env.CLIENT_URL || "http://localhost:5173").trim(),
  })
);

// Local product photos — drop files into backend/uploads and reference them
// as <this server's base URL>/uploads/<filename> in the product's `image` field.
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// Health check
app.get("/", (req, res) => {
  res.json({ status: "KIRIJO PHARMACY API is live" });
});

app.use("/api/products", productRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/admin/auth", adminAuthRoutes);
app.use("/api/settings", settingsRoutes);
app.use("/api/admin/settings", adminSettingsRoutes);
app.use("/api/admin/orders", adminOrderRoutes);
app.use("/api/admin/products", adminProductRoutes);
app.use("/api/admin/stats", adminStatsRoutes);
app.use("/api/tickets", ticketRoutes);
app.use("/api/admin/tickets", adminTicketRoutes);

app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

connectDB().then(async () => {
  await ensureAdminBootstrap();
  app.listen(PORT, () => {
    console.log(`KIRIJO PHARMACY API running on http://localhost:${PORT}`);
  });
});
