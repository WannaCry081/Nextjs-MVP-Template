import {
  SignInButton,
  SignOutButton,
  SignedIn,
  SignUpButton,
  SignedOut,
} from "@clerk/nextjs";

export default function Page() {
  return (
    <div>
      <header>
        <SignedOut>
          <SignInButton forceRedirectUrl="/dashboard" />
          <SignUpButton forceRedirectUrl="/dashboard" />
        </SignedOut>
        <SignedIn>
          <SignOutButton />
        </SignedIn>
      </header>
      <h1>Hello world</h1>
    </div>
  );
}
