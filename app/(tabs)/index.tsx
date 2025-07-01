import React from "react";
import {
  StyleSheet,
  Text,
  View,
  FlatList,
  ActivityIndicator,
  TouchableOpacity,
  Platform,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { MapPin, Clock, Star } from "lucide-react-native";
import colors from "@/constants/colors";
import typography from "@/constants/typography";
import { useGalleries } from "@/hooks/useGalleries";

const fontFamily = Platform.select({
  ios: "Georgia",
  android: "serif",
  default: "Georgia, serif",
});

export default function HomeScreen() {
  const router = useRouter();
  const { galleries, loading } = useGalleries();

  const handleGalleryPress = (galleryId: string) => {
    if (galleryId) {
      router.push(`/gallery/${galleryId}`);
    }
  };

  const renderGalleryItem = ({ item }: { item: any }) => (
    <TouchableOpacity
      style={styles.galleryCard}
      onPress={() => handleGalleryPress(item.id)}
      activeOpacity={0.7}
    >
      <View style={styles.cardContent}>
        <View style={styles.galleryHeader}>
          <Text style={styles.galleryName}>{item.name}</Text>
          <View style={styles.ratingContainer}>
            <Star size={14} color={colors.accent} fill={colors.accent} />
            <Text style={styles.rating}>4.8</Text>
          </View>
        </View>
        
        <View style={styles.locationContainer}>
          <MapPin size={14} color={colors.textSecondary} />
          <Text style={styles.location}>{item.location}</Text>
        </View>
        
        {item.description && (
          <Text style={styles.description} numberOfLines={2}>
            {item.description}
          </Text>
        )}
        
        <View style={styles.metaContainer}>
          <View style={styles.hoursContainer}>
            <Clock size={12} color={colors.textSecondary} />
            <Text style={styles.hours}>Open today 10AM - 6PM</Text>
          </View>
          <Text style={styles.category}>Gallery</Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <Text style={styles.emptyTitle}>No Galleries Found</Text>
      <Text style={styles.emptyDescription}>
        Check back later for new gallery listings
      </Text>
    </View>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.accent} />
        <Text style={styles.loadingText}>Loading galleries...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={galleries}
        keyExtractor={(item) => item.id}
        renderItem={renderGalleryItem}
        contentContainerStyle={styles.listContainer}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={renderEmptyState}
        ItemSeparatorComponent={() => <View style={styles.separator} />}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  listContainer: {
    padding: 16,
  },
  galleryCard: {
    backgroundColor: colors.card,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.border,
    overflow: "hidden",
  },
  cardContent: {
    padding: 20,
  },
  galleryHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 8,
  },
  galleryName: {
    fontSize: 20,
    fontWeight: "700",
    color: colors.text,
    flex: 1,
    marginRight: 12,
    fontFamily,
  },
  ratingContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.surface,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 4,
  },
  rating: {
    fontSize: 12,
    fontWeight: "600",
    color: colors.accent,
  },
  locationContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
    gap: 6,
  },
  location: {
    fontSize: 14,
    color: colors.textSecondary,
    fontWeight: "500",
  },
  description: {
    fontSize: 14,
    color: colors.textSecondary,
    lineHeight: 20,
    marginBottom: 16,
  },
  metaContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  hoursContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  hours: {
    fontSize: 12,
    color: colors.textSecondary,
    fontWeight: "500",
  },
  category: {
    fontSize: 12,
    color: colors.accent,
    fontWeight: "600",
    backgroundColor: colors.surface,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  separator: {
    height: 16,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    gap: 16,
    backgroundColor: colors.background,
  },
  loadingText: {
    fontSize: 16,
    color: colors.textSecondary,
    fontWeight: "500",
  },
  emptyState: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 60,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: colors.text,
    marginBottom: 8,
    fontFamily,
  },
  emptyDescription: {
    fontSize: 14,
    color: colors.textSecondary,
    textAlign: "center",
  },
});