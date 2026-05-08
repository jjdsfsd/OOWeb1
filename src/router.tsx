/* eslint-disable @typescript-eslint/no-non-null-assertion */
import { createRouter as createTanStackRouter } from "@tanstack/react-router";
import { routeTree } from "./routeTree.gen";

export function createRouter() {
  return createTanStackRouter({
    routeTree,
    context: {
      queryClient: undefined!,
      isAuthenticated: undefined!,
      isLoading: undefined!,
    },
  });
}

export const getRouter = createRouter;

export const router = createRouter();

declare module "@tanstack/react-router" {
  interface Register {
    router: ReturnType<typeof createRouter>;
  }
}
