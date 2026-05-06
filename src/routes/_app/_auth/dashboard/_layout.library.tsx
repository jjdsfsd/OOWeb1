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

export const Route = createFileRoute("/_app/_auth/dashboard/_layout/library")({
  component: LibraryPage,
});

function LibraryPage() {
  const { data: courses, isLoading } = useQuery(
    convexQuery((api as any).courses.getCourses, {}),
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
        {(courses as any[])?.map((course) => (
          <Card
            key={course._id}
            className="overflow-hidden border-primary/20 bg-card/50 backdrop-blur-sm transition-all hover:border-primary/50"
          >
            <div className="aspect-video bg-muted flex items-center justify-center">
              {/* Thumbnail would go here */}
              <span className="text-muted-foreground italic">
                Course Thumbnail
              </span>
            </div>
            <CardHeader>
              <CardTitle>{course.title}</CardTitle>
              <CardDescription>{course.description}</CardDescription>
            </CardHeader>
            <CardContent>
              <Button asChild className="w-full">
                <Link to={`/dashboard/library/${course._id}`}>View Course</Link>
              </Button>
            </CardContent>
          </Card>
        ))}
        {(courses as any[])?.length === 0 && (
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
