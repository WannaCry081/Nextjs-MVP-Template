# Convex + Clerk Next.js Starter

![hero-page-view](./public/hero-page.png)

Modern SaaS boilerplate that combines **Next.js 16**, **Clerk authentication**, and **Convex realtime data** so you can launch dashboards, billing flows, and synced user records with minimal setup.

## Features

- ✅ Pre-wired Clerk auth (UI + JWT templates) with Convex validation
- ✅ Convex schema + mutations to keep a `users` table synced via Clerk webhooks
- ✅ HTTP endpoint (`/clerk-users-webhook`) that verifies Svix signatures
- ✅ Shared React provider (`ConvexProviderWithClerk`) for safe Convex hooks
- ✅ Tailwind-ready UI primitives, theme toggling, and placeholder public/dashboard routes

See `docs/setup.md` for the full walk-through.

## Tech Stack

- [Next.js App Router](https://nextjs.org/) (Turbopack dev server)
- [Clerk](https://clerk.com/) for auth UI and JWT issuance
- [Convex](https://convex.dev/) for data, server functions, and webhooks
- [Tailwind CSS](https://tailwindcss.com/) + [shadcn/ui](https://ui.shadcn.com/) components
- [pnpm](https://pnpm.io/) for dependency management

## Prerequisites

- Node.js ≥ 18.18
- `pnpm` 9 (project pins `pnpm@9.12.2`)
- A Convex deployment (`npx convex dev` will prompt you to log in if needed)
- A Clerk application with:
  - Publishable + secret keys
  - A JWT template named **convex**
  - Svix webhook signing secret

## Environment Variables

Create `.env.local` for Next.js:

```bash
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
CLERK_SECRET_KEY=sk_test_...
CLERK_JWT_ISSUER_DOMAIN=https://<your-app>.clerk.accounts.dev
CLERK_WEBHOOK_SECRET=whsec_...
NEXT_PUBLIC_CONVEX_URL=https://<deployment>.convex.cloud
CONVEX_DEPLOYMENT=dev:<deployment-slug>
```

Convex runs outside of Next.js, so copy required secrets into the Convex environment as well:

```bash
npx convex env set CLERK_JWT_ISSUER_DOMAIN https://<your-app>.clerk.accounts.dev
npx convex env set CLERK_WEBHOOK_SECRET whsec_...
```

> ✱ Whenever you rotate Clerk secrets, update both `.env.local` and the Convex env.

## Getting Started

```bash
pnpm install

# Terminal 1 – Convex functions, schema, and webhook endpoint
pnpm convex:dev

# Terminal 2 – Next.js web app
pnpm dev
```

Open http://localhost:3000 to view the public marketing page. Use the Clerk modal to sign in. Convex verifies the JWT, saves user details via the webhook, and you can begin querying the synced record for dashboards.

## Useful Scripts

| Command           | Description                                     |
| ----------------- | ----------------------------------------------- |
| `pnpm dev`        | Start Next.js (Turbopack).                      |
| `pnpm build`      | Production build.                               |
| `pnpm start`      | Run the built Next.js app.                      |
| `pnpm lint`       | ESLint.                                         |
| `pnpm convex:dev` | Start Convex dev server + hot reload functions. |

## Key Files

- `app/layout.tsx` – wraps the tree with Clerk + Convex providers.
- `components/shared/convex-provider.tsx` – uses `ConvexProviderWithClerk`.
- `convex/auth.config.ts` – registers Clerk as the Convex auth provider.
- `convex/schema.ts` – defines the `users` table + index.
- `convex/users.ts` – mutations to upsert/delete users from Clerk payloads.
- `convex/http.ts` – Clerk webhook handler with Svix verification.
- `docs/setup.md` – extended docs, diagrams, and next steps.

## Project Structure

```
├── app/                    # Next.js routes (marketing + dashboard skeleton)
├── components/             # Shared providers and UI primitives
├── convex/                 # Convex schema, auth config, mutations, http
├── docs/                   # Setup and reference docs
├── lib/                    # Utilities (e.g., cn helper)
└── public/                 # Static assets
```

## Documentation

- [Setup Guide](docs/setup.md)
- [Clerk Next.js Quickstart](https://clerk.com/docs/nextjs/getting-started/quickstart)
- [Convex Clerk Auth](https://docs.convex.dev/auth/clerk#nextjs)
- [Convex Database Schemas](https://docs.convex.dev/database/schemas)

## Contributing / Customizing

1. Fork or clone the repo.
2. Update `convex/schema.ts` and run `pnpm convex:dev` to sync schema.
3. Extend `convex/users.ts` with more metadata (roles, billing state, etc.).
4. Build dashboard routes under `app/(dashboard)/`.
5. Add billing integrations (Stripe, Lemon Squeezy, etc.) – place hooks in Convex actions/mutations for a unified backend.

Pull requests welcome! This template is meant to stay lean but pragmatic; if something slows down your setup, improve it and share.
