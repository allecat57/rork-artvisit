import { Theme } from '@react-navigation/native';
import colors from './colors';

export const CustomTheme: Theme = {
  dark: true,
  colors: {
    primary: colors.accent, // Gold accent
    background: colors.background, // Dark green background
    card: colors.card, // Card background
    text: colors.text, // White text
    border: colors.border, // Gold border with opacity
    notification: colors.accent, // Gold for notifications
  },
  fonts: {
    regular: {
      fontFamily: 'System',
      fontWeight: '400',
    },
    medium: {
      fontFamily: 'System',
      fontWeight: '500',
    },
    bold: {
      fontFamily: 'System',
      fontWeight: '700',
    },
    heavy: {
      fontFamily: 'System',
      fontWeight: '900',
    },
  },
};