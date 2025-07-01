import React, { useEffect } from "react";
import { StyleSheet, Text, View, FlatList, Alert } from "react-native";
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
  const sortedPurchases = [...purchases].sort((a, b) => 
    new Date(b.date).getTime() - new Date(a.date).getTime()
  );
  
  // Log screen view
  useEffect(() => {
    Analytics.logScreenView("PurchaseHistory");
  }, []);
  
  const handlePurchasePress = (purchase: any) => {
    // For now, just show purchase details in an alert
    // In a real app, you'd navigate to a detailed purchase view
    const itemsList = purchase.items.map((item: any) => 
      `${item.name} (x${item.quantity}) - $${(item.price * item.quantity).toFixed(2)}`
    ).join('\n');
    
    Alert.alert(
      `Order #${purchase.id}`,
      `Items:\n${itemsList}\n\nTotal: $${purchase.totalAmount.toFixed(2)}\nStatus: ${purchase.status}\nDate: ${new Date(purchase.date).toLocaleDateString()}`,
      [{ text: "OK" }]
    );
    
    Analytics.logEvent("purchase_history_item_press", {
      purchase_id: purchase.id,
      total_amount: purchase.totalAmount
    });
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
  
  const renderPurchaseItem = ({ item }: { item: any }) => (
    <PurchaseHistoryCard 
      purchase={item} 
      onPress={() => handlePurchasePress(item)}
    />
  );
  
  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <Stack.Screen options={{ title: "Purchase History" }} />
      
      <FlatList
        data={sortedPurchases}
        keyExtractor={(item) => item.id}
        renderItem={renderPurchaseItem}
        contentContainerStyle={styles.listContent}
        ListHeaderComponent={
          purchases.length > 0 ? (
            <Text style={[typography.heading1, styles.title]}>Your Purchases</Text>
          ) : null
        }
        ListEmptyComponent={renderEmptyState}
        showsVerticalScrollIndicator={false}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  title: {
    marginBottom: 20,
    color: colors.text,
  },
  listContent: {
    padding: 20,
    flexGrow: 1,
  },
});