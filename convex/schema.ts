import { defineSchema, defineTable } from "convex/server";
import { authTables } from "@convex-dev/auth/server";
import { v } from "convex/values";

export default defineSchema({
  ...authTables,

  // Coffee shop info
  shops: defineTable({
    name: v.string(),
    ownerId: v.id("users"),
    createdAt: v.number(),
  }).index("by_owner", ["ownerId"]),

  // Menu items (drinks, food, etc.)
  menuItems: defineTable({
    shopId: v.id("shops"),
    name: v.string(),
    category: v.string(), // "espresso", "brewed", "cold", "food", "pastry"
    price: v.number(),
    description: v.string(),
    available: v.boolean(),
    createdAt: v.number(),
  }).index("by_shop", ["shopId"]),

  // Customer orders
  orders: defineTable({
    shopId: v.id("shops"),
    customerName: v.string(),
    items: v.array(v.object({
      menuItemId: v.id("menuItems"),
      name: v.string(),
      quantity: v.number(),
      price: v.number(),
    })),
    total: v.number(),
    status: v.string(), // "pending", "preparing", "ready", "completed"
    createdAt: v.number(),
  }).index("by_shop", ["shopId"])
    .index("by_shop_and_status", ["shopId", "status"]),

  // Daily sales stats
  dailyStats: defineTable({
    shopId: v.id("shops"),
    date: v.string(), // YYYY-MM-DD
    totalOrders: v.number(),
    totalRevenue: v.number(),
    topItem: v.optional(v.string()),
  }).index("by_shop_and_date", ["shopId", "date"]),
});
