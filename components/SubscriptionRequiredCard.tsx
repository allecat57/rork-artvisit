import React from "react";
import { StyleSheet, Text, View, TouchableOpacity, Modal } from "react-native";
import { X, Crown, Star, Ticket } from "lucide-react-native";
import colors from "@/constants/colors";
import typography from "@/constants/typography";
import { AccessLevel } from "@/types/event";
import Button from "./Button";

interface SubscriptionRequiredCardProps {
  requiredLevel: AccessLevel;
  onUpgrade: () => void;
  onClose: () => void;
}

export default function SubscriptionRequiredCard({
  requiredLevel,
  onUpgrade,
  onClose,
}: SubscriptionRequiredCardProps) {
  const getAccessLevelInfo = (level: AccessLevel) => {
    switch (level) {
      case AccessLevel.COLLECTOR:
        return {
          icon: <Crown size={24} color={colors.accent} />,
          title: "Collector Subscription Required",
          description: "This exclusive event is only available to Collector members.",
          color: colors.accent
        };
      case AccessLevel.EXPLORER:
        return {
          icon: <Star size={24} color={colors.accent} />,
          title: "Explorer Subscription Required", 
          description: "This event requires an Explorer subscription or higher.",
          color: colors.muted
        };
      case AccessLevel.ESSENTIAL:
        return {
          icon: <Ticket size={24} color={colors.accent} />,
          title: "Essential Subscription Required",
          description: "This event requires an Essential subscription or higher.",
          color: colors.accent
        };
      default:
        return {
          icon: <Ticket size={24} color={colors.accent} />,
          title: "Subscription Required",
          description: "This event requires a subscription to access.",
          color: colors.accent
        };
    }
  };

  const levelInfo = getAccessLevelInfo(requiredLevel);

  return (
    <Modal
      visible={true}
      transparent={true}
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={styles.container}>
          <TouchableOpacity style={styles.closeButton} onPress={onClose}>
            <X size={24} color={colors.text} />
          </TouchableOpacity>
          
          <View style={styles.content}>
            <View style={styles.iconContainer}>
              {levelInfo.icon}
            </View>
            
            <Text style={styles.title}>{levelInfo.title}</Text>
            <Text style={styles.description}>{levelInfo.description}</Text>
            
            <View style={styles.buttonContainer}>
              <Button
                title="Upgrade Subscription"
                onPress={onUpgrade}
                variant="primary"
                style={styles.upgradeButton}
              />
              
              <Button
                title="Maybe Later"
                onPress={onClose}
                variant="outline"
                style={styles.cancelButton}
              />
            </View>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  container: {
    backgroundColor: colors.card,
    borderRadius: 16,
    padding: 24,
    width: "100%",
    maxWidth: 400,
    position: "relative",
    borderWidth: 1,
    borderColor: colors.border,
  },
  closeButton: {
    position: "absolute",
    top: 16,
    right: 16,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.border,
    justifyContent: "center",
    alignItems: "center",
  },
  content: {
    alignItems: "center",
    paddingTop: 20,
  },
  iconContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: colors.background,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 16,
  },
  title: {
    ...typography.heading3,
    color: colors.text,
    textAlign: "center",
    marginBottom: 8,
  },
  description: {
    ...typography.body,
    color: colors.muted,
    textAlign: "center",
    marginBottom: 24,
    lineHeight: 20,
  },
  buttonContainer: {
    width: "100%",
    gap: 12,
  },
  upgradeButton: {
    marginBottom: 0,
  },
  cancelButton: {
    marginBottom: 0,
  },
});