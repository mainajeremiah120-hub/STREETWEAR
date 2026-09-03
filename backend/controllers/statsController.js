import Order from "../models/Order.js";

function startOfDay(d) {
  const x = new Date(d);
  x.setHours(0, 0, 0, 0);
  return x;
}

// GET /api/admin/stats
export async function getStats(req, res, next) {
  try {
    const now = new Date();
    const todayStart = startOfDay(now);
    const weekStart = new Date(todayStart);
    weekStart.setDate(weekStart.getDate() - 6); // last 7 days inclusive of today
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);

    const [totals, byStatus, revenueRanges, recentOrders] = await Promise.all([
      Order.aggregate([
        { $match: { status: { $ne: "cancelled" } } },
        { $group: { _id: null, revenue: { $sum: "$total" }, count: { $sum: 1 } } },
      ]),
      Order.aggregate([{ $group: { _id: "$status", count: { $sum: 1 } } }]),
      Order.aggregate([
        { $match: { status: { $ne: "cancelled" } } },
        {
          $facet: {
            today: [{ $match: { createdAt: { $gte: todayStart } } }, { $group: { _id: null, revenue: { $sum: "$total" } } }],
            week: [{ $match: { createdAt: { $gte: weekStart } } }, { $group: { _id: null, revenue: { $sum: "$total" } } }],
            month: [{ $match: { createdAt: { $gte: monthStart } } }, { $group: { _id: null, revenue: { $sum: "$total" } } }],
          },
        },
      ]),
      Order.find().sort({ createdAt: -1 }).limit(8),
    ]);

    const statusCounts = { received: 0, packaged: 0, delivered: 0, cancelled: 0 };
    for (const s of byStatus) statusCounts[s._id] = s.count;

    res.json({
      totalRevenue: totals[0]?.revenue || 0,
      totalOrders: totals[0]?.count || 0,
      statusCounts,
      revenueToday: revenueRanges[0].today[0]?.revenue || 0,
      revenueWeek: revenueRanges[0].week[0]?.revenue || 0,
      revenueMonth: revenueRanges[0].month[0]?.revenue || 0,
      recentOrders,
    });
  } catch (err) {
    next(err);
  }
}
