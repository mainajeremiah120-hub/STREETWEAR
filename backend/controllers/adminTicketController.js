import Ticket from "../models/Ticket.js";

// GET /api/admin/tickets  (?status=open|resolved)
export async function listTickets(req, res, next) {
  try {
    const { status } = req.query;
    const filter = status ? { status } : {};
    const tickets = await Ticket.find(filter).sort({ lastMessageAt: -1 });
    res.json(tickets);
  } catch (err) {
    next(err);
  }
}

// GET /api/admin/tickets/:id
export async function getTicket(req, res, next) {
  try {
    const ticket = await Ticket.findById(req.params.id);
    if (!ticket) return res.status(404).json({ message: "Ticket not found" });
    res.json(ticket);
  } catch (err) {
    next(err);
  }
}

// POST /api/admin/tickets/:id/reply
export async function replyTicket(req, res, next) {
  try {
    const { text } = req.body;
    if (!text?.trim()) return res.status(400).json({ message: "text is required" });

    const ticket = await Ticket.findById(req.params.id);
    if (!ticket) return res.status(404).json({ message: "Ticket not found" });

    ticket.messages.push({ sender: "admin", text: text.trim() });
    ticket.lastMessageAt = new Date();
    await ticket.save();

    res.json(ticket);
  } catch (err) {
    next(err);
  }
}

// PATCH /api/admin/tickets/:id/resolve
export async function resolveTicket(req, res, next) {
  try {
    const ticket = await Ticket.findByIdAndUpdate(req.params.id, { status: "resolved" }, { new: true });
    if (!ticket) return res.status(404).json({ message: "Ticket not found" });
    res.json(ticket);
  } catch (err) {
    next(err);
  }
}
