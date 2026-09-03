import Ticket from "../models/Ticket.js";

// A single scripted acknowledgment, not an AI/automated bot — just confirms
// the message landed and sets expectations while a human catches up.
const BOT_ACK_TEXT = "Thanks for reaching out! Please hold on a moment while we connect you with our team.";

// POST /api/tickets — creates a new ticket if the visitor has no open one,
// otherwise appends to their existing open ticket.
export async function createOrContinueTicket(req, res, next) {
  try {
    const { visitorId, text, name } = req.body;
    if (!visitorId || !text?.trim()) {
      return res.status(400).json({ message: "visitorId and text are required" });
    }

    let ticket = await Ticket.findOne({ visitorId, status: "open" });
    const isNew = !ticket;

    if (!ticket) {
      ticket = new Ticket({ visitorId, visitorName: name || "" });
    }

    ticket.messages.push({ sender: "visitor", text: text.trim() });
    if (isNew) {
      ticket.messages.push({ sender: "bot", text: BOT_ACK_TEXT });
    }
    ticket.lastMessageAt = new Date();
    if (name && !ticket.visitorName) ticket.visitorName = name;
    await ticket.save();

    res.status(isNew ? 201 : 200).json(ticket);
  } catch (err) {
    next(err);
  }
}

// GET /api/tickets/:visitorId — for polling; prefers their latest open
// ticket, falling back to their most recent ticket overall.
export async function getTicketForVisitor(req, res, next) {
  try {
    const { visitorId } = req.params;
    const ticket =
      (await Ticket.findOne({ visitorId, status: "open" }).sort({ createdAt: -1 })) ||
      (await Ticket.findOne({ visitorId }).sort({ createdAt: -1 }));

    if (!ticket) return res.status(404).json({ message: "No ticket found" });
    res.json(ticket);
  } catch (err) {
    next(err);
  }
}

// POST /api/tickets/:visitorId/messages — append a follow-up message to the
// visitor's open ticket.
export async function addVisitorMessage(req, res, next) {
  try {
    const { visitorId } = req.params;
    const { text } = req.body;
    if (!text?.trim()) return res.status(400).json({ message: "text is required" });

    const ticket = await Ticket.findOne({ visitorId, status: "open" });
    if (!ticket) return res.status(404).json({ message: "No open ticket found for this visitor" });

    ticket.messages.push({ sender: "visitor", text: text.trim() });
    ticket.lastMessageAt = new Date();
    await ticket.save();

    res.json(ticket);
  } catch (err) {
    next(err);
  }
}
