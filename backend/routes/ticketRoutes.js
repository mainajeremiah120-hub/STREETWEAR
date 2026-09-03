import { Router } from "express";
import {
  createOrContinueTicket,
  getTicketForVisitor,
  addVisitorMessage,
} from "../controllers/ticketController.js";

const router = Router();

router.post("/", createOrContinueTicket);
router.get("/:visitorId", getTicketForVisitor);
router.post("/:visitorId/messages", addVisitorMessage);

export default router;
