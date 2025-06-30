import React, { useEffect, useState } from "react";
import { StyleSheet, Text, View, FlatList, TouchableOpacity } from "react-native";
import { useLocalSearchParams, Stack, useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { Calendar, ArrowLeft } from "lucide-react-native";
import colors from "@/constants/colors";
import typography from "@/constants/typography";
import VenueCard from "@/components/VenueCard";
import Button from "@/components/Button";
import { useVenueStore } from "@/store/useVenueStore";
import { categories } from "@/mocks/categories";
import { Venue } from "@/types/venue";

export default function CategoryScreen() {
  const { id, title } = useLocalSearchParams();
  const router = useRouter();
  const { getVenuesByCategory } = useVenueStore();
  const [venues, setVenues] = useState<Venue[]>([]);
  const [categoryTitle, setCategoryTitle] = useState<string>("");

  useEffect(() => {
    if (id && typeof id === "string") {
      // Get venues for this category
      const categoryVenues = getVenuesByCategory(
        // Find the category title if not provided in params
        title && typeof title === "string" 
          ? title 
          : categories.find(c => c.id === id)?.title || ""
      );
      
      setVenues(categoryVenues);
      
      // Set the category title
      if (title && typeof title === "string") {
        setCategoryTitle(title);
      } else {
        const category = categories.find(c => c.id === id);
        if (category) {
          setCategoryTitle(category.title);
        }
      }
    }
  }, [id, title]);

  const handleVenuePress = (venueId: string) => {
    router.push(`/venue/${venueId}`);
  };

  const handleReserveAll = () => {
    // This would typically navigate to a bulk reservation screen
    // For now, we'll just show the first venue's reservation screen
    if (venues.length > 0) {
      router.push(`/venue/${venues[0].id}`);
    }
  };

  const handleBack = () => {
    router.back();
  };

  return (
    <SafeAreaView style={styles.container} edges={["bottom"]}>
      <Stack.Screen 
        options={{ 
          title: categoryTitle,
          headerLeft: () => (
            <TouchableOpacity onPress={handleBack} style={styles.backButton}>
              <ArrowLeft size={24} color={colors.primary.text} />
            </TouchableOpacity>
          )
        }} 
      />
      
      <View style={styles.header}>
        <Text style={[typography.heading2, styles.title]}>{categoryTitle}</Text>
        <Text style={[typography.body, styles.subtitle]}>
          {venues.length} {venues.length === 1 ? "venue" : "venues"} available
        </Text>
      </View>
      
      {venues.length > 0 && (
        <TouchableOpacity 
          style={styles.reserveAllButton}
          onPress={handleReserveAll}
        >
          <Calendar size={18} color={colors.primary.background} />
          <Text style={styles.reserveAllText}>Reserve a Visit to Any {categoryTitle}</Text>
        </TouchableOpacity>
      )}
      
      <FlatList
        data={venues}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <VenueCard
            id={item.id}
            name={item.name}
            type={item.type}
            imageUrl={item.imageUrl}
            rating={item.rating}
            distance={item.distance}
            openingHours={item.openingHours}
            onPress={() => handleVenuePress(item.id)}
          />
        )}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={[typography.body, styles.emptyText]}>
              No venues found in this category.
            </Text>
          </View>
        }
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
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 16,
  },
  title: {
    marginBottom: 4,
  },
  subtitle: {
    color: colors.primary.muted,
  },
  reserveAllButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.primary.accent,
    marginHorizontal: 16,
    marginBottom: 16,
    paddingVertical: 12,
    borderRadius: 8,
  },
  reserveAllText: {
    ...typography.body,
    color: colors.primary.background,
    fontWeight: "600",
    marginLeft: 8,
  },
  listContent: {
    paddingHorizontal: 16,
    paddingBottom: 24,
  },
  emptyContainer: {
    padding: 24,
    alignItems: "center",
  },
  emptyText: {
    color: colors.primary.muted,
    textAlign: "center",
  },
  backButton: {
    padding: 4,
    marginRight: 8,
  },
});