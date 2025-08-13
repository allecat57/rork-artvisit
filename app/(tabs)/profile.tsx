import React, { useState, useEffect } from "react";
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  Alert,
  Platform,
} from "react-native";
import { useRouter } from "expo-router";
import { Image } from "expo-image";
import * as ImagePicker from "expo-image-picker";
import {
  User,
  Settings,
  CreditCard,
  Heart,
  Clock,
  ShoppingBag,
  Calendar,
  Bell,
  Shield,
  HelpCircle,
  LogOut,
  ChevronRight,
  Star,
  Crown,
  Camera,
  Database,
} from "lucide-react-native";
import colors from "@/constants/colors";
import typography from "@/constants/typography";
import { useAuthStore } from "@/store/useAuthStore";
import { useProfileStore } from "@/store/useProfileStore";
import SubscriptionModal from "@/components/SubscriptionModal";
import PrivacySettingsModal from "@/components/PrivacySettingsModal";
import NotificationsModal from "@/components/NotificationsModal";
import HelpCenterModal from "@/components/HelpCenterModal";
import { CacheClearButton } from "@/components/CacheClearButton";
import * as Analytics from "@/utils/analytics";

const fontFamily = Platform.select({
  ios: "Georgia",
  android: "serif",
  default: "Georgia, serif",
});

interface MenuItemProps {
  icon: React.ReactNode;
  title: string;
  subtitle?: string;
  onPress: () => void;
  showChevron?: boolean;
  badge?: string;
}

const MenuItem: React.FC<MenuItemProps> = ({
  icon,
  title,
  subtitle,
  onPress,
  showChevron = true,
  badge,
}) => (
  <TouchableOpacity style={styles.menuItem} onPress={onPress} activeOpacity={0.7}>
    <View style={styles.menuItemLeft}>
      <View style={styles.menuItemIcon}>{icon}</View>
      <View style={styles.menuItemContent}>
        <Text style={styles.menuItemTitle}>{title}</Text>
        {subtitle && <Text style={styles.menuItemSubtitle}>{subtitle}</Text>}
      </View>
    </View>
    <View style={styles.menuItemRight}>
      {badge && (
        <View style={styles.badge}>
          <Text style={styles.badgeText}>{badge}</Text>
        </View>
      )}
      {showChevron && <ChevronRight size={20} color={colors.textSecondary} />}
    </View>
  </TouchableOpacity>
);

