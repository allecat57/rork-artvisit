import React from 'react';
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  ActivityIndicator,
  ViewStyle,
  TextStyle,
  StyleProp,
  View,
} from 'react-native';
import colors from '@/constants/colors';
import typography from '@/constants/typography';
import * as Analytics from '@/utils/analytics';

interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'outline' | 'text';
  size?: 'small' | 'medium' | 'large';
  disabled?: boolean;
  loading?: boolean;
  style?: StyleProp<ViewStyle>;
  textStyle?: StyleProp<TextStyle>;
  analyticsEventName?: string;
  analyticsProperties?: Record<string, any>;
  analyticsParams?: Record<string, any>; // Added for backward compatibility
  icon?: React.ReactNode;
}

const Button: React.FC<ButtonProps> = ({
  title,
  onPress,
  variant = 'primary',
  size = 'medium',
  disabled = false,
  loading = false,
  style,
  textStyle,
  analyticsEventName,
  analyticsProperties = {},
  analyticsParams = {}, // Added for backward compatibility
  icon,
}) => {
  const handlePress = () => {
    if (analyticsEventName) {
      // Use analyticsProperties first, then fall back to analyticsParams for backward compatibility
      const eventProperties = Object.keys(analyticsProperties).length > 0 
        ? analyticsProperties 
        : analyticsParams;
      Analytics.logEvent(analyticsEventName, eventProperties);
    }
    onPress();
  };

  const getButtonStyle = () => {
    switch (variant) {
      case 'primary':
        return styles.primaryButton;
      case 'secondary':
        return styles.secondaryButton;
      case 'outline':
        return styles.outlineButton;
      case 'text':
        return styles.textButton;
      default:
        return styles.primaryButton;
    }
  };

  const getTextStyle = () => {
    switch (variant) {
      case 'primary':
        return styles.primaryText;
      case 'secondary':
        return styles.secondaryText;
      case 'outline':
        return styles.outlineText;
      case 'text':
        return styles.textButtonText;
      default:
        return styles.primaryText;
    }
  };

  const getSizeStyle = () => {
    switch (size) {
      case 'small':
        return styles.smallButton;
      case 'medium':
        return styles.mediumButton;
      case 'large':
        return styles.largeButton;
      default:
        return styles.mediumButton;
    }
  };

  const getTextSizeStyle = () => {
    switch (size) {
      case 'small':
        return styles.smallText;
      case 'medium':
        return styles.mediumText;
      case 'large':
        return styles.largeText;
      default:
        return styles.mediumText;
    }
  };

  const renderContent = () => {
    if (loading) {
      return (
        <ActivityIndicator
          color={variant === 'primary' ? '#013025' : '#AC8901'}
          size={size === 'small' ? 'small' : 'small'}
        />
      );
    }

    if (icon && title) {
      return (
        <View style={styles.contentWithIcon}>
          {icon}
          <Text
            style={[
              styles.text,
              getTextStyle(),
              getTextSizeStyle(),
              disabled && styles.disabledText,
              textStyle,
              styles.textWithIcon,
            ]}
          >
            {title}
          </Text>
        </View>
      );
    }

    return (
      <Text
        style={[
          styles.text,
          getTextStyle(),
          getTextSizeStyle(),
          disabled && styles.disabledText,
          textStyle,
        ]}
      >
        {title}
      </Text>
    );
  };

  return (
    <TouchableOpacity
      style={[
        styles.button,
        getButtonStyle(),
        getSizeStyle(),
        disabled && styles.disabledButton,
        style,
      ]}
      onPress={handlePress}
      disabled={disabled || loading}
      activeOpacity={0.8}
    >
      {renderContent()}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: 44,
  },
  primaryButton: {
    backgroundColor: '#AC8901',
  },
  secondaryButton: {
    backgroundColor: '#1a4037',
    borderWidth: 1,
    borderColor: '#AC8901',
  },
  outlineButton: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: '#AC8901',
  },
  textButton: {
    backgroundColor: 'transparent',
  },
  disabledButton: {
    opacity: 0.5,
  },
  text: {
    fontWeight: '600',
    textAlign: 'center',
  },
  primaryText: {
    color: '#013025',
  },
  secondaryText: {
    color: '#AC8901',
  },
  outlineText: {
    color: '#AC8901',
  },
  textButtonText: {
    color: '#AC8901',
  },
  disabledText: {
    opacity: 0.7,
  },
  smallButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    minHeight: 36,
  },
  mediumButton: {
    paddingVertical: 12,
    paddingHorizontal: 24,
    minHeight: 44,
  },
  largeButton: {
    paddingVertical: 16,
    paddingHorizontal: 32,
    minHeight: 52,
  },
  smallText: {
    ...typography.buttonSmall,
    fontSize: 14,
  },
  mediumText: {
    ...typography.button,
    fontSize: 16,
  },
  largeText: {
    ...typography.button,
    fontSize: 18,
  },
  contentWithIcon: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  textWithIcon: {
    marginLeft: 8,
  },
});

export default Button;