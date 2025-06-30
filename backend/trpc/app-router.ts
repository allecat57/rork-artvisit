import { router } from './trpc';
import { hiProcedure } from './routes/example/hi/route';
import { sendConfirmationEmailProcedure } from './routes/email/send-confirmation/route';

export const appRouter = router({
  example: router({
    hi: hiProcedure,
  }),
  email: router({
    sendConfirmation: sendConfirmationEmailProcedure,
  }),
});

export type AppRouter = typeof appRouter;