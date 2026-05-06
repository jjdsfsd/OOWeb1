import { v } from "convex/values";
import { query, mutation } from "./_generated/server";
import { auth } from "./auth";

export const list = query({
  args: { userId: v.optional(v.id("users")) },
  returns: v.array(
    v.object({
      _id: v.id("messages"),
      _creationTime: v.number(),
      userId: v.id("users"),
      text: v.optional(v.string()),
      fileId: v.optional(v.id("_storage")),
      fileType: v.optional(v.union(v.literal("image"), v.literal("video"))),
      sender: v.union(v.literal("user"), v.literal("coach")),
      createdAt: v.number(),
    }),
  ),
  handler: async (ctx, args) => {
    const authUserId = await auth.getUserId(ctx);
    if (!authUserId) return [];
    
    const user = await ctx.db.get(authUserId);
    const targetUserId = args.userId || authUserId;
    
    // If a non-coach tries to view someone else's messages, return empty
    if (!user?.isCoach && targetUserId !== authUserId) {
      return [];
    }

    return await ctx.db
      .query("messages")
      .withIndex("userId", (q) => q.eq("userId", targetUserId))
      .order("asc")
      .collect();
  },
});

export const listStudents = query({
  args: {},
  returns: v.array(
    v.object({
      _id: v.id("users"),
      name: v.optional(v.string()),
      username: v.optional(v.string()),
      email: v.optional(v.string()),
      lastMessageAt: v.number(),
    }),
  ),
  handler: async (ctx) => {
    const userId = await auth.getUserId(ctx);
    if (!userId) throw new Error("Not authenticated");
    
    const user = await ctx.db.get(userId);
    if (!user?.isCoach) throw new Error("Not authorized");

    const messages = await ctx.db.query("messages").order("desc").collect();
    const studentMap = new Map<string, number>();
    
    for (const msg of messages) {
      if (!studentMap.has(msg.userId)) {
        studentMap.set(msg.userId, msg.createdAt);
      }
    }

    const students = [];
    for (const [studentId, lastMessageAt] of studentMap.entries()) {
      const student = await ctx.db.get(studentId as any);
      if (student && !student.isCoach) {
        students.push({
          _id: student._id,
          name: student.name,
          username: student.username,
          email: student.email,
          lastMessageAt,
        });
      }
    }

    return students.sort((a, b) => b.lastMessageAt - a.lastMessageAt);
  },
});

export const getVideoUrl = query({
  args: { fileId: v.id("_storage") },
  returns: v.union(v.string(), v.null()),
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
  returns: v.id("messages"),
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
