import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  users: defineTable({
    id: v.string(),
    clerkId: v.string(),
    username: v.string(),
    firstName: v.string(),
    lastName: v.string(),
    email: v.string(),
    banned: v.boolean(),
    locked: v.boolean(),
    imageUrl: v.string(),
    createdAt: v.string(),
    updatedAt: v.string(),
  }).index("byClerkId", ["clerkId"]),
});
