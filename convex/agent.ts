"use node";

import { Agent, createTool } from "@convex-dev/agent";
import { components } from "./_generated/api";
import { createOpenRouter } from "@openrouter/ai-sdk-provider";
import { z } from "zod";

const openrouter = createOpenRouter({
  apiKey: process.env.OPENROUTER_API_KEY,
});

export const aiCaddy = new Agent(components.agent, {
  name: "AI Caddy",
  instructions: "You are the OOWeb1 AI Caddy, a specialized golf assistant. Your goal is to help students understand their coach's feedback and provide actionable swing tips. You have access to the student's latest swing reviews. Use them to provide personalized advice. Be encouraging, professional, and concise.",
  languageModel: openrouter.chat("openai/gpt-4o-mini"),
  maxSteps: 5,
  tools: {
    getLatestReviews: createTool({
      description: "Get the student's 3 most recent swing reviews and their current handicap.",
      args: z.object({ userId: z.string() }),
      handler: async (ctx, args): Promise<string> => {
        const user = await ctx.db.get(args.userId as any);
        const reviews = await ctx.db
          .query("swingReviews")
          .withIndex("userId", (q) => q.eq("userId", args.userId as any))
          .order("desc")
          .take(3);
        
        const reviewData = reviews.map(r => ({
          title: r.title,
          date: new Date(r.createdAt).toLocaleDateString(),
          summary: r.summary,
          grip: r.grip,
          posture: r.posture,
          path: r.swingPath,
          drill: r.drillInstructions
        }));

        return JSON.stringify({
          handicap: user?.handicap ?? "Not set",
          recentReviews: reviewData
        });
      },
    }),
  },
});
