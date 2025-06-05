import React from "react";
import { StyleSheet, Text, View, TouchableOpacity } from "react-native";
import { ChevronRight, Package, Clock, CheckCircle, Truck } from "lucide-react-native";
import { Purchase, PurchaseItem } from "@/store/usePurchaseHistoryStore";
import colors from "@/constants/colors";
import typography from "@/constants/typography";

interface PurchaseHistoryCardProps {
  purchase: Purchase;
  onPress: (purchase: Purchase) => void;
}

const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
};

const getStatusIcon = (status: Purchase["status"]) => {
  switch (status) {
    case "completed":
      return <CheckCircle size={16} color={colors.status.success} />;
    case "processing":
      return <Clock size={16} color={colors.primary.accent} />;
    case "shipped":
      return <Truck size={16} color={colors.primary.accent} />;
    case "delivered":
      return <Package size={16} color={colors.status.success} />;
    default:
      return <Clock size={16} color={colors.primary.accent} />;
  }
};

const getStatusText = (status: Purchase["status"]) => {
  switch (status) {
    case "completed":
      return "Completed";
    case "processing":
      return "Processing";
    case "shipped":
      return "Shipped";
    case "delivered":
      return "Delivered";
    default:
      return status;
  }
};

const PurchaseHistoryCard = ({ purchase, onPress }: PurchaseHistoryCardProps) => {
  return (
    <TouchableOpacity 
      style={styles.purchaseCard}
      onPress={() => onPress(purchase)}
    >
      <View style={styles.purchaseHeader}>
        <View style={styles.orderInfo}>
          <Text style={styles.orderId}>Order #{purchase.id}</Text>
          <Text style={styles.orderDate}>{formatDate(purchase.date)}</Text>
        </View>
        <View style={styles.statusContainer}>
          {getStatusIcon(purchase.status)}
          <Text style={[
            styles.statusText,
            purchase.status === "completed" || purchase.status === "delivered" 
              ? styles.statusSuccess 
              : styles.statusPending
          ]}>
            {getStatusText(purchase.status)}
          </Text>
        </View>
      </View>
      
      <View style={styles.itemsContainer}>
        {purchase.items.slice(0, 2).map((purchaseItem: PurchaseItem, index: number) => (
          <View key={`${purchase.id}-${index}`} style={styles.purchaseItem}>
            <Text style={styles.itemName} numberOfLines={1}>
              {purchaseItem.product.name}
              {purchaseItem.quantity > 1 ? ` (${purchaseItem.quantity})` : ""}
            </Text>
            <Text style={styles.itemPrice}>
              ${(purchaseItem.price * purchaseItem.quantity).toFixed(2)}
            </Text>
          </View>
        ))}
        
        {purchase.items.length > 2 && (
          <Text style={styles.moreItems}>
            +{purchase.items.length - 2} more items
          </Text>
        )}
      </View>
      
      <View style={styles.purchaseFooter}>
        <View style={styles.paymentMethod}>
          <Text style={styles.paymentText}>
            {purchase.paymentMethod.cardType} •••• {purchase.paymentMethod.last4}
          </Text>
        </View>
        <View style={styles.totalContainer}>
          <Text style={styles.totalLabel}>Total:</Text>
          <Text style={styles.totalAmount}>${purchase.totalAmount.toFixed(2)}</Text>
        </View>
      </View>
      
      <View style={styles.viewDetailsContainer}>
        <Text style={styles.viewDetailsText}>View Details</Text>
        <ChevronRight size={16} color={colors.primary.accent} />
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  purchaseCard: {
    backgroundColor: colors.primary.card,
    borderRadius: 12,
    marginBottom: 16,
    padding: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  purchaseHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.primary.border,
  },
  orderInfo: {
    flex: 1,
  },
  orderId: {
    ...typography.bodyBold,
    marginBottom: 2,
  },
  orderDate: {
    ...typography.caption,
    color: colors.primary.muted,
  },
  statusContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.03)",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    ...typography.caption,
    marginLeft: 4,
    fontWeight: "600",
  },
  statusSuccess: {
    color: colors.status.success,
  },
  statusPending: {
    color: colors.primary.accent,
  },
  itemsContainer: {
    marginBottom: 12,
  },
  purchaseItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 6,
  },
  itemName: {
    ...typography.body,
    flex: 1,
    marginRight: 8,
  },
  itemPrice: {
    ...typography.body,
    fontWeight: "600",
  },
  moreItems: {
    ...typography.caption,
    color: colors.primary.muted,
    fontStyle: "italic",
    marginTop: 4,
  },
  purchaseFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: colors.primary.border,
  },
  paymentMethod: {
    flex: 1,
  },
  paymentText: {
    ...typography.caption,
    color: colors.primary.muted,
  },
  totalContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  totalLabel: {
    ...typography.body,
    marginRight: 4,
  },
  totalAmount: {
    ...typography.bodyBold,
    color: colors.primary.accent,
  },
  viewDetailsContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-end",
    marginTop: 12,
  },
  viewDetailsText: {
    ...typography.caption,
    color: colors.primary.accent,
    fontWeight: "600",
    marginRight: 4,
  },
});

export default PurchaseHistoryCard;