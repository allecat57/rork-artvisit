import React, { useState, useEffect } from "react";
import { StyleSheet, Text, View, TouchableOpacity, ScrollView, Alert, Platform, Image } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { 
  User, 
  Bell, 
  HelpCircle, 
  LogOut, 
  Heart, 
  Camera,
  CreditCard,
  Shield,
  Ticket,
  ShoppingBag,
  CheckCircle,
  Crown,
  ChevronRight,
  Star,
  Zap
} from "lucide-react-native";
import * as ImagePicker from "expo-image-picker";
import { useRouter } from "expo-router";
import colors from "@/constants/colors";
import typography from "@/constants/typography";
import { useProfileStore } from "@/store/useProfileStore";
import { useFavoritesStore } from "@/store/useFavoritesStore";
import { useVisitHistoryStore } from "@/store/useVisitHistoryStore";
import { useAuthStore } from "@/store/useAuthStore";
import { usePurchaseHistoryStore } from "@/store/usePurchaseHistoryStore";
import PaymentMethodModal, { PaymentDetails } from "@/components/PaymentMethodModal";
import SubscriptionModal from "@/components/SubscriptionModal";
import PrivacySettingsModal from "@/components/PrivacySettingsModal";
import NotificationsModal from "@/components/NotificationsModal";
import HelpCenterModal from "@/components/HelpCenterModal";
import * as Analytics from "@/utils/analytics";

interface ProfileOptionProps {
  icon: React.ReactNode;
  title: string;
  onPress: () => void;
  badge?: number;
  rightContent?: React.ReactNode;
  analyticsEventName?: string;
  analyticsParams?: Record<string, any>;
}

const ProfileOption = ({ 
  icon, 
  title, 
  onPress, 
  badge, 
  rightContent,
  analyticsEventName,
  analyticsParams
}: ProfileOptionProps) => {
  const handlePress = () => {
    // Log analytics event if provided
    if (analyticsEventName) {
      Analytics.logEvent(analyticsEventName, {
        option_title: title,
        ...analyticsParams
      });
    }
    
    onPress();
  };

  return (
    <TouchableOpacity style={styles.optionContainer} onPress={handlePress}>
      <View style={styles.optionIconContainer}>{icon}</View>
      <Text style={[typography.body, styles.optionTitle]}>{title}</Text>
      {badge !== undefined && badge > 0 ? (
        <View style={styles.badgeContainer}>
          <Text style={styles.badgeText}>{badge}</Text>
        </View>
      ) : rightContent ? (
        rightContent
      ) : (
        <ChevronRight size={20} color={colors.primary.muted} />
      )}
    </TouchableOpacity>
  );
};

