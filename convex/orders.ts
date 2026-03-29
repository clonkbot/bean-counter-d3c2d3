import { query, mutation } from "./_generated/server";
import { v } from "convex/values";
import { getAuthUserId } from "@convex-dev/auth/server";

export const getOrders = query({
  args: { shopId: v.id("shops") },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("orders")
      .withIndex("by_shop", (q) => q.eq("shopId", args.shopId))
      .order("desc")
      .take(50);
  },
});

export const getActiveOrders = query({
  args: { shopId: v.id("shops") },
  handler: async (ctx, args) => {
    const orders = await ctx.db
      .query("orders")
      .withIndex("by_shop", (q) => q.eq("shopId", args.shopId))
      .order("desc")
      .collect();

    return orders.filter(o => o.status !== "completed");
  },
});

export const createOrder = mutation({
  args: {
    shopId: v.id("shops"),
    customerName: v.string(),
    items: v.array(v.object({
      menuItemId: v.id("menuItems"),
      name: v.string(),
      quantity: v.number(),
      price: v.number(),
    })),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    const total = args.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);

    return await ctx.db.insert("orders", {
      shopId: args.shopId,
      customerName: args.customerName,
      items: args.items,
      total,
      status: "pending",
      createdAt: Date.now(),
    });
  },
});

export const updateOrderStatus = mutation({
  args: {
    orderId: v.id("orders"),
    status: v.string(),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    const order = await ctx.db.get(args.orderId);
    if (!order) throw new Error("Order not found");

    const shop = await ctx.db.get(order.shopId);
    if (!shop || shop.ownerId !== userId) throw new Error("Not authorized");

    await ctx.db.patch(args.orderId, { status: args.status });

    // Update daily stats if completing order
    if (args.status === "completed") {
      const today = new Date().toISOString().split("T")[0];
      const existingStats = await ctx.db
        .query("dailyStats")
        .withIndex("by_shop_and_date", (q) => q.eq("shopId", order.shopId).eq("date", today))
        .first();

      if (existingStats) {
        await ctx.db.patch(existingStats._id, {
          totalOrders: existingStats.totalOrders + 1,
          totalRevenue: existingStats.totalRevenue + order.total,
        });
      } else {
        await ctx.db.insert("dailyStats", {
          shopId: order.shopId,
          date: today,
          totalOrders: 1,
          totalRevenue: order.total,
        });
      }
    }
  },
});

export const getTodayStats = query({
  args: { shopId: v.id("shops") },
  handler: async (ctx, args) => {
    const today = new Date().toISOString().split("T")[0];
    const stats = await ctx.db
      .query("dailyStats")
      .withIndex("by_shop_and_date", (q) => q.eq("shopId", args.shopId).eq("date", today))
      .first();

    return stats || { totalOrders: 0, totalRevenue: 0 };
  },
});

export const getWeekStats = query({
  args: { shopId: v.id("shops") },
  handler: async (ctx, args) => {
    const dates: string[] = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      dates.push(d.toISOString().split("T")[0]);
    }

    const stats = [];
    for (const date of dates) {
      const dayStat = await ctx.db
        .query("dailyStats")
        .withIndex("by_shop_and_date", (q) => q.eq("shopId", args.shopId).eq("date", date))
        .first();
      stats.push({
        date,
        orders: dayStat?.totalOrders || 0,
        revenue: dayStat?.totalRevenue || 0,
      });
    }

    return stats;
  },
});
