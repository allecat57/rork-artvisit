import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { Image } from "expo-image";
import { LinearGradient } from "expo-linear-gradient";
import colors from "@/constants/colors";
import typography from "@/constants/typography";

interface CategoryCardProps {
  category: {
    id: string;
    title: string;
    name?: string;
    imageUrl: string;
  };
  isSelected?: boolean;
  onPress: () => void;
}

export default function CategoryCard({ category, isSelected = false, onPress }: CategoryCardProps) {
  return (
    <TouchableOpacity 
      style={[
        styles.container,
        isSelected && styles.selectedContainer
      ]} 
      onPress={onPress}
      activeOpacity={0.9}
    >
      <Image
        source={{ uri: category.imageUrl }}
        style={styles.image}
        contentFit="cover"
        transition={300}
      />
      <LinearGradient
        colors={[
          "transparent", 
          isSelected ? "rgba(172, 137, 1, 0.8)" : "rgba(1, 48, 37, 0.8)", 
          isSelected ? "rgba(172, 137, 1, 0.95)" : "rgba(1, 48, 37, 0.95)"
        ]}
        style={styles.gradient}
      >
        <View style={styles.textContainer}>
          <Text style={[typography.heading3, styles.title]}>
            {category.name || category.title}
          </Text>
        </View>
      </LinearGradient>
      {isSelected && (
        <View style={styles.selectedIndicator} />
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    height: 160,
    width: 280,
    borderRadius: 12,
    overflow: "hidden",
    marginRight: 16,
  },
  selectedContainer: {
    borderWidth: 2,
    borderColor: "#AC8901",
  },
  image: {
    ...StyleSheet.absoluteFillObject,
  },
  gradient: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: "flex-end",
  },
  textContainer: {
    padding: 16,
  },
  title: {
    color: "#FFFFFF",
    textShadowColor: "rgba(0, 0, 0, 0.75)",
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },
  selectedIndicator: {
    position: "absolute",
    top: 12,
    right: 12,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: "#AC8901",
    borderWidth: 2,
    borderColor: "#FFFFFF",
  },
});