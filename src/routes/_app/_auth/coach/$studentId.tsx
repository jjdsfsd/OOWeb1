import { createFileRoute } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";
import { convexQuery, useConvexMutation } from "@convex-dev/react-query";
import { api } from "@cvx/_generated/api";
import { useState, useRef, useEffect } from "react";
import { Button } from "@/ui/button";
import { Input } from "@/ui/input";
import { Send, Paperclip, Loader2, ChevronLeft, ClipboardList } from "lucide-react";
import { cn } from "@/utils/misc";
import { Id } from "@cvx/_generated/dataModel";
import { Link } from "@tanstack/react-router";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger,
  DialogFooter
} from "@/ui/dialog";
import { Textarea } from "@/ui/textarea";
import { Label } from "@/ui/label";

export const Route = createFileRoute("/_app/_auth/coach/$studentId")({
  component: CoachStudentChat,
});

function CoachStudentChat() {
  const { studentId } = Route.useParams();
  const { data: messages } = useSuspenseQuery(
    convexQuery(api.messages.list, { userId: studentId as Id<"users"> }),
  );
  const sendMessage = useConvexMutation(api.messages.send);
  const createReview = useConvexMutation(api.swingReviews.create);
  const generateUploadUrl = useConvexMutation(api.app.generateUploadUrl);

  const [text, setText] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [reviewOpen, setReviewOpen] = useState(false);
  const [reviewForm, setReviewForm] = useState({
    title: "Swing Analysis",
    grip: "",
    posture: "",
    alignment: "",
    swingPath: "",
    summary: "",
    drillInstructions: "",
  });

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
    await sendMessage({ text: content, userId: studentId as Id<"users"> });
  };

  const handleReviewSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await createReview({
      userId: studentId as Id<"users">,
      ...reviewForm,
    });
    setReviewOpen(false);
    await sendMessage({ 
      text: `🏆 Coach posted a new Swing Analysis: "${reviewForm.title}"`, 
      userId: studentId as Id<"users"> 
    });
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    try {
      const uploadUrl = await generateUploadUrl({});
      const result = await fetch(uploadUrl, {
        method: "POST",
        headers: { "Content-Type": file.type },
        body: file,
      });
      const response = (await result.json()) as { storageId: string };
      const storageId = response.storageId;
      
      const isVideo = file.type.startsWith("video/");
      const isImage = file.type.startsWith("image/");
      
      await sendMessage({
        userId: studentId as Id<"users">,
        fileId: storageId as Id<"_storage">,
        fileType: isVideo ? "video" : isImage ? "image" : undefined,
        text: `Coach attached: ${file.name}`,
      });
    } catch (err) {
      console.error("Upload failed", err);
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between p-4 border-b bg-card shadow-sm">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" asChild className="rounded-full">
            <Link to="/coach">
              <ChevronLeft className="w-5 h-5" />
            </Link>
          </Button>
          <div>
            <h2 className="font-bold text-primary">Student Review</h2>
            <p className="text-xs text-muted-foreground uppercase tracking-widest font-medium">Chat History</p>
          </div>
        </div>
        
        <Dialog open={reviewOpen} onOpenChange={setReviewOpen}>
          <DialogTrigger asChild>
            <Button size="sm" className="gap-2">
              <ClipboardList className="w-4 h-4" />
              New Analysis
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Structured Swing Review</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleReviewSubmit} className="space-y-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="title">Report Title</Label>
                <Input 
                  id="title" 
                  value={reviewForm.title} 
                  onChange={e => setReviewForm(prev => ({...prev, title: e.target.value}))}
                  placeholder="e.g. Driver Swing Analysis"
                  required
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="grip">Grip Feedback</Label>
                  <Input 
                    id="grip" 
                    value={reviewForm.grip} 
                    onChange={e => setReviewForm(prev => ({...prev, grip: e.target.value}))}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="posture">Posture Feedback</Label>
                  <Input 
                    id="posture" 
                    value={reviewForm.posture} 
                    onChange={e => setReviewForm(prev => ({...prev, posture: e.target.value}))}
                  />
                </div>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="swingPath">Swing Path / Dynamics</Label>
                <Textarea 
                  id="swingPath" 
                  value={reviewForm.swingPath} 
                  onChange={e => setReviewForm(prev => ({...prev, swingPath: e.target.value}))}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="summary">Overall Summary</Label>
                <Textarea 
                  id="summary" 
                  value={reviewForm.summary} 
                  onChange={e => setReviewForm(prev => ({...prev, summary: e.target.value}))}
                  required
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="drills">Recommended Drills</Label>
                <Textarea 
                  id="drills" 
                  value={reviewForm.drillInstructions} 
                  onChange={e => setReviewForm(prev => ({...prev, drillInstructions: e.target.value}))}
                />
              </div>
              <DialogFooter>
                <Button type="submit">Post Review</Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div
        className="flex-1 overflow-y-auto p-6 space-y-4 custom-scrollbar"
        ref={scrollRef}
      >
        {messages.map((msg) => (
          <div
            key={msg._id}
            className={cn(
              "flex flex-col max-w-[80%] rounded-2xl p-4 shadow-sm transition-all animate-in fade-in slide-in-from-bottom-2",
              msg.sender === "coach"
                ? "ml-auto bg-primary text-primary-foreground rounded-tr-none shadow-primary/20"
                : "bg-card border border-primary/10 rounded-tl-none",
            )}
          >
            {msg.text && <p className="text-sm leading-relaxed">{msg.text}</p>}
            {msg.fileId && msg.fileType === "video" && (
              <VideoMessage fileId={msg.fileId} />
            )}
            {msg.fileId && msg.fileType === "image" && (
              <ImageMessage fileId={msg.fileId} />
            )}
            <span className="text-[10px] mt-2 opacity-70 self-end font-medium uppercase tracking-wider">
              {new Date(msg.createdAt).toLocaleTimeString([], {
                hour: "2-digit",
                minute: "2-digit",
              })}
            </span>
          </div>
        ))}
        {isUploading && (
          <div className="flex flex-col ml-auto max-w-[80%] rounded-2xl p-4 bg-primary/20 border border-primary/20 rounded-tr-none items-center">
            <Loader2 className="w-6 h-6 animate-spin mb-2 text-primary" />
            <p className="text-xs text-primary font-medium">Sending review...</p>
          </div>
        )}
      </div>

      <form
        onSubmit={handleSend}
        className="p-4 bg-card border-t flex gap-2 items-center"
      >
        <input
          type="file"
          className="hidden"
          ref={fileInputRef}
          onChange={handleFileChange}
          accept="image/*,video/*"
        />
        <Button
          type="button"
          variant="ghost"
          size="icon"
          onClick={() => fileInputRef.current?.click()}
          className="rounded-full hover:bg-primary/10 hover:text-primary"
        >
          <Paperclip className="w-5 h-5" />
        </Button>
        <Input
          placeholder="Type your feedback..."
          value={text}
          onChange={(e) => setText(e.target.value)}
          className="flex-1 bg-muted/50 border-none focus-visible:ring-1 focus-visible:ring-primary/50"
        />
        <Button
          type="submit"
          size="icon"
          disabled={!text.trim()}
          className="rounded-full bg-primary hover:bg-primary/90 shadow-lg shadow-primary/20"
        >
          <Send className="w-4 h-4" />
        </Button>
      </form>
    </div>
  );
}

