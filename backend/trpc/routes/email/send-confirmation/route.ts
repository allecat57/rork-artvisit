import { protectedProcedure } from '@/backend/trpc/trpc';
import { z } from 'zod';
import sgMail from '@sendgrid/mail';

// This would be set in your environment variables in a real app
const SENDGRID_API_KEY = process.env.SENDGRID_API_KEY || 'your-sendgrid-api-key';
sgMail.setApiKey(SENDGRID_API_KEY);

export const sendConfirmationEmailProcedure = protectedProcedure
  .input(
    z.object({
      email: z.string().email(),
      subject: z.string(),
      message: z.string(),
    })
  )
  .mutation(async ({ input }) => {
    const { email, subject, message } = input;

    const msg = {
      to: email,
      from: 'your@email.com', // replace with your verified sender from SendGrid
      subject,
      text: message,
    };

    try {
      await sgMail.send(msg);
      console.log('✅ Email sent successfully');
      return { success: true };
    } catch (error) {
      console.error('❌ Error sending email:', error);
      throw new Error('Email send failed');
    }
  });