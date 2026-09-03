import Admin from "../models/Admin.js";

// Auto-creates the first Admin from env vars if none exists yet. Safe to run
// on every startup — the countDocuments guard makes it a no-op after the
// first successful run, including on repeated cold starts in production.
export async function ensureAdminBootstrap() {
  const count = await Admin.countDocuments();
  if (count > 0) return;

  const email = (process.env.ADMIN_EMAIL || "").trim();
  const password = process.env.ADMIN_PASSWORD;
  if (!email || !password) {
    console.warn(
      "No Admin exists and ADMIN_EMAIL/ADMIN_PASSWORD are not set — skipping bootstrap. Set them in .env and restart."
    );
    return;
  }

  await Admin.create({ email, password }); // pre-save hook hashes it
  console.log(`Bootstrap admin created: ${email}`);
}
