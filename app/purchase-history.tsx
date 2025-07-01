import React, { useEffect } from "react";
import { StyleSheet, Text, View, FlatList, Alert, TouchableOpacity } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Stack, useRouter } from "expo-router";
import { usePurchaseHistoryStore } from "@/store/usePurchaseHistoryStore";
import { useAuthStore } from "@/store/useAuthStore";
import EmptyState from "@/components/EmptyState";
import PurchaseHistoryCard from "@/components/PurchaseHistoryCard";
import colors from "@/constants/colors";
import typography from "@/constants/typography";
import Button from "@/components/Button";
import * as Analytics from "@/utils/analytics";

export default function PurchaseHistoryScreen() {
  const router = useRouter();
  const { user } = useAuthStore();
  const { getCurrentUserPurchases } = usePurchaseHistoryStore();
  
  // Get purchases for current user
  const purchases = user ? getCurrentUserPurchases() : [];
  
  // Sort purchases by date (newest first)
  const sortedPurchases = [...purchases].sort((a, b) => {
    const dateA = new Date(a.date || 0).getTime();
    const dateB = new Date(b.date || 0).getTime();
    return dateB - dateA;
  });
  
  // Log screen view
  useEffect(() => {
    Analytics.logScreenView("PurchaseHistory");
  }, []);
  
  const handlePurchasePress = (purchase: any) => {
    try {
      if (!purchase || !purchase.items || !Array.isArray(purchase.items)) {
        Alert.alert("Error", "Invalid purchase data");
        return;
      }

      // For now, just show purchase details in an alert
      // In a real app, you'd navigate to a detailed purchase view
      const itemsList = purchase.items.map((item: any) => 
        `${item.name || 'Unknown Item'} (x${item.quantity || 1}) - $${((item.price || 0) * (item.quantity || 1)).toFixed(2)}`
      ).join('\n');
      
      Alert.alert(
        `Order #${purchase.id}`,
        `Items:\n${itemsList}\n\nTotal: $${(purchase.totalAmount || 0).toFixed(2)}\nStatus: ${purchase.status || 'Unknown'}\nDate: ${new Date(purchase.date || Date.now()).toLocaleDateString()}`,
        [{ text: "OK" }]
      );
      
      Analytics.logEvent("purchase_history_item_press", {
        purchase_id: purchase.id,
        total_amount: purchase.totalAmount || 0
      });
    } catch (error) {
      console.error("Error showing purchase details:", error);
      Alert.alert("Error", "Unable to show purchase details");
    }
  };
  
  const renderEmptyState = () => (
    <EmptyState
      iconName="ShoppingBag"
      title="No Purchase History"
      message="You haven't made any purchases yet. Visit our shop to find unique items related to your favorite museums and exhibitions."
      action={
        <Button
          title="Visit Shop"
          onPress={() => router.push("/(tabs)/shop")}
          variant="primary"
        />
      }
    />
  );
  
  const renderPurchaseItem = ({ item }: { item: any }) => {
    if (!item) {
      return (
        <View style={styles.errorCard}>
          <Text style={styles.errorText}>Invalid purchase record</Text>
        </View>
      );
    }

    return (
      <PurchaseHistoryCard 
        purchase={item} 
        onPress={() => handlePurchasePress(item)}
      />
    );
  };
  
  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <Stack.Screen options={{ title: "Purchase History" }} />
      
      <FlatList
        data={sortedPurchases}
        keyExtractor={(item, index) => item?.id || `purchase-${index}`}
        renderItem={renderPurchaseItem}
        contentContainerStyle={styles.listContent}
        ListHeaderComponent={
          purchases.length > 0 ? (
            <View style={styles.headerContainer}>
              <Text style={[typography.heading1, styles.title]}>Your Purchases</Text>
              <Text style={styles.subtitle}>
                {purchases.length} {purchases.length === 1 ? "purchase" : "purchases"}
              </Text>
            </View>
          ) : null
        }
        ListEmptyComponent={renderEmptyState}
        showsVerticalScrollIndicator={false}
        ItemSeparatorComponent={() => <View style={styles.separator} />}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  headerContainer: {
    marginBottom: 20,
  },
  title: {
    marginBottom: 4,
    color: colors.text,
  },
  subtitle: {
    ...typography.body,
    color: colors.textMuted,
  },
  listContent: {
    padding: 20,
    flexGrow: 1,
  },
  errorCard: {
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: colors.border,
  },
  errorText: {
    ...typography.body,
    color: colors.error,
    textAlign: "center",
    fontWeight: "600",
  },
  separator: {
    height: 12,
  },
});