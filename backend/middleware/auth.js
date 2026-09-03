import jwt from "jsonwebtoken";
import Admin from "../models/Admin.js";

export async function protect(req, res, next) {
  const header = req.headers.authorization || "";
  const token = header.startsWith("Bearer ") ? header.slice(7) : null;
  if (!token) return res.status(401).json({ message: "Not authorized, no token" });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const admin = await Admin.findById(decoded.id);
    if (!admin) return res.status(401).json({ message: "Admin no longer exists" });
    req.admin = admin;
    next();
  } catch {
    return res.status(401).json({ message: "Not authorized, invalid token" });
  }
}
