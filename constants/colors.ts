export interface AppColors {
  // Main theme colors
  primary: {
    background: string;
    surface: string;
    card: string;
    text: string;
    textSecondary: string;
    muted: string;
    accent: string;
    border: string;
    divider: string;
  };
  
  // Legacy flat structure for backward compatibility
  background: string;
  surface: string;
  card: string;
  text: string;
  textSecondary: string;
  textMuted: string;
  accent: string;
  border: string;
  divider: string;
  
  // Status colors
  success: string;
  error: string;
  warning: string;
  info: string;
  
  // Utility colors
  white: string;
  black: string;
  transparent: string;
  
  // Legacy support
  muted: string;
  constructive: string;
  destructive: string;
  
  // Status object
  status: {
    success: string;
    error: string;
    warning: string;
    info: string;
  };
}

const colors: AppColors = {
  // Main theme colors
  primary: {
    background: "#013025",    // Dark green - main background
    surface: "#1a4037",       // Slightly lighter surface
    card: "#1a4037",          // Card background
    text: "#FFFFFF",          // Primary text (white)
    textSecondary: "#B0B0B0", // Secondary text
    muted: "#808080",         // Muted text
    accent: "#AC8901",        // Gold - accent color
    border: "rgba(172, 137, 1, 0.2)", // Gold with opacity
    divider: "rgba(172, 137, 1, 0.1)",
  },
  
  // Legacy flat structure for backward compatibility
  background: "#013025",     // Main background (dark green)
  surface: "#1a4037",        // Slightly lighter surface
  card: "#1a4037",           // Card background
  text: "#FFFFFF",           // Primary text (white)
  textSecondary: "#B0B0B0",  // Secondary text
  textMuted: "#808080",      // Muted text
  accent: "#AC8901",         // Gold - accent color
  border: "rgba(172, 137, 1, 0.2)", // Gold with opacity
  divider: "rgba(172, 137, 1, 0.1)",
  
  // Status colors
  success: "#10B981",
  error: "#EF4444",
  warning: "#F59E0B",
  info: "#3B82F6",
  
  // Utility colors
  white: "#FFFFFF",
  black: "#000000",
  transparent: "transparent",
  
  // Legacy support (for components that might still use these)
  muted: "#808080",
  constructive: "#10B981",
  destructive: "#EF4444",
  
  // Status object for backward compatibility
  status: {
    success: "#10B981",
    error: "#EF4444",
    warning: "#F59E0B",
    info: "#3B82F6"
  }
};

export default colors;