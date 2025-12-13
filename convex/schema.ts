import { defineSchema } from "convex/server";

// Schemas
import * as schema from "./schemas";

export default defineSchema({
  ...schema.userSchema,
});
