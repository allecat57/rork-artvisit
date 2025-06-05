import React from "react";
import { StyleSheet, View, Text } from "react-native";
import { useRouter } from "expo-router";
import { AlertTriangle } from "lucide-react-native";
import colors from "@/constants/colors";
import typography from "@/constants/typography";
import Button from "@/components/Button";
import EmptyState from "@/components/EmptyState";

export default function NotFoundScreen() {
  const router = useRouter();

  return (
    <View style={styles.container}>
      <EmptyState
        icon={<AlertTriangle size={48} color={colors.status.warning} />}
        title="Page Not Found"
        message="The page you're looking for doesn't exist or has been moved."
        action={
          <Button
            title="Go to Home"
            onPress={() => router.replace("/(tabs)")}
            variant="primary"
          />
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.primary.background,
  },
});