function VideoMessage({ fileId }: { fileId: Id<"_storage"> }) {
  const { data: videoUrl } = useSuspenseQuery(convexQuery(api.messages.getVideoUrl, { fileId }));

  if (!videoUrl)
    return (
      <div className="mt-2 aspect-video bg-muted/20 rounded-xl flex items-center justify-center border border-primary/5">
        <Loader2 className="w-6 h-6 animate-spin text-primary opacity-50" />
      </div>
    );

  return (
    <div className="mt-2 aspect-video rounded-xl overflow-hidden border border-primary/10 shadow-lg bg-black">
      <video
        src={videoUrl}
        controls
        className="w-full h-full object-contain"
      />
    </div>
  );
}

function ImageMessage({ fileId }: { fileId: Id<"_storage"> }) {
  const { data: imageUrl } = useSuspenseQuery(convexQuery(api.messages.getVideoUrl, { fileId }));

  if (!imageUrl)
    return (
      <div className="mt-2 aspect-video bg-muted/20 rounded-xl flex items-center justify-center border border-primary/5">
        <Loader2 className="w-6 h-6 animate-spin text-primary opacity-50" />
      </div>
    );

  return (
    <div className="mt-2 rounded-xl overflow-hidden border border-primary/10 shadow-lg bg-black">
      <img
        src={imageUrl}
        alt="Student submission"
        className="w-full h-auto max-h-[400px] object-contain"
      />
    </div>
  );
}
