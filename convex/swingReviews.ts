import { v } from "convex/values";
import { query, mutation } from "./_generated/server";
import { auth } from "./auth";

export const create = mutation({
  args: {
    userId: v.id("users"),
    messageId: v.optional(v.id("messages")),
    title: v.string(),
    grip: v.optional(v.string()),
    posture: v.optional(v.string()),
    alignment: v.optional(v.string()),
    swingPath: v.optional(v.string()),
    summary: v.string(),
    drillInstructions: v.optional(v.string()),
    drillVideoId: v.optional(v.id("_storage")),
  },
  returns: v.id("swingReviews"),
  handler: async (ctx, args) => {
    const coachId = await auth.getUserId(ctx);
    const coach = await ctx.db.get(coachId!);
    if (!coach?.isCoach) throw new Error("Not authorized");

    return await ctx.db.insert("swingReviews", {
      ...args,
      createdAt: Date.now(),
    });
  },
});

export const list = query({
  args: { userId: v.optional(v.id("users")) },
  returns: v.array(
    v.object({
      _id: v.id("swingReviews"),
      _creationTime: v.number(),
      userId: v.id("users"),
      messageId: v.optional(v.id("messages")),
      title: v.string(),
      grip: v.optional(v.string()),
      posture: v.optional(v.string()),
      alignment: v.optional(v.string()),
      swingPath: v.optional(v.string()),
      summary: v.string(),
      drillInstructions: v.optional(v.string()),
      drillVideoId: v.optional(v.id("_storage")),
      createdAt: v.number(),
    }),
  ),
  handler: async (ctx, args) => {
    const userId = await auth.getUserId(ctx);
    if (!userId) return [];
    
    const targetUserId = args.userId || userId;
    const user = await ctx.db.get(userId);
    
    if (!user?.isCoach && targetUserId !== userId) {
      return [];
    }

    return await ctx.db
      .query("swingReviews")
      .withIndex("userId", (q) => q.eq("userId", targetUserId))
      .order("desc")
      .collect();
  },
});

export const getUnreadCount = query({
  args: {},
  returns: v.number(),
  handler: async (ctx) => {
    const userId = await auth.getUserId(ctx);
    if (!userId) return 0;
    
    const user = await ctx.db.get(userId);
    if (!user) return 0;

    const lastRead = user.lastReadReviewsAt ?? 0;
    const reviews = await ctx.db
      .query("swingReviews")
      .withIndex("userId", (q) => q.eq("userId", userId))
      .collect();
    
    return reviews.filter(r => r.createdAt > lastRead).length;
  },
});

export const markRead = mutation({
  args: {},
  returns: v.null(),
  handler: async (ctx) => {
    const userId = await auth.getUserId(ctx);
    if (!userId) return null;
    
    await ctx.db.patch(userId, { lastReadReviewsAt: Date.now() });
    return null;
  },
});

export const getAgentContext = query({
  args: { userId: v.id("users") },
  returns: v.object({
    handicap: v.optional(v.number()),
    reviews: v.array(v.any()),
  }),
  handler: async (ctx, args) => {
    const user = await ctx.db.get(args.userId);
    const reviews = await ctx.db
      .query("swingReviews")
      .withIndex("userId", (q) => q.eq("userId", args.userId))
      .order("desc")
      .take(3);
    
    return {
      handicap: user?.handicap,
      reviews,
    };
  },
});
