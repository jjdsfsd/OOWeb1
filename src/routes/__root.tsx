import {
  createRootRouteWithContext,
  Outlet,
  ScrollRestoration,
  HeadContent,
  Scripts,
} from "@tanstack/react-router";
import { QueryClient } from "@tanstack/react-query";
import React from "react";
import { Providers } from "../components/Providers";
import { ErrorBoundary } from "@/components/ErrorBoundary";

export const Route = createRootRouteWithContext<{
  queryClient: QueryClient;
  isAuthenticated: boolean;
  isLoading: boolean;
}>()({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: "OOWeb1 - Premium Golf Coaching" },
    ],
  }),
  component: RootComponent,
});

function RootComponent() {
  return (
    <RootDocument>
      <Providers>
        <ErrorBoundary>
          <Outlet />
        </ErrorBoundary>
      </Providers>
    </RootDocument>
  );
}

function RootDocument({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <HeadContent />
      </head>
      <body className="antialiased">
        {children}
        <ScrollRestoration />
        <Scripts />
      </body>
    </html>
  );
}
