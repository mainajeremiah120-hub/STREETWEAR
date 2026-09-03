import mongoose from "mongoose";

const messageSchema = new mongoose.Schema(
  {
    sender: { type: String, enum: ["visitor", "admin"], required: true },
    text: { type: String, required: true, trim: true },
    createdAt: { type: Date, default: Date.now },
  },
  { _id: false }
);

const ticketSchema = new mongoose.Schema(
  {
    visitorId: { type: String, required: true, index: true }, // uuid from the visitor's browser localStorage
    visitorName: { type: String, default: "" },
    status: { type: String, enum: ["open", "resolved"], default: "open" },
    messages: { type: [messageSchema], default: [] },
    lastMessageAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

const Ticket = mongoose.model("Ticket", ticketSchema);
export default Ticket;
