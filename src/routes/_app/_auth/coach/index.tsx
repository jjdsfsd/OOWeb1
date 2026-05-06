import { createFileRoute, Link } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";
import { convexQuery } from "@convex-dev/react-query";
import { api } from "@cvx/_generated/api";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/ui/card";
import { Button } from "@/ui/button";
import { User, MessageSquare, Clock } from "lucide-react";

export const Route = createFileRoute("/_app/_auth/coach/")({
  component: StudentList,
});

function StudentList() {
  const { data: students } = useSuspenseQuery(
    convexQuery(api.messages.listStudents, {}),
  );

  return (
    <div className="container mx-auto p-6 max-w-4xl">
      <h2 className="text-2xl font-bold mb-6">Your Students</h2>
      
      {students.length === 0 ? (
        <Card className="p-12 text-center border-dashed">
          <MessageSquare className="w-12 h-12 mx-auto mb-4 text-muted-foreground opacity-20" />
          <p className="text-muted-foreground">No students have messaged you yet.</p>
        </Card>
      ) : (
        <div className="grid gap-4">
          {students.map((student) => (
            <Link 
              key={student._id} 
              to={`/coach/${student._id}`}
              className="block group"
            >
              <Card className="hover:border-primary/50 transition-all group-hover:shadow-md">
                <CardHeader className="flex flex-row items-center gap-4 py-4">
                  <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-lg">
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
      )}
    </div>
  );
}
