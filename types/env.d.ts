declare namespace NodeJS {
  interface ProcessEnv {
    // Clerk environment variables
    NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY: string;
    CLERK_SECRET_KEY: string;

    // Clerk JWT Template
    CLERK_JWT_ISSUER_DOMAIN: string;

    // Clerk Webhook Secret
    CLERK_WEBHOOK_SECRET: string;

    // Convex environment variables
    NEXT_PUBLIC_CONVEX_URL: string;
    CONVEX_DEPLOYMENT: string;
  }
}
