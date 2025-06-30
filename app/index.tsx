import React from "react";
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { 
  Search, 
  Calendar, 
  ShoppingBag, 
  User, 
  Heart,
  Clock,
  MapPin
} from "lucide-react-native";
import colors from "@/constants/colors";
import typography from "@/constants/typography";
import { useAuthStore } from "@/store/useAuthStore";

export default function HomeScreen() {
  const router = useRouter();
  const { user } = useAuthStore();

  const navigationItems = [
    {
      title: "Explore",
      subtitle: "Discover venues & galleries",
      icon: <Search size={24} color={colors.text} />,
      route: "/explore",
      color: colors.accent,
    },
    {
      title: "Events",
      subtitle: "Upcoming exhibitions",
      icon: <Calendar size={24} color={colors.text} />,
      route: "/events",
      color: colors.status.info,
    },
    {
      title: "Shop",
      subtitle: "Art & merchandise",
      icon: <ShoppingBag size={24} color={colors.text} />,
      route: "/shop",
      color: colors.status.success,
    },
    {
      title: "Profile",
      subtitle: "Your account & settings",
      icon: <User size={24} color={colors.text} />,
      route: user ? "/profile" : "/login",
      color: colors.status.warning,
    },
  ];

  const quickActions = [
    {
      title: "Favorites",
      icon: <Heart size={20} color={colors.text} />,
      route: "/favorites",
    },
    {
      title: "Visit History",
      icon: <Clock size={20} color={colors.text} />,
      route: "/visit-history",
    },
    {
      title: "Reservations",
      icon: <MapPin size={20} color={colors.text} />,
      route: "/reservations",
    },
  ];

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Text style={styles.welcomeText}>
            Welcome{user ? `, ${user.name}` : ""}
          </Text>
          <Text style={styles.subtitle}>
            Discover amazing art venues and galleries
          </Text>
        </View>

        <View style={styles.mainNavigation}>
          {navigationItems.map((item, index) => (
            <TouchableOpacity
              key={index}
              style={[styles.navCard, { borderLeftColor: item.color }]}
              onPress={() => router.push(item.route as any)}
              activeOpacity={0.8}
            >
              <View style={styles.navCardContent}>
                <View style={styles.navCardLeft}>
                  <View style={[styles.iconContainer, { backgroundColor: `${item.color}20` }]}>
                    {item.icon}
                  </View>
                  <View style={styles.navCardText}>
                    <Text style={styles.navCardTitle}>{item.title}</Text>
                    <Text style={styles.navCardSubtitle}>{item.subtitle}</Text>
                  </View>
                </View>
              </View>
            </TouchableOpacity>
          ))}
        </View>

        <View style={styles.quickActionsSection}>
          <Text style={styles.sectionTitle}>Quick Actions</Text>
          <View style={styles.quickActionsGrid}>
            {quickActions.map((action, index) => (
              <TouchableOpacity
                key={index}
                style={styles.quickActionCard}
                onPress={() => router.push(action.route as any)}
                activeOpacity={0.8}
              >
                <View style={styles.quickActionIcon}>
                  {action.icon}
                </View>
                <Text style={styles.quickActionTitle}>{action.title}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.primary,
  },
  scrollView: {
    flex: 1,
  },
  header: {
    padding: 20,
    paddingTop: 10,
  },
  welcomeText: {
    ...typography.heading1,
    color: colors.text,
    fontSize: 32,
    fontWeight: "700",
    marginBottom: 8,
  },
  subtitle: {
    ...typography.body,
    color: colors.muted,
    fontSize: 16,
    opacity: 0.8,
  },
  mainNavigation: {
    paddingHorizontal: 20,
    gap: 16,
  },
  navCard: {
    backgroundColor: colors.card,
    borderRadius: 16,
    padding: 20,
    borderLeftWidth: 4,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  navCardContent: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  navCardLeft: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 16,
  },
  navCardText: {
    flex: 1,
  },
  navCardTitle: {
    ...typography.heading3,
    color: colors.text,
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 4,
  },
  navCardSubtitle: {
    ...typography.body,
    color: colors.muted,
    fontSize: 14,
  },
  quickActionsSection: {
    padding: 20,
    paddingTop: 32,
  },
  sectionTitle: {
    ...typography.heading2,
    color: colors.text,
    fontSize: 22,
    fontWeight: "600",
    marginBottom: 16,
  },
  quickActionsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
  },
  quickActionCard: {
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: 16,
    alignItems: "center",
    justifyContent: "center",
    minWidth: 100,
    flex: 1,
    maxWidth: "30%",
  },
  quickActionIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: `${colors.accent}20`,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 8,
  },
  quickActionTitle: {
    ...typography.bodySmall,
    color: colors.text,
    fontSize: 12,
    fontWeight: "500",
    textAlign: "center",
  },
});