import React from "react";
import { 
  StyleSheet, 
  Text, 
  TouchableOpacity, 
  ActivityIndicator, 
  View 
} from "react-native";
import colors from "../constants/colors";
import typography from "../constants/typography";
import * as Analytics from "../utils/analytics";
import { logFirestoreEvent } from "../utils/firestoreEvents";

interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: "primary" | "secondary" | "outline" | "text";
  size?: "small" | "medium" | "large";
  disabled?: boolean;
  loading?: boolean;
  icon?: React.ReactNode;
  iconPosition?: "left" | "right";
  analyticsEventName?: string;
  analyticsParams?: Record<string, any>;
  firestoreEvent?: {
    type: string;
    userId: string;
    galleryId?: string;
    artworkId?: string;
    venueId?: string;
    eventId?: string;
    additionalData?: Record<string, any>;
  };
  style?: any;
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
  analyticsEventName,
  analyticsParams,
  firestoreEvent,
  style
}: ButtonProps) {
  const handlePress = async () => {
    if (analyticsEventName) {
      await Analytics.sendAnalyticsEvent(analyticsEventName, analyticsParams);
    }
    
    if (firestoreEvent) {
      await logFirestoreEvent(firestoreEvent);
    }
    
    onPress();
  };

  const getButtonStyle = () => {
    let buttonStyle = [styles.button, styles[`${size}Button`]];
    
    if (variant === "primary") {
      buttonStyle.push(styles.primaryButton);
    } else if (variant === "secondary") {
      buttonStyle.push(styles.secondaryButton);
    } else if (variant === "outline") {
      buttonStyle.push(styles.outlineButton);
    } else if (variant === "text") {
      buttonStyle.push(styles.textButton);
    }
    
    if (disabled) {
      buttonStyle.push(styles.disabledButton);
    }
    
    if (style) {
      buttonStyle.push(style);
    }
    
    return buttonStyle;
  };
  
  const getTextStyle = () => {
    let textStyle = [styles.buttonText, styles[`${size}Text`]];
    
    if (variant === "primary") {
      textStyle.push(styles.primaryText);
    } else if (variant === "secondary") {
      textStyle.push(styles.secondaryText);
    } else if (variant === "outline") {
      textStyle.push(styles.outlineText);
    } else if (variant === "text") {
      textStyle.push(styles.textButtonText);
    }
    
    if (disabled) {
      textStyle.push(styles.disabledText);
    }
    
    return textStyle;
  };

  return (
    <TouchableOpacity
      style={getButtonStyle()}
      onPress={handlePress}
      disabled={disabled || loading}
      activeOpacity={0.7}
    >
      {loading ? (
        <ActivityIndicator 
          size="small" 
          color={variant === "primary" ? "#FFFFFF" : colors.primary.accent} 
        />
      ) : (
        <View style={styles.contentContainer}>
          {icon && iconPosition === "left" && (
            <View style={styles.iconLeft}>{icon}</View>
          )}
          <Text style={getTextStyle()}>{title}</Text>
          {icon && iconPosition === "right" && (
            <View style={styles.iconRight}>{icon}</View>
          )}
        </View>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center",
  },
  smallButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
  },
  mediumButton: {
    paddingVertical: 12,
    paddingHorizontal: 24,
  },
  largeButton: {
    paddingVertical: 16,
    paddingHorizontal: 32,
  },
  primaryButton: {
    backgroundColor: colors.primary.accent,
  },
  secondaryButton: {
    backgroundColor: colors.primary.secondary,
  },
  outlineButton: {
    backgroundColor: "transparent",
    borderWidth: 1,
    borderColor: colors.primary.accent,
  },
  textButton: {
    backgroundColor: "transparent",
    paddingHorizontal: 0,
    paddingVertical: 4,
  },
  disabledButton: {
    opacity: 0.5,
  },
  buttonText: {
    fontWeight: "600",
    textAlign: "center",
  },
  smallText: {
    ...typography.caption,
  },
  mediumText: {
    ...typography.body,
  },
  largeText: {
    ...typography.heading4,
  },
  primaryText: {
    color: "#FFFFFF",
  },
  secondaryText: {
    color: colors.primary.accent,
  },
  outlineText: {
    color: colors.primary.accent,
  },
  textButtonText: {
    color: colors.primary.accent,
  },
  disabledText: {
    opacity: 0.8,
  },
  contentContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  iconLeft: {
    marginRight: 8,
  },
  iconRight: {
    marginLeft: 8,
  },
});