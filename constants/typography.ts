import { Platform, TextStyle } from "react-native";

// Define the font family based on platform for better consistency
const fontFamily = Platform.select({
  ios: "SF Pro Display",
  android: "Roboto",
  default: "system"
});

const serifFontFamily = Platform.select({
  ios: "Georgia",
  android: "serif",
  default: "Georgia, serif"
});

// Typography styles with modern design
const typography = {
  // Display styles
  display: {
    fontSize: 36,
    fontWeight: "700",
    letterSpacing: -0.5,
    lineHeight: 44,
    fontFamily,
  } as TextStyle,
  
  // Heading styles
  heading1: {
    fontSize: 32,
    fontWeight: "700",
    letterSpacing: -0.25,
    lineHeight: 40,
    fontFamily,
  } as TextStyle,
  
  heading2: {
    fontSize: 24,
    fontWeight: "600",
    letterSpacing: -0.15,
    lineHeight: 32,
    fontFamily,
  } as TextStyle,
  
  heading3: {
    fontSize: 20,
    fontWeight: "600",
    letterSpacing: -0.1,
    lineHeight: 28,
    fontFamily,
  } as TextStyle,
  
  heading4: {
    fontSize: 18,
    fontWeight: "600",
    letterSpacing: 0,
    lineHeight: 26,
    fontFamily,
  } as TextStyle,
  
  // Body styles
  subtitle: {
    fontSize: 16,
    fontWeight: "500",
    letterSpacing: 0,
    lineHeight: 24,
    fontFamily,
  } as TextStyle,
  
  body: {
    fontSize: 16,
    fontWeight: "400",
    letterSpacing: 0,
    lineHeight: 24,
    fontFamily,
  } as TextStyle,
  
  bodyMedium: {
    fontSize: 14,
    fontWeight: "500",
    letterSpacing: 0.1,
    lineHeight: 20,
    fontFamily,
  } as TextStyle,
  
  bodySmall: {
    fontSize: 14,
    fontWeight: "400",
    letterSpacing: 0.1,
    lineHeight: 20,
    fontFamily,
  } as TextStyle,
  
  // Utility styles
  caption: {
    fontSize: 12,
    fontWeight: "400",
    letterSpacing: 0.4,
    lineHeight: 16,
    fontFamily,
  } as TextStyle,
  
  button: {
    fontSize: 16,
    fontWeight: "600",
    letterSpacing: 0.1,
    fontFamily,
  } as TextStyle,
  
  buttonSmall: {
    fontSize: 14,
    fontWeight: "600",
    letterSpacing: 0.1,
    fontFamily,
  } as TextStyle,
  
  overline: {
    fontSize: 11,
    fontWeight: "600",
    letterSpacing: 1.2,
    textTransform: "uppercase",
    fontFamily,
  } as TextStyle,
  
  // Special styles
  serif: {
    fontSize: 16,
    fontWeight: "400",
    letterSpacing: 0,
    lineHeight: 24,
    fontFamily: serifFontFamily,
  } as TextStyle,
  
  monospace: {
    fontSize: 14,
    fontWeight: "400",
    letterSpacing: 0,
    lineHeight: 20,
    fontFamily: Platform.select({
      ios: "Menlo",
      android: "monospace",
      default: "monospace"
    }),
  } as TextStyle,
};

export default typography;