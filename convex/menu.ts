import { query, mutation } from "./_generated/server";
import { v } from "convex/values";
import { getAuthUserId } from "@convex-dev/auth/server";

export const getItems = query({
  args: { shopId: v.id("shops") },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("menuItems")
      .withIndex("by_shop", (q) => q.eq("shopId", args.shopId))
      .collect();
  },
});

export const addItem = mutation({
  args: {
    shopId: v.id("shops"),
    name: v.string(),
    category: v.string(),
    price: v.number(),
    description: v.string(),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    const shop = await ctx.db.get(args.shopId);
    if (!shop || shop.ownerId !== userId) throw new Error("Not authorized");

    return await ctx.db.insert("menuItems", {
      shopId: args.shopId,
      name: args.name,
      category: args.category,
      price: args.price,
      description: args.description,
      available: true,
      createdAt: Date.now(),
    });
  },
});

export const toggleAvailability = mutation({
  args: { itemId: v.id("menuItems") },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    const item = await ctx.db.get(args.itemId);
    if (!item) throw new Error("Item not found");

    const shop = await ctx.db.get(item.shopId);
    if (!shop || shop.ownerId !== userId) throw new Error("Not authorized");

    await ctx.db.patch(args.itemId, { available: !item.available });
  },
});

export const updatePrice = mutation({
  args: { itemId: v.id("menuItems"), price: v.number() },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    const item = await ctx.db.get(args.itemId);
    if (!item) throw new Error("Item not found");

    const shop = await ctx.db.get(item.shopId);
    if (!shop || shop.ownerId !== userId) throw new Error("Not authorized");

    await ctx.db.patch(args.itemId, { price: args.price });
  },
});

export const deleteItem = mutation({
  args: { itemId: v.id("menuItems") },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    const item = await ctx.db.get(args.itemId);
    if (!item) throw new Error("Item not found");

    const shop = await ctx.db.get(item.shopId);
    if (!shop || shop.ownerId !== userId) throw new Error("Not authorized");

    await ctx.db.delete(args.itemId);
  },
});
