import { createFileRoute } from "@tanstack/react-router";
import { 
  useUIMessages, 
  useSmoothText, 
  optimisticallySendMessage 
} from "@convex-dev/agent/react";
import { useMutation } from "convex/react";
import { api } from "@cvx/_generated/api";
import type { UIMessage } from "@convex-dev/agent";
import { useState, useRef, useEffect } from "react";
import { Button } from "@/ui/button";
import { Input } from "@/ui/input";
import { Send, Bot, User, Loader2, Sparkles } from "lucide-react";
import { cn } from "@/utils/misc";
import { useQuery } from "@tanstack/react-query";
import { convexQuery, useConvexMutation } from "@convex-dev/react-query";

export const Route = createFileRoute("/_app/_auth/dashboard/_layout/caddy")({
  component: AICaddyPage,
});

function AICaddyPage() {
  const getOrCreateThread = useConvexMutation(api.chat.getOrCreateThread);
  const [threadId, setThreadId] = useState<string | null>(null);

  useEffect(() => {
    getOrCreateThread({}).then(res => setThreadId(res.threadId));
  }, [getOrCreateThread]);

  if (!threadId) {
    return (
      <div className="flex h-full items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return <CaddyChat threadId={threadId} />;
}

function CaddyChat({ threadId }: { threadId: string }) {
  const { results, status, loadMore } = useUIMessages(
    api.chat.listMessages,
    { threadId },
    { initialNumItems: 50, stream: true },
  );

  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [results]);

  return (
    <main className="container mx-auto max-w-screen-md p-6 h-[calc(100vh-180px)] flex flex-col">
      <div className="mb-6 flex items-center gap-3">
        <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary border border-primary/20 shadow-inner">
          <Bot className="w-6 h-6" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-primary">AI Caddy</h1>
          <p className="text-sm text-muted-foreground flex items-center gap-1">
            <Sparkles className="w-3 h-3 text-orange-500" /> Personalized golf assistant
          </p>
        </div>
      </div>

      <div
        className="flex-1 overflow-y-auto space-y-4 pr-4 custom-scrollbar"
        ref={scrollRef}
      >
        {results.length === 0 && (
          <div className="h-full flex flex-col items-center justify-center text-center p-8 space-y-4 opacity-60">
            <Bot className="w-16 h-16 text-primary/20" />
            <div>
              <p className="font-bold text-lg">How can I help your game today?</p>
              <p className="text-sm max-w-xs">I can answer questions about your drills, explain your coach's feedback, or give general swing tips.</p>
            </div>
          </div>
        )}
        
        {results.map((msg) => (
          <Message key={msg.key} message={msg} />
        ))}
      </div>

      <CaddyInput threadId={threadId} />
    </main>
  );
}

function Message({ message }: { message: UIMessage }) {
  const isAI = message.role === "assistant";
  const [visibleText] = useSmoothText(message.text, {
    startStreaming: message.status === "streaming",
  });

  return (
    <div
      className={cn(
        "flex gap-3 max-w-[85%] animate-in fade-in slide-in-from-bottom-2 duration-300",
        isAI ? "mr-auto" : "ml-auto flex-row-reverse"
      )}
    >
      <div className={cn(
        "w-8 h-8 rounded-full flex items-center justify-center shrink-0 border",
        isAI ? "bg-primary/10 border-primary/20 text-primary" : "bg-secondary border-border text-muted-foreground"
      )}>
        {isAI ? <Bot className="w-4 h-4" /> : <User className="w-4 h-4" />}
      </div>
      <div
        className={cn(
          "rounded-2xl p-4 shadow-sm text-sm leading-relaxed",
          isAI 
            ? "bg-card border border-primary/10 rounded-tl-none" 
            : "bg-primary text-primary-foreground rounded-tr-none"
        )}
      >
        <p className="whitespace-pre-wrap">{visibleText}</p>
        {message.status === "streaming" && (
          <span className="inline-block w-1.5 h-4 ml-1 bg-primary/40 animate-pulse align-middle rounded-full" />
        )}
      </div>
    </div>
  );
}

function CaddyInput({ threadId }: { threadId: string }) {
  const [input, setInput] = useState("");
  const sendMessage = useMutation(api.chat.sendMessage).withOptimisticUpdate(
    optimisticallySendMessage(api.chat.listMessages),
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;
    const prompt = input;
    setInput("");
    await sendMessage({ threadId, prompt });
  };

  return (
    <form 
      onSubmit={handleSubmit}
      className="mt-6 flex gap-2 items-center bg-card p-2 rounded-full border border-primary/20 shadow-lg"
    >
      <Input
        value={input}
        onChange={(e) => setInput(e.target.value)}
        placeholder="Ask about your drills or feedback..."
        className="flex-1 border-none focus-visible:ring-0 bg-transparent text-sm ml-2"
      />
      <Button 
        type="submit" 
        size="icon" 
        disabled={!input.trim()}
        className="rounded-full bg-primary hover:bg-primary/90 shadow-lg shadow-primary/20 mr-1"
      >
        <Send className="w-4 h-4" />
      </Button>
    </form>
  );
}
