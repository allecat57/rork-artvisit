import { trpcClient } from '@/lib/trpc';

export const sendConfirmationEmail = async (
  email: string,
  subject: string,
  message: string
) => {
  try {
    const result = await trpcClient.email.sendConfirmation.mutate({
      email,
      subject,
      message,
    });
    return result;
  } catch (error) {
    console.error('Error sending confirmation email:', error);
    throw error;
  }
};