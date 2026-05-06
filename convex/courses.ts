import { v } from "convex/values";
import { query, mutation } from "./_generated/server";

export const getCourses = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query("courses").order("asc").collect();
  },
});

export const getCourseWithLessons = query({
  args: { courseId: v.id("courses") },
  handler: async (ctx, args) => {
    const course = await ctx.db.get(args.courseId);
    if (!course) return null;
    const lessons = await ctx.db
      .query("lessons")
      .withIndex("courseId", (q) => q.eq("courseId", args.courseId))
      .order("asc")
      .collect();
    return { ...course, lessons };
  },
});

export const getLesson = query({
  args: { lessonId: v.id("lessons") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.lessonId);
  },
});

// Admin mutations (could be restricted by auth later)
export const createCourse = mutation({
  args: {
    title: v.string(),
    description: v.string(),
    thumbnailId: v.optional(v.id("_storage")),
    price: v.optional(v.number()),
    order: v.number(),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("courses", args);
  },
});

export const createLesson = mutation({
  args: {
    courseId: v.id("courses"),
    title: v.string(),
    description: v.string(),
    videoStorageId: v.id("_storage"),
    order: v.number(),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("lessons", args);
  },
});
