import { Router } from "express";
import { updateSettings } from "../controllers/settingsController.js";
import { protect } from "../middleware/auth.js";

const router = Router();

router.put("/", protect, updateSettings);

export default router;
