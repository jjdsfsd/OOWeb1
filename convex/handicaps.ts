import { v } from "convex/values";
import { query, mutation } from "./_generated/server";
import { auth } from "./auth";

export const getHandicaps = query({
  args: { userId: v.optional(v.id("users")) },
  handler: async (ctx, args) => {
    const authUserId = await auth.getUserId(ctx);
    const targetUserId = args.userId || authUserId;
    if (!targetUserId) return [];

    return await ctx.db
      .query("handicaps")
      .withIndex("userId", (q) => q.eq("userId", targetUserId))
      .order("desc")
      .collect();
  },
});

export const addHandicap = mutation({
  args: { value: v.number() },
  handler: async (ctx, args) => {
    const userId = await auth.getUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    await ctx.db.patch(userId, { handicap: args.value });

    return await ctx.db.insert("handicaps", {
      userId,
      value: args.value,
      date: Date.now(),
    });
  },
});
