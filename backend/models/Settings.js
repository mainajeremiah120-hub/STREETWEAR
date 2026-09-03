import mongoose from "mongoose";

const howItWorksStepSchema = new mongoose.Schema(
  { title: { type: String, required: true }, description: { type: String, required: true } },
  { _id: true }
);

// Singleton — there's only ever one Settings document. Controllers upsert
// against an empty filter so it self-creates on first access.
const settingsSchema = new mongoose.Schema(
  {
    whatsappNumber: { type: String, default: "254740687321" },
    howItWorks: {
      type: [howItWorksStepSchema],
      default: [
        {
          title: "Order online",
          description: "Browse medicines, vitamins, skincare and more. Add to cart and check out in minutes.",
        },
        {
          title: "Verified by our pharmacist",
          description: "Every order is reviewed for accuracy and authenticity before it's packed.",
        },
        {
          title: "Fast, discreet delivery",
          description: "Pay with M-Pesa or cash on delivery. Most orders arrive within 24–48 hours.",
        },
      ],
    },
  },
  { timestamps: true }
);

const Settings = mongoose.model("Settings", settingsSchema);
export default Settings;
