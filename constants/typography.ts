import { Platform, TextStyle } from "react-native";
import colors from "./colors";

// Define the serif font family based on platform
const serifFontFamily = Platform.select({
  ios: "Georgia",
  android: "serif",
  default: "Georgia, serif"
});

// Base text styles
const baseText: TextStyle = {
  color: colors.primary.text || colors.accent,
  fontFamily: serifFontFamily,
};

// Typography styles
const typography = {
  heading1: {
    ...baseText,
    fontSize: 32,
    fontWeight: "700",
    letterSpacing: 0.25,
  } as TextStyle,
  
  heading2: {
    ...baseText,
    fontSize: 24,
    fontWeight: "600",
    letterSpacing: 0.15,
  } as TextStyle,
  
  heading3: {
    ...baseText,
    fontSize: 20,
    fontWeight: "600",
    letterSpacing: 0.15,
  } as TextStyle,
  
  heading4: {
    ...baseText,
    fontSize: 18,
    fontWeight: "600",
    letterSpacing: 0.15,
  } as TextStyle,
  
  subtitle: {
    ...baseText,
    fontSize: 16,
    fontWeight: "500",
    letterSpacing: 0.15,
  } as TextStyle,
  
  body: {
    ...baseText,
    fontSize: 16,
    fontWeight: "400",
    letterSpacing: 0.5,
    lineHeight: 24,
  } as TextStyle,
  
  bodySmall: {
    ...baseText,
    fontSize: 14,
    fontWeight: "400",
    letterSpacing: 0.25,
    lineHeight: 20,
  } as TextStyle,
  
  caption: {
    ...baseText,
    fontSize: 12,
    fontWeight: "400",
    letterSpacing: 0.4,
  } as TextStyle,
  
  button: {
    ...baseText,
    fontSize: 16,
    fontWeight: "600",
    letterSpacing: 0.5,
    textTransform: "none",
  } as TextStyle,
  
  overline: {
    ...baseText,
    fontSize: 10,
    fontWeight: "400",
    letterSpacing: 1.5,
    textTransform: "uppercase",
  } as TextStyle,
};

export default typography;