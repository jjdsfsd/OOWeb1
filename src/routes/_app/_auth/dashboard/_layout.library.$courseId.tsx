import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { convexQuery, useConvexMutation } from "@convex-dev/react-query";
import { api } from "@cvx/_generated/api";
import type { Id } from "@cvx/_generated/dataModel";
import { useState } from "react";
import { cn } from "@/utils/misc";
import { PlayCircle, CheckCircle2, Circle } from "lucide-react";
import type { DataModel } from "@cvx/_generated/dataModel";
import { Button } from "@/ui/button";

type Lesson = DataModel["lessons"]["document"] & { completed?: boolean };

export const Route = createFileRoute(
  "/_app/_auth/dashboard/_layout/library/$courseId",
)({
  component: CourseDetailPage,
});

function CourseDetailPage() {
  const { courseId } = Route.useParams();
  const { data: course, isLoading } = useQuery(
    convexQuery(api.courses.getCourseWithLessons, {
      courseId: courseId as Id<"courses">,
    }),
  );
  const markComplete = useConvexMutation(api.courses.markLessonComplete);

  const [selectedLessonId, setSelectedLessonId] = useState<string | null>(null);

  if (isLoading)
    return <div className="p-8 text-center">Loading course...</div>;
  if (!course) return <div className="p-8 text-center">Course not found.</div>;

  const lessons = (course.lessons as Lesson[]) || [];
  const currentLesson =
    lessons.find((l) => l._id === selectedLessonId) || lessons[0];

  const handleMarkComplete = async (
    lessonId: Id<"lessons">,
    completed: boolean,
  ) => {
    await markComplete({ lessonId, completed });
  };

  const completedCount = lessons.filter((l) => l.completed).length;
  const progressPercent =
    lessons.length > 0
      ? Math.round((completedCount / lessons.length) * 100)
      : 0;

  return (
    <main className="container mx-auto max-w-screen-xl p-6">
      <div className="grid gap-8 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-6">
          <div className="aspect-video bg-black rounded-xl overflow-hidden flex items-center justify-center border border-primary/20 shadow-2xl relative">
            {currentLesson ? (
              <div className="w-full h-full flex flex-col items-center justify-center">
                <PlayCircle className="w-16 h-16 text-primary mb-4 opacity-50" />
                <p className="text-xl font-medium text-white">
                  {currentLesson.title}
                </p>
                <p className="text-sm text-muted-foreground mt-2">
                  HD Video Player Active
                </p>
              </div>
            ) : (
              <p className="text-muted-foreground">
                No lessons in this course yet.
              </p>
            )}
          </div>
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-2xl font-bold text-primary">
                {currentLesson?.title || course.title}
              </h1>
              <p className="text-muted-foreground mt-2">
                {currentLesson?.description || course.description}
              </p>
            </div>
            {currentLesson && (
              <Button
                variant={currentLesson.completed ? "outline" : "default"}
                onClick={() =>
                  handleMarkComplete(
                    currentLesson._id as Id<"lessons">,
                    !currentLesson.completed,
                  )
                }
                className="gap-2"
              >
                {currentLesson.completed ? (
                  <>
                    <CheckCircle2 className="w-4 h-4" />
                    Completed
                  </>
                ) : (
                  <>
                    <Circle className="w-4 h-4" />
                    Mark as Complete
                  </>
                )}
              </Button>
            )}
          </div>
        </div>
        <div className="space-y-6">
          <div className="bg-card border border-primary/10 rounded-xl p-4 shadow-sm">
            <h2 className="text-lg font-semibold mb-2">Your Progress</h2>
            <div className="w-full bg-secondary h-2 rounded-full overflow-hidden">
              <div
                className="bg-primary h-full transition-all duration-500"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              {completedCount} of {lessons.length} lessons completed (
              {progressPercent}%)
            </p>
          </div>

          <div className="space-y-2">
            <h2 className="text-xl font-semibold px-1">Course Content</h2>
            <div className="space-y-2">
              {lessons.map((lesson, index) => (
                <button
                  key={lesson._id}
                  onClick={() => setSelectedLessonId(lesson._id)}
                  className={cn(
                    "w-full flex items-start gap-3 p-4 rounded-lg border transition-all text-left",
                    selectedLessonId === lesson._id ||
                      (!selectedLessonId && index === 0)
                      ? "bg-primary/10 border-primary shadow-sm"
                      : "bg-card hover:border-primary/50",
                  )}
                >
                  <div className="mt-1">
                    {lesson.completed ? (
                      <CheckCircle2 className="w-5 h-5 text-primary" />
                    ) : (
                      <PlayCircle className="w-5 h-5 text-muted-foreground" />
                    )}
                  </div>
                  <div className="flex-1">
                    <p
                      className={cn(
                        "font-medium",
                        lesson.completed && "text-primary/80",
                      )}
                    >
                      {index + 1}. {lesson.title}
                    </p>
                    <p className="text-xs text-muted-foreground line-clamp-1">
                      {lesson.description}
                    </p>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
