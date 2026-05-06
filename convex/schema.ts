import { defineSchema, defineTable } from "convex/server";
import { authTables } from "@convex-dev/auth/server";
import { v, Infer } from "convex/values";

export const CURRENCIES = {
  USD: "usd",
  EUR: "eur",
} as const;
export const currencyValidator = v.union(
  v.literal(CURRENCIES.USD),
  v.literal(CURRENCIES.EUR),
);
export type Currency = Infer<typeof currencyValidator>;

export const INTERVALS = {
  MONTH: "month",
  YEAR: "year",
} as const;
export const intervalValidator = v.union(
  v.literal(INTERVALS.MONTH),
  v.literal(INTERVALS.YEAR),
);
export type Interval = Infer<typeof intervalValidator>;

export const PLANS = {
  FREE: "free",
  PRO: "pro",
} as const;
export const planKeyValidator = v.union(
  v.literal(PLANS.FREE),
  v.literal(PLANS.PRO),
);
export type PlanKey = Infer<typeof planKeyValidator>;

const priceValidator = v.object({
  stripeId: v.string(),
  amount: v.number(),
});
const pricesValidator = v.object({
  [CURRENCIES.USD]: priceValidator,
  [CURRENCIES.EUR]: priceValidator,
});

const schema = defineSchema({
  ...authTables,
  users: defineTable({
    name: v.optional(v.string()),
    username: v.optional(v.string()),
    imageId: v.optional(v.id("_storage")),
    image: v.optional(v.string()),
    email: v.optional(v.string()),
    emailVerificationTime: v.optional(v.number()),
    phone: v.optional(v.string()),
    phoneVerificationTime: v.optional(v.number()),
    isAnonymous: v.optional(v.boolean()),
    customerId: v.optional(v.string()),
    handicap: v.optional(v.number()),
  })
    .index("email", ["email"])
    .index("customerId", ["customerId"]),
  plans: defineTable({
    key: planKeyValidator,
    stripeId: v.string(),
    name: v.string(),
    description: v.string(),
    prices: v.object({
      [INTERVALS.MONTH]: pricesValidator,
      [INTERVALS.YEAR]: pricesValidator,
    }),
  })
    .index("key", ["key"])
    .index("stripeId", ["stripeId"]),
  subscriptions: defineTable({
    userId: v.id("users"),
    planId: v.id("plans"),
    priceStripeId: v.string(),
    stripeId: v.string(),
    currency: currencyValidator,
    interval: intervalValidator,
    status: v.string(),
    currentPeriodStart: v.number(),
    currentPeriodEnd: v.number(),
    cancelAtPeriodEnd: v.boolean(),
  })
    .index("userId", ["userId"])
    .index("stripeId", ["stripeId"]),
  courses: defineTable({
    title: v.string(),
    description: v.string(),
    thumbnailId: v.optional(v.id("_storage")),
    price: v.optional(v.number()), // For one-time purchases
    stripeProductId: v.optional(v.string()),
    order: v.number(),
  }),
  lessons: defineTable({
    courseId: v.id("courses"),
    title: v.string(),
    description: v.string(),
    videoStorageId: v.id("_storage"),
    order: v.number(),
  }).index("courseId", ["courseId"]),
  messages: defineTable({
    userId: v.id("users"),
    text: v.optional(v.string()),
    fileId: v.optional(v.id("_storage")),
    fileType: v.optional(v.union(v.literal("image"), v.literal("video"))),
    sender: v.union(v.literal("user"), v.literal("coach")),
    createdAt: v.number(),
  }).index("userId", ["userId"]),
  handicaps: defineTable({
    userId: v.id("users"),
    value: v.number(),
    date: v.number(),
  }).index("userId", ["userId"]),
  lessonProgress: defineTable({
    userId: v.id("users"),
    lessonId: v.id("lessons"),
    completed: v.boolean(),
    lastWatched: v.number(),
  })
    .index("userId", ["userId"])
    .index("lessonId", ["lessonId"])
    .index("userId_lessonId", ["userId", "lessonId"]),
});

export default schema;
