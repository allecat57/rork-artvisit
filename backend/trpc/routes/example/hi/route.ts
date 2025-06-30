import { protectedProcedure } from "@/backend/trpc/create-context";

export const hiProcedure = protectedProcedure.query(() => {
  return {
    message: "Hello from tRPC!",
    timestamp: new Date().toISOString()
  };
});