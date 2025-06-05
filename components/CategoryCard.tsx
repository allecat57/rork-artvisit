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
    imageUrl: string;
  };
  onPress: () => void;
}

export default function CategoryCard({ category, onPress }: CategoryCardProps) {
  return (
    <TouchableOpacity 
      style={styles.container} 
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
        colors={["transparent", "rgba(1, 48, 37, 0.8)", "rgba(1, 48, 37, 0.95)"]}
        style={styles.gradient}
      >
        <View style={styles.textContainer}>
          <Text style={[typography.heading3, styles.title]}>{category.title}</Text>
        </View>
      </LinearGradient>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    height: 160,
    borderRadius: 12,
    overflow: "hidden",
    marginBottom: 16,
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
    textShadowColor: "rgba(0, 0, 0, 0.75)",
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },
});