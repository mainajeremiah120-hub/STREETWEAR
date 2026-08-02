import { Router } from "express";
import {
  getProducts,
  getProductBySlug,
  createProduct,
  updateProduct,
  deleteProduct,
} from "../controllers/productController.js";

const router = Router();

router.route("/").get(getProducts).post(createProduct);
router.get("/:slug", getProductBySlug);
router.route("/:id").put(updateProduct).delete(deleteProduct);

export default router;
