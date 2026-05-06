import { v } from "convex/values";
import { query, mutation } from "./_generated/server";
import { auth } from "./auth";

export const getCourses = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query("courses").order("asc").collect();
  },
});

export const getCourseWithLessons = query({
  args: { courseId: v.id("courses") },
  handler: async (ctx, args) => {
    const userId = await auth.getUserId(ctx);
    const course = await ctx.db.get(args.courseId);
    if (!course) return null;
    const lessons = await ctx.db
      .query("lessons")
      .withIndex("courseId", (q) => q.eq("courseId", args.courseId))
      .order("asc")
      .collect();

    const lessonsWithProgress = await Promise.all(
      lessons.map(async (lesson) => {
        let progress = null;
        if (userId) {
          progress = await ctx.db
            .query("lessonProgress")
            .withIndex("userId_lessonId", (q) =>
              q.eq("userId", userId).eq("lessonId", lesson._id),
            )
            .unique();
        }
        return { ...lesson, completed: progress?.completed ?? false };
      }),
    );

    return { ...course, lessons: lessonsWithProgress };
  },
});

export const markLessonComplete = mutation({
  args: { lessonId: v.id("lessons"), completed: v.boolean() },
  handler: async (ctx, args) => {
    const userId = await auth.getUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    const existing = await ctx.db
      .query("lessonProgress")
      .withIndex("userId_lessonId", (q) =>
        q.eq("userId", userId).eq("lessonId", args.lessonId),
      )
      .unique();

    if (existing) {
      await ctx.db.patch(existing._id, {
        completed: args.completed,
        lastWatched: Date.now(),
      });
    } else {
      await ctx.db.insert("lessonProgress", {
        userId,
        lessonId: args.lessonId,
        completed: args.completed,
        lastWatched: Date.now(),
      });
    }
  },
});

export const getLesson = query({
  args: { lessonId: v.id("lessons") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.lessonId);
  },
});

export const getCompletedLessonsCount = query({
  args: {},
  handler: async (ctx) => {
    const userId = await auth.getUserId(ctx);
    if (!userId) return 0;
    const progress = await ctx.db
      .query("lessonProgress")
      .withIndex("userId", (q) => q.eq("userId", userId))
      .filter((q) => q.eq(q.field("completed"), true))
      .collect();
    return progress.length;
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
