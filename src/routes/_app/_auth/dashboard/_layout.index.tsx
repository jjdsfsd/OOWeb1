/* eslint-disable @typescript-eslint/no-explicit-any */
import { createFileRoute } from "@tanstack/react-router";
import { Plus, TrendingDown, Video, MessageSquare, Trophy } from "lucide-react";
import siteConfig from "~/site.config";
import { useQuery } from "@tanstack/react-query";
import { convexQuery, useConvexMutation } from "@convex-dev/react-query";
import { api } from "@cvx/_generated/api";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/ui/card";
import { Button } from "@/ui/button";
import { Input } from "@/ui/input";
import { useState } from "react";
import { Link } from "@tanstack/react-router";
import { Id } from "@cvx/_generated/dataModel";

export const Route = createFileRoute("/_app/_auth/dashboard/_layout/")({
  component: Dashboard,
  beforeLoad: () => ({
    title: `${siteConfig.siteTitle} - Dashboard`,
    headerTitle: "Dashboard",
    headerDescription: "Track your golf progress and manage your coaching.",
  }),
});

type Handicap = {
  _id: Id<"handicaps">;
  _creationTime: number;
  userId: Id<"users">;
  value: number;
  date: number;
};

export default function Dashboard() {
  const { data: user } = useQuery(convexQuery(api.app.getCurrentUser, {}));
  const { data: handicaps } = useQuery(
    convexQuery((api as any).handicaps.getHandicaps, {}),
  );
  const addHandicap = useConvexMutation((api as any).handicaps.addHandicap);
  const [newHandicap, setNewHandicap] = useState("");

  const handleAddHandicap = async (e: React.FormEvent) => {
    e.preventDefault();
    const val = parseFloat(newHandicap);
    if (isNaN(val)) return;
    await addHandicap({ value: val });
    setNewHandicap("");
  };

  const improvement =
    (handicaps as Handicap[]) && (handicaps as Handicap[]).length > 1
      ? (
          (handicaps as Handicap[])[(handicaps as Handicap[]).length - 1]
            .value - (handicaps as Handicap[])[0].value
        ).toFixed(1)
      : "0.0";

  return (
    <div className="flex h-full w-full bg-secondary px-6 py-8 dark:bg-black">
      <div className="mx-auto grid h-full w-full max-w-screen-xl gap-6 md:grid-cols-2 lg:grid-cols-3">
        {/* Welcome & Stats */}
        <Card className="lg:col-span-2 border-primary/20 bg-card/50 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="text-2xl text-primary">
              Welcome back, {user?.username}!
            </CardTitle>
            <CardDescription>
              Here's what's happening with your game.
            </CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4 md:grid-cols-3">
            <div className="flex flex-col items-center justify-center p-4 rounded-xl bg-primary/10 border border-primary/20 text-center">
              <Trophy className="w-8 h-8 text-primary mb-2" />
              <p className="text-2xl font-bold">
                {(user as any)?.handicap ?? "--"}
              </p>
              <p className="text-xs text-muted-foreground uppercase tracking-wider font-semibold">
                Handicap
              </p>
            </div>
            <div className="flex flex-col items-center justify-center p-4 rounded-xl bg-primary/10 border border-primary/20 text-center">
              <TrendingDown className="w-8 h-8 text-primary mb-2" />
              <p className="text-2xl font-bold">-{improvement}</p>
              <p className="text-xs text-muted-foreground uppercase tracking-wider font-semibold">
                Improvement
              </p>
            </div>
            <div className="flex flex-col items-center justify-center p-4 rounded-xl bg-primary/10 border border-primary/20 text-center">
              <Video className="w-8 h-8 text-primary mb-2" />
              <p className="text-2xl font-bold">12</p>
              <p className="text-xs text-muted-foreground uppercase tracking-wider font-semibold">
                Lessons Watched
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Handicap Tracker */}
        <Card className="border-primary/20 bg-card/50 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Plus className="w-5 h-5 text-primary" />
              Update Handicap
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleAddHandicap} className="flex gap-2 mb-6">
              <Input
                type="number"
                step="0.1"
                placeholder="New Handicap"
                value={newHandicap}
                onChange={(e) => setNewHandicap(e.target.value)}
                className="bg-background"
              />
              <Button type="submit">Update</Button>
            </form>
            <div className="space-y-4 max-h-[200px] overflow-y-auto pr-2 custom-scrollbar">
              {(handicaps as Handicap[])?.map((h) => (
                <div
                  key={h._id}
                  className="flex justify-between items-center text-sm border-b border-border pb-2 last:border-0"
                >
                  <span className="text-muted-foreground">
                    {new Date(h.date).toLocaleDateString()}
                  </span>
                  <span className="font-bold text-primary">
                    {h.value.toFixed(1)}
                  </span>
                </div>
              ))}
              {(!handicaps || (handicaps as Handicap[]).length === 0) && (
                <p className="text-center text-muted-foreground text-sm py-4">
                  No data yet. Log your first handicap!
                </p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Quick Links */}
        <Card className="border-primary/20 bg-card/50 backdrop-blur-sm">
          <CardHeader>
            <CardTitle>My Academy</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button
              asChild
              variant="outline"
              className="w-full justify-start gap-3 border-primary/10 hover:bg-primary/5 hover:text-primary"
            >
              <Link to="/dashboard/library">
                <Video className="w-4 h-4 text-primary" />
                Continue Learning
              </Link>
            </Button>
            <Button
              asChild
              variant="outline"
              className="w-full justify-start gap-3 border-primary/10 hover:bg-primary/5 hover:text-primary"
            >
              <Link to="/dashboard/chat">
                <MessageSquare className="w-4 h-4 text-primary" />
                Chat with Coach
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
