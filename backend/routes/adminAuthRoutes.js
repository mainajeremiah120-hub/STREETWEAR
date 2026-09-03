import { Router } from "express";
import { login, me, updateCredentials } from "../controllers/adminAuthController.js";
import { protect } from "../middleware/auth.js";

const router = Router();

router.post("/login", login);
router.get("/me", protect, me);
router.put("/credentials", protect, updateCredentials);

export default router;
