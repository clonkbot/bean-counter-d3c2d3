import { query, mutation } from "./_generated/server";
import { v } from "convex/values";
import { getAuthUserId } from "@convex-dev/auth/server";

export const getMyShop = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return null;

    const shop = await ctx.db
      .query("shops")
      .withIndex("by_owner", (q) => q.eq("ownerId", userId))
      .first();

    return shop;
  },
});

export const createShop = mutation({
  args: { name: v.string() },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    // Check if user already has a shop
    const existing = await ctx.db
      .query("shops")
      .withIndex("by_owner", (q) => q.eq("ownerId", userId))
      .first();

    if (existing) throw new Error("You already have a shop");

    const shopId = await ctx.db.insert("shops", {
      name: args.name,
      ownerId: userId,
      createdAt: Date.now(),
    });

    // Add some default menu items
    const defaultItems = [
      { name: "Espresso", category: "espresso", price: 3.50, description: "Rich, bold single shot" },
      { name: "Americano", category: "espresso", price: 4.00, description: "Espresso with hot water" },
      { name: "Cappuccino", category: "espresso", price: 5.00, description: "Espresso, steamed milk, foam" },
      { name: "Latte", category: "espresso", price: 5.50, description: "Espresso with silky steamed milk" },
      { name: "Cold Brew", category: "cold", price: 5.00, description: "Smooth, 12-hour steeped" },
      { name: "Iced Latte", category: "cold", price: 5.50, description: "Espresso over ice with milk" },
      { name: "Drip Coffee", category: "brewed", price: 3.00, description: "House blend, fresh brewed" },
      { name: "Pour Over", category: "brewed", price: 4.50, description: "Single origin, hand poured" },
      { name: "Croissant", category: "pastry", price: 4.00, description: "Buttery, flaky, fresh baked" },
      { name: "Avocado Toast", category: "food", price: 9.00, description: "Sourdough, smashed avo, everything" },
    ];

    for (const item of defaultItems) {
      await ctx.db.insert("menuItems", {
        shopId,
        ...item,
        available: true,
        createdAt: Date.now(),
      });
    }

    return shopId;
  },
});

export const updateShopName = mutation({
  args: { name: v.string() },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    const shop = await ctx.db
      .query("shops")
      .withIndex("by_owner", (q) => q.eq("ownerId", userId))
      .first();

    if (!shop) throw new Error("No shop found");

    await ctx.db.patch(shop._id, { name: args.name });
  },
});
