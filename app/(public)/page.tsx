"use client";

import { PropsWithChildren } from "react";
import { useTheme } from "next-themes";
import { Settings2, Sparkles, Zap } from "lucide-react";
import { Authenticated, Unauthenticated, AuthLoading } from "convex/react";
import {
  SignInButton,
  SignOutButton,
  SignUpButton,
  UserButton,
  PricingTable,
  Protect,
} from "@clerk/nextjs";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";

import { ModeToggle } from "@/components/shared/mode-toggle";
import { Skeleton } from "@/components/ui/skeleton";

const CardDecorator = ({ children }: PropsWithChildren) => (
  <div className="mask-radial-from-40% mask-radial-to-60% relative mx-auto size-36 duration-200 [--color-border:color-mix(in_oklab,var(--color-zinc-950)10%,transparent)] group-hover:[--color-border:color-mix(in_oklab,var(--color-zinc-950)20%,transparent)] dark:[--color-border:color-mix(in_oklab,var(--color-white)15%,transparent)] dark:group-hover:[--color-border:color-mix(in_oklab,var(--color-white)20%,transparent)]">
    <div
      aria-hidden
      className="absolute inset-0 bg-[linear-gradient(to_right,var(--color-border)_1px,transparent_1px),linear-gradient(to_bottom,var(--color-border)_1px,transparent_1px)] bg-size-[24px_24px] dark:opacity-50"
    />

    <div className="bg-background absolute inset-0 m-auto flex size-12 items-center justify-center border-l border-t">
      {children}
    </div>
  </div>
);

export default function Page() {
  const { theme } = useTheme();
  return (
    <>
      <header className="px-6 py-8 fixed w-full backdrop-blur-sm">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <div className="flex gap-2">
            <Authenticated>
              <AuthLoading>
                <Skeleton className="size-8 rounded-full" />
                <Skeleton className="w-32" />
              </AuthLoading>
            </Authenticated>

            <Authenticated>
              <UserButton
                showName
                appearance={{
                  elements: {
                    userButtonBox: {
                      flexDirection: "row-reverse", // Reverses the order of avatar and name
                      color: theme === "dark" ? "white" : "black",
                    },
                  },
                  layout: {
                    shimmer: false,
                  },
                }}
              />
            </Authenticated>
          </div>

          <div className="flex gap-2">
            <AuthLoading>
              <Skeleton className="w-24" />
              <Skeleton className="w-24" />
            </AuthLoading>

            <Unauthenticated>
              <SignInButton mode="modal">
                <Button variant="outline">Sign In</Button>
              </SignInButton>
              <SignUpButton mode="modal">
                <Button>Sign Up</Button>
              </SignUpButton>
            </Unauthenticated>

            <Authenticated>
              <SignOutButton>
                <Button>Sign Out</Button>
              </SignOutButton>
            </Authenticated>
            <ModeToggle />
          </div>
        </div>
      </header>
      <section className="py-16 md:py-32">
        <div className="@container mx-auto max-w-5xl px-6">
          <div className="text-center">
            <h2 className="text-balance text-4xl font-semibold lg:text-5xl">
              Next.js MVP Template
            </h2>
            <p className="mt-4">
              A starter project template for building MVPs with Next.js using
              Convex and Clerk
            </p>
          </div>
          <div className="@min-4xl:max-w-full @min-4xl:grid-cols-3 mx-auto mt-8 grid max-w-sm gap-6 [--color-background:var(--color-muted)] [--color-card:var(--color-muted)] *:text-center md:mt-16 dark:[--color-muted:var(--color-zinc-900)]">
            <Card className="group border-0 shadow-none">
              <CardHeader className="pb-3">
                <CardDecorator>
                  <Zap className="size-6" aria-hidden />
                </CardDecorator>

                <h3 className="mt-6 font-medium">Customizable</h3>
              </CardHeader>

              <CardContent>
                <p className="text-sm">
                  Preconfigured with essential Convex and Clerk setup so you can
                  start building immediately—no boilerplate required.
                </p>
              </CardContent>
            </Card>

            <Card className="group border-0 shadow-none">
              <CardHeader className="pb-3">
                <CardDecorator>
                  <Settings2 className="size-6" aria-hidden />
                </CardDecorator>

                <h3 className="mt-6 font-medium">You have full control</h3>
              </CardHeader>

              <CardContent>
                <p className="mt-3 text-sm">
                  Built for flexibility—extend, modify, and integrate however
                  you want while keeping full ownership of your codebase.
                </p>
              </CardContent>
            </Card>

            <Card className="group border-0 shadow-none">
              <CardHeader className="pb-3">
                <CardDecorator>
                  <Sparkles className="size-6" aria-hidden />
                </CardDecorator>

                <h3 className="mt-6 font-medium">Open Source</h3>
              </CardHeader>

              <CardContent>
                <p className="mt-3 text-sm">
                  Fully open source, giving you transparency and the freedom to
                  adapt the template to any project needs.
                </p>
              </CardContent>
            </Card>
          </div>
          <div className="pt-16 pb-4 flex flex-col lg:flex-row items-center justify-center gap-6">
            <Protect
              condition={(has) => !has({ plan: "free_user" })}
              fallback={<PricingTable />}
            >
              <span className="text-extrabold text-2xl">
                Congratualation in purchasing the premium version! 🎉
              </span>
            </Protect>
          </div>
        </div>
      </section>
    </>
  );
}
