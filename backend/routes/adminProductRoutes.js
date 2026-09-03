import { Router } from "express";
import { listAllProducts, getProductById } from "../controllers/adminProductController.js";
import { createProduct, updateProduct, deleteProduct } from "../controllers/productController.js";
import { protect } from "../middleware/auth.js";

const router = Router();

router.use(protect);

router.get("/", listAllProducts);
router.get("/:id", getProductById);
router.post("/", createProduct);
router.put("/:id", updateProduct);
router.delete("/:id", deleteProduct);

export default router;
