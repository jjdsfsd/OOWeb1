import { v } from "convex/values";
import { query, mutation } from "./_generated/server";
import { auth } from "./auth";

export const create = mutation({
  args: {
    title: v.string(),
    description: v.string(),
    videoStorageId: v.optional(v.id("_storage")),
  },
  returns: v.id("drills"),
  handler: async (ctx, args) => {
    const userId = await auth.getUserId(ctx);
    if (!userId) throw new Error("Not authenticated");
    const user = await ctx.db.get(userId);
    if (!user?.isCoach) throw new Error("Not authorized");

    return await ctx.db.insert("drills", {
      coachId: userId,
      ...args,
    });
  },
});

export const list = query({
  args: {},
  returns: v.array(
    v.object({
      _id: v.id("drills"),
      _creationTime: v.number(),
      coachId: v.id("users"),
      title: v.string(),
      description: v.string(),
      videoStorageId: v.optional(v.id("_storage")),
    }),
  ),
  handler: async (ctx) => {
    const userId = await auth.getUserId(ctx);
    if (!userId) return [];
    
    return await ctx.db
      .query("drills")
      .withIndex("coachId", (q) => q.eq("coachId", userId))
      .collect();
  },
});

export const remove = mutation({
  args: { id: v.id("drills") },
  returns: v.null(),
  handler: async (ctx, args) => {
    const userId = await auth.getUserId(ctx);
    if (!userId) throw new Error("Not authenticated");
    const drill = await ctx.db.get(args.id);
    if (!drill || drill.coachId !== userId) throw new Error("Not authorized");

    await ctx.db.delete(args.id);
    return null;
  },
});
