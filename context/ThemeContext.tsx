import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useColorScheme } from 'react-native';
import colors from '@/constants/colors';

type ThemeType = 'light' | 'dark' | 'system';

interface ThemeContextType {
  theme: ThemeType;
  isDark: boolean;
  setTheme: (theme: ThemeType) => void;
  toggleTheme: () => void;
  colors: typeof colors;
}

const ThemeContext = createContext<ThemeContextType>({
  theme: 'system',
  isDark: true, // Default to dark since our app uses dark theme
  setTheme: () => {},
  toggleTheme: () => {},
  colors: colors,
});

export const useTheme = () => useContext(ThemeContext);

interface ThemeProviderProps {
  children: ReactNode;
}

export const ThemeProvider: React.FC<ThemeProviderProps> = ({ children }) => {
  const systemColorScheme = useColorScheme();
  const [theme, setTheme] = useState<ThemeType>('dark'); // Default to dark theme
  
  // Since our app uses a dark theme (#013025), we'll always use dark mode
  const isDark = true;
  
  // Toggle between light and dark themes (though we're keeping it dark)
  const toggleTheme = () => {
    // For now, we'll keep it as dark theme since the design is dark
    console.log('Theme toggle requested, but keeping dark theme for consistency');
  };
  
  // Provide the theme context value with enhanced colors
  const contextValue: ThemeContextType = {
    theme: 'dark',
    isDark: true,
    setTheme: () => {}, // Keep dark theme
    toggleTheme,
    colors: colors,
  };
  
  return (
    <ThemeContext.Provider value={contextValue}>
      {children}
    </ThemeContext.Provider>
  );
};