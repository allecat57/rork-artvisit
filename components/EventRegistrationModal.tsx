import React, { useState } from "react";
import {
  Modal,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  Platform,
} from "react-native";
import { X, Minus, Plus, Ticket, CreditCard, Calendar } from "lucide-react-native";
import colors from "@/constants/colors";
import typography from "@/constants/typography";
import Button from "./Button";
import { Event } from "@/types/event";
import { useEventsStore } from "@/store/useEventsStore";
import { useAuthStore } from "@/store/useAuthStore";
import { useProfileStore } from "@/store/useProfileStore";
import * as Analytics from "@/utils/analytics";
import { supabase, isSupabaseConfigured, TABLES } from "@/config/supabase";
import { bookEvent } from "@/utils/bookingApi";

interface EventRegistrationModalProps {
  visible: boolean;
  onClose: () => void;
  event: Event;
}

export default function EventRegistrationModal({
  visible,
  onClose,
  event,
}: EventRegistrationModalProps) {
  const [numberOfTickets, setNumberOfTickets] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  
  const { registerForEvent } = useEventsStore();
  const { user } = useAuthStore();
  const { getCurrentPaymentMethod } = useProfileStore();
  
  const paymentMethod = getCurrentPaymentMethod();
  const totalPrice = event.price * numberOfTickets;
  
  const handleIncrement = () => {
    if (numberOfTickets < event.remainingSpots) {
      setNumberOfTickets(numberOfTickets + 1);
    } else {
      Alert.alert(
        "Maximum Reached",
        `Only ${event.remainingSpots} spots available for this event.`
      );
    }
  };
  
  const handleDecrement = () => {
    if (numberOfTickets > 1) {
      setNumberOfTickets(numberOfTickets - 1);
    }
  };
  
  const handleRegister = async () => {
    if (!user) {
      Alert.alert("Error", "You must be logged in to register for an event.");
      return;
    }
    
    try {
      setIsLoading(true);
      
      // Check for payment method since all events now have a price
      if (!paymentMethod) {
        Alert.alert(
          "Payment Method Required",
          "Please add a payment method in your profile before registering for this event.",
          [
            { text: "OK" }
          ]
        );
        setIsLoading(false);
        return;
      }
      
      // If Supabase is configured, register through Supabase
      if (isSupabaseConfigured()) {
        try {
          // First check if already registered
          const { data: existingReg, error: checkError } = await supabase
            .from(TABLES.EVENT_REGISTRATIONS)
            .select('*')
            .eq('user_id', user.id)
            .eq('event_id', event.id);
          
          if (checkError) {
            console.log("Supabase table doesn't exist or error checking registration:", checkError.message);
            // Fall back to local registration
          } else if (existingReg && existingReg.length > 0) {
            Alert.alert("Already Registered", "You are already registered for this event.");
            setIsLoading(false);
            onClose();
            return;
          }
          
          // Process payment since all events now have a price
          let paymentIntentId;
          if (paymentMethod) {
            // In a real app, this would call your payment processing API
            // For this demo, we'll use the bookEvent utility which handles payments
            const bookingResult = await bookEvent({
              userId: user.id,
              eventId: event.id,
              numberOfTickets,
              paymentMethodId: paymentMethod.stripePaymentMethodId,
              price: event.price
            });
            
            if (!bookingResult.success) {
              throw new Error(bookingResult.message || "Payment failed");
            }
            
            paymentIntentId = bookingResult.paymentIntentId;
          }
          
          // Create registration in Supabase
          const confirmationCode = Math.random().toString(36).substring(2, 10).toUpperCase();
          
          const { data, error } = await supabase
            .from(TABLES.EVENT_REGISTRATIONS)
            .insert([
              {
                event_id: event.id,
                user_id: user.id,
                registration_date: new Date().toISOString(),
                number_of_tickets: numberOfTickets,
                total_price: totalPrice,
                confirmation_code: confirmationCode,
                payment_intent_id: paymentIntentId,
                payment_method_id: paymentMethod?.stripePaymentMethodId
              }
            ])
            .select();
          
          if (error) {
            console.log("Supabase table doesn't exist or error creating registration:", error.message);
            // Fall back to local registration
          } else {
            // Update event remaining spots in Supabase
            const { error: updateError } = await supabase
              .from(TABLES.EVENTS)
              .update({ remaining_spots: event.remainingSpots - numberOfTickets })
              .eq('id', event.id);
            
            if (updateError) {
              console.log("Supabase table doesn't exist or error updating event spots:", updateError.message);
            }
            
            // Log analytics event
            Analytics.logEvent("register_for_event", {
              event_id: event.id,
              user_id: user.id,
              tickets: numberOfTickets,
              price: totalPrice,
              method: "supabase"
            });
            
            Alert.alert(
              "Registration Successful",
              `You have successfully registered for ${event.title}. Your confirmation code is ${confirmationCode}.`
            );
            
            onClose();
            setIsLoading(false);
            return;
          }
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : String(error);
          console.log("Supabase error, falling back to local registration:", errorMessage);
          // Continue to local registration below
        }
      }
      
      // If Supabase is not configured or failed, use the local store
      const registration = registerForEvent(event.id, numberOfTickets);
      
      if (registration) {
        Alert.alert(
          "Registration Successful",
          `You have successfully registered for ${event.title}. Your confirmation code is ${registration.confirmationCode}.`
        );
        
        // Log analytics event
        Analytics.logEvent("register_for_event", {
          event_id: event.id,
          user_id: user.id,
          tickets: numberOfTickets,
          price: totalPrice,
          method: "local"
        });
        
        onClose();
      } else {
        Alert.alert(
          "Registration Failed",
          "There was a problem with your registration. Please try again."
        );
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      console.error("Error in handleRegister:", errorMessage);
      Alert.alert(
        "Registration Error",
        "An unexpected error occurred. Please try again later."
      );
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Register for Event</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <X size={24} color={colors.text} />
            </TouchableOpacity>
          </View>
          
          <View style={styles.eventInfo}>
            <Text style={styles.eventTitle}>{event.title}</Text>
            <View style={styles.eventDetail}>
              <Calendar size={16} color={colors.accent} style={styles.eventIcon} />
              <Text style={styles.eventDetailText}>{new Date(event.date).toLocaleDateString()}</Text>
            </View>
            <View style={styles.eventDetail}>
              <Ticket size={16} color={colors.accent} style={styles.eventIcon} />
              <Text style={styles.eventDetailText}>
                ${event.price.toFixed(2)} per ticket
              </Text>
            </View>
          </View>
          
          <View style={styles.ticketSelector}>
            <Text style={styles.sectionTitle}>Number of Tickets</Text>
            <View style={styles.ticketControls}>
              <TouchableOpacity
                onPress={handleDecrement}
                style={[styles.ticketButton, numberOfTickets <= 1 && styles.disabledButton]}
                disabled={numberOfTickets <= 1}
              >
                <Minus size={20} color={numberOfTickets <= 1 ? colors.textMuted : colors.text} />
              </TouchableOpacity>
              <Text style={styles.ticketCount}>{numberOfTickets}</Text>
              <TouchableOpacity
                onPress={handleIncrement}
                style={[styles.ticketButton, numberOfTickets >= event.remainingSpots && styles.disabledButton]}
                disabled={numberOfTickets >= event.remainingSpots}
              >
                <Plus size={20} color={numberOfTickets >= event.remainingSpots ? colors.textMuted : colors.text} />
              </TouchableOpacity>
            </View>
          </View>
          
          <View style={styles.paymentSection}>
            <Text style={styles.sectionTitle}>Payment Method</Text>
            {paymentMethod ? (
              <View style={styles.paymentMethod}>
                <CreditCard size={20} color={colors.accent} style={styles.paymentIcon} />
                <Text style={styles.paymentText}>
                  {paymentMethod.cardType} •••• {paymentMethod.last4}
                </Text>
              </View>
            ) : (
              <Text style={styles.noPaymentText}>
                No payment method on file. Please add one in your profile.
              </Text>
            )}
          </View>
          
          <View style={styles.summarySection}>
            <Text style={styles.sectionTitle}>Order Summary</Text>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Tickets</Text>
              <Text style={styles.summaryValue}>{numberOfTickets} x ${event.price.toFixed(2)}</Text>
            </View>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Subtotal</Text>
              <Text style={styles.summaryValue}>${(event.price * numberOfTickets).toFixed(2)}</Text>
            </View>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Service Fee</Text>
              <Text style={styles.summaryValue}>$0.00</Text>
            </View>
            <View style={styles.totalRow}>
              <Text style={styles.totalLabel}>Total</Text>
              <Text style={styles.totalValue}>
                ${totalPrice.toFixed(2)}
              </Text>
            </View>
          </View>
          
          <Button
            title={isLoading ? "Processing..." : "Complete Registration"}
            onPress={handleRegister}
            disabled={isLoading || !paymentMethod}
            style={styles.registerButton}
            icon={isLoading ? <ActivityIndicator size="small" color="#FFFFFF" /> : null}
          />
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "flex-end",
  },
  modalContainer: {
    backgroundColor: colors.background,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    maxHeight: "90%",
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  modalTitle: {
    ...typography.heading3,
    color: colors.text,
  },
  closeButton: {
    padding: 5,
  },
  eventInfo: {
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
  },
  eventTitle: {
    ...typography.heading4,
    color: colors.text,
    marginBottom: 12,
  },
  eventDetail: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  eventIcon: {
    marginRight: 8,
  },
  eventDetailText: {
    ...typography.body,
    color: colors.text,
  },
  ticketSelector: {
    marginBottom: 20,
  },
  sectionTitle: {
    ...typography.heading4,
    color: colors.text,
    marginBottom: 12,
  },
  ticketControls: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  ticketButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.card,
    justifyContent: "center",
    alignItems: "center",
  },
  disabledButton: {
    opacity: 0.5,
  },
  ticketCount: {
    ...typography.heading3,
    color: colors.text,
    marginHorizontal: 20,
  },
  paymentSection: {
    marginBottom: 20,
  },
  paymentMethod: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.card,
    borderRadius: 8,
    padding: 12,
  },
  paymentIcon: {
    marginRight: 12,
  },
  paymentText: {
    ...typography.body,
    color: colors.text,
  },
  noPaymentText: {
    ...typography.body,
    color: colors.status.error,
    backgroundColor: colors.card,
    borderRadius: 8,
    padding: 12,
  },
  summarySection: {
    marginBottom: 20,
  },
  summaryRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  summaryLabel: {
    ...typography.body,
    color: colors.textMuted,
  },
  summaryValue: {
    ...typography.body,
    color: colors.text,
  },
  totalRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    borderTopWidth: 1,
    borderTopColor: colors.border,
    paddingTop: 12,
    marginTop: 8,
  },
  totalLabel: {
    ...typography.heading4,
    color: colors.text,
  },
  totalValue: {
    ...typography.heading4,
    color: colors.text,
  },
  registerButton: {
    marginBottom: Platform.OS === "ios" ? 20 : 0,
  },
});