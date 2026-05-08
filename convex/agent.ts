"use node";

import { Agent, createTool } from "@convex-dev/agent";
import { api, components } from "./_generated/api";
import { createOpenRouter } from "@openrouter/ai-sdk-provider";
import { z } from "zod";
import type { Id } from "./_generated/dataModel";

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
        const { reviews, handicap } = await ctx.runQuery(api.swingReviews.getAgentContext, { 
          userId: args.userId as Id<"users"> 
        });
        
        const reviewData = reviews.map((r: any) => ({
          title: r.title,
          date: new Date(r.createdAt).toLocaleDateString(),
          summary: r.summary,
          grip: r.grip,
          posture: r.posture,
          path: r.swingPath,
          drill: r.drillInstructions
        }));
    
        return JSON.stringify({
          handicap: handicap ?? "Not set",
          recentReviews: reviewData
        });
      },
    }),
  },
});
