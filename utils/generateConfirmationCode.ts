/**
 * Generate a confirmation code for reservations
 */
export const generateConfirmationCode = (): string => {
  const characters = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"; // Removed similar looking characters
  let result = "";
  
  // Generate 2 letters followed by 4 numbers
  for (let i = 0; i < 2; i++) {
    result += characters.charAt(Math.floor(Math.random() * 24)); // First 24 chars are letters
  }
  
  for (let i = 0; i < 4; i++) {
    result += characters.charAt(24 + Math.floor(Math.random() * 8)); // Last 8 chars are numbers
  }
  
  return result;
};