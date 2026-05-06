import { v } from "convex/values";
import { query, mutation } from "./_generated/server";
import { auth } from "./auth";

export const list = query({
  args: { userId: v.optional(v.id("users")) },
  handler: async (ctx, args) => {
    const authUserId = await auth.getUserId(ctx);
    const targetUserId = args.userId || authUserId;
    if (!targetUserId) return [];

    return await ctx.db
      .query("messages")
      .withIndex("userId", (q) => q.eq("userId", targetUserId))
      .order("asc")
      .collect();
  },
});

export const getVideoUrl = query({
  args: { fileId: v.id("_storage") },
  handler: async (ctx, args) => {
    return await ctx.storage.getUrl(args.fileId);
  },
});

export const send = mutation({
  args: {
    userId: v.optional(v.id("users")), // If coach sends to a specific user
    text: v.optional(v.string()),
    fileId: v.optional(v.id("_storage")),
    fileType: v.optional(v.union(v.literal("image"), v.literal("video"))),
  },
  handler: async (ctx, args) => {
    const authUserId = await auth.getUserId(ctx);
    if (!authUserId) throw new Error("Not authenticated");

    const userId = args.userId || authUserId;
    const sender = args.userId ? "coach" : "user";

    return await ctx.db.insert("messages", {
      userId,
      text: args.text,
      fileId: args.fileId,
      fileType: args.fileType,
      sender,
      createdAt: Date.now(),
    });
  },
});
