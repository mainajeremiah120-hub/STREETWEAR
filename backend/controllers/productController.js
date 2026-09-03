import Product from "../models/Product.js";

// GET /api/products  (supports ?category=&featured=&search=)
export async function getProducts(req, res, next) {
  try {
    const { category, featured, search } = req.query;
    const filter = { stock: { $gt: 0 }, soldOut: { $ne: true } }; // out-of-stock products don't show in the store

    if (category && category !== "all") filter.category = category;
    if (featured === "true") filter.featured = true;
    if (search) filter.name = { $regex: search, $options: "i" };

    const products = await Product.find(filter).sort({ createdAt: -1 });
    res.json(products);
  } catch (err) {
    next(err);
  }
}

// GET /api/products/:slug
export async function getProductBySlug(req, res, next) {
  try {
    const product = await Product.findOne({ slug: req.params.slug });
    if (!product) return res.status(404).json({ message: "Product not found" });
    res.json(product);
  } catch (err) {
    next(err);
  }
}

// POST /api/admin/products — mounted with the `protect` auth middleware
export async function createProduct(req, res, next) {
  try {
    const product = await Product.create(req.body);
    res.status(201).json(product);
  } catch (err) {
    next(err);
  }
}

// PUT /api/products/:id
export async function updateProduct(req, res, next) {
  try {
    const product = await Product.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!product) return res.status(404).json({ message: "Product not found" });
    res.json(product);
  } catch (err) {
    next(err);
  }
}

// DELETE /api/products/:id
export async function deleteProduct(req, res, next) {
  try {
    const product = await Product.findByIdAndDelete(req.params.id);
    if (!product) return res.status(404).json({ message: "Product not found" });
    res.json({ message: "Product removed" });
  } catch (err) {
    next(err);
  }
}
