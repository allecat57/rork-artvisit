import { createTRPCRouter } from './create-context';
import { hiProcedure } from './routes/example/hi/route';
import { sendConfirmationEmailProcedure } from './routes/email/send-confirmation/route';

export const appRouter = createTRPCRouter({
  example: createTRPCRouter({
    hi: hiProcedure,
  }),
  email: createTRPCRouter({
    sendConfirmation: sendConfirmationEmailProcedure,
  }),
});

export type AppRouter = typeof appRouter;