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
import { X, Check, Calendar, Users, CreditCard, ArrowLeft } from "lucide-react-native";
import { Image } from "expo-image";
import colors from "@/constants/colors";
import typography from "@/constants/typography";
import Button from "./Button";
import DateTimePicker from "./DateTimePicker";
import PaymentMethodModal from "./PaymentMethodModal";
import StripePaymentMethodModal from "./StripePaymentMethodModal";
import { Venue } from "@/types/venue";
import * as Analytics from "@/utils/analytics";
import { useAuthStore } from "@/store/useAuthStore";
import { useReservationStore } from "@/store/useReservationStore";
import { useProfileStore } from "@/store/useProfileStore";
import { useStripe } from "@/context/StripeContext";

const { height } = Dimensions.get("window");

interface ReservationModalProps {
  visible: boolean;
  venue?: Venue | null;
  venues?: Venue[];
  onClose: () => void;
  onReserve?: (venue: Venue, date: Date, timeSlot: string, partySize: number) => void;
  isModifying?: boolean;
  initialDate?: Date;
  initialTimeSlot?: string;
  initialPartySize?: number;
}

type ReservationStep = 'datetime' | 'party-size' | 'review' | 'payment' | 'confirmation';

export default function ReservationModal({ 
  visible, 
  venue,
  venues,
  onClose,
  onReserve,
  isModifying = false,
  initialDate,
  initialTimeSlot,
  initialPartySize = 2
}: ReservationModalProps) {
  const [selectedDate, setSelectedDate] = useState<Date | null>(initialDate || null);
  const [selectedTimeSlot, setSelectedTimeSlot] = useState<string | null>(initialTimeSlot || null);
  const [selectedVenue, setSelectedVenue] = useState<Venue | null>(venue || null);
  const [partySize, setPartySize] = useState<number>(initialPartySize);
  const [currentStep, setCurrentStep] = useState<ReservationStep>('datetime');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [showStripePaymentModal, setShowStripePaymentModal] = useState(false);
  const [reservationTotal, setReservationTotal] = useState(0);
  const [confirmationCode, setConfirmationCode] = useState<string>("");
  
  const { user } = useAuthStore();
  const { addReservation } = useReservationStore();
  const { getCurrentPaymentMethod, setPaymentMethod } = useProfileStore();
  const { processPayment, isLoading: stripeLoading } = useStripe();
  
  // Use the provided venue or allow selection from venues list
  const currentVenue = venue || selectedVenue;
  const currentPaymentMethod = getCurrentPaymentMethod();
  
  // Calculate reservation total based on party size
  useEffect(() => {
    if (currentVenue && partySize) {
      // Base price per person (you can adjust this logic)
      const basePrice = 15; // $15 per person
      const total = basePrice * partySize;
      setReservationTotal(total);
    }
  }, [currentVenue, partySize]);
  
  useEffect(() => {
    if (visible) {
      // Reset to initial values when modal becomes visible
      setSelectedDate(initialDate || null);
      setSelectedTimeSlot(initialTimeSlot || null);
      setSelectedVenue(venue || null);
      setPartySize(initialPartySize);
      setCurrentStep('datetime');
      setIsSubmitting(false);
      setConfirmationCode("");
      
      // Log modal open event
      if (currentVenue) {
        Analytics.logEvent(isModifying ? Analytics.Events.MODIFY_RESERVATION : Analytics.Events.CREATE_RESERVATION, {
          venue_id: currentVenue.id,
          venue_name: currentVenue.name,
          venue_type: currentVenue.type
        });
      }
    }
  }, [visible, initialDate, initialTimeSlot, venue, currentVenue, isModifying, initialPartySize]);
  
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
  
  const handlePartySizeChange = (size: number) => {
    setPartySize(size);
    
    // Log party size selection
    if (currentVenue) {
      Analytics.logEvent("reservation_party_size_selected", {
        venue_id: currentVenue.id,
        party_size: size
      });
    }
  };
  
  const handleNextStep = () => {
    switch (currentStep) {
      case 'datetime':
        if (selectedDate && selectedTimeSlot) {
          setCurrentStep('party-size');
        }
        break;
      case 'party-size':
        setCurrentStep('review');
        break;
      case 'review':
        setCurrentStep('payment');
        break;
      case 'payment':
        handleProcessPayment();
        break;
    }
  };
  
  const handlePreviousStep = () => {
    switch (currentStep) {
      case 'party-size':
        setCurrentStep('datetime');
        break;
      case 'review':
        setCurrentStep('party-size');
        break;
      case 'payment':
        setCurrentStep('review');
        break;
      case 'confirmation':
        setCurrentStep('payment');
        break;
    }
  };
  
  const handleProcessPayment = async () => {
    if (!currentVenue || !selectedDate || !selectedTimeSlot || !currentPaymentMethod) {
      Alert.alert("Error", "Please ensure all details are complete and a payment method is selected.");
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      // Process payment with Stripe
      const paymentResult = await processPayment(reservationTotal * 100, 'usd'); // Convert to cents
      
      if (paymentResult.status === 'succeeded') {
        // Generate confirmation code
        const newConfirmationCode = `CONF-${Math.random().toString(36).substring(2, 7).toUpperCase()}`;
        setConfirmationCode(newConfirmationCode);
        
        // Create reservation with required properties
        const reservation = {
          id: `res-${Date.now()}`,
          userId: user?.id || "app_user",
          venueId: currentVenue.id,
          date: selectedDate.toISOString().split('T')[0],
          time: selectedTimeSlot,
          status: "confirmed" as const,
          confirmationCode: newConfirmationCode,
          partySize: partySize
        };
        
        // Add to reservation store
        addReservation(reservation);
        
        if (onReserve) {
          onReserve(currentVenue, selectedDate, selectedTimeSlot, partySize);
        }
        
        setCurrentStep('confirmation');
        
        // Log successful booking
        Analytics.logEvent("reservation_confirmed", {
          venue_id: currentVenue.id,
          venue_name: currentVenue.name,
          date: selectedDate.toISOString(),
          time_slot: selectedTimeSlot,
          party_size: partySize,
          total_amount: reservationTotal,
          confirmation_code: newConfirmationCode
        });
      } else {
        throw new Error('Payment failed');
      }
    } catch (error) {
      console.error("Reservation error:", error);
      Alert.alert(
        "Payment Error",
        "There was an issue processing your payment. Please try again.",
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
  
  const handlePaymentMethodSave = (paymentDetails: any) => {
    // Convert payment details to the format expected by the store
    const paymentMethod = {
      cardType: paymentDetails.cardNumber?.startsWith('3') ? 'amex' : 'visa',
      last4: paymentDetails.cardNumber?.slice(-4) || paymentDetails.last4,
      expirationDate: paymentDetails.expirationDate,
      stripePaymentMethodId: paymentDetails.id
    };
    
    setPaymentMethod(paymentMethod);
    setShowPaymentModal(false);
    setShowStripePaymentModal(false);
    
    Analytics.logEvent("payment_method_added_during_reservation", {
      venue_id: currentVenue?.id,
      card_type: paymentMethod.cardType
    });
  };
  
  const resetAndClose = () => {
    // Log modal close event
    if (currentVenue) {
      Analytics.logEvent(isModifying ? "modify_reservation_modal_close" : "reservation_modal_close", {
        venue_id: currentVenue.id,
        venue_name: currentVenue.name,
        completed: currentStep === 'confirmation'
      });
    }
    
    if (!isModifying) {
      setSelectedDate(null);
      setSelectedTimeSlot(null);
      setSelectedVenue(null);
      setPartySize(2);
      setCurrentStep('datetime');
      setConfirmationCode("");
    }
    onClose();
  };

  const renderStepIndicator = () => {
    const steps = ['datetime', 'party-size', 'review', 'payment'];
    const currentStepIndex = steps.indexOf(currentStep);
    
    return (
      <View style={styles.stepIndicator}>
        {steps.map((step, index) => (
          <View key={step} style={styles.stepContainer}>
            <View style={[
              styles.stepCircle,
              index <= currentStepIndex ? styles.stepCircleActive : styles.stepCircleInactive
            ]}>
              <Text style={[
                styles.stepNumber,
                index <= currentStepIndex ? styles.stepNumberActive : styles.stepNumberInactive
              ]}>
                {index + 1}
              </Text>
            </View>
            {index < steps.length - 1 && (
              <View style={[
                styles.stepLine,
                index < currentStepIndex ? styles.stepLineActive : styles.stepLineInactive
              ]} />
            )}
          </View>
        ))}
      </View>
    );
  };

  const renderPartySizeSelector = () => {
    const sizes = [1, 2, 3, 4, 5, 6, 7, 8];
    
    return (
      <View style={styles.partySizeContainer}>
        <Text style={[typography.heading3, styles.sectionTitle]}>How many people?</Text>
        <Text style={[typography.body, styles.sectionSubtitle]}>
          Select the number of people in your party
        </Text>
        
        <View style={styles.partySizeGrid}>
          {sizes.map((size) => (
            <TouchableOpacity
              key={size}
              style={[
                styles.partySizeButton,
                partySize === size && styles.partySizeButtonActive
              ]}
              onPress={() => handlePartySizeChange(size)}
            >
              <Users 
                size={20} 
                color={partySize === size ? colors.primary : colors.text} 
              />
              <Text style={[
                styles.partySizeText,
                partySize === size && styles.partySizeTextActive
              ]}>
                {size} {size === 1 ? 'Person' : 'People'}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
        
        <View style={styles.partySizeNote}>
          <Text style={[typography.bodySmall, styles.noteText]}>
            💡 Larger groups may require special arrangements. Contact the venue directly for parties over 8 people.
          </Text>
        </View>
      </View>
    );
  };

  const renderReviewStep = () => {
    if (!currentVenue || !selectedDate || !selectedTimeSlot) return null;
    
    return (
      <View style={styles.reviewContainer}>
        <Text style={[typography.heading3, styles.sectionTitle]}>Review Your Reservation</Text>
        
        <View style={styles.reviewCard}>
          <View style={styles.reviewRow}>
            <Text style={styles.reviewLabel}>Venue</Text>
            <Text style={styles.reviewValue}>{currentVenue.name}</Text>
          </View>
          
          <View style={styles.reviewRow}>
            <Text style={styles.reviewLabel}>Date</Text>
            <Text style={styles.reviewValue}>
              {selectedDate.toLocaleDateString('en-US', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric'
              })}
            </Text>
          </View>
          
          <View style={styles.reviewRow}>
            <Text style={styles.reviewLabel}>Time</Text>
            <Text style={styles.reviewValue}>{selectedTimeSlot}</Text>
          </View>
          
          <View style={styles.reviewRow}>
            <Text style={styles.reviewLabel}>Party Size</Text>
            <Text style={styles.reviewValue}>{partySize} {partySize === 1 ? 'Person' : 'People'}</Text>
          </View>
          
          <View style={[styles.reviewRow, styles.totalRow]}>
            <Text style={styles.totalLabel}>Total</Text>
            <Text style={styles.totalValue}>${reservationTotal.toFixed(2)}</Text>
          </View>
        </View>
      </View>
    );
  };

  const renderPaymentStep = () => {
    return (
      <View style={styles.paymentContainer}>
        <Text style={[typography.heading3, styles.sectionTitle]}>Payment</Text>
        
        {currentPaymentMethod ? (
          <View style={styles.paymentMethodCard}>
            <View style={styles.paymentMethodHeader}>
              <CreditCard size={24} color={colors.accent} />
              <Text style={styles.paymentMethodTitle}>Payment Method</Text>
            </View>
            
            <View style={styles.paymentMethodDetails}>
              <Text style={styles.paymentMethodText}>
                {currentPaymentMethod.cardType.toUpperCase()} •••• {currentPaymentMethod.last4}
              </Text>
              <Text style={styles.paymentMethodExpiry}>
                Expires {currentPaymentMethod.expirationDate}
              </Text>
            </View>
            
            <TouchableOpacity 
              style={styles.changePaymentButton}
              onPress={() => setShowStripePaymentModal(true)}
            >
              <Text style={styles.changePaymentText}>Change Payment Method</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.noPaymentMethodCard}>
            <CreditCard size={48} color={colors.textMuted} />
            <Text style={styles.noPaymentMethodTitle}>No Payment Method</Text>
            <Text style={styles.noPaymentMethodText}>
              Add a payment method to complete your reservation
            </Text>
            
            <Button
              title="Add Payment Method"
              onPress={() => setShowStripePaymentModal(true)}
              variant="outline"
              style={styles.addPaymentButton}
            />
          </View>
        )}
        
        <View style={styles.paymentSummary}>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Subtotal</Text>
            <Text style={styles.summaryValue}>${reservationTotal.toFixed(2)}</Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Processing Fee</Text>
            <Text style={styles.summaryValue}>$0.00</Text>
          </View>
          <View style={[styles.summaryRow, styles.totalSummaryRow]}>
            <Text style={styles.totalSummaryLabel}>Total</Text>
            <Text style={styles.totalSummaryValue}>${reservationTotal.toFixed(2)}</Text>
          </View>
        </View>
      </View>
    );
  };

  const renderConfirmationStep = () => {
    return (
      <View style={styles.confirmationContainer}>
        <View style={styles.confirmationIcon}>
          <Check size={48} color={colors.success} />
        </View>
        
        <Text style={[typography.heading2, styles.confirmationTitle]}>
          Reservation Confirmed!
        </Text>
        
        <Text style={[typography.body, styles.confirmationText]}>
          Your reservation has been successfully booked. You will receive a confirmation email shortly.
        </Text>
        
        <View style={styles.confirmationDetails}>
          <Text style={styles.confirmationLabel}>Confirmation Code</Text>
          <Text style={styles.confirmationCode}>
            {confirmationCode}
          </Text>
        </View>
        
        <Button
          title="Done"
          onPress={resetAndClose}
          style={styles.doneButton}
        />
      </View>
    );
  };

  const getStepTitle = () => {
    switch (currentStep) {
      case 'datetime':
        return isModifying ? "Modify Date & Time" : "Select Date & Time";
      case 'party-size':
        return "Party Size";
      case 'review':
        return "Review Reservation";
      case 'payment':
        return "Payment";
      case 'confirmation':
        return "Confirmation";
      default:
        return "Make a Reservation";
    }
  };

  const canProceedToNext = () => {
    switch (currentStep) {
      case 'datetime':
        return selectedDate && selectedTimeSlot;
      case 'party-size':
        return partySize > 0;
      case 'review':
        return true;
      case 'payment':
        return currentPaymentMethod && !isSubmitting;
      default:
        return false;
    }
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
          <View style={styles.header}>
            {currentStep !== 'datetime' && currentStep !== 'confirmation' && (
              <TouchableOpacity 
                style={styles.backButton} 
                onPress={handlePreviousStep}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              >
                <ArrowLeft size={24} color={colors.text} />
              </TouchableOpacity>
            )}
            
            <Text style={[typography.heading3, styles.headerTitle]}>{getStepTitle()}</Text>
            
            <TouchableOpacity 
              style={styles.closeButton} 
              onPress={resetAndClose}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <X size={24} color={colors.text} />
            </TouchableOpacity>
          </View>
          
          {currentStep !== 'confirmation' && renderStepIndicator()}
          
          <ScrollView showsVerticalScrollIndicator={false} style={styles.scrollContainer}>
            {currentStep === 'datetime' && (
              <>
                <Image
                  source={{ uri: currentVenue.imageUrl }}
                  style={styles.venueImage}
                  contentFit="cover"
                  transition={300}
                />
                
                <View style={styles.contentPadding}>
                  <Text style={[typography.heading2, styles.venueName]}>{currentVenue.name}</Text>
                  <Text style={[typography.body, styles.venueDescription]}>{currentVenue.description}</Text>
                  
                  <View style={styles.divider} />
                  
                  <DateTimePicker 
                    onSelectDateTime={handleSelectDateTime} 
                    initialDate={initialDate}
                    initialTimeSlot={initialTimeSlot}
                  />
                </View>
              </>
            )}
            
            {currentStep === 'party-size' && (
              <View style={styles.contentPadding}>
                {renderPartySizeSelector()}
              </View>
            )}
            
            {currentStep === 'review' && (
              <View style={styles.contentPadding}>
                {renderReviewStep()}
              </View>
            )}
            
            {currentStep === 'payment' && (
              <View style={styles.contentPadding}>
                {renderPaymentStep()}
              </View>
            )}
            
            {currentStep === 'confirmation' && renderConfirmationStep()}
          </ScrollView>
          
          {currentStep !== 'confirmation' && (
            <View style={styles.footer}>
              <Button
                title={
                  currentStep === 'payment' 
                    ? `Pay $${reservationTotal.toFixed(2)}` 
                    : "Continue"
                }
                onPress={handleNextStep}
                disabled={!canProceedToNext()}
                loading={isSubmitting || stripeLoading}
                icon={currentStep === 'payment' ? 
                  <CreditCard size={18} color={colors.primary} /> : 
                  undefined
                }
                analyticsEventName={
                  currentStep === 'payment' 
                    ? "reservation_payment_initiated"
                    : "reservation_step_continue"
                }
                analyticsProperties={{
                  venue_id: currentVenue.id,
                  venue_name: currentVenue.name,
                  venue_type: currentVenue.type,
                  date: selectedDate?.toISOString(),
                  time_slot: selectedTimeSlot,
                }}
              />
            </View>
          )}
        </View>
      </View>
      
      <PaymentMethodModal
        visible={showPaymentModal}
        onClose={() => setShowPaymentModal(false)}
        onSave={handlePaymentMethodSave}
      />
      
      <StripePaymentMethodModal
        visible={showStripePaymentModal}
        onClose={() => setShowStripePaymentModal(false)}
        onSave={handlePaymentMethodSave}
      />
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
    backgroundColor: colors.background,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    height: height * 0.9,
  },
  header: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    position: "relative",
  },
  headerTitle: {
    textAlign: "center",
    color: colors.text,
  },
  backButton: {
    position: "absolute",
    left: 20,
    padding: 8,
    zIndex: 10,
  },
  closeButton: {
    position: "absolute",
    right: 20,
    padding: 8,
    zIndex: 10,
  },
  stepIndicator: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: colors.card,
  },
  stepContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  stepCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
  },
  stepCircleActive: {
    backgroundColor: colors.accent,
  },
  stepCircleInactive: {
    backgroundColor: colors.border,
  },
  stepNumber: {
    fontSize: 14,
    fontWeight: "600",
  },
  stepNumberActive: {
    color: colors.primary,
  },
  stepNumberInactive: {
    color: colors.textMuted,
  },
  stepLine: {
    width: 40,
    height: 2,
    marginHorizontal: 8,
  },
  stepLineActive: {
    backgroundColor: colors.accent,
  },
  stepLineInactive: {
    backgroundColor: colors.border,
  },
  scrollContainer: {
    flex: 1,
  },
  venueImage: {
    height: 200,
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
    color: colors.textMuted,
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
  divider: {
    height: 1,
    backgroundColor: colors.border,
    marginBottom: 24,
  },
  sectionTitle: {
    marginBottom: 8,
    color: colors.text,
  },
  sectionSubtitle: {
    marginBottom: 20,
    color: colors.textMuted,
  },
  partySizeContainer: {
    marginBottom: 20,
  },
  partySizeGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    marginBottom: 16,
  },
  partySizeButton: {
    width: "48%",
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 2,
    borderColor: colors.border,
  },
  partySizeButtonActive: {
    backgroundColor: colors.accent,
    borderColor: colors.accent,
  },
  partySizeText: {
    marginLeft: 8,
    color: colors.text,
    fontWeight: "500",
  },
  partySizeTextActive: {
    color: colors.primary,
  },
  partySizeNote: {
    backgroundColor: "rgba(172, 137, 1, 0.1)",
    padding: 12,
    borderRadius: 8,
  },
  noteText: {
    color: colors.text,
    textAlign: "center",
  },
  reviewContainer: {
    marginBottom: 20,
  },
  reviewCard: {
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: 16,
  },
  reviewRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  reviewLabel: {
    ...typography.body,
    color: colors.textMuted,
  },
  reviewValue: {
    ...typography.body,
    color: colors.text,
    fontWeight: "500",
    flex: 1,
    textAlign: "right",
  },
  totalRow: {
    borderBottomWidth: 0,
    paddingTop: 16,
    marginTop: 8,
    borderTopWidth: 2,
    borderTopColor: colors.border,
  },
  totalLabel: {
    ...typography.heading4,
    color: colors.text,
  },
  totalValue: {
    ...typography.heading4,
    color: colors.accent,
    fontWeight: "600",
  },
  paymentContainer: {
    marginBottom: 20,
  },
  paymentMethodCard: {
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
  },
  paymentMethodHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  paymentMethodTitle: {
    ...typography.heading4,
    color: colors.text,
    marginLeft: 8,
  },
  paymentMethodDetails: {
    marginBottom: 12,
  },
  paymentMethodText: {
    ...typography.body,
    color: colors.text,
    fontWeight: "500",
  },
  paymentMethodExpiry: {
    ...typography.bodySmall,
    color: colors.textMuted,
    marginTop: 4,
  },
  changePaymentButton: {
    alignSelf: "flex-start",
  },
  changePaymentText: {
    ...typography.bodySmall,
    color: colors.accent,
    fontWeight: "500",
  },
  noPaymentMethodCard: {
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: 24,
    alignItems: "center",
    marginBottom: 20,
  },
  noPaymentMethodTitle: {
    ...typography.heading4,
    color: colors.text,
    marginTop: 12,
    marginBottom: 8,
  },
  noPaymentMethodText: {
    ...typography.body,
    color: colors.textMuted,
    textAlign: "center",
    marginBottom: 16,
  },
  addPaymentButton: {
    minWidth: 160,
  },
  paymentSummary: {
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: 16,
  },
  summaryRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 8,
  },
  summaryLabel: {
    ...typography.body,
    color: colors.textMuted,
  },
  summaryValue: {
    ...typography.body,
    color: colors.text,
  },
  totalSummaryRow: {
    borderTopWidth: 1,
    borderTopColor: colors.border,
    marginTop: 8,
    paddingTop: 12,
  },
  totalSummaryLabel: {
    ...typography.heading4,
    color: colors.text,
  },
  totalSummaryValue: {
    ...typography.heading4,
    color: colors.accent,
    fontWeight: "600",
  },
  confirmationContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 40,
  },
  confirmationIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "rgba(34, 197, 94, 0.1)",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 24,
  },
  confirmationTitle: {
    color: colors.text,
    textAlign: "center",
    marginBottom: 16,
  },
  confirmationText: {
    color: colors.textMuted,
    textAlign: "center",
    marginBottom: 32,
  },
  confirmationDetails: {
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: 16,
    marginBottom: 32,
    alignItems: "center",
  },
  confirmationLabel: {
    ...typography.bodySmall,
    color: colors.textMuted,
    marginBottom: 4,
  },
  confirmationCode: {
    ...typography.heading3,
    color: colors.accent,
    fontWeight: "600",
  },
  doneButton: {
    minWidth: 120,
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
    color: colors.textMuted,
    fontSize: 14,
  },
});