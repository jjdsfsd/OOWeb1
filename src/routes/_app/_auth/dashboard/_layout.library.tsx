/* eslint-disable @typescript-eslint/no-explicit-any */
import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { convexQuery } from "@convex-dev/react-query";
import { api } from "@cvx/_generated/api";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/ui/card";
import { Button } from "@/ui/button";
import { Link } from "@tanstack/react-router";
import { PlayCircle, CheckCircle2, Clock } from "lucide-react";

export const Route = createFileRoute("/_app/_auth/dashboard/_layout/library")({
  component: LibraryPage,
});

function LibraryPage() {
  const { data: courses, isLoading } = useQuery(
    convexQuery(api.courses.getCourses, {}),
  );

  if (isLoading) {
    return <div className="p-8 text-center">Loading courses...</div>;
  }

  return (
    <main className="container mx-auto max-w-screen-xl p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight text-primary">
          Video Lesson Library
        </h1>
        <p className="text-muted-foreground">
          Master your swing with our premium HD video courses.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {courses?.map((course: any) => {
          const progressPercent = course.totalLessons > 0 
            ? Math.round((course.completedCount / course.totalLessons) * 100) 
            : 0;

          return (
            <Card
              key={course._id}
              className="overflow-hidden border-primary/20 bg-card/50 backdrop-blur-sm transition-all hover:border-primary/50 group"
            >
              <div className="aspect-video bg-muted flex flex-col items-center justify-center relative">
                <PlayCircle className="w-12 h-12 text-primary/20 group-hover:text-primary/40 transition-colors" />
                <div className="absolute top-2 right-2">
                  <span className="px-2 py-1 rounded bg-primary/10 text-primary text-[10px] font-bold uppercase tracking-wider border border-primary/20">
                    {course.category || "General"}
                  </span>
                </div>
              </div>
              <CardHeader className="pb-3">
                <CardTitle className="group-hover:text-primary transition-colors">{course.title}</CardTitle>
                <CardDescription className="line-clamp-2">{course.description}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-1.5">
                  <div className="flex justify-between text-[10px] font-bold uppercase tracking-tight">
                    <span className="text-muted-foreground">Progress</span>
                    <span className="text-primary">{progressPercent}%</span>
                  </div>
                  <div className="w-full bg-secondary h-1.5 rounded-full overflow-hidden">
                    <div 
                      className="bg-primary h-full transition-all duration-500" 
                      style={{ width: `${progressPercent}%` }} 
                    />
                  </div>
                  <div className="flex items-center gap-1 text-[10px] text-muted-foreground">
                    <CheckCircle2 className="w-3 h-3" />
                    {course.completedCount} / {course.totalLessons} Lessons
                  </div>
                </div>
                <Button asChild className="w-full group-hover:shadow-lg group-hover:shadow-primary/10 transition-all">
                  <Link
                    to="/dashboard/library/$courseId"
                    params={{ courseId: course._id }}
                  >
                    {progressPercent === 100 ? "Watch Again" : progressPercent > 0 ? "Continue Course" : "Start Course"}
                  </Link>
                </Button>
              </CardContent>
            </Card>
          );
        })}
        {courses?.length === 0 && (
          <div className="col-span-full py-20 text-center">
            <p className="text-muted-foreground text-lg">
              No courses available yet. Check back soon!
            </p>
          </div>
        )}
      </div>
    </main>
  );
}
