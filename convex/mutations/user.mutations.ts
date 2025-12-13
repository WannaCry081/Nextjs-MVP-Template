import { UserJSON } from "@clerk/backend";
import { v, Validator } from "convex/values";

import { internalMutation } from "../_generated/server";
import { userByExternalId } from "../queries/user.queries";

export const upsertFromClerk = internalMutation({
  args: { data: v.any() as Validator<UserJSON> },
  async handler(ctx, { data }) {
    const userAttributes = {
      clerkId: data.id,
      username: data.username ?? "",
      firstName: data.first_name ?? "",
      lastName: data.last_name ?? "",
      email: data.email_addresses[0]?.email_address,
      banned: data.banned,
      locked: data.locked,
      imageUrl: data.image_url,
      createdAt: new Date(data.created_at).toISOString(),
      updatedAt: new Date(data.updated_at).toISOString(),
    };

    const user = await userByExternalId(ctx, data.id);
    if (user === null) {
      await ctx.db.insert("users", userAttributes);
    } else {
      await ctx.db.patch(user._id, userAttributes);
    }
  },
});

export const deleteFromClerk = internalMutation({
  args: { clerkUserId: v.string() },
  async handler(ctx, { clerkUserId }) {
    const user = await userByExternalId(ctx, clerkUserId);

    if (user !== null) {
      await ctx.db.delete(user._id);
    } else {
      console.warn(`Can't delete user, there is none for Clerk user ID: ${clerkUserId}`);
    }
  },
});
