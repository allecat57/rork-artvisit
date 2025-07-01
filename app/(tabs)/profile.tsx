import React, { useState } from "react";
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  Image,
  Alert,
  Platform,
} from "react-native";
import { useRouter } from "expo-router";
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
  Camera,
  Crown,
} from "lucide-react-native";
import colors from "@/constants/colors";
import typography from "@/constants/typography";
import { useAuthStore } from "@/store/useAuthStore";
import { useProfileStore } from "@/store/useProfileStore";
import Button from "@/components/Button";
import PaymentMethodModal from "@/components/PaymentMethodModal";
import SubscriptionModal from "@/components/SubscriptionModal";
import PrivacySettingsModal from "@/components/PrivacySettingsModal";
import NotificationsModal from "@/components/NotificationsModal";
import HelpCenterModal from "@/components/HelpCenterModal";
import * as Analytics from "@/utils/analytics";

const fontFamily = Platform.select({
  ios: "Georgia",
  android: "serif",
  default: "Georgia, serif",
});

interface ProfileMenuItemProps {
  icon: React.ReactNode;
  title: string;
  subtitle?: string;
  onPress: () => void;
  showChevron?: boolean;
  badge?: string;
}

const ProfileMenuItem: React.FC<ProfileMenuItemProps> = ({
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
      <View style={styles.menuItemText}>
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
      {showChevron && (
        <Text style={styles.chevron}>›</Text>
      )}
    </View>
  </TouchableOpacity>
);

export default function ProfileScreen() {
  const router = useRouter();
  const { user, logout } = useAuthStore();
  const { 
    getCurrentProfileImage, 
    getCurrentPaymentMethod, 
    getCurrentSubscription,
    setProfileImage 
  } = useProfileStore();

  const [paymentModalVisible, setPaymentModalVisible] = useState(false);
  const [subscriptionModalVisible, setSubscriptionModalVisible] = useState(false);
  const [privacyModalVisible, setPrivacyModalVisible] = useState(false);
  const [notificationsModalVisible, setNotificationsModalVisible] = useState(false);
  const [helpModalVisible, setHelpModalVisible] = useState(false);

  const profileImage = getCurrentProfileImage();
  const paymentMethod = getCurrentPaymentMethod();
  const subscription = getCurrentSubscription();

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
            // Log analytics event
            Analytics.logEvent(Analytics.Events.USER_LOGOUT, {
              user_id: user?.id
            });
            
            await logout();
            router.replace("/login");
          },
        },
      ]
    );
  };

  const handleChangeProfileImage = () => {
    Alert.alert(
      "Change Profile Photo",
      "Choose an option",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Remove Photo",
          style: "destructive",
          onPress: () => {
            setProfileImage(null);
            Analytics.logEvent("profile_image_removed");
          },
        },
        {
          text: "Choose Photo",
          onPress: () => {
            // For demo purposes, set a random avatar
            const avatars = [
              "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?q=80&w=1000&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxjb2xsZWN0aW9uLXBhZ2V8MXw3NjA4Mjc3NHx8ZW58MHx8fHx8",
              "https://images.unsplash.com/photo-1494790108755-2616b612b786?q=80&w=1000&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxjb2xsZWN0aW9uLXBhZ2V8Mnw3NjA4Mjc3NHx8ZW58MHx8fHx8",
              "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=1000&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxjb2xsZWN0aW9uLXBhZ2V8M3w3NjA4Mjc3NHx8ZW58MHx8fHx8",
            ];
            const randomAvatar = avatars[Math.floor(Math.random() * avatars.length)];
            setProfileImage(randomAvatar);
            Analytics.logEvent("profile_image_changed");
          },
        },
      ]
    );
  };

  if (!user) {
    return (
      <View style={styles.container}>
        <View style={styles.emptyState}>
          <Text style={styles.emptyTitle}>Not Signed In</Text>
          <Text style={styles.emptyDescription}>
            Please sign in to view your profile
          </Text>
          <Button
            title="Sign In"
            onPress={() => router.replace("/login")}
            variant="primary"
            style={styles.signInButton}
          />
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Profile Header */}
        <View style={styles.profileHeader}>
          <TouchableOpacity 
            style={styles.profileImageContainer}
            onPress={handleChangeProfileImage}
            activeOpacity={0.7}
          >
            {profileImage || user.avatar ? (
              <Image 
                source={{ uri: profileImage || user.avatar }} 
                style={styles.profileImage}
              />
            ) : (
              <View style={styles.profileImagePlaceholder}>
                <User size={40} color={colors.textSecondary} />
              </View>
            )}
            <View style={styles.cameraIcon}>
              <Camera size={16} color={colors.background} />
            </View>
          </TouchableOpacity>
          
          <Text style={styles.userName}>{user.name}</Text>
          <Text style={styles.userEmail}>{user.email}</Text>
          
          {subscription && (
            <View style={styles.subscriptionBadge}>
              <Crown size={14} color={colors.accent} />
              <Text style={styles.subscriptionText}>{subscription.name}</Text>
            </View>
          )}
        </View>

        {/* Menu Items */}
        <View style={styles.menuSection}>
          <Text style={styles.sectionTitle}>Account</Text>
          
          <ProfileMenuItem
            icon={<CreditCard size={20} color={colors.accent} />}
            title="Payment Method"
            subtitle={paymentMethod ? `${paymentMethod.cardType} •••• ${paymentMethod.last4}` : "Add payment method"}
            onPress={() => setPaymentModalVisible(true)}
          />
          
          <ProfileMenuItem
            icon={<Crown size={20} color={colors.accent} />}
            title="Subscription"
            subtitle={subscription ? `${subscription.name} - $${subscription.price}/month` : "Free Access"}
            onPress={() => setSubscriptionModalVisible(true)}
          />
        </View>

        <View style={styles.menuSection}>
          <Text style={styles.sectionTitle}>Activity</Text>
          
          <ProfileMenuItem
            icon={<Heart size={20} color={colors.accent} />}
            title="Favorites"
            subtitle="Your saved venues and events"
            onPress={() => router.push("/favorites")}
          />
          
          <ProfileMenuItem
            icon={<Clock size={20} color={colors.accent} />}
            title="Visit History"
            subtitle="Places you have visited"
            onPress={() => router.push("/visit-history")}
          />
          
          <ProfileMenuItem
            icon={<ShoppingBag size={20} color={colors.accent} />}
            title="Purchase History"
            subtitle="Your art purchases"
            onPress={() => router.push("/purchase-history")}
          />
          
          <ProfileMenuItem
            icon={<Calendar size={20} color={colors.accent} />}
            title="Reservations"
            subtitle="Your bookings and events"
            onPress={() => router.push("/reservations")}
          />
        </View>

        <View style={styles.menuSection}>
          <Text style={styles.sectionTitle}>Settings</Text>
          
          <ProfileMenuItem
            icon={<Bell size={20} color={colors.accent} />}
            title="Notifications"
            subtitle="Manage your notifications"
            onPress={() => setNotificationsModalVisible(true)}
          />
          
          <ProfileMenuItem
            icon={<Shield size={20} color={colors.accent} />}
            title="Privacy & Security"
            subtitle="Control your privacy settings"
            onPress={() => setPrivacyModalVisible(true)}
          />
          
          <ProfileMenuItem
            icon={<HelpCircle size={20} color={colors.accent} />}
            title="Help & Support"
            subtitle="Get help and contact support"
            onPress={() => setHelpModalVisible(true)}
          />
        </View>

        <View style={styles.menuSection}>
          <ProfileMenuItem
            icon={<LogOut size={20} color={colors.status.error} />}
            title="Sign Out"
            onPress={handleLogout}
            showChevron={false}
          />
        </View>
      </ScrollView>

      {/* Modals */}
      <PaymentMethodModal
        visible={paymentModalVisible}
        onClose={() => setPaymentModalVisible(false)}
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
        visible={helpModalVisible}
        onClose={() => setHelpModalVisible(false)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollView: {
    flex: 1,
  },
  profileHeader: {
    alignItems: "center",
    paddingVertical: 32,
    paddingHorizontal: 24,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  profileImageContainer: {
    position: "relative",
    marginBottom: 16,
  },
  profileImage: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: colors.surface,
  },
  profileImagePlaceholder: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: colors.surface,
    justifyContent: "center",
    alignItems: "center",
  },
  cameraIcon: {
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
    marginBottom: 12,
  },
  subscriptionBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.surface,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    gap: 6,
  },
  subscriptionText: {
    fontSize: 12,
    fontWeight: "600",
    color: colors.accent,
  },
  menuSection: {
    paddingVertical: 8,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: colors.text,
    paddingHorizontal: 24,
    paddingVertical: 12,
    fontFamily,
  },
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 24,
    paddingVertical: 16,
    backgroundColor: colors.background,
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
    marginRight: 16,
  },
  menuItemText: {
    flex: 1,
  },
  menuItemTitle: {
    fontSize: 16,
    fontWeight: "500",
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
  chevron: {
    fontSize: 20,
    color: colors.textSecondary,
    fontWeight: "300",
  },
  emptyState: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 32,
  },
  emptyTitle: {
    fontSize: 24,
    fontWeight: "700",
    color: colors.text,
    marginBottom: 8,
    textAlign: "center",
    fontFamily,
  },
  emptyDescription: {
    fontSize: 16,
    color: colors.textSecondary,
    textAlign: "center",
    marginBottom: 32,
    lineHeight: 24,
  },
  signInButton: {
    minWidth: 120,
  },
});