import { internal } from "./_generated/api";
import { mutation, query } from "./_generated/server";
import { auth } from "./auth";
import { currencyValidator, PLANS } from "./schema";
import { asyncMap } from "convex-helpers";
import { v } from "convex/values";
import { User } from "./types";

export const getCurrentUser = query({
  args: {},
  returns: v.any(),
  handler: async (ctx): Promise<any> => {
    const userId = await auth.getUserId(ctx);
    if (!userId) {
      return null;
    }
    const [user, subscription] = await Promise.all([
      ctx.db.get(userId),
      ctx.db
        .query("subscriptions")
        .withIndex("userId", (q) => q.eq("userId", userId))
        .unique(),
    ]);
    if (!user) {
      return null;
    }
    const plan = subscription?.planId
      ? await ctx.db.get(subscription.planId)
      : undefined;
    const avatarUrl = user.imageId
      ? await ctx.storage.getUrl(user.imageId)
      : user.image;
    return {
      ...user,
      avatarUrl: avatarUrl || undefined,
      subscription:
        subscription && plan
          ? {
              ...subscription,
              planKey: plan.key,
            }
          : undefined,
    };
  },
});

export const updateUsername = mutation({
  args: {
    username: v.string(),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    const userId = await auth.getUserId(ctx);
    if (!userId) {
      return null;
    }
    await ctx.db.patch(userId, { username: args.username });
    return null;
  },
});

export const completeOnboarding = mutation({
  args: {
    username: v.string(),
    currency: currencyValidator,
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    const userId = await auth.getUserId(ctx);
    if (!userId) {
      return null;
    }
    const user = await ctx.db.get(userId);
    if (!user) {
      return null;
    }
    await ctx.db.patch(userId, { username: args.username });
    if (user.customerId) {
      return null;
    }
    await ctx.scheduler.runAfter(
      0,
      internal.stripe.PREAUTH_createStripeCustomer,
      {
        currency: args.currency,
        userId,
      },
    );
    return null;
  },
});

export const generateUploadUrl = mutation({
  args: {},
  returns: v.string(),
  handler: async (ctx) => {
    const userId = await auth.getUserId(ctx);
    if (!userId) {
      throw new Error("User not found");
    }
    return await ctx.storage.generateUploadUrl();
  },
});

export const updateUserImage = mutation({
  args: {
    imageId: v.id("_storage"),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    const userId = await auth.getUserId(ctx);
    if (!userId) {
      return null;
    }
    ctx.db.patch(userId, { imageId: args.imageId });
    return null;
  },
});

export const removeUserImage = mutation({
  args: {},
  returns: v.null(),
  handler: async (ctx) => {
    const userId = await auth.getUserId(ctx);
    if (!userId) {
      return null;
    }
    ctx.db.patch(userId, { imageId: undefined, image: undefined });
    return null;
  },
});

export const getActivePlans = query({
  args: {},
  returns: v.any(),
  handler: async (ctx) => {
    const userId = await auth.getUserId(ctx);
    if (!userId) {
      return;
    }
    const [free, pro] = await asyncMap(
      [PLANS.FREE, PLANS.PRO] as const,
      (key) =>
        ctx.db
          .query("plans")
          .withIndex("key", (q) => q.eq("key", key))
          .unique(),
    );
    if (!free || !pro) {
      throw new Error("Plan not found");
    }
    return { free, pro };
  },
});

export const deleteCurrentUserAccount = mutation({
  args: {},
  returns: v.null(),
  handler: async (ctx) => {
    const userId = await auth.getUserId(ctx);
    if (!userId) {
      return null;
    }
    const user = await ctx.db.get(userId);
    if (!user) {
      throw new Error("User not found");
    }
    const subscription = await ctx.db
      .query("subscriptions")
      .withIndex("userId", (q) => q.eq("userId", userId))
      .unique();
    if (!subscription) {
      console.error("No subscription found");
    } else {
      await ctx.db.delete(subscription._id);
      await ctx.scheduler.runAfter(
        0,
        internal.stripe.cancelCurrentUserSubscriptions,
      );
    }
    await ctx.db.delete(userId);
    await asyncMap(["resend-otp", "github"], async (provider) => {
      const authAccount = await ctx.db
        .query("authAccounts")
        .withIndex("userIdAndProvider", (q) =>
          q.eq("userId", userId).eq("provider", provider),
        )
        .unique();
      if (!authAccount) {
        return;
      }
      await ctx.db.delete(authAccount._id);
    });
    return null;
  },
});

export const toggleCoachRole = mutation({
  args: {},
  returns: v.null(),
  handler: async (ctx) => {
    const userId = await auth.getUserId(ctx);
    if (!userId) throw new Error("Not authenticated");
    const user = await ctx.db.get(userId);
    if (!user) throw new Error("User not found");
    await ctx.db.patch(userId, { isCoach: !user.isCoach });
    return null;
  },
});
