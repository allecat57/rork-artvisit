import React, { useState, useEffect } from "react";
import { 
  StyleSheet, 
  Text, 
  View, 
  Modal, 
  TouchableOpacity, 
  ScrollView,
  Dimensions,
  Alert
} from "react-native";
import { X, Check, Calendar } from "lucide-react-native";
import { Image } from "expo-image";
import colors from "@/constants/colors";
import typography from "@/constants/typography";
import Button from "./Button";
import DateTimePicker from "./DateTimePicker";
import { Venue } from "@/types/venue";
import * as Analytics from "@/utils/analytics";
import { bookVenue } from "@/utils/bookingApi";
import { useAuthStore } from "@/store/useAuthStore";

const { height } = Dimensions.get("window");

interface ReservationModalProps {
  visible: boolean;
  venue?: Venue | null;
  venues?: Venue[];
  onClose: () => void;
  onReserve?: (venue: Venue, date: Date, timeSlot: string) => void;
  isModifying?: boolean;
  initialDate?: Date;
  initialTimeSlot?: string;
}

export default function ReservationModal({ 
  visible, 
  venue,
  venues,
  onClose,
  onReserve,
  isModifying = false,
  initialDate,
  initialTimeSlot
}: ReservationModalProps) {
  const [selectedDate, setSelectedDate] = useState<Date | null>(initialDate || null);
  const [selectedTimeSlot, setSelectedTimeSlot] = useState<string | null>(initialTimeSlot || null);
  const [selectedVenue, setSelectedVenue] = useState<Venue | null>(venue || null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const { user } = useAuthStore();
  
  // Use the provided venue or allow selection from venues list
  const currentVenue = venue || selectedVenue;
  
  useEffect(() => {
    if (visible) {
      // Reset to initial values when modal becomes visible
      setSelectedDate(initialDate || null);
      setSelectedTimeSlot(initialTimeSlot || null);
      setSelectedVenue(venue || null);
      
      // Log modal open event
      if (currentVenue) {
        Analytics.logEvent(isModifying ? "modify_reservation_modal_open" : "reservation_modal_open", {
          venue_id: currentVenue.id,
          venue_name: currentVenue.name,
          venue_type: currentVenue.type
        });
      }
    }
  }, [visible, initialDate, initialTimeSlot, venue, currentVenue, isModifying]);
  
  const handleSelectDateTime = (date: Date, timeSlot: string) => {
    setSelectedDate(date);
    setSelectedTimeSlot(timeSlot);
    
    // Log date/time selection
    if (currentVenue) {
      Analytics.logEvent("reservation_datetime_selected", {
        venue_id: currentVenue.id,
        date: date.toISOString(),
        time_slot: timeSlot
      });
    }
  };
  
  const handleReserve = async () => {
    if (!currentVenue || !selectedDate || !selectedTimeSlot || !onReserve) {
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      // Call booking API (now with Firestore support)
      const bookingResult = await bookVenue({
        userId: user?.id || "app_user",
        venueId: currentVenue.id,
        date: selectedDate,
        timeSlot: selectedTimeSlot
      });
      
      if (bookingResult.success) {
        // If API call succeeds, proceed with local reservation
        onReserve(currentVenue, selectedDate, selectedTimeSlot);
        
        // Show success message with booking ID if available
        const successMessage = bookingResult.bookingId 
          ? `Your reservation has been confirmed! Booking ID: ${bookingResult.bookingId.substring(0, 8)}`
          : "Your reservation has been confirmed!";
          
        Alert.alert("🎉 Booking successful!", successMessage);
        
        // Log successful booking
        Analytics.logEvent("reservation_confirmed", {
          venue_id: currentVenue.id,
          venue_name: currentVenue.name,
          date: selectedDate.toISOString(),
          time_slot: selectedTimeSlot,
          booking_id: bookingResult.bookingId || "local_only"
        });
      } else {
        // Handle API failure but still allow local reservation
        Alert.alert(
          "⚠️ Partial Success",
          "Your reservation was saved locally, but we couldn't sync with the server. Your reservation will sync when connectivity is restored.",
          [
            { text: "OK", onPress: () => onReserve(currentVenue, selectedDate, selectedTimeSlot) }
          ]
        );
        
        // Log partial success
        Analytics.logEvent("reservation_partial_success", {
          venue_id: currentVenue.id,
          venue_name: currentVenue.name,
          error_message: bookingResult.message
        });
      }
    } catch (error) {
      console.error("Reservation error:", error);
      Alert.alert(
        "Error",
        "Something went wrong while booking. Please try again.",
        [{ text: "OK" }]
      );
      
      // Log error
      Analytics.logEvent("reservation_error", {
        venue_id: currentVenue.id,
        venue_name: currentVenue.name,
        error_message: error instanceof Error ? error.message : "Unknown error"
      });
    } finally {
      setIsSubmitting(false);
    }
  };
  
  const resetAndClose = () => {
    // Log modal close event
    if (currentVenue) {
      Analytics.logEvent(isModifying ? "modify_reservation_modal_close" : "reservation_modal_close", {
        venue_id: currentVenue.id,
        venue_name: currentVenue.name,
        completed: false
      });
    }
    
    if (!isModifying) {
      setSelectedDate(null);
      setSelectedTimeSlot(null);
      setSelectedVenue(null);
    }
    onClose();
  };

  if (!currentVenue) {
    return (
      <Modal
        visible={visible}
        transparent
        animationType="slide"
        onRequestClose={resetAndClose}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <TouchableOpacity style={styles.closeButton} onPress={resetAndClose}>
              <X size={24} color={colors.text} />
            </TouchableOpacity>
            
            <View style={styles.contentPadding}>
              <Text style={[typography.heading2, styles.title]}>Select a Venue</Text>
              <Text style={[typography.body, styles.subtitle]}>
                Please select a venue to make a reservation.
              </Text>
              
              {venues && venues.length > 0 && (
                <ScrollView style={styles.venuesList}>
                  {venues.map((venueOption) => (
                    <TouchableOpacity
                      key={venueOption.id}
                      style={styles.venueOption}
                      onPress={() => setSelectedVenue(venueOption)}
                    >
                      <Image
                        source={{ uri: venueOption.imageUrl }}
                        style={styles.venueOptionImage}
                        contentFit="cover"
                      />
                      <View style={styles.venueOptionContent}>
                        <Text style={[typography.heading3, styles.venueOptionName]}>
                          {venueOption.name}
                        </Text>
                        <Text style={[typography.body, styles.venueOptionType]}>
                          {venueOption.type}
                        </Text>
                      </View>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              )}
            </View>
          </View>
        </View>
      </Modal>
    );
  }

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={resetAndClose}
    >
      <View style={styles.modalContainer}>
        <View style={styles.modalContent}>
          <TouchableOpacity style={styles.closeButton} onPress={resetAndClose}>
            <X size={24} color={colors.text} />
          </TouchableOpacity>
          
          <ScrollView showsVerticalScrollIndicator={false}>
            <Image
              source={{ uri: currentVenue.imageUrl }}
              style={styles.venueImage}
              contentFit="cover"
              transition={300}
            />
            
            <View style={styles.contentPadding}>
              <Text style={[typography.heading2, styles.venueName]}>{currentVenue.name}</Text>
              <Text style={[typography.body, styles.venueDescription]}>{currentVenue.description}</Text>
              
              <View style={styles.infoContainer}>
                <View style={styles.infoItem}>
                  <Text style={[typography.bodySmall, styles.infoLabel]}>Type</Text>
                  <Text style={[typography.body, styles.infoValue]}>{currentVenue.type}</Text>
                </View>
                
                <View style={styles.infoItem}>
                  <Text style={[typography.bodySmall, styles.infoLabel]}>Hours</Text>
                  <Text style={[typography.body, styles.infoValue]}>{currentVenue.openingHours}</Text>
                </View>
                
                <View style={styles.infoItem}>
                  <Text style={[typography.bodySmall, styles.infoLabel]}>Admission</Text>
                  <Text style={[typography.body, styles.infoValue]}>{currentVenue.admission}</Text>
                </View>
              </View>
              
              <View style={styles.divider} />
              
              <Text style={[typography.heading3, styles.sectionTitle]}>
                {isModifying ? "Modify Reservation" : "Make a Reservation"}
              </Text>
              <DateTimePicker 
                onSelectDateTime={handleSelectDateTime} 
                initialDate={initialDate}
                initialTimeSlot={initialTimeSlot}
              />
            </View>
          </ScrollView>
          
          <View style={styles.footer}>
            <Button
              title={isModifying ? "Update Reservation" : "Reserve Visit"}
              onPress={handleReserve}
              disabled={!selectedDate || !selectedTimeSlot || isSubmitting}
              loading={isSubmitting}
              icon={isModifying ? 
                <Calendar size={18} color={colors.primary} /> : 
                <Check size={18} color={colors.primary} />
              }
              analyticsEventName={isModifying ? Analytics.Events.MODIFY_RESERVATION : Analytics.Events.CREATE_RESERVATION}
              analyticsProperties={{
                venue_id: currentVenue.id,
                venue_name: currentVenue.name,
                venue_type: currentVenue.type,
                date: selectedDate?.toISOString(),
                time_slot: selectedTimeSlot
              }}
            />
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    justifyContent: "flex-end",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  modalContent: {
    backgroundColor: colors.primary,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    height: height * 0.85,
  },
  closeButton: {
    position: "absolute",
    top: 16,
    right: 16,
    zIndex: 10,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    borderRadius: 20,
    padding: 8,
  },
  venueImage: {
    height: 220,
    width: "100%",
  },
  contentPadding: {
    padding: 20,
  },
  title: {
    marginBottom: 8,
    color: colors.text,
  },
  subtitle: {
    marginBottom: 20,
    color: colors.muted,
  },
  venueName: {
    marginBottom: 8,
    color: colors.text,
  },
  venueDescription: {
    marginBottom: 20,
    color: colors.text,
    opacity: 0.9,
  },
  infoContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 24,
  },
  infoItem: {
    flex: 1,
  },
  infoLabel: {
    color: colors.muted,
    marginBottom: 4,
  },
  infoValue: {
    color: colors.text,
  },
  divider: {
    height: 1,
    backgroundColor: colors.border,
    marginBottom: 24,
  },
  sectionTitle: {
    marginBottom: 16,
    color: colors.text,
  },
  footer: {
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  venuesList: {
    maxHeight: 300,
  },
  venueOption: {
    flexDirection: "row",
    padding: 12,
    borderRadius: 8,
    backgroundColor: colors.card,
    marginBottom: 8,
  },
  venueOptionImage: {
    width: 60,
    height: 60,
    borderRadius: 8,
  },
  venueOptionContent: {
    flex: 1,
    marginLeft: 12,
    justifyContent: "center",
  },
  venueOptionName: {
    color: colors.text,
    marginBottom: 4,
  },
  venueOptionType: {
    color: colors.muted,
    fontSize: 14,
  },
});