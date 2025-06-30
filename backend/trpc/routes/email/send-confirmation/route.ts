import { publicProcedure } from '../../create-context';
import { z } from 'zod';

export const sendConfirmationEmailProcedure = publicProcedure
  .input(z.object({
    email: z.string().email(),
    confirmationCode: z.string(),
    venueName: z.string(),
    date: z.string(),
    time: z.string(),
  }))
  .mutation(async ({ input }) => {
    // Mock email sending - in production, you would integrate with SendGrid, etc.
    console.log('Sending confirmation email:', {
      to: input.email,
      confirmationCode: input.confirmationCode,
      venueName: input.venueName,
      date: input.date,
      time: input.time,
    });

    // Simulate email sending delay
    await new Promise(resolve => setTimeout(resolve, 1000));

    return {
      success: true,
      message: 'Confirmation email sent successfully',
    };
  });