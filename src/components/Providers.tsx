import { ConvexReactClient } from "convex/react";
import { ConvexQueryClient } from "@convex-dev/react-query";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { HelmetProvider } from "react-helmet-async";
import { ConvexAuthProvider } from "@convex-dev/auth/react";
import React, { useState } from "react";
import "../i18n";

// Convex client
const convexUrl =
  (import.meta.env.VITE_CONVEX_URL as string) ||
  "https://placeholder.convex.cloud";

export function Providers({ children }: { children: React.ReactNode }) {
  const [convex] = useState(() => new ConvexReactClient(convexUrl));
  const [convexQueryClient] = useState(() => new ConvexQueryClient(convex));
  const [queryClient] = useState(() => {
    const qc = new QueryClient({
      defaultOptions: {
        queries: {
          queryKeyHashFn: convexQueryClient.hashFn(),
          queryFn: convexQueryClient.queryFn(),
        },
      },
    });
    convexQueryClient.connect(qc);
    return qc;
  });

  return (
    <HelmetProvider>
      <ConvexAuthProvider client={convex}>
        <QueryClientProvider client={queryClient}>
          {children}
        </QueryClientProvider>
      </ConvexAuthProvider>
    </HelmetProvider>
  );
}
