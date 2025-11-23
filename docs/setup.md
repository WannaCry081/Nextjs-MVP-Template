# Project Setup

This starter bundles **Next.js 16**, **Clerk**, and **Convex** so new projects get authentication, user provisioning, and realtime data sync on day one. The same repository also includes room for billing integrations and dashboard experiences, making it a solid base for SaaS experiments.

## Tech Stack at a Glance

- **Next.js App Router** (`app/`) with Tailwind styles in `app/styles/globals.css`.
- **Clerk** for auth UI + session management and JWT templates for server-side verification.
- **Convex** (`convex/`) for schema definition, auth config, webhooks, and user mutations.
- **UI Components** under `components/` (e.g., `shared/convex-provider.tsx`, `ui/button.tsx`).
- **Utility helpers** in `lib/utils.ts` (Tailwind `cn` helper).

```
├── app/                    # Next.js routes (public marketing + dashboard)
├── components/             # Shared providers and UI atoms
├── convex/                 # Convex schema, auth config, webhooks, mutations
├── docs/                   # Project documentation
├── public/                 # Static assets
└── package.json            # Scripts and dependencies
```

## Prerequisites

- Node.js ≥ 18.18
- `pnpm` 9 (or use the bundled version `pnpm@9.12.2`)
- A Convex project (`npx convex dev` will guide you through login if needed)
- A Clerk application with:
  - Publishable + secret keys
  - A **Convex** JWT template (kept as `convex`, do not rename)
  - A signing secret (Svix) for webhook verification

## Environment Configuration

Create `.env.local` in the repo root for Next.js. The existing example uses the following shape:

```bash
# Clerk configuration for the Next.js runtime
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
CLERK_SECRET_KEY=sk_test_...
CLERK_JWT_ISSUER_DOMAIN=https://<your-app>.clerk.accounts.dev
CLERK_WEBHOOK_SECRET=whsec_...

# Convex endpoint for the browser client
NEXT_PUBLIC_CONVEX_URL=https://<deployment>.convex.cloud
CONVEX_DEPLOYMENT=dev:<deployment-slug>
```

Convex does **not** read `.env.local`, so set sensitive values separately for the backend:

```bash
# Provide the same values you placed in .env.local
npx convex env set CLERK_JWT_ISSUER_DOMAIN https://<your-app>.clerk.accounts.dev
npx convex env set CLERK_WEBHOOK_SECRET whsec_...
```

If you rotate secrets later, update both `.env.local` (for Next.js) and the Convex env state.

## Installation & Local Development

```bash
pnpm install

# Terminal 1: start Convex (hot reloads functions + syncs schema/auth config)
pnpm convex:dev

# Terminal 2: start Next.js
pnpm dev
```

Visit `http://localhost:3000` to see the marketing page and try the Clerk sign-in modal. Once you sign in, Convex receives the JWT and the webhook to sync user metadata.

## Authentication Wiring

`app/layout.tsx` wraps the entire tree with Clerk + Convex context so client components can call Convex hooks with user identity.

```tsx
// app/layout.tsx (excerpt)
<ClerkProvider>
  <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
    <ConvexClientProvider>{children}</ConvexClientProvider>
  </ThemeProvider>
</ClerkProvider>
```

`ConvexClientProvider` bridges Clerk auth to Convex using the helper from `convex/react-clerk`.

```tsx
// components/shared/convex-provider.tsx
const convex = new ConvexReactClient(process.env.NEXT_PUBLIC_CONVEX_URL);

export function ConvexClientProvider({ children }: PropsWithChildren) {
  return (
    <ConvexProviderWithClerk client={convex} useAuth={useAuth}>
      {children}
    </ConvexProviderWithClerk>
  );
}
```

On the server, `convex/auth.config.ts` tells Convex how to validate Clerk JWTs:

```ts
// convex/auth.config.ts
export default {
  providers: [
    {
      domain: process.env.CLERK_JWT_ISSUER_DOMAIN!,
      applicationID: "convex",
    },
  ],
} satisfies AuthConfig;
```

## Database & User Sync

The Convex `users` table keeps one record per Clerk user. The schema lives in `convex/schema.ts`:

```ts
export default defineSchema({
  users: defineTable({
    id: v.string(),
    username: v.string(),
    firstName: v.string(),
    lastName: v.string(),
    banned: v.boolean(),
    locked: v.boolean(),
    lockoutExpiresInSeconds: v.number(),
    imageUrl: v.string(),
    createdAt: v.string(),
    updatedAt: v.string(),
    externalId: v.string(),
  }).index("byExternalId", ["externalId"]),
});
```

User provisioning happens inside `convex/users.ts`. Whenever Clerk emits `user.created` / `user.updated`, the webhook calls `upsertFromClerk` to insert or patch records using the Clerk payload:

```ts
export const upsertFromClerk = internalMutation({
  args: { data: v.any() as Validator<UserJSON> },
  async handler(ctx, { data }) {
    const userAttributes = {
      id: data.id,
      username: data.username,
      firstName: data.first_name,
      lastName: data.last_name,
      banned: data.banned,
      locked: data.locked,
      lockoutExpiresInSeconds: data.lockout_expires_in_seconds,
      imageUrl: data.image_url,
      createdAt: new Date(data.created_at).toISOString(),
      updatedAt: new Date(data.updated_at).toISOString(),
      externalId: data.id,
    };

    const user = await userByExternalId(ctx, data.id);
    if (user === null) {
      await ctx.db.insert("users", userAttributes);
    } else {
      await ctx.db.patch(user._id, userAttributes);
    }
  },
});
```

The Clerk webhook endpoint is registered via Convex HTTP actions (`convex/http.ts`). Every request is signature-checked with Svix before dispatching to the mutation above:

```ts
http.route({
  path: "/clerk-users-webhook",
  method: "POST",
  handler: httpAction(async (ctx, request) => {
    const event = await validateRequest(request); // uses Webhook + CLERK_WEBHOOK_SECRET
    if (!event) return new Response("Error occured", { status: 400 });

    switch (event.type) {
      case "user.created":
      case "user.updated":
        await ctx.runMutation(internal.users.upsertFromClerk, {
          data: event.data,
        });
        break;
      case "user.deleted":
        await ctx.runMutation(internal.users.deleteFromClerk, {
          clerkUserId: event.data.id!,
        });
        break;
    }
    return new Response(null, { status: 200 });
  }),
});
```

When developing locally, use the Clerk dashboard to send a test `user.created` webhook pointed at `http://localhost:8787/clerk-users-webhook` (the default Convex dev server port) or forward production webhooks via something like `ngrok`.

## Useful Scripts

| Command           | Description                                                     |
| ----------------- | --------------------------------------------------------------- |
| `pnpm dev`        | Run Next.js (uses Turbopack).                                   |
| `pnpm build`      | Production Next.js build.                                       |
| `pnpm start`      | Start the production server after building.                     |
| `pnpm lint`       | Run ESLint.                                                     |
| `pnpm convex:dev` | Launch Convex dev server (required for schema, auth, and http). |

## Next Steps

- Hook up billing (e.g., Stripe) once Convex handles user creation.
- Add dashboard pages querying Convex via `useQuery` hooks.
- Expand the webhook handler for org events or billing events as needed.

## Reference Links

- [Clerk Next.js Quickstart](https://clerk.com/docs/nextjs/getting-started/quickstart)
- [Convex Clerk Guide](https://docs.convex.dev/auth/clerk#nextjs)
- [Convex Database Schemas](https://docs.convex.dev/database/schemas)
- [Convex Auth + Database Sync](https://docs.convex.dev/auth/database-auth)
