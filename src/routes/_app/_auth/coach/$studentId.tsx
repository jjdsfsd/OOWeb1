import { createFileRoute } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";
import { convexQuery, useConvexMutation } from "@convex-dev/react-query";
import { api } from "@cvx/_generated/api";
import { useState, useRef, useEffect } from "react";
import { Button } from "@/ui/button";
import { Input } from "@/ui/input";
import { Send, Paperclip, Loader2, Trophy, Video, ChevronDown } from "lucide-react";
import { cn } from "@/utils/misc";
import type { Id } from "@cvx/_generated/dataModel";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/ui/dialog";
import { Label } from "@/ui/label";
import { Textarea } from "@/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/ui/select";

export const Route = createFileRoute("/_app/_auth/coach/$studentId")({
  component: StudentChat,
});

function StudentChat() {
  const { studentId } = Route.useParams();
  const { data: messages } = useSuspenseQuery(
    convexQuery(api.messages.list, { userId: studentId as Id<"users"> }),
  );
  const { data: drills } = useSuspenseQuery(convexQuery(api.drills.list, {}));
  
  const sendMessage = useConvexMutation(api.messages.send);
  const createReview = useConvexMutation(api.swingReviews.create);
  const generateUploadUrl = useConvexMutation(api.app.generateUploadUrl);

  const [text, setText] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  const [reviewDialogOpen, setReviewDialogOpen] = useState(false);
  
  const [reviewData, setReviewData] = useState({
    title: "",
    grip: "",
    posture: "",
    alignment: "",
    swingPath: "",
    summary: "",
    drillInstructions: "",
    drillVideoId: undefined as Id<"_storage"> | undefined,
  });

  const scrollRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

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
    await sendMessage({ userId: studentId as Id<"users">, text: content });
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
      const response = await result.json();
      const storageId = response.storageId;
      
      const isVideo = file.type.startsWith("video/");
      const isImage = file.type.startsWith("image/");
      
      await sendMessage({
        userId: studentId as Id<"users">,
        fileId: storageId as Id<"_storage">,
        fileType: isVideo ? "video" : isImage ? "image" : undefined,
        text: "Attached: " + file.name,
      });
    } catch (err) {
      console.error("Upload failed", err);
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const submitReview = async () => {
    if (!reviewData.title || !reviewData.summary) return;
    setIsUploading(true);
    try {
      await createReview({
        userId: studentId as Id<"users">,
        ...reviewData,
      });
      setReviewDialogOpen(false);
      setReviewData({
        title: "",
        grip: "",
        posture: "",
        alignment: "",
        swingPath: "",
        summary: "",
        drillInstructions: "",
        drillVideoId: undefined,
      });
      // Also send a message notification
      await sendMessage({
        userId: studentId as Id<"users">,
        text: "I've just posted a new swing analysis for you: " + reviewData.title,
      });
    } catch (err) {
      console.error(err);
    } finally {
      setIsUploading(false);
    }
  };

  const handleSelectDrill = (drillId: string) => {
    const drill = drills.find(d => d._id === drillId);
    if (drill) {
      setReviewData(prev => ({
        ...prev,
        drillInstructions: drill.description,
        drillVideoId: drill.videoStorageId as Id<"_storage"> | undefined,
      }));
    }
  };

  return (
    <div className="flex flex-col h-full bg-background">
      <div className="p-4 border-b bg-card flex justify-between items-center shadow-sm">
        <div className="flex items-center gap-3">
           <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold border border-primary/20">
            S
          </div>
          <div>
            <h2 className="font-bold text-primary">Student Chat</h2>
            <p className="text-xs text-muted-foreground">Direct coaching session</p>
          </div>
        </div>
        
        <Dialog open={reviewDialogOpen} onOpenChange={setReviewDialogOpen}>
          <DialogTrigger asChild>
            <Button size="sm" className="gap-2 shadow-lg shadow-primary/20">
              <Trophy className="w-4 h-4" /> Post Analysis
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="text-2xl font-bold flex items-center gap-2 text-primary">
                <Trophy className="w-6 h-6" /> New Swing Analysis
              </DialogTitle>
            </DialogHeader>
            <div className="grid gap-6 py-4">
              <div className="space-y-2">
                <Label className="text-sm font-bold">Analysis Title</Label>
                <Input 
                  placeholder="e.g., Driver Swing Evaluation - May 8th" 
                  value={reviewData.title}
                  onChange={e => setReviewData(prev => ({ ...prev, title: e.target.value }))}
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-sm font-bold">Grip</Label>
                  <Input 
                    placeholder="Feedback on grip..." 
                    value={reviewData.grip}
                    onChange={e => setReviewData(prev => ({ ...prev, grip: e.target.value }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-sm font-bold">Posture</Label>
                  <Input 
                    placeholder="Feedback on posture..." 
                    value={reviewData.posture}
                    onChange={e => setReviewData(prev => ({ ...prev, posture: e.target.value }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-sm font-bold">Swing Path</Label>
                  <Input 
                    placeholder="Feedback on path..." 
                    value={reviewData.swingPath}
                    onChange={e => setReviewData(prev => ({ ...prev, swingPath: e.target.value }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-sm font-bold">Alignment</Label>
                  <Input 
                    placeholder="Feedback on alignment..." 
                    value={reviewData.alignment}
                    onChange={e => setReviewData(prev => ({ ...prev, alignment: e.target.value }))}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label className="text-sm font-bold">Overall Summary</Label>
                <Textarea 
                  placeholder="Summarize the key takeaways..." 
                  className="min-h-[100px]"
                  value={reviewData.summary}
                  onChange={e => setReviewData(prev => ({ ...prev, summary: e.target.value }))}
                />
              </div>

              <div className="p-4 bg-orange-500/5 rounded-xl border border-orange-500/20 space-y-4">
                <div className="flex justify-between items-center">
                  <Label className="text-sm font-bold text-orange-500 flex items-center gap-2">
                    <Video className="w-4 h-4" /> Prescribe Drill
                  </Label>
                  {drills.length > 0 && (
                    <Select onValueChange={handleSelectDrill}>
                      <SelectTrigger className="w-[200px] h-8 text-xs">
                        <SelectValue placeholder="Import from Library" />
                      </SelectTrigger>
                      <SelectContent>
                        {drills.map(d => (
                          <SelectItem key={d._id} value={d._id}>{d.title}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                </div>
                <Textarea 
                  placeholder="Drill instructions..." 
                  value={reviewData.drillInstructions}
                  onChange={e => setReviewData(prev => ({ ...prev, drillInstructions: e.target.value }))}
                  className="bg-transparent"
                />
              </div>
            </div>
            <DialogFooter>
              <Button onClick={submitReview} disabled={isUploading || !reviewData.title || !reviewData.summary} className="w-full">
                {isUploading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Post Final Analysis"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <div
        className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar bg-secondary/30"
        ref={scrollRef}
      >
        {messages.map((msg: any) => (
          <div
            key={msg._id}
            className={cn(
              "flex flex-col max-w-[80%] rounded-2xl p-4 shadow-sm transition-all",
              msg.sender === "coach"
                ? "ml-auto bg-primary text-primary-foreground rounded-tr-none shadow-primary/10"
                : "bg-card border border-primary/5 rounded-tl-none shadow-black/5",
            )}
          >
            {msg.text && <p className="text-sm leading-relaxed whitespace-pre-wrap">{msg.text}</p>}
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
            <p className="text-xs text-primary font-medium">Processing...</p>
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
          className="rounded-full hover:bg-primary/10 hover:text-primary transition-colors"
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
