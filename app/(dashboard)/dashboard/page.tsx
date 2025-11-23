"use client";
import {
  SignedIn,
  UserButton,
  useUser,
  Protect,
  PricingTable,
} from "@clerk/nextjs";

export default function Page() {
  const { user } = useUser();

  return (
    <div>
      <SignedIn>
        <UserButton />
      </SignedIn>

      <Protect
        condition={(has) => {
          return !has({ plan: "free_user" });
        }}
        fallback={<PricingTable />}
      >
        <h1>Actual Features here</h1>

        <p>You got scammmmeedddd! HAHA </p>
      </Protect>

      <h1>Hello world {user?.fullName}</h1>
    </div>
  );
}
