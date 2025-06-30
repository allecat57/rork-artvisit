import React from "react";
import { View, Text, StyleSheet, TouchableOpacity, Modal } from "react-native";
import { X, Crown, Star, Diamond } from "lucide-react-native";
import colors from "@/constants/colors";
import typography from "@/constants/typography";
import Button from "./Button";
import { AccessLevel } from "@/types/event";

interface SubscriptionRequiredCardProps {
  requiredLevel: AccessLevel;
  onUpgrade: () => void;
  onClose: () => void;
}

const getSubscriptionInfo = (level: AccessLevel) => {
  switch (level) {
    case AccessLevel.ESSENTIAL:
      return {
        name: "Essential",
        icon: <Star size={24} color={colors.accent} />,
        description: "Access to basic events and exhibitions",
        color: colors.accent
      };
    case AccessLevel.EXPLORER:
      return {
        name: "Explorer",
        icon: <Crown size={24} color={colors.accent} />,
        description: "Access to premium events, workshops, and tours",
        color: colors.accent
      };
    case AccessLevel.COLLECTOR:
      return {
        name: "Collector",
        icon: <Diamond size={24} color={colors.textMuted} />,
        description: "VIP access to exclusive events and private collections",
        color: colors.textMuted
      };
    default:
      return {
        name: "Essential",
        icon: <Star size={24} color={colors.accent} />,
        description: "Access to basic events and exhibitions",
        color: colors.accent
      };
  }
};

export default function SubscriptionRequiredCard({
  requiredLevel,
  onUpgrade,
  onClose,
}: SubscriptionRequiredCardProps) {
  const subscriptionInfo = getSubscriptionInfo(requiredLevel);
  
  return (
    <Modal
      visible={true}
      animationType="fade"
      transparent={true}
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContainer}>
          <View style={styles.header}>
            <Text style={styles.title}>Subscription Required</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <X size={24} color={colors.text} />
            </TouchableOpacity>
          </View>
          
          <View style={styles.content}>
            <View style={styles.iconContainer}>
              {subscriptionInfo.icon}
            </View>
            
            <Text style={styles.subscriptionName}>
              {subscriptionInfo.name} Membership Required
            </Text>
            
            <Text style={styles.description}>
              This event requires a {subscriptionInfo.name} membership or higher to access.
            </Text>
            
            <Text style={styles.features}>
              {subscriptionInfo.description}
            </Text>
          </View>
          
          <View style={styles.actions}>
            <Button
              title="View Subscriptions"
              onPress={onUpgrade}
              style={styles.upgradeButton}
            />
            
            <TouchableOpacity onPress={onClose} style={styles.cancelButton}>
              <Text style={styles.cancelButtonText}>Maybe Later</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  modalContainer: {
    backgroundColor: colors.card,
    borderRadius: 16,
    padding: 24,
    width: "100%",
    maxWidth: 400,
    borderWidth: 1,
    borderColor: colors.border,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  title: {
    ...typography.heading3,
    color: colors.text,
  },
  closeButton: {
    padding: 4,
  },
  content: {
    alignItems: "center",
    marginBottom: 24,
  },
  iconContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: colors.background,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 16,
    borderWidth: 1,
    borderColor: colors.border,
  },
  subscriptionName: {
    ...typography.heading4,
    color: colors.text,
    textAlign: "center",
    marginBottom: 8,
  },
  description: {
    ...typography.body,
    color: colors.text,
    textAlign: "center",
    marginBottom: 12,
  },
  features: {
    ...typography.bodySmall,
    color: colors.textMuted,
    textAlign: "center",
  },
  actions: {
    gap: 12,
  },
  upgradeButton: {
    marginBottom: 0,
  },
  cancelButton: {
    padding: 12,
    alignItems: "center",
  },
  cancelButtonText: {
    ...typography.body,
    color: colors.textMuted,
  },
});