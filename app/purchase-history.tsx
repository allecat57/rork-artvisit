import React, { useEffect } from "react";
import { StyleSheet, Text, View, FlatList } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Stack } from "expo-router";
import { usePurchaseHistoryStore } from "@/store/usePurchaseHistoryStore";
import EmptyState from "@/components/EmptyState";
import PurchaseHistoryCard from "@/components/PurchaseHistoryCard";
import colors from "@/constants/colors";
import typography from "@/constants/typography";
import Button from "@/components/Button";
import * as Analytics from "@/utils/analytics";

export default function PurchaseHistoryScreen() {
  const { purchases } = usePurchaseHistoryStore();
  
  // Sort purchases by date (newest first)
  const sortedPurchases = [...purchases].sort((a, b) => 
    new Date(b.date).getTime() - new Date(a.date).getTime()
  );
  
  // Log screen view
  useEffect(() => {
    // Log screen view with analytics
    Analytics.logScreenView("PurchaseHistory");
  }, []);
  
  const renderEmptyState = () => (
    <EmptyState
      iconName="ShoppingBag"
      title="No Purchase History"
      message="You haven't made any purchases yet. Visit our shop to find unique items related to your favorite museums and exhibitions."
      action={
        <Button
          title="Visit Shop"
          onPress={() => {}}
          variant="primary"
        />
      }
    />
  );
  
  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <Stack.Screen options={{ title: "Purchase History" }} />
      
      <FlatList
        data={sortedPurchases}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <PurchaseHistoryCard purchase={item} />
        )}
        contentContainerStyle={styles.listContent}
        ListHeaderComponent={
          purchases.length > 0 ? (
            <Text style={[typography.heading1, styles.title]}>Your Purchases</Text>
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
});