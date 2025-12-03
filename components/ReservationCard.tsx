import React from "react";
import { StyleSheet, Text, View, TouchableOpacity } from "react-native";
import { Image } from "expo-image";
import { Calendar, Clock, Users, MapPin, Phone, MoreVertical } from "lucide-react-native";
import colors from "@/constants/colors";
import typography from "@/constants/typography";
import { Reservation } from "@/types/reservation";
import { getVenueById } from "@/mocks/venues";

interface ReservationCardProps {
  reservation: Reservation;
  onPress?: () => void;
  onCancel: () => void;
  onModify?: () => void;
}

export default function ReservationCard({ 
  reservation, 
  onPress,
  onCancel,
  onModify 
}: ReservationCardProps) {
  const venue = getVenueById(reservation.venueId);
  
  if (!venue) {
    return null;
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const getStatusColor = () => {
    switch (reservation.status) {
      case 'confirmed':
        return colors.constructive;
      case 'pending':
        return colors.status.warning;
      case 'cancelled':
        return colors.error;
      case 'completed':
        return colors.muted;
      default:
        return colors.muted;
    }
  };

  const getStatusText = () => {
    switch (reservation.status) {
      case 'confirmed':
        return 'Confirmed';
      case 'pending':
        return 'Pending';
      case 'cancelled':
        return 'Cancelled';
      case 'completed':
        return 'Completed';
      default:
        return 'Unknown';
    }
  };

  const isUpcoming = () => {
    const reservationDate = new Date(reservation.date);
    const now = new Date();
    return reservationDate >= now && reservation.status !== 'cancelled';
  };

  return (
    <TouchableOpacity 
      style={styles.container}
      onPress={onPress}
      activeOpacity={onPress ? 0.9 : 1}
      disabled={!onPress}
    >
      <View style={styles.imageContainer}>
        <Image
          source={{ uri: venue.imageUrl }}
          style={styles.image}
          contentFit="cover"
          transition={300}
        />
        <View style={[styles.statusBadge, { backgroundColor: getStatusColor() }]}>
          <Text style={styles.statusText}>{getStatusText()}</Text>
        </View>
      </View>

      <View style={styles.content}>
        <View style={styles.header}>
          <View style={styles.titleContainer}>
            <Text style={[typography.heading3, styles.venueName]} numberOfLines={1}>
              {venue.name}
            </Text>
            <Text style={[typography.bodySmall, styles.venueType]}>
              {venue.type}
            </Text>
          </View>
          
          <TouchableOpacity style={styles.moreButton}>
            <MoreVertical size={20} color={colors.muted} />
          </TouchableOpacity>
        </View>

        <View style={styles.detailsContainer}>
          <View style={styles.detailRow}>
            <Calendar size={16} color={colors.muted} />
            <Text style={styles.detailText}>{formatDate(reservation.date)}</Text>
          </View>
          
          <View style={styles.detailRow}>
            <Clock size={16} color={colors.muted} />
            <Text style={styles.detailText}>{reservation.time}</Text>
          </View>
          
          <View style={styles.detailRow}>
            <Users size={16} color={colors.muted} />
            <Text style={styles.detailText}>
              {reservation.partySize} {reservation.partySize === 1 ? 'person' : 'people'}
            </Text>
          </View>
          
          <View style={styles.detailRow}>
            <MapPin size={16} color={colors.muted} />
            <Text style={styles.detailText} numberOfLines={1}>{venue.location}</Text>
          </View>
        </View>

        <View style={styles.footer}>
          <View style={styles.confirmationContainer}>
            <Text style={styles.confirmationLabel}>Confirmation</Text>
            <Text style={styles.confirmationCode}>{reservation.confirmationCode}</Text>
          </View>
          
          {isUpcoming() && (
            <View style={styles.actionButtons}>
              <TouchableOpacity 
                style={[styles.actionButton, styles.cancelButton]}
                onPress={onCancel}
              >
                <Text style={[styles.actionButtonText, { color: colors.error }]}>
                  Cancel
                </Text>
              </TouchableOpacity>
              
              {onModify && (
                <TouchableOpacity 
                  style={[styles.actionButton, styles.editButton]}
                  onPress={onModify}
                >
                  <Text style={[styles.actionButtonText, { color: colors.accent }]}>
                    Modify
                  </Text>
                </TouchableOpacity>
              )}
            </View>
          )}
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.card,
    borderRadius: 16,
    marginBottom: 16,
    overflow: "hidden",
    elevation: 2,
    shadowColor: colors.text,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  imageContainer: {
    position: "relative",
  },
  image: {
    width: "100%",
    height: 120,
  },
  statusBadge: {
    position: "absolute",
    top: 12,
    right: 12,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    ...typography.caption,
    color: colors.background,
    fontWeight: "600",
    fontSize: 12,
  },
  content: {
    padding: 16,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 12,
  },
  titleContainer: {
    flex: 1,
    marginRight: 12,
  },
  venueName: {
    color: colors.text,
    marginBottom: 2,
  },
  venueType: {
    color: colors.muted,
  },
  moreButton: {
    padding: 4,
  },
  detailsContainer: {
    marginBottom: 16,
  },
  detailRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  detailText: {
    ...typography.body,
    color: colors.text,
    marginLeft: 8,
    flex: 1,
  },
  footer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  confirmationContainer: {
    flex: 1,
  },
  confirmationLabel: {
    ...typography.caption,
    color: colors.muted,
    marginBottom: 2,
  },
  confirmationCode: {
    ...typography.bodySmall,
    color: colors.text,
    fontWeight: "600",
  },
  actionButtons: {
    flexDirection: "row",
    gap: 8,
  },
  actionButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
  },
  cancelButton: {
    borderColor: colors.error,
    backgroundColor: "transparent",
  },
  editButton: {
    borderColor: colors.accent,
    backgroundColor: "transparent",
  },
  actionButtonText: {
    ...typography.bodySmall,
    fontWeight: "600",
  },
});