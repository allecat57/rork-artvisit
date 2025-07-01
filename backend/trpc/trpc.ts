import { initTRPC } from "@trpc/server";
import superjson from "superjson";

// Initialize tRPC
const t = initTRPC.create({
  transformer: superjson,
  errorFormatter({ shape }) {
    return shape;
  },
});

export const router = t.router;
export const publicProcedure = t.procedure;
export const protectedProcedure = t.procedure;