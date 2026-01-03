"use client";

import { PropsWithChildren } from "react";
import { useAuth } from "@clerk/nextjs";
import { ConvexProviderWithClerk } from "convex/react-clerk";
import { QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";

// Services
import { convex, getConvexQueryClient } from "@/lib/get-convex-query-client";

export const ConvexQueryClientProvider = ({ children }: PropsWithChildren) => {
  const queryClient = getConvexQueryClient();

  return (
    <ConvexProviderWithClerk client={convex} useAuth={useAuth}>
      <QueryClientProvider client={queryClient}>
        {children}
        <ReactQueryDevtools />
      </QueryClientProvider>
    </ConvexProviderWithClerk>
  );
};
