import React from "react";
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
import { ChevronRight } from "lucide-react-native";
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
  const { getFeaturedVenues, venues } = useVenueStore();
  const featuredVenues = getFeaturedVenues();

  const museums = venues.filter((venue) =>
    ["museum", "Museums Near You"].some((k) =>
      venue.type?.toLowerCase().includes(k) ||
      venue.category === k
    )
  );

  const artGalleries = venues.filter((venue) =>
    ["gallery", "art", "Art Galleries Near You"].some((k) =>
      venue.type?.toLowerCase().includes(k) ||
      venue.category === k
    )
  );

  const handleVenuePress = (venueId: string) => {
    router.push(`/venue/${venueId}`);
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
          <ChevronRight size={16} color={colors.primary.accent} />
        </TouchableOpacity>
      </View>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.featuredContainer}
      >
        {data.slice(0, 5).map((venue) => (
          venue && <FeaturedVenueCard
            key={venue.id}
            venue={venue}
            onPress={() => handleVenuePress(venue.id)}
            useGoldText
          />
        ))}
      </ScrollView>
    </View>
  );

  return (
    <SafeAreaView style={styles.container} edges={["bottom"]}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        <Text style={[typography.heading1, styles.mainTitle]}>Discover Art</Text>

        <View style={styles.section}>
          <Text style={[typography.heading2, styles.sectionTitle]}>Featured</Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.featuredContainer}
          >
            {featuredVenues.map((venue) => (
              venue && <FeaturedVenueCard
                key={venue.id}
                venue={venue}
                onPress={() => handleVenuePress(venue.id)}
                useGoldText
              />
            ))}
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
    backgroundColor: colors.primary.background,
  },
  scrollContent: {
    paddingTop: 12,
    paddingBottom: 20,
  },
  mainTitle: {
    fontFamily,
    color: "#AC8901",
    fontSize: 28,
    fontWeight: "600",
    paddingHorizontal: 16,
    marginBottom: 8,
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