export default function ProfileScreen() {
  const router = useRouter();
  const { getCurrentProfileImage, getCurrentPaymentMethod, getCurrentSubscription, setProfileImage, setPaymentMethod } = useProfileStore();
  const { getCurrentUserFavorites } = useFavoritesStore();
  const { getCurrentUserVisits } = useVisitHistoryStore();
  const { getCurrentUserPurchases } = usePurchaseHistoryStore();
  const { user, logout, isAuthenticated, isHydrated } = useAuthStore();
  
  const [paymentModalVisible, setPaymentModalVisible] = useState(false);
  const [subscriptionModalVisible, setSubscriptionModalVisible] = useState(false);
  const [privacyModalVisible, setPrivacyModalVisible] = useState(false);
  const [notificationsModalVisible, setNotificationsModalVisible] = useState(false);
  const [helpCenterModalVisible, setHelpCenterModalVisible] = useState(false);
  
  const profileImage = getCurrentProfileImage();
  const paymentMethod = getCurrentPaymentMethod();
  const subscription = getCurrentSubscription();
  const favorites = getCurrentUserFavorites();
  const visits = getCurrentUserVisits();
  const purchases = getCurrentUserPurchases();
  
  // Check authentication status
  useEffect(() => {
    if (isHydrated && !isAuthenticated) {
      router.replace("/login");
    }
  }, [isAuthenticated, isHydrated, router]);
  
  const handleNotImplemented = () => {
    // Log not implemented event
    Analytics.logEvent("feature_not_implemented", {
      screen: "profile"
    });
    
    Alert.alert(
      "Not Implemented",
      "This feature is not implemented in the demo.",
      [{ text: "OK" }]
    );
  };
  
  const handleChangeProfilePhoto = async () => {
    try {
      const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
      
      if (permissionResult.granted === false) {
        // Log permission denied
        Analytics.logEvent("permission_denied", {
          permission: "photo_library",
          screen: "profile"
        });
        
        Alert.alert("Permission Required", "You need to grant permission to access your photos");
        return;
      }
      
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });
      
      if (!result.canceled) {
        // Log profile photo change
        Analytics.logEvent(Analytics.Events.UPDATE_PROFILE, {
          update_type: "profile_photo"
        });
        
        setProfileImage(result.assets[0].uri);
      }
    } catch (error) {
      // Log error
      Analytics.logEvent("profile_photo_error", {
        error_message: error instanceof Error ? error.message : "Unknown error"
      });
      
      console.error("Error picking image:", error);
      Alert.alert("Error", "There was an error selecting your image");
    }
  };

  const handleSavePaymentMethod = (paymentDetails: PaymentDetails) => {
    // In a real app, you would securely send this to your backend
    // For this demo, we'll just store the last 4 digits of the card
    const cardNumber = paymentDetails.cardNumber.replace(/\s/g, "");
    const last4 = cardNumber.length >= 4 ? cardNumber.substring(cardNumber.length - 4) : "****";
    
    // Log payment method update
    Analytics.logEvent(Analytics.Events.UPDATE_PAYMENT_METHOD, {
      card_type: getCardType(cardNumber),
      is_new_card: !paymentMethod
    });
    
    setPaymentMethod({
      cardType: getCardType(cardNumber),
      last4: last4,
      expirationDate: paymentDetails.expirationDate
    });
    
    Alert.alert(
      "Payment Method Updated",
      "Your payment information has been saved successfully.",
      [{ text: "OK" }]
    );
  };
  
  const getCardType = (cardNumber: string) => {
    if (!cardNumber || cardNumber.length < 1) {
      return "Credit Card";
    }
    // Very basic card type detection based on first digit
    const firstDigit = cardNumber.charAt(0);
    
    if (firstDigit === "4") return "Visa";
    if (firstDigit === "5") return "Mastercard";
    if (firstDigit === "3") return "American Express";
    if (firstDigit === "6") return "Discover";
    
    return "Credit Card";
  };
  
  const handleLogout = () => {
    Alert.alert(
      "Log Out",
      "Are you sure you want to log out?",
      [
        {
          text: "Cancel",
          style: "cancel"
        },
        {
          text: "Log Out",
          style: "destructive",
          onPress: async () => {
            try {
              // Log logout event
              Analytics.logEvent(Analytics.Events.LOGOUT);
              
              // Perform logout
              await logout();
              
              // Force navigation to login screen
              console.log("Logout successful, navigating to login screen");
              router.replace("/login");
            } catch (error) {
              console.error("Error during logout:", error);
              Alert.alert(
                "Logout Error",
                "There was a problem logging out. Please try again."
              );
            }
          }
        }
      ]
    );
  };

  const getSubscriptionBadge = () => {
    if (!subscription) return null;
    
    let color = "#E0E0E0";
    let icon = <Ticket size={16} color="#FFFFFF" />;
    
    if (subscription.id === "free") {
      color = "#4CAF50";
      icon = <Zap size={16} color="#FFFFFF" />;
    } else if (subscription.id === "explorer") {
      color = "#FFD700";
      icon = <Star size={16} color="#FFFFFF" />;
    } else if (subscription.id === "collector") {
      color = "#9C27B0";
      icon = <Crown size={16} color="#FFFFFF" />;
    }
    
    return (
      <View style={[styles.subscriptionBadge, { backgroundColor: color }]}>
        {icon}
        <Text style={styles.subscriptionBadgeText}>{subscription.name}</Text>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={["bottom"]}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <TouchableOpacity 
            style={styles.avatarContainer}
            onPress={handleChangeProfilePhoto}
          >
            {profileImage ? (
              <Image source={{ uri: profileImage }} style={styles.avatar} />
            ) : (
              <User size={40} color={colors.primary.accent} />
            )}
            <View style={styles.cameraIconContainer}>
              <Camera size={16} color={colors.primary.background} />
            </View>
          </TouchableOpacity>
          <Text style={[typography.heading2, styles.name]}>{user?.name || "Guest User"}</Text>
          <Text style={[typography.body, styles.email]}>{user?.email || "guest@example.com"}</Text>
          
          {subscription && getSubscriptionBadge()}
          
          <TouchableOpacity 
            style={styles.editButton}
            onPress={handleNotImplemented}
          >
            <Text style={styles.editButtonText}>Edit Profile</Text>
          </TouchableOpacity>
        </View>
        
        <View style={styles.section}>
          <Text style={[typography.heading3, styles.sectionTitle]}>Your Activity</Text>
          <ProfileOption
            icon={<CheckCircle size={22} color={colors.primary.accent} />}
            title="Visit History"
            onPress={() => router.push("/visit-history")}
            badge={visits.length}
            analyticsEventName="view_visit_history"
          />
          <ProfileOption
            icon={<Heart size={22} color={colors.primary.accent} />}
            title="Favorite Venues"
            onPress={() => router.push("/favorites")}
            badge={favorites.length}
            analyticsEventName="view_favorites"
          />
          <ProfileOption
            icon={<ShoppingBag size={22} color={colors.primary.accent} />}
            title="Purchase History"
            onPress={() => router.push("/purchase-history")}
            badge={purchases.length}
            analyticsEventName="view_purchase_history"
          />
        </View>
        
        <View style={styles.section}>
          <Text style={[typography.heading3, styles.sectionTitle]}>Settings</Text>
          <ProfileOption
            icon={<Camera size={22} color={colors.primary.accent} />}
            title="Change Profile Photo"
            onPress={handleChangeProfilePhoto}
            analyticsEventName="change_profile_photo_tap"
          />
          <ProfileOption
            icon={<CreditCard size={22} color={colors.primary.accent} />}
            title="Update Payment Method"
            onPress={() => {
              Analytics.logEvent("open_payment_method_modal");
              setPaymentModalVisible(true);
            }}
            analyticsEventName="update_payment_method_tap"
          />
          {paymentMethod && (
            <View style={styles.paymentInfoContainer}>
              <Text style={styles.paymentInfoText}>
                {paymentMethod.cardType} •••• {paymentMethod.last4} | Expires: {paymentMethod.expirationDate}
              </Text>
            </View>
          )}
          <ProfileOption
            icon={<Ticket size={22} color={colors.primary.accent} />}
            title="Manage Subscription"
            onPress={() => {
              Analytics.logEvent("open_subscription_modal");
              setSubscriptionModalVisible(true);
            }}
            analyticsEventName="manage_subscription_tap"
            rightContent={
              subscription ? (
                <View style={styles.subscriptionInfo}>
                  <Text style={styles.subscriptionPrice}>
                    {subscription.id === "free" ? "Free" : `$${subscription.price.toFixed(2)}/mo`}
                  </Text>
                </View>
              ) : (
                <ChevronRight size={20} color={colors.primary.muted} />
              )
            }
          />
          <ProfileOption
            icon={<Shield size={22} color={colors.primary.accent} />}
            title="Privacy Settings"
            onPress={() => {
              Analytics.logEvent("open_privacy_settings_modal");
              setPrivacyModalVisible(true);
            }}
            analyticsEventName="privacy_settings_tap"
          />
          <ProfileOption
            icon={<Bell size={22} color={colors.primary.accent} />}
            title="Notifications"
            onPress={() => {
              Analytics.logEvent("open_notifications_modal");
              setNotificationsModalVisible(true);
            }}
            analyticsEventName="notifications_tap"
          />
        </View>
        
        <View style={styles.section}>
          <Text style={[typography.heading3, styles.sectionTitle]}>Support</Text>
          <ProfileOption
            icon={<HelpCircle size={22} color={colors.primary.accent} />}
            title="Help Center"
            onPress={() => {
              Analytics.logEvent(Analytics.Events.OPEN_HELP_CENTER);
              setHelpCenterModalVisible(true);
            }}
            analyticsEventName="help_center_tap"
          />
        </View>
        
        <TouchableOpacity 
          style={styles.logoutButton}
          onPress={handleLogout}
        >
          <LogOut size={20} color={colors.status.error} />
          <Text style={styles.logoutText}>Log Out</Text>
        </TouchableOpacity>
        
        <Text style={styles.versionText}>Version 1.0.0</Text>
      </ScrollView>
      
      <PaymentMethodModal
        visible={paymentModalVisible}
        onClose={() => setPaymentModalVisible(false)}
        onSave={handleSavePaymentMethod}
      />
      
      <SubscriptionModal
        visible={subscriptionModalVisible}
        onClose={() => setSubscriptionModalVisible(false)}
      />

      <PrivacySettingsModal
        visible={privacyModalVisible}
        onClose={() => setPrivacyModalVisible(false)}
      />

      <NotificationsModal
        visible={notificationsModalVisible}
        onClose={() => setNotificationsModalVisible(false)}
      />

      <HelpCenterModal
        visible={helpCenterModalVisible}
        onClose={() => setHelpCenterModalVisible(false)}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.primary.background,
  },
  header: {
    alignItems: "center",
    paddingVertical: 24,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.primary.border,
  },
  avatarContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: colors.primary.secondary,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 16,
    position: "relative",
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
  },
  cameraIconContainer: {
    position: "absolute",
    bottom: 0,
    right: 0,
    backgroundColor: colors.primary.accent,
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    borderColor: colors.primary.background,
  },
  name: {
    marginBottom: 4,
  },
  email: {
    color: colors.primary.muted,
    marginBottom: 16,
  },
  subscriptionBadge: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    marginBottom: 16,
  },
  subscriptionBadgeText: {
    ...typography.bodySmall,
    color: "#FFFFFF",
    fontWeight: "600",
    marginLeft: 6,
  },
  editButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: colors.primary.accent,
  },
  editButtonText: {
    ...typography.bodySmall,
    color: colors.primary.accent,
    fontWeight: "600",
  },
  section: {
    paddingVertical: 16,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.primary.border,
  },
  sectionTitle: {
    marginBottom: 16,
  },
  optionContainer: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
  },
  optionIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(172, 137, 1, 0.1)",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 16,
  },
  optionTitle: {
    flex: 1,
  },
  badgeContainer: {
    backgroundColor: colors.primary.accent,
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 2,
    minWidth: 24,
    alignItems: "center",
  },
  badgeText: {
    ...typography.caption,
    color: colors.primary.background,
    fontWeight: "bold",
  },
  paymentInfoContainer: {
    backgroundColor: colors.primary.card,
    borderRadius: 8,
    padding: 12,
    marginLeft: 56,
    marginBottom: 16,
    marginTop: -8,
  },
  paymentInfoText: {
    ...typography.bodySmall,
    color: colors.primary.muted,
  },
  subscriptionInfo: {
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  subscriptionPrice: {
    ...typography.bodySmall,
    color: colors.primary.accent,
    fontWeight: "600",
  },
  logoutButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 16,
    marginTop: 24,
    marginHorizontal: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.status.error,
  },
  logoutText: {
    ...typography.body,
    color: colors.status.error,
    fontWeight: "600",
    marginLeft: 8,
  },
  versionText: {
    ...typography.caption,
    color: colors.primary.muted,
    textAlign: "center",
    marginTop: 16,
    marginBottom: 24,
  },
});