import React, { useEffect } from "react";
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  Platform,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { ChevronRight, Search, Calendar, User, ShoppingBag, CalendarDays, Home } from "lucide-react-native";
import colors from "@/constants/colors";
import typography from "@/constants/typography";
import FeaturedVenueCard from "@/components/FeaturedVenueCard";
import { useVenueStore } from "@/store/useVenueStore";

// Define font family
const fontFamily = Platform.select({
  ios: "Georgia",
  android: "serif",
  default: "Georgia, serif",
});

export default function HomeScreen() {
  const router = useRouter();
  const { getFeaturedVenues, venues, fetchVenues } = useVenueStore();
  
  // Fetch venues on component mount
  useEffect(() => {
    fetchVenues();
  }, [fetchVenues]);

  const featuredVenues = getFeaturedVenues();

  const museums = venues.filter((venue) => {
    if (!venue) return false;
    return ["museum", "Museums Near You"].some((k) =>
      (venue.type && venue.type.toLowerCase().includes(k)) ||
      venue.category === k
    );
  });

  const artGalleries = venues.filter((venue) => {
    if (!venue) return false;
    return ["gallery", "art", "Art Galleries Near You"].some((k) =>
      (venue.type && venue.type.toLowerCase().includes(k)) ||
      venue.category === k
    );
  });

  const handleVenuePress = (venueId: string) => {
    if (venueId) {
      router.push(`/venue/${venueId}`);
    }
  };

  const navigateToCategory = (categoryId: string, title: string) => {
    router.push({ pathname: `/category/${categoryId}`, params: { title } });
  };

  const renderSection = (title: string, data: any[], onPress: () => void) => (
    <View style={styles.section}>
      <View style={styles.sectionHeader}>
        <Text style={[typography.heading2, styles.sectionTitle]}>
          {title}
        </Text>
        <TouchableOpacity onPress={onPress} style={styles.viewAllButton}>
          <Text style={styles.viewAllText}>View All</Text>
          <ChevronRight size={16} color={colors.accent} />
        </TouchableOpacity>
      </View>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.featuredContainer}
      >
        {data.slice(0, 5).map((venue) => {
          if (!venue || !venue.id) return null;
          return (
            <FeaturedVenueCard
              key={venue.id}
              venue={venue}
              onPress={() => handleVenuePress(venue.id)}
              useGoldText
            />
          );
        })}
      </ScrollView>
    </View>
  );

  const renderNavigationButtons = () => (
    <View style={styles.navigationContainer}>
      <TouchableOpacity 
        style={styles.navButton}
        onPress={() => router.push('/explore')}
      >
        <Search size={20} color="#AC8901" />
        <Text style={styles.navButtonText}>Explore</Text>
      </TouchableOpacity>
      
      <TouchableOpacity 
        style={styles.navButton}
        onPress={() => router.push('/shop')}
      >
        <ShoppingBag size={20} color="#AC8901" />
        <Text style={styles.navButtonText}>Shop</Text>
      </TouchableOpacity>
      
      <TouchableOpacity 
        style={styles.navButton}
        onPress={() => router.push('/events')}
      >
        <CalendarDays size={20} color="#AC8901" />
        <Text style={styles.navButtonText}>Events</Text>
      </TouchableOpacity>
      
      <TouchableOpacity 
        style={styles.navButton}
        onPress={() => router.push('/reservations')}
      >
        <Calendar size={20} color="#AC8901" />
        <Text style={styles.navButtonText}>Reservations</Text>
      </TouchableOpacity>
      
      <TouchableOpacity 
        style={styles.navButton}
        onPress={() => router.push('/profile')}
      >
        <User size={20} color="#AC8901" />
        <Text style={styles.navButtonText}>Profile</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <SafeAreaView style={styles.container} edges={["bottom"]}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <Text style={[typography.heading1, styles.mainTitle]}>Discover Art</Text>
        </View>

        {renderNavigationButtons()}

        <View style={styles.section}>
          <Text style={[typography.heading2, styles.sectionTitle]}>Featured</Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.featuredContainer}
          >
            {featuredVenues.map((venue) => {
              if (!venue || !venue.id) return null;
              return (
                <FeaturedVenueCard
                  key={venue.id}
                  venue={venue}
                  onPress={() => handleVenuePress(venue.id)}
                  useGoldText
                />
              );
            })}
          </ScrollView>
        </View>

        {renderSection("Museums Near You", museums, () =>
          navigateToCategory("c3", "Museums Near You")
        )}
        {renderSection("Art Galleries Near You", artGalleries, () =>
          navigateToCategory("c2", "Art Galleries Near You")
        )}
        {renderSection("Popular Near You", venues, () => router.push("/explore"))}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#013025',
  },
  header: {
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(172, 137, 1, 0.2)",
  },
  scrollContent: {
    paddingBottom: 20,
  },
  mainTitle: {
    fontFamily,
    color: "#AC8901",
    fontSize: 28,
    fontWeight: "600",
  },
  navigationContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 16,
    paddingVertical: 16,
    gap: 12,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(172, 137, 1, 0.2)",
  },
  navButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1a4037',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#AC8901',
    gap: 8,
    minWidth: 100,
  },
  navButtonText: {
    color: '#AC8901',
    fontSize: 14,
    fontWeight: '600',
  },
  section: {
    marginBottom: 20,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    marginBottom: 12,
  },
  sectionTitle: {
    fontFamily,
    fontSize: 20,
    color: "#AC8901",
  },
  featuredContainer: {
    paddingLeft: 16,
    paddingRight: 8,
    gap: 12,
  },
  viewAllButton: {
    flexDirection: "row",
    alignItems: "center",
  },
  viewAllText: {
    fontFamily,
    fontSize: 14,
    color: "#AC8901",
    fontWeight: "600",
    marginRight: 4,
  },
});