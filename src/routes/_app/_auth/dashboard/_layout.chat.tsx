/* eslint-disable @typescript-eslint/no-explicit-any */
import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { convexQuery, useConvexMutation } from "@convex-dev/react-query";
import { api } from "@cvx/_generated/api";
import { useState, useRef, useEffect } from "react";
import { Button } from "@/ui/button";
import { Input } from "@/ui/input";
import { Send, Video, Paperclip } from "lucide-react";
import { cn } from "@/utils/misc";
import { Id } from "@cvx/_generated/dataModel";

export const Route = createFileRoute("/_app/_auth/dashboard/_layout/chat")({
  component: ChatPage,
});

type Message = {
  _id: Id<"messages">;
  _creationTime: number;
  userId: Id<"users">;
  text?: string;
  fileId?: Id<"_storage">;
  fileType?: "image" | "video";
  sender: "user" | "coach";
  createdAt: number;
};

function ChatPage() {
  const { data: messages, isLoading } = useQuery(convexQuery((api as any).messages.list, {}));
  const sendMessage = useConvexMutation((api as any).messages.send);
  const [text, setText] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!text.trim()) return;
    const content = text;
    setText("");
    await sendMessage({ text: content });
  };

  return (
    <main className="container mx-auto max-w-screen-md p-6 h-[calc(100vh-180px)] flex flex-col">
      <div className="mb-4">
        <h1 className="text-2xl font-bold text-primary">Coach Chat</h1>
        <p className="text-sm text-muted-foreground">Direct access to your pro coach.</p>
      </div>

      <div className="flex-1 overflow-y-auto space-y-4 pr-4 custom-scrollbar" ref={scrollRef}>
        {isLoading && <div className="text-center py-10">Loading history...</div>}
        {(messages as Message[])?.map((msg) => (
          <div
            key={msg._id}
            className={cn(
              "flex flex-col max-w-[80%] rounded-2xl p-4 shadow-sm",
              msg.sender === "user"
                ? "ml-auto bg-primary text-primary-foreground rounded-tr-none"
                : "bg-card border border-primary/10 rounded-tl-none"
            )}
          >
            {msg.text && <p className="text-sm">{msg.text}</p>}
            {msg.fileId && msg.fileType === "video" && (
              <div className="mt-2 aspect-video bg-black/20 rounded-lg flex items-center justify-center border border-white/10">
                 <Video className="w-8 h-8 opacity-50" />
                 <span className="text-xs ml-2">Video Lesson</span>
              </div>
            )}
            <span className="text-[10px] mt-2 opacity-70 self-end">
              {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </span>
          </div>
        ))}
      </div>

      <form onSubmit={handleSend} className="mt-6 flex gap-2 items-center bg-card p-2 rounded-full border border-primary/20 shadow-lg">
        <Button type="button" variant="ghost" size="icon" className="rounded-full hover:bg-primary/10 hover:text-primary">
          <Paperclip className="w-5 h-5" />
        </Button>
        <Input
          placeholder="Ask your coach anything..."
          value={text}
          onChange={(e) => setText(e.target.value)}
          className="flex-1 border-none focus-visible:ring-0 bg-transparent text-sm"
        />
        <Button type="button" variant="ghost" size="icon" className="rounded-full hover:bg-primary/10 hover:text-primary">
          <Video className="w-5 h-5" />
        </Button>
        <Button type="submit" size="icon" className="rounded-full bg-primary hover:bg-primary/90">
          <Send className="w-4 h-4" />
        </Button>
      </form>
    </main>
  );
}
