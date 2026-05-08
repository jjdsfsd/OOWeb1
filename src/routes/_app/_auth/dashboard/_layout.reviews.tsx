import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { convexQuery, useConvexMutation } from "@convex-dev/react-query";
import { api } from "@cvx/_generated/api";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/ui/card";
import { Trophy, Calendar, ChevronRight, Video, Target, Info } from "lucide-react";
import { Button } from "@/ui/button";
import type { Id } from "@cvx/_generated/dataModel";
import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/ui/dialog";

export const Route = createFileRoute("/_app/_auth/dashboard/_layout/reviews")({
  component: ReviewsPage,
});

type SwingReview = {
  _id: Id<"swingReviews">;
  _creationTime: number;
  userId: Id<"users">;
  title: string;
  grip?: string;
  posture?: string;
  alignment?: string;
  swingPath?: string;
  summary: string;
  drillInstructions?: string;
  drillVideoId?: Id<"_storage">;
  createdAt: number;
};

function ReviewsPage() {
  const { data: reviews, isLoading } = useQuery(
    convexQuery(api.swingReviews.list, {}),
  );
  const markRead = useConvexMutation(api.swingReviews.markRead);
  const [selectedReview, setSelectedReview] = useState<SwingReview | null>(null);

  useEffect(() => {
    markRead({});
  }, [markRead]);

  return (
    <main className="container mx-auto max-w-screen-xl p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-primary">Analysis Gallery</h1>
        <p className="text-muted-foreground">Review your past swing evaluations and coach's drills.</p>
      </div>

      {isLoading ? (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="animate-pulse bg-card/50 h-48" />
          ))}
        </div>
      ) : reviews && reviews.length > 0 ? (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {reviews.map((review: any) => (
            <Card 
              key={review._id} 
              className="group cursor-pointer hover:border-primary/50 transition-all border-primary/10 bg-card/50 backdrop-blur-sm"
              onClick={() => setSelectedReview(review)}
            >
              <CardHeader className="pb-3">
                <div className="flex justify-between items-start mb-2">
                  <div className="bg-primary/10 p-2 rounded-lg text-primary">
                    <Trophy className="w-5 h-5" />
                  </div>
                  <span className="text-xs text-muted-foreground flex items-center gap-1">
                    <Calendar className="w-3 h-3" />
                    {new Date(review.createdAt).toLocaleDateString()}
                  </span>
                </div>
                <CardTitle className="text-lg group-hover:text-primary transition-colors">{review.title}</CardTitle>
                <CardDescription className="line-clamp-2">
                  {review.summary}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center text-primary text-sm font-medium">
                  View full analysis <ChevronRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-20 text-center bg-card/30 rounded-3xl border-2 border-dashed border-primary/10">
          <Target className="w-16 h-16 text-primary/20 mb-4" />
          <h3 className="text-xl font-bold text-primary/60">No reviews yet</h3>
          <p className="text-muted-foreground max-w-xs">
            Send a swing video to your coach in the chat to receive your first professional analysis.
          </p>
          <Button asChild className="mt-6">
            <a href="/dashboard/chat">Go to Chat</a>
          </Button>
        </div>
      )}

      {selectedReview && (
        <ReviewDialog 
          review={selectedReview} 
          onClose={() => setSelectedReview(null)} 
        />
      )}
    </main>
  );
}

function ReviewDialog({ review, onClose }: { review: SwingReview, onClose: () => void }) {
  return (
    <Dialog open={!!review} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center gap-2 text-primary mb-2">
            <Trophy className="w-6 h-6" />
            <span className="text-xs font-bold uppercase tracking-widest">Coach Review</span>
          </div>
          <DialogTitle className="text-2xl">{review.title}</DialogTitle>
          <DialogDescription>
            Analyzed on {new Date(review.createdAt).toLocaleDateString()}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 mt-6">
          <div className="grid grid-cols-2 gap-4">
            <AnalysisBit icon={<Target className="w-4 h-4" />} label="Grip" value={review.grip} />
            <AnalysisBit icon={<Info className="w-4 h-4" />} label="Posture" value={review.posture} />
            <AnalysisBit icon={<ChevronRight className="w-4 h-4" />} label="Swing Path" value={review.swingPath} />
            <AnalysisBit icon={<Target className="w-4 h-4" />} label="Alignment" value={review.alignment} />
          </div>

          <div className="bg-primary/5 p-4 rounded-xl border border-primary/10">
            <h4 className="font-bold text-primary mb-2 flex items-center gap-2">
              <Info className="w-4 h-4" /> Coach's Summary
            </h4>
            <p className="text-sm leading-relaxed">{review.summary}</p>
          </div>

          {review.drillInstructions && (
            <div>
              <h4 className="font-bold text-primary mb-3 flex items-center gap-2">
                <Video className="w-4 h-4" /> Recommended Drill
              </h4>
              <div className="bg-secondary p-4 rounded-xl">
                <p className="text-sm italic">{review.drillInstructions}</p>
                {review.drillVideoId && (
                  <DrillVideo fileId={review.drillVideoId} />
                )}
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

function AnalysisBit({ icon, label, value }: { icon: React.ReactNode, label: string, value?: string }) {
  if (!value) return null;
  return (
    <div className="p-3 bg-card border border-primary/5 rounded-lg">
      <div className="flex items-center gap-2 text-primary/60 text-[10px] font-bold uppercase mb-1">
        {icon} {label}
      </div>
      <p className="text-sm font-medium">{value}</p>
    </div>
  );
}

function DrillVideo({ fileId }: { fileId: Id<"_storage"> }) {
  const getUrl = useQuery(convexQuery(api.messages.getVideoUrl, { fileId }));

  if (!getUrl.data) return null;

  return (
    <div className="mt-4 aspect-video rounded-lg overflow-hidden bg-black border border-white/10">
      <video src={getUrl.data} controls className="w-full h-full object-contain" />
    </div>
  );
}
