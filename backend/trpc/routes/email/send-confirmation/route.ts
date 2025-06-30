import { publicProcedure } from '../../create-context';
import { z } from 'zod';

export const sendConfirmationEmailProcedure = publicProcedure
  .input(z.object({
    email: z.string().email(),
    confirmationCode: z.string(),
    reservationDetails: z.object({
      venueName: z.string(),
      date: z.string(),
      time: z.string(),
      partySize: z.number(),
    }),
  }))
  .mutation(async ({ input }) => {
    // Mock email sending - in production, use a real email service
    console.log('Sending confirmation email to:', input.email);
    console.log('Confirmation code:', input.confirmationCode);
    console.log('Reservation details:', input.reservationDetails);
    
    // Simulate email sending delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    return {
      success: true,
      message: 'Confirmation email sent successfully',
    };
  });