import React from "react";
import { StyleSheet, Text, View, TouchableOpacity } from "react-native";
import { Image } from "expo-image";
import { Calendar, Clock, MapPin, Ticket, Edit, X } from "lucide-react-native";
import colors from "@/constants/colors";
import typography from "@/constants/typography";
import { Reservation } from "@/types/reservation";
import { useVenueStore } from "@/store/useVenueStore";

interface ReservationCardProps {
  reservation: Reservation;
  onPress?: () => void;
  onCancel: () => void;
  onEdit?: () => void;
  onModify?: () => void;
}

export default function ReservationCard({ 
  reservation, 
  onPress, 
  onCancel, 
  onEdit,
  onModify 
}: ReservationCardProps) {
  const { getVenueById } = useVenueStore();
  
  // Format date helper function
  const formatDate = (dateString: string) => {
    if (!dateString) return "Date unknown";
    
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString("en-US", { 
        weekday: "short", 
        month: "short", 
        day: "numeric" 
      });
    } catch (error) {
      console.error("Error formatting date:", error);
      return "Invalid date";
    }
  };
  
  // Get venue details using venueId from the reservation
  const venue = reservation.venueId ? getVenueById(reservation.venueId) : null;
  
  // Use onEdit or onModify (for backward compatibility)
  const handleEdit = onEdit || onModify;
  
  // If venue is not found, show a fallback UI
  if (!venue) {
    return (
      <View style={[styles.container, styles.fallbackContainer]}>
        <View style={styles.content}>
          <Text style={[typography.heading3, styles.name]}>Reservation #{reservation.confirmationCode || "Unknown"}</Text>
          <Text style={[typography.bodySmall, styles.infoText]}>Venue information unavailable</Text>
          
          <View style={styles.infoContainer}>
            <View style={styles.infoRow}>
              <Calendar size={16} color={colors.muted} />
              <Text style={[typography.bodySmall, styles.infoText]}>
                {reservation.date ? formatDate(reservation.date) : "Date unknown"}
              </Text>
            </View>
            
            <View style={styles.infoRow}>
              <Clock size={16} color={colors.muted} />
              <Text style={[typography.bodySmall, styles.infoText]}>{reservation.time || "Time unknown"}</Text>
            </View>
            
            <View style={styles.infoRow}>
              <Ticket size={16} color={colors.muted} />
              <Text style={[typography.bodySmall, styles.infoText]}>
                Party size: {reservation.partySize || "Unknown"}
              </Text>
            </View>
          </View>
          
          <View style={styles.confirmationContainer}>
            <Ticket size={14} color={colors.accent} />
            <Text style={styles.confirmationText}>Confirmation: {reservation.confirmationCode || "Pending"}</Text>
          </View>
        </View>
        
        <View style={styles.actionsContainer}>
          {handleEdit && (
            <TouchableOpacity 
              style={[styles.actionButton, styles.modifyButton]} 
              onPress={handleEdit}
            >
              <Edit size={16} color={colors.accent} />
              <Text style={styles.modifyText}>Modify</Text>
            </TouchableOpacity>
          )}
          
          <TouchableOpacity 
            style={[styles.actionButton, styles.cancelButton, !handleEdit && styles.fullWidthButton]} 
            onPress={onCancel}
          >
            <X size={16} color={colors.status.error} />
            <Text style={styles.cancelText}>Cancel</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }
  
  const { date, time, confirmationCode } = reservation;

  const CardContent = (
    <>
      <Image
        source={{ uri: venue.imageUrl }}
        style={styles.image}
        contentFit="cover"
        transition={300}
      />
      
      <View style={styles.content}>
        <Text style={[typography.heading3, styles.name]} numberOfLines={1}>{venue.name}</Text>
        
        <View style={styles.infoContainer}>
          <View style={styles.infoRow}>
            <Calendar size={16} color={colors.muted} />
            <Text style={[typography.bodySmall, styles.infoText]}>{formatDate(date)}</Text>
          </View>
          
          <View style={styles.infoRow}>
            <Clock size={16} color={colors.muted} />
            <Text style={[typography.bodySmall, styles.infoText]}>{time || "Time not specified"}</Text>
          </View>
          
          <View style={styles.infoRow}>
            <MapPin size={16} color={colors.muted} />
            <Text style={[typography.bodySmall, styles.infoText]} numberOfLines={1}>{venue.location}</Text>
          </View>
        </View>
        
        <View style={styles.confirmationContainer}>
          <Ticket size={14} color={colors.accent} />
          <Text style={styles.confirmationText}>Confirmation: {confirmationCode || "Pending"}</Text>
        </View>
      </View>
    </>
  );

  return (
    <View style={styles.container}>
      {onPress ? (
        <TouchableOpacity 
          style={styles.cardContent} 
          onPress={onPress}
          activeOpacity={0.9}
        >
          {CardContent}
        </TouchableOpacity>
      ) : (
        <View style={styles.cardContent}>
          {CardContent}
        </View>
      )}
      
      <View style={styles.actionsContainer}>
        {handleEdit && (
          <TouchableOpacity 
            style={[styles.actionButton, styles.modifyButton]} 
            onPress={handleEdit}
          >
            <Edit size={16} color={colors.accent} />
            <Text style={styles.modifyText}>Modify</Text>
          </TouchableOpacity>
        )}
        
        <TouchableOpacity 
          style={[styles.actionButton, styles.cancelButton, !handleEdit && styles.fullWidthButton]} 
          onPress={onCancel}
        >
          <X size={16} color={colors.status.error} />
          <Text style={styles.cancelText}>Cancel</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.card,
    borderRadius: 12,
    overflow: "hidden",
    marginBottom: 16,
  },
  fallbackContainer: {
    borderWidth: 1,
    borderColor: colors.border,
    borderStyle: "dashed",
  },
  cardContent: {
    flexDirection: "column",
  },
  image: {
    height: 120,
    width: "100%",
  },
  content: {
    padding: 16,
  },
  name: {
    marginBottom: 12,
    color: colors.text,
  },
  infoContainer: {
    marginBottom: 12,
  },
  infoRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  infoText: {
    marginLeft: 8,
    color: colors.text,
  },
  confirmationContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(172, 137, 1, 0.15)",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
  },
  confirmationText: {
    ...typography.bodySmall,
    color: colors.accent,
    marginLeft: 8,
    fontWeight: "500",
  },
  actionsContainer: {
    flexDirection: "row",
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  actionButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 12,
  },
  modifyButton: {
    borderRightWidth: 1,
    borderRightColor: colors.border,
  },
  cancelButton: {
    backgroundColor: "rgba(244, 67, 54, 0.05)",
  },
  fullWidthButton: {
    flex: 1,
  },
  modifyText: {
    ...typography.bodySmall,
    color: colors.accent,
    fontWeight: "600",
    marginLeft: 6,
  },
  cancelText: {
    ...typography.bodySmall,
    color: colors.status.error,
    fontWeight: "600",
    marginLeft: 6,
  },
});