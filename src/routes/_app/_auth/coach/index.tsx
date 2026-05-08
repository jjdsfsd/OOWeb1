import { createFileRoute, Link } from "@tanstack/react-router";
import { useSuspenseQuery, useQueryClient } from "@tanstack/react-query";
import { convexQuery, useConvexMutation } from "@convex-dev/react-query";
import { api } from "@cvx/_generated/api";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/ui/card";
import { Button } from "@/ui/button";
import { MessageSquare, Clock, Users, Video, Plus, Trash2, Loader2 } from "lucide-react";
import { useState } from "react";
import { Input } from "@/ui/input";
import { Textarea } from "@/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/ui/dialog";

export const Route = createFileRoute("/_app/_auth/coach/")({
  component: CoachDashboard,
});

function CoachDashboard() {
  const [activeTab, setActiveTab] = useState<"students" | "drills">("students");

  return (
    <div className="container mx-auto p-6 max-w-4xl">
      <div className="flex justify-between items-center mb-8">
        <h2 className="text-3xl font-bold text-primary">Coach Dashboard</h2>
        <div className="flex bg-muted p-1 rounded-lg">
          <Button 
            variant={activeTab === "students" ? "secondary" : "ghost"} 
            size="sm"
            onClick={() => setActiveTab("students")}
            className="gap-2"
          >
            <Users className="w-4 h-4" /> Students
          </Button>
          <Button 
            variant={activeTab === "drills" ? "secondary" : "ghost"} 
            size="sm"
            onClick={() => setActiveTab("drills")}
            className="gap-2"
          >
            <Video className="w-4 h-4" /> Drills
          </Button>
        </div>
      </div>
      
      {activeTab === "students" ? <StudentList /> : <DrillLibrary />}
    </div>
  );
}

function StudentList() {
  const { data: students } = useSuspenseQuery(
    convexQuery(api.messages.listStudents, {}),
  );

  if (students.length === 0) {
    return (
      <Card className="p-12 text-center border-dashed">
        <MessageSquare className="w-12 h-12 mx-auto mb-4 text-muted-foreground opacity-20" />
        <p className="text-muted-foreground">No students have messaged you yet.</p>
      </Card>
    );
  }

  return (
    <div className="grid gap-4">
      {students.map((student) => (
        <Link 
          key={student._id} 
          to="/coach/$studentId"
          params={{ studentId: student._id }}
          className="block group"
        >
          <Card className="hover:border-primary/50 transition-all group-hover:shadow-md border-primary/5 bg-card/50 backdrop-blur-sm">
            <CardHeader className="flex flex-row items-center gap-4 py-4">
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-lg border border-primary/20">
                {(student.name || student.username || "U")[0].toUpperCase()}
              </div>
              <div className="flex-1 min-w-0">
                <CardTitle className="truncate">
                  {student.name || student.username || "Anonymous User"}
                </CardTitle>
                <CardDescription className="truncate">
                  {student.email}
                </CardDescription>
              </div>
              <div className="text-right text-xs text-muted-foreground flex flex-col items-end gap-1">
                {student.unreadCount > 0 && (
                  <span className="bg-red-500 text-white px-2 py-0.5 rounded-full text-[10px] font-bold animate-pulse mb-1">
                    {student.unreadCount} New
                  </span>
                )}
                <div className="flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  {new Date(student.lastMessageAt).toLocaleDateString()}
                </div>
                <Button size="sm" variant="ghost" className="group-hover:text-primary">
                  Open Chat
                </Button>
              </div>
            </CardHeader>
          </Card>
        </Link>
      ))}
    </div>
  );
}

function DrillLibrary() {
  const { data: drills } = useSuspenseQuery(convexQuery(api.drills.list, {}));
  const createDrill = useConvexMutation(api.drills.create);
  const removeDrill = useConvexMutation(api.drills.remove);
  const generateUploadUrl = useConvexMutation(api.app.generateUploadUrl);
  const queryClient = useQueryClient();
  
  const [isCreating, setIsCreating] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [formData, setFormData] = useState({ title: "", description: "" });
  const [videoId, setVideoId] = useState<string | null>(null);

  const handleCreate = async () => {
    if (!formData.title) return;
    setIsCreating(true);
    try {
      await createDrill({
        ...formData,
        videoStorageId: videoId as any,
      });
      setFormData({ title: "", description: "" });
      setVideoId(null);
      setIsCreating(false);
      // Re-fetch drills
      queryClient.invalidateQueries({ queryKey: convexQuery(api.drills.list, {}).queryKey });
    } catch (e) {
      console.error(e);
      setIsCreating(false);
    }
  };

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
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
      const { storageId } = await result.json();
      setVideoId(storageId);
    } catch (e) {
      console.error(e);
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-xl font-bold">Standard Drills</h3>
        <Dialog>
          <DialogTrigger asChild>
            <Button size="sm" className="gap-2">
              <Plus className="w-4 h-4" /> Create Drill
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add New Drill</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <label className="text-sm font-bold">Title</label>
                <Input 
                  placeholder="e.g., The Towel Drill" 
                  value={formData.title}
                  onChange={e => setFormData(prev => ({ ...prev, title: e.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-bold">Instructions</label>
                <Textarea 
                  placeholder="How to perform this drill..." 
                  value={formData.description}
                  onChange={e => setFormData(prev => ({ ...prev, description: e.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-bold text-orange-500">Video Demo (Optional)</label>
                <Input type="file" accept="video/*" onChange={handleUpload} />
                {isUploading && <p className="text-xs text-orange-500 flex items-center gap-1"><Loader2 className="w-3 h-3 animate-spin" /> Uploading video...</p>}
                {videoId && <p className="text-xs text-green-500">✓ Video uploaded</p>}
              </div>
            </div>
            <DialogFooter>
              <Button onClick={handleCreate} disabled={isCreating || !formData.title || isUploading}>
                {isCreating ? <Loader2 className="w-4 h-4 animate-spin" /> : "Save Drill"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {drills.map((drill) => (
          <Card key={drill._id} className="border-primary/10">
            <CardHeader className="pb-2">
              <div className="flex justify-between items-start">
                <CardTitle className="text-lg">{drill.title}</CardTitle>
                <Button 
                  size="icon" 
                  variant="ghost" 
                  className="text-destructive h-8 w-8"
                  onClick={async () => {
                    await removeDrill({ id: drill._id });
                    queryClient.invalidateQueries({ queryKey: convexQuery(api.drills.list, {}).queryKey });
                  }}
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground line-clamp-3">{drill.description}</p>
              {drill.videoStorageId && (
                <div className="mt-3 flex items-center gap-2 text-xs text-orange-500 font-bold">
                  <Video className="w-3 h-3" /> Includes Video Demo
                </div>
              )}
            </CardContent>
          </Card>
        ))}
        {drills.length === 0 && (
          <div className="md:col-span-2 py-10 text-center bg-muted/20 rounded-xl border-2 border-dashed">
            <Video className="w-10 h-10 mx-auto mb-2 text-muted-foreground opacity-20" />
            <p className="text-muted-foreground text-sm">Create standard drills to quickly reuse in your student analyses.</p>
          </div>
        )}
      </div>
    </div>
  );
}
