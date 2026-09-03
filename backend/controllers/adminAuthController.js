import jwt from "jsonwebtoken";
import Admin from "../models/Admin.js";

function signToken(id) {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || "7d",
  });
}

// POST /api/admin/auth/login
export async function login(req, res, next) {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ message: "Email and password are required" });
    }

    const admin = await Admin.findOne({ email: email.toLowerCase().trim() }).select("+password");
    if (!admin || !(await admin.comparePassword(password))) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    res.json({
      token: signToken(admin._id),
      admin: { _id: admin._id, email: admin.email },
    });
  } catch (err) {
    next(err);
  }
}

// GET /api/admin/auth/me
export async function me(req, res) {
  res.json({ _id: req.admin._id, email: req.admin.email });
}

// PUT /api/admin/auth/credentials
export async function updateCredentials(req, res, next) {
  try {
    const { currentPassword, newEmail, newPassword } = req.body;
    if (!currentPassword) {
      return res.status(400).json({ message: "Current password is required" });
    }

    const admin = await Admin.findById(req.admin._id).select("+password");
    if (!(await admin.comparePassword(currentPassword))) {
      return res.status(401).json({ message: "Current password is incorrect" });
    }

    if (newEmail) admin.email = newEmail.toLowerCase().trim();
    if (newPassword) admin.password = newPassword; // pre-save hook re-hashes

    await admin.save();
    res.json({ _id: admin._id, email: admin.email });
  } catch (err) {
    next(err);
  }
}
