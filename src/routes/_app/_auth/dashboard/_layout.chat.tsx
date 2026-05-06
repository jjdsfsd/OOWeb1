import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { convexQuery, useConvexMutation } from "@convex-dev/react-query";
import { api } from "@cvx/_generated/api";
import { useState, useRef, useEffect } from "react";
import { Button } from "@/ui/button";
import { Input } from "@/ui/input";
import { Send, Video, Paperclip, StopCircle, Loader2 } from "lucide-react";
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
  const { data: messages, isLoading } = useQuery(
    convexQuery(api.messages.list, {}),
  );
  const sendMessage = useConvexMutation(api.messages.send);
  const generateUploadUrl = useConvexMutation(api.app.generateUploadUrl);

  const [text, setText] = useState("");
  const [isRecording, setIsRecording] = useState(false);
  const [recordingDuration, setRecordingDuration] = useState(0);
  const [isUploading, setIsUploading] = useState(false);

  const scrollRef = useRef<HTMLDivElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<number | undefined>(undefined);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true,
      });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      chunksRef.current = [];

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          chunksRef.current.push(e.data);
        }
      };

      mediaRecorder.onstop = async () => {
        const blob = new Blob(chunksRef.current, { type: "video/webm" });
        await uploadVideo(blob);
        stream.getTracks().forEach((track) => track.stop());
      };

      mediaRecorder.start();
      setIsRecording(true);
      setRecordingDuration(0);
      timerRef.current = window.setInterval(() => {
        setRecordingDuration((prev) => {
          if (prev >= 15) {
            stopRecording();
            return 15;
          }
          return prev + 1;
        });
      }, 1000);
    } catch (err) {
      console.error("Failed to start recording", err);
      alert("Could not access camera/microphone");
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      if (timerRef.current) window.clearInterval(timerRef.current);
    }
  };

  const uploadVideo = async (blob: Blob) => {
    setIsUploading(true);
    try {
      const uploadUrl = await generateUploadUrl({});
      const result = await fetch(uploadUrl, {
        method: "POST",
        headers: { "Content-Type": blob.type },
        body: blob,
      });
      const response = (await result.json()) as { storageId: string };
      const storageId = response.storageId;
      await sendMessage({
        fileId: storageId as Id<"_storage">,
        fileType: "video",
      });
    } catch (err) {
      console.error("Upload failed", err);
    } finally {
      setIsUploading(false);
    }
  };

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!text.trim()) return;
    const content = text;
    setText("");
    await sendMessage({ text: content });
  };

  return (
    <main className="container mx-auto max-w-screen-md p-6 h-[calc(100vh-180px)] flex flex-col">
      <div className="mb-4 flex justify-between items-end">
        <div>
          <h1 className="text-2xl font-bold text-primary">Coach Chat</h1>
          <p className="text-sm text-muted-foreground">
            Direct access to your pro coach.
          </p>
        </div>
        {isRecording && (
          <div className="flex items-center gap-2 text-red-500 animate-pulse font-medium">
            <div className="w-2 h-2 rounded-full bg-red-500" />
            {recordingDuration}s / 15s
          </div>
        )}
      </div>

      <div
        className="flex-1 overflow-y-auto space-y-4 pr-4 custom-scrollbar"
        ref={scrollRef}
      >
        {isLoading && (
          <div className="text-center py-10">Loading history...</div>
        )}
        {(messages as Message[] | undefined)?.map((msg: Message) => (
          <div
            key={msg._id}
            className={cn(
              "flex flex-col max-w-[80%] rounded-2xl p-4 shadow-sm",
              msg.sender === "user"
                ? "ml-auto bg-primary text-primary-foreground rounded-tr-none"
                : "bg-card border border-primary/10 rounded-tl-none",
            )}
          >
            {msg.text && <p className="text-sm">{msg.text}</p>}
            {msg.fileId && msg.fileType === "video" && (
              <VideoMessage fileId={msg.fileId} />
            )}
            <span className="text-[10px] mt-2 opacity-70 self-end">
              {new Date(msg.createdAt).toLocaleTimeString([], {
                hour: "2-digit",
                minute: "2-digit",
              })}
            </span>
          </div>
        ))}
        {isUploading && (
          <div className="flex flex-col ml-auto max-w-[80%] rounded-2xl p-4 bg-primary/50 text-primary-foreground rounded-tr-none items-center">
            <Loader2 className="w-6 h-6 animate-spin mb-2" />
            <p className="text-xs">Uploading video swing...</p>
          </div>
        )}
      </div>

      <form
        onSubmit={handleSend}
        className="mt-6 flex gap-2 items-center bg-card p-2 rounded-full border border-primary/20 shadow-lg"
      >
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="rounded-full hover:bg-primary/10 hover:text-primary"
        >
          <Paperclip className="w-5 h-5" />
        </Button>
        <Input
          placeholder={
            isRecording ? "Recording video..." : "Ask your coach anything..."
          }
          value={text}
          onChange={(e) => setText(e.target.value)}
          disabled={isRecording}
          className="flex-1 border-none focus-visible:ring-0 bg-transparent text-sm"
        />
        {isRecording ? (
          <Button
            type="button"
            variant="destructive"
            size="icon"
            onClick={stopRecording}
            className="rounded-full animate-pulse"
          >
            <StopCircle className="w-5 h-5" />
          </Button>
        ) : (
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={startRecording}
            className="rounded-full hover:bg-primary/10 hover:text-primary"
          >
            <Video className="w-5 h-5" />
          </Button>
        )}
        <Button
          type="submit"
          size="icon"
          disabled={isRecording || !text.trim()}
          className="rounded-full bg-primary hover:bg-primary/90"
        >
          <Send className="w-4 h-4" />
        </Button>
      </form>
    </main>
  );
}

function VideoMessage({ fileId }: { fileId: Id<"_storage"> }) {
  const getUrl = useQuery(convexQuery(api.messages.getVideoUrl, { fileId }));

  if (!getUrl.data)
    return (
      <div className="mt-2 aspect-video bg-black/20 rounded-lg flex items-center justify-center border border-white/10">
        <Loader2 className="w-6 h-6 animate-spin opacity-50" />
      </div>
    );

  return (
    <div className="mt-2 aspect-video rounded-lg overflow-hidden border border-white/10 shadow-inner bg-black">
      <video
        src={getUrl.data}
        controls
        className="w-full h-full object-contain"
      />
    </div>
  );
}
