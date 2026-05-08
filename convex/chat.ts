import { internalAction, mutation, query } from "./_generated/server";
import { internal, components } from "./_generated/api";
import { listUIMessages, syncStreams, vStreamArgs } from "@convex-dev/agent";
import { paginationOptsValidator } from "convex/server";
import { v } from "convex/values";
import { aiCaddy } from "./agent";
import { auth } from "./auth";

export const getOrCreateThread = mutation({
  args: {},
  returns: v.object({ threadId: v.string() }),
  handler: async (ctx) => {
    const userId = await auth.getUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    // For simplicity, we'll use a single thread per user for now
    // In a real app, you might want multiple threads
    const user = await ctx.db.get(userId);
    if (user?.caddyThreadId) {
      return { threadId: user.caddyThreadId };
    }

    const { threadId } = await aiCaddy.createThread(ctx, {});
    await ctx.db.patch(userId, { caddyThreadId: threadId });
    return { threadId };
  },
});

export const sendMessage = mutation({
  args: { prompt: v.string(), threadId: v.string() },
  returns: v.string(),
  handler: async (ctx, { prompt, threadId }) => {
    const userId = await auth.getUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    const { messageId } = await aiCaddy.saveMessage(ctx, {
      threadId,
      prompt,
      userId: userId,
      skipEmbeddings: true,
    });
    
    await ctx.scheduler.runAfter(0, internal.chat.generateResponse, {
      threadId,
      promptMessageId: messageId,
    });
    
    return messageId;
  },
});

export const generateResponse = internalAction({
  args: { promptMessageId: v.string(), threadId: v.string() },
  handler: async (ctx, { promptMessageId, threadId }) => {
    const result = await aiCaddy.streamText(
      ctx,
      { threadId },
      { promptMessageId },
      { saveStreamDeltas: { throttleMs: 200, chunking: "word" } },
    );
    await result.consumeStream();
  },
});

export const listMessages = query({
  args: {
    threadId: v.string(),
    paginationOpts: paginationOptsValidator,
    streamArgs: vStreamArgs,
  },
  handler: async (ctx, args) => {
    const streams = await syncStreams(ctx, components.agent, args);
    const paginated = await listUIMessages(ctx, components.agent, args);
    return { ...paginated, streams };
  },
});
