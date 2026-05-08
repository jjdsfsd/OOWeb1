import { ConvexReactClient, useConvexAuth } from "convex/react";
import { RouterProvider } from "@tanstack/react-router";
import { ConvexQueryClient } from "@convex-dev/react-query";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { HelmetProvider } from "react-helmet-async";
import { createRouter } from "@/router";
import { ConvexAuthProvider } from "@convex-dev/auth/react";
import "@/i18n";
import { useMemo } from "react";

// Convex client
const convexUrl =
  (import.meta.env.VITE_CONVEX_URL as string) ||
  "https://placeholder.convex.cloud";
const convex = new ConvexReactClient(convexUrl);

const convexQueryClient = new ConvexQueryClient(convex);
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      queryKeyHashFn: convexQueryClient.hashFn(),
      queryFn: convexQueryClient.queryFn(),
    },
  },
});

convexQueryClient.connect(queryClient);

function InnerApp() {
  const { isAuthenticated, isLoading } = useConvexAuth();
  const router = useMemo(() => createRouter(), []);

  return (
    <RouterProvider
      router={router}
      context={{ queryClient, isAuthenticated, isLoading }}
    />
  );
}

const helmetContext = {};

export default function App() {
  return (
    <HelmetProvider context={helmetContext}>
      <ConvexAuthProvider client={convex}>
        <QueryClientProvider client={queryClient}>
          <InnerApp />
        </QueryClientProvider>
      </ConvexAuthProvider>
    </HelmetProvider>
  );
}