export default function ProfileScreen() {
  const router = useRouter();
  const { user, logout, updateUser } = useAuthStore();
  const { getCurrentSubscription, getCurrentPaymentMethod } = useProfileStore();
  
  const [showSubscriptionModal, setShowSubscriptionModal] = useState(false);
  const [showPrivacyModal, setShowPrivacyModal] = useState(false);
  const [showNotificationsModal, setShowNotificationsModal] = useState(false);
  const [showHelpModal, setShowHelpModal] = useState(false);

  const subscription = getCurrentSubscription();
  const paymentMethod = getCurrentPaymentMethod();

  useEffect(() => {
    Analytics.logScreenView("Profile");
  }, []);

  const handleChangeProfilePhoto = async () => {
    try {
      // Request permission
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert(
          'Permission Required',
          'Please grant permission to access your photo library to change your profile photo.'
        );
        return;
      }

      // Show action sheet
      Alert.alert(
        'Change Profile Photo',
        'Choose how you\'d like to update your profile photo',
        [
          {
            text: 'Take Photo',
            onPress: async () => {
              const cameraPermission = await ImagePicker.requestCameraPermissionsAsync();
              if (cameraPermission.status !== 'granted') {
                Alert.alert('Permission Required', 'Camera permission is required to take a photo.');
                return;
              }
              
              const result = await ImagePicker.launchCameraAsync({
                mediaTypes: ImagePicker.MediaTypeOptions.Images,
                allowsEditing: true,
                aspect: [1, 1],
                quality: 0.8,
              });
              
              if (!result.canceled && result.assets[0]) {
                updateProfilePhoto(result.assets[0].uri);
              }
            }
          },
          {
            text: 'Choose from Library',
            onPress: async () => {
              const result = await ImagePicker.launchImageLibraryAsync({
                mediaTypes: ImagePicker.MediaTypeOptions.Images,
                allowsEditing: true,
                aspect: [1, 1],
                quality: 0.8,
              });
              
              if (!result.canceled && result.assets[0]) {
                updateProfilePhoto(result.assets[0].uri);
              }
            }
          },
          {
            text: 'Cancel',
            style: 'cancel'
          }
        ]
      );
    } catch (error) {
      console.error('Error changing profile photo:', error);
      Alert.alert('Error', 'Failed to change profile photo. Please try again.');
    }
  };

  const updateProfilePhoto = (uri: string) => {
    if (!user) return;
    
    try {
      // Update the user with new avatar
      updateUser({ avatar: uri });
      
      Alert.alert('Success', 'Profile photo updated successfully!');
    } catch (error) {
      console.error('Error updating profile photo:', error);
      Alert.alert('Error', 'Failed to update profile photo. Please try again.');
    }
  };

  const handleLogout = () => {
    Alert.alert(
      "Sign Out",
      "Are you sure you want to sign out?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Sign Out",
          style: "destructive",
          onPress: async () => {
            try {
              Analytics.logEvent(Analytics.Events.USER_LOGOUT, {
                user_id: user?.id
              });
              await logout();
              router.replace("/login");
            } catch (error) {
              console.error("Logout error:", error);
              Alert.alert("Error", "Failed to sign out. Please try again.");
            }
          },
        },
      ]
    );
  };

  const getSubscriptionBadge = () => {
    if (!subscription) return undefined;
    
    switch (subscription.id) {
      case "collector":
        return "Premium";
      case "enthusiast":
        return "Plus";
      default:
        return undefined;
    }
  };

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Profile Header */}
      <View style={styles.header}>
        <View style={styles.profileSection}>
          <TouchableOpacity 
            style={styles.avatarContainer}
            onPress={handleChangeProfilePhoto}
            activeOpacity={0.8}
          >
            {user?.avatar ? (
              <Image
                source={{ uri: user.avatar }}
                style={styles.avatar}
                contentFit="cover"
              />
            ) : (
              <View style={styles.avatarPlaceholder}>
                <User size={32} color={colors.accent} />
              </View>
            )}
            <View style={styles.cameraOverlay}>
              <Camera size={16} color={colors.background} />
            </View>
            {subscription?.id === "collector" && (
              <View style={styles.crownBadge}>
                <Crown size={16} color={colors.accent} />
              </View>
            )}
          </TouchableOpacity>
          
          <View style={styles.profileInfo}>
            <Text style={styles.userName}>{user?.name || "Guest User"}</Text>
            <Text style={styles.userEmail}>{user?.email || "guest@example.com"}</Text>
            
            {subscription && (
              <View style={styles.subscriptionBadge}>
                <Star size={12} color={colors.accent} />
                <Text style={styles.subscriptionText}>{subscription.name}</Text>
              </View>
            )}
          </View>
        </View>
      </View>

      {/* Menu Sections */}
      <View style={styles.menuSection}>
        <Text style={styles.sectionTitle}>Account</Text>
        
        <MenuItem
          icon={<CreditCard size={20} color={colors.accent} />}
          title="Subscription"
          subtitle={subscription ? subscription.name : "Free Access"}
          onPress={() => setShowSubscriptionModal(true)}
          badge={getSubscriptionBadge()}
        />
        
        <MenuItem
          icon={<CreditCard size={20} color={colors.accent} />}
          title="Payment Methods"
          subtitle={paymentMethod ? `•••• ${paymentMethod.last4}` : "No payment method"}
          onPress={() => {
            Analytics.logEvent("profile_payment_methods_press");
            // Navigate to payment methods screen
            Alert.alert("Payment Methods", "Payment methods management coming soon!");
          }}
        />
      </View>

      <View style={styles.menuSection}>
        <Text style={styles.sectionTitle}>Activity</Text>
        
        <MenuItem
          icon={<Heart size={20} color={colors.accent} />}
          title="Favorites"
          subtitle="Your saved venues and artworks"
          onPress={() => {
            Analytics.logEvent("profile_favorites_press");
            router.push("/favorites");
          }}
        />
        
        <MenuItem
          icon={<Clock size={20} color={colors.accent} />}
          title="Visit History"
          subtitle="Places you've been"
          onPress={() => {
            Analytics.logEvent("profile_visit_history_press");
            router.push("/visit-history");
          }}
        />
        
        <MenuItem
          icon={<Calendar size={20} color={colors.accent} />}
          title="Reservations"
          subtitle="Your bookings and appointments"
          onPress={() => {
            Analytics.logEvent("profile_reservations_press");
            router.push("/reservations");
          }}
        />
        
        <MenuItem
          icon={<ShoppingBag size={20} color={colors.accent} />}
          title="Purchase History"
          subtitle="Your orders and receipts"
          onPress={() => {
            Analytics.logEvent("profile_purchase_history_press");
            router.push("/purchase-history");
          }}
        />
      </View>

      <View style={styles.menuSection}>
        <Text style={styles.sectionTitle}>Settings</Text>
        
        <MenuItem
          icon={<Bell size={20} color={colors.accent} />}
          title="Notifications"
          subtitle="Manage your notification preferences"
          onPress={() => {
            Analytics.logEvent("profile_notifications_press");
            setShowNotificationsModal(true);
          }}
        />
        
        <MenuItem
          icon={<Shield size={20} color={colors.accent} />}
          title="Privacy & Security"
          subtitle="Control your data and privacy"
          onPress={() => {
            Analytics.logEvent("profile_privacy_press");
            setShowPrivacyModal(true);
          }}
        />
        
        <MenuItem
          icon={<HelpCircle size={20} color={colors.accent} />}
          title="Help & Support"
          subtitle="Get help and contact support"
          onPress={() => {
            Analytics.logEvent("profile_help_press");
            setShowHelpModal(true);
          }}
        />
        
        <MenuItem
          icon={<Database size={20} color={colors.accent} />}
          title="Test Database"
          subtitle="Test Supabase connection"
          onPress={() => {
            Analytics.logEvent("profile_database_test_press");
            router.push("/supabase-test");
          }}
        />
      </View>

      <View style={styles.menuSection}>
        <Text style={styles.sectionTitle}>Cache Management</Text>
        
        <View style={styles.cacheButtons}>
          <CacheClearButton 
            type="timeframe" 
            style={styles.cacheButton}
            onClearComplete={() => {
              Analytics.logEvent("cache_timeframe_cleared");
            }}
          />
          
          <CacheClearButton 
            type="all" 
            style={styles.cacheButton}
            onClearComplete={() => {
              Analytics.logEvent("cache_all_cleared");
            }}
          />
        </View>
      </View>

      <View style={styles.menuSection}>
        <MenuItem
          icon={<LogOut size={20} color={colors.error} />}
          title="Sign Out"
          onPress={handleLogout}
          showChevron={false}
        />
      </View>

      {/* Modals */}
      <SubscriptionModal
        visible={showSubscriptionModal}
        onClose={() => setShowSubscriptionModal(false)}
      />
      
      <PrivacySettingsModal
        visible={showPrivacyModal}
        onClose={() => setShowPrivacyModal(false)}
      />
      
      <NotificationsModal
        visible={showNotificationsModal}
        onClose={() => setShowNotificationsModal(false)}
      />
      
      <HelpCenterModal
        visible={showHelpModal}
        onClose={() => setShowHelpModal(false)}
      />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    paddingHorizontal: 24,
    paddingTop: 20,
    paddingBottom: 32,
  },
  profileSection: {
    flexDirection: "row",
    alignItems: "center",
  },
  avatarContainer: {
    position: "relative",
    marginRight: 16,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
  },
  avatarPlaceholder: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: colors.card,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    borderColor: colors.accent,
  },
  cameraOverlay: {
    position: "absolute",
    bottom: 0,
    right: 0,
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: colors.accent,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    borderColor: colors.background,
  },
  crownBadge: {
    position: "absolute",
    top: -4,
    right: -4,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: colors.background,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    borderColor: colors.accent,
  },
  profileInfo: {
    flex: 1,
  },
  userName: {
    fontSize: 24,
    fontWeight: "700",
    color: colors.text,
    marginBottom: 4,
    fontFamily,
  },
  userEmail: {
    fontSize: 14,
    color: colors.textSecondary,
    marginBottom: 8,
  },
  subscriptionBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.surface,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    alignSelf: "flex-start",
    gap: 4,
  },
  subscriptionText: {
    fontSize: 12,
    fontWeight: "600",
    color: colors.accent,
  },
  menuSection: {
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: colors.text,
    marginBottom: 16,
    marginHorizontal: 24,
    fontFamily,
  },
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 24,
    paddingVertical: 16,
    backgroundColor: colors.card,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  menuItemLeft: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  menuItemIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.surface,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  menuItemContent: {
    flex: 1,
  },
  menuItemTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: colors.text,
    marginBottom: 2,
  },
  menuItemSubtitle: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  menuItemRight: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  badge: {
    backgroundColor: colors.accent,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  badgeText: {
    fontSize: 12,
    fontWeight: "600",
    color: colors.background,
  },
  cacheButtons: {
    paddingHorizontal: 24,
    gap: 12,
  },
  cacheButton: {
    marginVertical: 0,
  },
});