/* eslint-disable */
/**
 * Generated `api` utility.
 *
 * THIS CODE IS AUTOMATICALLY GENERATED.
 *
 * To regenerate, run `npx convex dev`.
 * @module
 */

import type * as agent from "../agent.js";
import type * as app from "../app.js";
import type * as auth from "../auth.js";
import type * as chat from "../chat.js";
import type * as courses from "../courses.js";
import type * as drills from "../drills.js";
import type * as email_index from "../email/index.js";
import type * as email_templates_subscriptionEmail from "../email/templates/subscriptionEmail.js";
import type * as env from "../env.js";
import type * as errors from "../errors.js";
import type * as handicaps from "../handicaps.js";
import type * as http from "../http.js";
import type * as init from "../init.js";
import type * as library from "../library.js";
import type * as messages from "../messages.js";
import type * as otp_ResendOTP from "../otp/ResendOTP.js";
import type * as otp_VerificationCodeEmail from "../otp/VerificationCodeEmail.js";
import type * as stripe from "../stripe.js";
import type * as swingReviews from "../swingReviews.js";
import type * as types from "../types.js";

import type {
  ApiFromModules,
  FilterApi,
  FunctionReference,
} from "convex/server";

declare const fullApi: ApiFromModules<{
  agent: typeof agent;
  app: typeof app;
  auth: typeof auth;
  chat: typeof chat;
  courses: typeof courses;
  drills: typeof drills;
  "email/index": typeof email_index;
  "email/templates/subscriptionEmail": typeof email_templates_subscriptionEmail;
  env: typeof env;
  errors: typeof errors;
  handicaps: typeof handicaps;
  http: typeof http;
  init: typeof init;
  library: typeof library;
  messages: typeof messages;
  "otp/ResendOTP": typeof otp_ResendOTP;
  "otp/VerificationCodeEmail": typeof otp_VerificationCodeEmail;
  stripe: typeof stripe;
  swingReviews: typeof swingReviews;
  types: typeof types;
}>;

/**
 * A utility for referencing Convex functions in your app's public API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = api.myModule.myFunction;
 * ```
 */
export declare const api: FilterApi<
  typeof fullApi,
  FunctionReference<any, "public">
>;

/**
 * A utility for referencing Convex functions in your app's internal API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = internal.myModule.myFunction;
 * ```
 */
export declare const internal: FilterApi<
  typeof fullApi,
  FunctionReference<any, "internal">
>;

export declare const components: {
  agent: import("@convex-dev/agent/_generated/component.js").ComponentApi<"agent">;
};
