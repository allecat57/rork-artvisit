import React, { useEffect } from "react";
import { StyleSheet, Text, View, FlatList, TouchableOpacity } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter, Stack } from "expo-router";
import { useFavoritesStore } from "@/store/useFavoritesStore";
import { useVenueStore } from "@/store/useVenueStore";
import VenueCard from "@/components/VenueCard";
import EmptyState from "@/components/EmptyState";
import colors from "@/constants/colors";
import typography from "@/constants/typography";
import Button from "@/components/Button";
import { ArrowLeft } from "lucide-react-native";
import * as Analytics from "@/utils/analytics";

export default function FavoritesScreen() {
  const router = useRouter();
  const { favoriteVenueIds, toggleFavorite } = useFavoritesStore();
  const { getVenueById } = useVenueStore();
  
  // Get all favorite venues
  const favoriteVenues = favoriteVenueIds
    .map(id => getVenueById(id))
    .filter(venue => venue !== null);
  
  // Log screen view
  useEffect(() => {
    // Log screen view with analytics
    Analytics.logScreenView("Favorites");
  }, []);
  
  const handleVenuePress = (venueId: string) => {
    router.push(`/venue/${venueId}`);
    
    // Log analytics event
    Analytics.logEvent("favorite_venue_press", {
      venue_id: venueId
    });
  };
  
  const handleToggleFavorite = (venueId: string) => {
    toggleFavorite(venueId);
    
    // Log analytics event
    Analytics.logEvent("remove_favorite", {
      venue_id: venueId
    });
  };
  
  const handleBack = () => {
    router.back();
  };
  
  const renderEmptyState = () => (
    <EmptyState
      iconName="Heart"
      title="No Favorites Yet"
      message="You haven't added any venues to your favorites yet. Explore museums and add them to your favorites for quick access."
      action={
        <Button
          title="Explore Venues"
          onPress={() => router.push("/(tabs)/explore")}
          variant="primary"
        />
      }
    />
  );
  
  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <Stack.Screen 
        options={{ 
          title: "Favorites",
          headerLeft: () => (
            <TouchableOpacity onPress={handleBack} style={styles.backButton}>
              <ArrowLeft size={24} color={colors.primary.text} />
            </TouchableOpacity>
          )
        }} 
      />
      
      <FlatList
        data={favoriteVenues}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <VenueCard
            venue={item}
            onPress={() => handleVenuePress(item.id)}
            onFavoritePress={() => handleToggleFavorite(item.id)}
            isFavorite={true}
          />
        )}
        contentContainerStyle={styles.listContent}
        ListHeaderComponent={
          favoriteVenues.length > 0 ? (
            <Text style={[typography.heading1, styles.title]}>Your Favorites</Text>
          ) : null
        }
        ListEmptyComponent={renderEmptyState}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.primary.background,
  },
  title: {
    marginBottom: 20,
  },
  listContent: {
    padding: 20,
    flexGrow: 1,
  },
  backButton: {
    padding: 4,
    marginRight: 8,
  },
});