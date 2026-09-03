import { Router } from "express";
import { listTickets, getTicket, replyTicket, resolveTicket } from "../controllers/adminTicketController.js";
import { protect } from "../middleware/auth.js";

const router = Router();

router.use(protect);

router.get("/", listTickets);
router.get("/:id", getTicket);
router.post("/:id/reply", replyTicket);
router.patch("/:id/resolve", resolveTicket);

export default router;
