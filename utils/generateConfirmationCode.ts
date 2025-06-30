import { v4 as uuidv4 } from "uuid";

export const generateConfirmationCode = (): string => {
  // Option 1: Use UUID and format it
  const uuid = uuidv4();
  // Take first 6 characters of the UUID and make them uppercase
  return uuid.substring(0, 6).toUpperCase();
  
  // Option 2: Generate a custom code (keeping this as an alternative)
  /*
  const characters = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"; // Removed similar looking characters
  let result = "";
  
  // Generate 2 letters followed by 4 numbers
  for (let i = 0; i < 2; i++) {
    result += characters.charAt(Math.floor(Math.random() * 24)); // First 24 chars are letters
  }
  
  for (let i = 0; i < 4; i++) {
    result += characters.charAt(24 + Math.floor(Math.random() * 10)); // Last 10 chars are numbers
  }
  
  return result;
  */
};