import React from "react";
import { 
  TouchableOpacity, 
  Text, 
  StyleSheet, 
  ActivityIndicator, 
  View,
  ViewStyle,
  TextStyle 
} from "react-native";
import colors from "@/constants/colors";
import typography from "@/constants/typography";
import * as Analytics from "@/utils/analytics";

export interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: "primary" | "secondary" | "outline" | "ghost";
  size?: "small" | "medium" | "large";
  disabled?: boolean;
  loading?: boolean;
  icon?: React.ReactNode;
  iconPosition?: "left" | "right";
  style?: ViewStyle;
  textStyle?: TextStyle;
  analyticsEventName?: string;
  analyticsProperties?: Record<string, any>;
}

export default function Button({
  title,
  onPress,
  variant = "primary",
  size = "medium",
  disabled = false,
  loading = false,
  icon,
  iconPosition = "left",
  style,
  textStyle,
  analyticsEventName,
  analyticsProperties
}: ButtonProps) {
  const handlePress = () => {
    if (disabled || loading) return;
    
    // Log analytics event if provided
    if (analyticsEventName) {
      Analytics.logEvent(analyticsEventName, analyticsProperties);
    }
    
    onPress();
  };

  const getButtonStyle = (): ViewStyle => {
    const baseStyle = styles.button;
    const sizeStyle = styles[`${size}Button` as keyof typeof styles] as ViewStyle;
    const variantStyle = styles[`${variant}Button` as keyof typeof styles] as ViewStyle;
    const disabledStyle = (disabled || loading) ? styles.disabledButton : {};

    return {
      ...baseStyle,
      ...sizeStyle,
      ...variantStyle,
      ...disabledStyle,
      ...style,
    };
  };

  const getTextStyle = (): TextStyle => {
    const baseStyle = styles.buttonText;
    const sizeStyle = styles[`${size}ButtonText` as keyof typeof styles] as TextStyle;
    const variantStyle = styles[`${variant}ButtonText` as keyof typeof styles] as TextStyle;
    const disabledStyle = (disabled || loading) ? styles.disabledButtonText : {};

    return {
      ...baseStyle,
      ...sizeStyle,
      ...variantStyle,
      ...disabledStyle,
      ...textStyle,
    };
  };

  const renderContent = () => {
    if (loading) {
      return (
        <View style={styles.loadingContainer}>
          <ActivityIndicator 
            size="small" 
            color={variant === "primary" ? colors.background : colors.accent} 
          />
          <Text style={[getTextStyle(), styles.loadingText]}>{title}</Text>
        </View>
      );
    }

    if (icon) {
      return (
        <View style={[
          styles.iconContainer,
          iconPosition === "right" && styles.iconContainerReverse
        ]}>
          {iconPosition === "left" && icon}
          <Text style={getTextStyle()}>{title}</Text>
          {iconPosition === "right" && icon}
        </View>
      );
    }

    return <Text style={getTextStyle()}>{title}</Text>;
  };

  return (
    <TouchableOpacity
      style={getButtonStyle()}
      onPress={handlePress}
      disabled={disabled || loading}
      activeOpacity={0.7}
    >
      {renderContent()}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
  },
  
  // Size variants
  smallButton: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    minHeight: 36,
  },
  mediumButton: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    minHeight: 44,
  },
  largeButton: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    minHeight: 52,
  },
  
  // Color variants
  primaryButton: {
    backgroundColor: colors.accent,
  },
  secondaryButton: {
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
  },
  outlineButton: {
    backgroundColor: "transparent",
    borderWidth: 1,
    borderColor: colors.accent,
  },
  ghostButton: {
    backgroundColor: "transparent",
  },
  
  // Disabled state
  disabledButton: {
    opacity: 0.5,
  },
  
  // Text styles
  buttonText: {
    fontWeight: "600",
    textAlign: "center",
  },
  
  // Text size variants
  smallButtonText: {
    ...typography.bodySmall,
  },
  mediumButtonText: {
    ...typography.body,
  },
  largeButtonText: {
    ...typography.heading4,
  },
  
  // Text color variants
  primaryButtonText: {
    color: colors.background,
  },
  secondaryButtonText: {
    color: colors.text,
  },
  outlineButtonText: {
    color: colors.accent,
  },
  ghostButtonText: {
    color: colors.accent,
  },
  
  // Disabled text
  disabledButtonText: {
    opacity: 0.7,
  },
  
  // Icon and loading styles
  iconContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  iconContainerReverse: {
    flexDirection: "row-reverse",
  },
  loadingContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  loadingText: {
    marginLeft: 8,
  },
});