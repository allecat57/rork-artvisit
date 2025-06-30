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
  theme: 'dark',
  isDark: true,
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
  const [theme, setTheme] = useState<ThemeType>('dark');
  
  // Our app uses a dark theme with the green/gold color scheme
  const isDark = true;
  
  const toggleTheme = () => {
    // For now, we'll keep it as dark theme since the design is dark
    console.log('Theme toggle requested, but keeping dark theme for consistency');
  };
  
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