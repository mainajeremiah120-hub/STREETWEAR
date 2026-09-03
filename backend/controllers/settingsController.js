import Settings from "../models/Settings.js";

// GET /api/settings — public, self-creates the singleton on first access
export async function getSettings(req, res, next) {
  try {
    const settings = await Settings.findOneAndUpdate(
      {},
      {},
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );
    res.json(settings);
  } catch (err) {
    next(err);
  }
}

// PUT /api/admin/settings — protected
export async function updateSettings(req, res, next) {
  try {
    const { whatsappNumber, howItWorks } = req.body;
    const update = {};
    if (whatsappNumber !== undefined) update.whatsappNumber = whatsappNumber;
    if (howItWorks !== undefined) update.howItWorks = howItWorks;

    const settings = await Settings.findOneAndUpdate(
      {},
      { $set: update },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );
    res.json(settings);
  } catch (err) {
    next(err);
  }
}
