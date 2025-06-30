import React from "react";
import { StyleSheet, Text, View, TouchableOpacity } from "react-native";
import { Lock, Crown, Star, Ticket } from "lucide-react-native";
import colors from "@/constants/colors";
import typography from "@/constants/typography";
import { AccessLevel } from "@/types/event";
import * as Analytics from "@/utils/analytics";

interface SubscriptionRequiredCardProps {
  requiredLevel: AccessLevel;
  onUpgrade: () => void;
  onClose: () => void;
}

export default function SubscriptionRequiredCard({ 
  requiredLevel, 
  onUpgrade,
  onClose
}: SubscriptionRequiredCardProps) {
  const getAccessLevelIcon = () => {
    switch (requiredLevel) {
      case AccessLevel.COLLECTOR:
        return <Crown size={24} color="#9C27B0" />;
      case AccessLevel.EXPLORER:
        return <Star size={24} color="#FFD700" />;
      case AccessLevel.ESSENTIAL:
        return <Ticket size={24} color={colors.primary.accent} />;
      default:
        return <Lock size={24} color={colors.primary.muted} />;
    }
  };
  
  const getAccessLevelColor = () => {
    switch (requiredLevel) {
      case AccessLevel.COLLECTOR:
        return "#9C27B0";
      case AccessLevel.EXPLORER:
        return "#FFD700";
      case AccessLevel.ESSENTIAL:
        return colors.primary.accent;
      default:
        return colors.primary.muted;
    }
  };
  
  const getAccessLevelName = () => {
    switch (requiredLevel) {
      case AccessLevel.COLLECTOR:
        return "Master Collector";
      case AccessLevel.EXPLORER:
        return "Art Explorer";
      case AccessLevel.ESSENTIAL:
        return "Essential Pass";
      default:
        return "Subscription";
    }
  };
  
  const getAccessLevelDescription = () => {
    switch (requiredLevel) {
      case AccessLevel.COLLECTOR:
        return "Upgrade to Master Collector to access VIP events, private gallery openings, and exclusive collector dinners.";
      case AccessLevel.EXPLORER:
        return "Upgrade to Art Explorer to access exclusive event invitations, priority booking, and behind-the-scenes content.";
      case AccessLevel.ESSENTIAL:
        return "Upgrade to Essential Pass to access event invitations and early access notifications.";
      default:
        return "Upgrade your subscription to access this content.";
    }
  };
  
  const handleUpgrade = () => {
    // Log analytics event
    Analytics.logEvent("subscription_upgrade_prompt", {
      required_level: requiredLevel,
      source: "events_page"
    });
    
    onUpgrade();
  };
  
  return (
    <View style={styles.container}>
      <TouchableOpacity 
        style={styles.closeButton}
        onPress={onClose}
      >
        <Text style={styles.closeButtonText}>×</Text>
      </TouchableOpacity>
      
      <View style={[styles.iconContainer, { backgroundColor: `${getAccessLevelColor()}20` }]}>
        {getAccessLevelIcon()}
      </View>
      
      <Text style={[typography.heading3, styles.title]}>
        {getAccessLevelName()} Required
      </Text>
      
      <Text style={styles.description}>
        {getAccessLevelDescription()}
      </Text>
      
      <TouchableOpacity 
        style={[styles.upgradeButton, { backgroundColor: getAccessLevelColor() }]}
        onPress={handleUpgrade}
      >
        <Text style={styles.upgradeButtonText}>Upgrade Subscription</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.primary.card,
    borderRadius: 12,
    padding: 24,
    alignItems: "center",
    marginVertical: 16,
    borderWidth: 1,
    borderColor: colors.primary.border,
    position: "relative",
  },
  closeButton: {
    position: "absolute",
    top: 10,
    right: 10,
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: colors.primary.border,
    justifyContent: "center",
    alignItems: "center",
  },
  closeButtonText: {
    fontSize: 20,
    color: colors.primary.text,
    fontWeight: "bold",
  },
  iconContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 16,
  },
  title: {
    marginBottom: 12,
    textAlign: "center",
    color: colors.primary.text,
  },
  description: {
    ...typography.body,
    color: colors.primary.muted,
    textAlign: "center",
    marginBottom: 24,
  },
  upgradeButton: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 24,
  },
  upgradeButtonText: {
    ...typography.body,
    color: "#FFFFFF",
    fontWeight: "600",
  },
});