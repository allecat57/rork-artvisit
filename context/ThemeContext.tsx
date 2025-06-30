import React, { createContext, useContext, ReactNode } from 'react';
import colors from '@/constants/colors';

interface ThemeContextType {
  theme: 'dark';
  isDark: boolean;
  colors: typeof colors;
}

const ThemeContext = createContext<ThemeContextType>({
  theme: 'dark',
  isDark: true,
  colors: colors,
});

export const useTheme = () => useContext(ThemeContext);

interface ThemeProviderProps {
  children: ReactNode;
}

export const ThemeProvider: React.FC<ThemeProviderProps> = ({ children }) => {
  // Our app uses a consistent dark theme
  const contextValue: ThemeContextType = {
    theme: 'dark',
    isDark: true,
    colors: colors,
  };
  
  return (
    <ThemeContext.Provider value={contextValue}>
      {children}
    </ThemeContext.Provider>
  );
};