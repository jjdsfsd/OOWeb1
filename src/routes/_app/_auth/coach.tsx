import { createFileRoute, Outlet, redirect } from "@tanstack/react-router";
import { convexQuery } from "@convex-dev/react-query";
import { api } from "@cvx/_generated/api";

export const Route = createFileRoute("/_app/_auth/coach")({
  beforeLoad: async ({ context }) => {
    const user = await context.queryClient.ensureQueryData(
      convexQuery(api.app.getCurrentUser, {}),
    );
    if (!user?.isCoach) {
      throw redirect({ to: "/dashboard" });
    }
  },
  component: CoachLayout,
});

function CoachLayout() {
  return (
    <div className="flex flex-col h-full overflow-hidden bg-background">
      <header className="border-b bg-card px-6 py-4">
        <h1 className="text-xl font-bold text-primary">Coach Dashboard</h1>
      </header>
      <div className="flex-1 overflow-hidden">
        <Outlet />
      </div>
    </div>
  );
}
