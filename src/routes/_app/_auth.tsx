import { createFileRoute, redirect, Outlet } from "@tanstack/react-router";

export const Route = createFileRoute("/_app/_auth")({
  beforeLoad: ({ context }) => {
    // Check authentication from the router context
    // This assumes isAuthenticated is provided in the context (usually via the root route or router setup)
    if (!context.isAuthenticated) {
      throw redirect({
        to: "/login",
        search: { redirect: window.location.pathname },
      });
    }
  },
  component: () => <Outlet />,
  pendingComponent: () => (
    <div className="flex h-screen items-center justify-center text-lg font-medium">
      Loading...
    </div>
  ),
  errorComponent: ({ error }) => (
    <div className="p-8 text-center text-red-500">
      Error: {error.message}
    </div>
  ),
});
