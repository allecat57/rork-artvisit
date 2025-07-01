import React from "react";
import {
  StyleSheet,
  Text,
  View,
  FlatList,
  ActivityIndicator,
  TouchableOpacity,
  Platform,
  ScrollView,
} from "react-native";
import { useRouter } from "expo-router";
import { MapPin, Clock, Star, RefreshCw } from "lucide-react-native";
import colors from "@/constants/colors";
import typography from "@/constants/typography";
import { useGalleries } from "@/hooks/useGalleries";

const fontFamily = Platform.select({
  ios: "Georgia",
  android: "serif",
  default: "Georgia, serif",
});

export default function GalleriesScreen() {
  const router = useRouter();
  const { galleries, loading, error, refetch, isUsingMockData } = useGalleries(); // Fetch all galleries, not just featured

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
            <Text style={styles.rating}>{item.rating || 4.8}</Text>
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
            <Text style={styles.hours}>{item.hours || "Open today 10AM - 6PM"}</Text>
          </View>
          <Text style={styles.category}>{item.category || "Gallery"}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.accent} />
        <Text style={styles.loadingText}>Loading galleries...</Text>
      </View>
    );
  }

  if (galleries.length === 0) {
    return (
      <View style={styles.emptyState}>
        <Text style={styles.emptyText}>No galleries available at the moment.</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.headerContainer}>
          <View style={styles.header}>
            <Text style={styles.headerTitle}>All Galleries</Text>
            <Text style={styles.headerSubtitle}>
              Browse all available galleries and exhibitions
            </Text>
          </View>
          
          {isUsingMockData && (
            <View style={styles.mockDataBanner}>
              <Text style={styles.mockDataText}>
                📱 Using sample data - Connect Supabase for live galleries
              </Text>
            </View>
          )}

          {error && (
            <View style={styles.errorBanner}>
              <Text style={styles.errorText}>
                ⚠️ {error}
              </Text>
              <TouchableOpacity style={styles.retryButton} onPress={refetch}>
                <RefreshCw size={14} color={colors.accent} />
                <Text style={styles.retryText}>Retry</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>

        <View style={styles.galleriesSection}>
          <FlatList
            data={galleries}
            keyExtractor={(item) => item.id}
            renderItem={renderGalleryItem}
            scrollEnabled={false}
            ItemSeparatorComponent={() => <View style={styles.separator} />}
            showsVerticalScrollIndicator={false}
          />
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  headerContainer: {
    paddingHorizontal: 24,
    paddingTop: 20,
  },
  header: {
    paddingBottom: 16,
  },
  headerTitle: {
    fontSize: 32,
    fontWeight: "700",
    color: colors.accent,
    marginBottom: 8,
    fontFamily,
  },
  headerSubtitle: {
    fontSize: 16,
    color: colors.textSecondary,
    lineHeight: 24,
  },
  mockDataBanner: {
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: 12,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: colors.border,
  },
  mockDataText: {
    fontSize: 14,
    color: colors.textSecondary,
    textAlign: "center",
  },
  errorBanner: {
    backgroundColor: "#FEF2F2",
    borderRadius: 12,
    padding: 12,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "#FECACA",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  errorText: {
    fontSize: 14,
    color: "#DC2626",
    flex: 1,
    marginRight: 12,
  },
  retryButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    backgroundColor: colors.surface,
  },
  retryText: {
    fontSize: 12,
    color: colors.accent,
    fontWeight: "600",
  },
  galleriesSection: {
    paddingHorizontal: 24,
    paddingBottom: 32,
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
    backgroundColor: colors.background,
  },
  emptyText: {
    fontSize: 16,
    color: colors.textSecondary,
    textAlign: "center",
    fontWeight: "500",
  },
});