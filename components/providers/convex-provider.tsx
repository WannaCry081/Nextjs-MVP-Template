"use client";

import { useEffect, useState, PropsWithChildren } from "react";
import { useAuth } from "@clerk/nextjs";
import { ConvexReactClient } from "convex/react";
import { ConvexQueryClient } from "@convex-dev/react-query";
import { ConvexProviderWithClerk } from "convex/react-clerk";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";

if (!process.env.NEXT_PUBLIC_CONVEX_URL) {
  throw new Error("Missing NEXT_PUBLIC_CONVEX_URL in your .env file");
}

const convex = new ConvexReactClient(process.env.NEXT_PUBLIC_CONVEX_URL);

export function ConvexClientProvider({ children }: PropsWithChildren) {
  const [{ queryClient, convexQueryClient }] = useState(() => {
    const convexQueryClient = new ConvexQueryClient(convex);
    const tanstackQueryClient = new QueryClient({
      defaultOptions: {
        queries: {
          queryKeyHashFn: convexQueryClient.hashFn(),
          queryFn: convexQueryClient.queryFn(),
        },
      },
    });

    convexQueryClient.connect(tanstackQueryClient);

    return { queryClient: tanstackQueryClient, convexQueryClient };
  });

  useEffect(() => {
    return () => {
      convexQueryClient.unsubscribe?.();
      queryClient.clear();
    };
  }, [convexQueryClient, queryClient]);

  return (
    <ConvexProviderWithClerk client={convex} useAuth={useAuth}>
      <QueryClientProvider client={queryClient}>
        {children}
        <ReactQueryDevtools />
      </QueryClientProvider>
    </ConvexProviderWithClerk>
  );
}
