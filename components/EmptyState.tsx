import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { Calendar, Ticket, Heart, Clock, ShoppingBag, Map, Search } from "lucide-react-native";
import colors from "@/constants/colors";
import typography from "@/constants/typography";

interface EmptyStateProps {
  icon?: React.ReactNode;
  iconName?: string;
  title: string;
  message: string;
  action?: React.ReactNode;
}

export default function EmptyState({ 
  icon, 
  iconName,
  title, 
  message, 
  action 
}: EmptyStateProps) {
  // Render icon based on iconName if no custom icon is provided
  const renderIcon = () => {
    if (icon) return icon;
    
    if (iconName) {
      const size = 64;
      const color = colors.primary.muted;
      
      switch (iconName) {
        case "Calendar":
          return <Calendar size={size} color={color} />;
        case "Ticket":
          return <Ticket size={size} color={color} />;
        case "Heart":
          return <Heart size={size} color={color} />;
        case "Clock":
          return <Clock size={size} color={color} />;
        case "ShoppingBag":
          return <ShoppingBag size={size} color={color} />;
        case "Map":
          return <Map size={size} color={color} />;
        case "Search":
          return <Search size={size} color={color} />;
        default:
          return <Calendar size={size} color={color} />;
      }
    }
    
    // Default icon if none provided
    return <Calendar size={64} color={colors.primary.muted} />;
  };
  
  return (
    <View style={styles.container}>
      <View style={styles.iconContainer}>
        {renderIcon()}
      </View>
      <Text style={[typography.heading3, styles.title]}>
        {title}
      </Text>
      <Text style={[typography.body, styles.message]}>
        {message}
      </Text>
      {action && (
        <View style={styles.actionContainer}>
          {action}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
    minHeight: 300,
  },
  iconContainer: {
    marginBottom: 20,
  },
  title: {
    textAlign: "center",
    marginBottom: 12,
  },
  message: {
    textAlign: "center",
    color: colors.primary.muted,
    marginBottom: 24,
  },
  actionContainer: {
    width: "100%",
    maxWidth: 250,
  },
});