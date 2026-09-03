import Product from "../models/Product.js";

// GET /api/admin/products  (?category=&search=&page=&limit=) — unlike the
// public listing, this intentionally shows out-of-stock/sold-out products
// too, so the admin can actually manage stock.
export async function listAllProducts(req, res, next) {
  try {
    const { category, search, page = 1, limit = 20 } = req.query;
    const filter = {};
    if (category && category !== "all") filter.category = category;
    if (search) filter.name = { $regex: search, $options: "i" };

    const skip = (Number(page) - 1) * Number(limit);
    const [products, total] = await Promise.all([
      Product.find(filter).sort({ createdAt: -1 }).skip(skip).limit(Number(limit)),
      Product.countDocuments(filter),
    ]);

    res.json({ products, total, page: Number(page), limit: Number(limit) });
  } catch (err) {
    next(err);
  }
}

// GET /api/admin/products/:id
export async function getProductById(req, res, next) {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ message: "Product not found" });
    res.json(product);
  } catch (err) {
    next(err);
  }
}
