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
import { X, Check, Calendar, Users, CreditCard, ArrowLeft, ChevronDown, Plus, Minus } from "lucide-react-native";
import { Image } from "expo-image";
import colors from "@/constants/colors";
import typography from "@/constants/typography";
import Button from "./Button";
import DateTimePicker from "./DateTimePicker";
import PaymentMethodModal from "./PaymentMethodModal";
import StripePaymentMethodModal from "./StripePaymentMethodModal";
import { Venue } from "@/types/venue";
import { Reservation } from "@/types/reservation";
import * as Analytics from "@/utils/analytics";
import { useAuthStore } from "@/store/useAuthStore";
import { useReservationStore } from "@/store/useReservationStore";
import { useProfileStore } from "@/store/useProfileStore";
import { useStripe } from "@/context/StripeContext";
import { trpc } from "@/lib/trpc";

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
  const [ticketBreakdown, setTicketBreakdown] = useState<{
    adult: number;
    student: number;
    child: number;
    senior: number;
  }>({ adult: initialPartySize, student: 0, child: 0, senior: 0 });
  const [showTicketDropdown, setShowTicketDropdown] = useState(false);
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
  const sendConfirmationEmail = trpc.email.sendConfirmation.useMutation();
  
  // Use the provided venue or allow selection from venues list
  const currentVenue = venue || selectedVenue;
  const currentPaymentMethod = getCurrentPaymentMethod();
  
  // Calculate reservation total based on ticket breakdown
  useEffect(() => {
    if (currentVenue) {
      const ticketPrices = {
        adult: 15,
        student: 12,
        child: 8,
        senior: 10
      };
      
      const total = 
        (ticketBreakdown.adult * ticketPrices.adult) +
        (ticketBreakdown.student * ticketPrices.student) +
        (ticketBreakdown.child * ticketPrices.child) +
        (ticketBreakdown.senior * ticketPrices.senior);
      
      setReservationTotal(total);
      
      // Update total party size
      const totalSize = ticketBreakdown.adult + ticketBreakdown.student + ticketBreakdown.child + ticketBreakdown.senior;
      setPartySize(totalSize);
    }
  }, [currentVenue, ticketBreakdown]);
  
  useEffect(() => {
    if (visible) {
      // Reset to initial values when modal becomes visible
      setSelectedDate(initialDate || null);
      setSelectedTimeSlot(initialTimeSlot || null);
      setSelectedVenue(venue || null);
      setPartySize(initialPartySize);
      setTicketBreakdown({ adult: initialPartySize, student: 0, child: 0, senior: 0 });
      setCurrentStep('datetime');
      setIsSubmitting(false);
      setConfirmationCode("");
      setShowTicketDropdown(false);
      
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
  
  const handleTicketChange = (type: 'adult' | 'student' | 'child' | 'senior', change: number) => {
    setTicketBreakdown(prev => {
      const newValue = Math.max(0, prev[type] + change);
      const newBreakdown = { ...prev, [type]: newValue };
      
      // Log ticket selection
      if (currentVenue) {
        Analytics.logEvent("reservation_ticket_selected", {
          venue_id: currentVenue.id,
          ticket_type: type,
          quantity: newValue
        });
      }
      
      return newBreakdown;
    });
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
        const reservation: Reservation = {
          id: `res-${Date.now()}`,
          userId: user?.id || "app_user",
          venueId: currentVenue.id,
          date: selectedDate.toISOString().split('T')[0],
          time: selectedTimeSlot,
          status: "confirmed",
          confirmationCode: newConfirmationCode,
          partySize: partySize
        };
        
        // Add to reservation store
        addReservation(reservation);
        
        // Send confirmation email
        if (user?.email) {
          try {
            await sendConfirmationEmail.mutateAsync({
              email: user.email,
              subject: `Reservation Confirmation - ${currentVenue.name}`,
              message: `Dear ${user.name || 'Guest'},

Your reservation has been confirmed!

Reservation Details:
• Venue: ${currentVenue.name}
• Date: ${selectedDate.toLocaleDateString('en-US', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric'
              })}
• Time: ${selectedTimeSlot}
• Party Size: ${partySize} ${partySize === 1 ? 'person' : 'people'}
• Total Amount: ${reservationTotal.toFixed(2)}
• Confirmation Code: ${newConfirmationCode}

Please arrive 15 minutes before your scheduled time and bring a valid ID.

If you need to modify or cancel your reservation, please contact us or use the app.

Thank you for choosing ${currentVenue.name}!

Best regards,
The ${currentVenue.name} Team`
            });
            console.log('✅ Confirmation email sent successfully');
          } catch (emailError) {
            console.error('❌ Failed to send confirmation email:', emailError);
            // Don't fail the reservation if email fails
          }
        }
        
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
      setTicketBreakdown({ adult: 2, student: 0, child: 0, senior: 0 });
      setCurrentStep('datetime');
      setShowTicketDropdown(false);
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
    const ticketTypes = [
      { key: 'adult' as const, label: 'Adult', price: 15, description: 'Ages 18+' },
      { key: 'student' as const, label: 'Student', price: 12, description: 'Valid student ID required' },
      { key: 'child' as const, label: 'Child', price: 8, description: 'Ages 5-17' },
      { key: 'senior' as const, label: 'Senior', price: 10, description: 'Ages 65+' }
    ];
    
    return (
      <View style={styles.partySizeContainer}>
        <Text style={[typography.heading3, styles.sectionTitle]}>Select Tickets</Text>
        <Text style={[typography.body, styles.sectionSubtitle]}>
          Choose ticket types and quantities for your party
        </Text>
        
        <TouchableOpacity 
          style={styles.partySizeDropdownButton}
          onPress={() => setShowTicketDropdown(!showTicketDropdown)}
        >
          <View style={styles.dropdownButtonContent}>
            <Users size={20} color={colors.accent} />
            <Text style={styles.dropdownButtonText}>
              {partySize} {partySize === 1 ? 'Ticket' : 'Tickets'} Selected
            </Text>
          </View>
          <ChevronDown 
            size={20} 
            color={colors.text} 
            style={[styles.chevron, showTicketDropdown && styles.chevronRotated]}
          />
        </TouchableOpacity>
        
        {showTicketDropdown && (
          <View style={styles.ticketDropdown}>
            {ticketTypes.map((ticket) => (
              <View key={ticket.key} style={styles.ticketRow}>
                <View style={styles.ticketInfo}>
                  <Text style={styles.ticketLabel}>{ticket.label}</Text>
                  <Text style={styles.ticketDescription}>{ticket.description}</Text>
                  <Text style={styles.ticketPrice}>${ticket.price}</Text>
                </View>
                
                <View style={styles.ticketControls}>
                  <TouchableOpacity
                    style={[
                      styles.ticketControlButton,
                      ticketBreakdown[ticket.key] === 0 && styles.ticketControlButtonDisabled
                    ]}
                    onPress={() => handleTicketChange(ticket.key, -1)}
                    disabled={ticketBreakdown[ticket.key] === 0}
                  >
                    <Minus size={16} color={ticketBreakdown[ticket.key] === 0 ? colors.muted : colors.accent} />
                  </TouchableOpacity>
                  
                  <Text style={styles.ticketQuantity}>{ticketBreakdown[ticket.key]}</Text>
                  
                  <TouchableOpacity
                    style={styles.ticketControlButton}
                    onPress={() => handleTicketChange(ticket.key, 1)}
                  >
                    <Plus size={16} color={colors.accent} />
                  </TouchableOpacity>
                </View>
              </View>
            ))}
            
            <View style={styles.ticketSummary}>
              <Text style={styles.ticketSummaryText}>
                Total: {partySize} {partySize === 1 ? 'ticket' : 'tickets'} • ${reservationTotal.toFixed(2)}
              </Text>
            </View>
          </View>
        )}
        
        <View style={styles.partySizeNote}>
          <Text style={[typography.bodySmall, styles.noteText]}>
            💡 Student and senior discounts require valid ID at entry. Children under 5 are free.
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
            <Text style={styles.reviewLabel}>Tickets</Text>
            <View style={styles.reviewTicketBreakdown}>
              {ticketBreakdown.adult > 0 && (
                <Text style={styles.reviewTicketLine}>{ticketBreakdown.adult} Adult × $15</Text>
              )}
              {ticketBreakdown.student > 0 && (
                <Text style={styles.reviewTicketLine}>{ticketBreakdown.student} Student × $12</Text>
              )}
              {ticketBreakdown.child > 0 && (
                <Text style={styles.reviewTicketLine}>{ticketBreakdown.child} Child × $8</Text>
              )}
              {ticketBreakdown.senior > 0 && (
                <Text style={styles.reviewTicketLine}>{ticketBreakdown.senior} Senior × $10</Text>
              )}
            </View>
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
          Your reservation has been successfully booked. {user?.email ? 'A confirmation email has been sent to your email address.' : 'Please save your confirmation code for your records.'}
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
        return "Select Tickets";
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
                  <CreditCard size={18} color={colors.accent} /> : 
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
    color: colors.background,
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
    color: colors.background,
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
  // New dropdown styles
  partySizeDropdownButton: {
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: 16,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderWidth: 2,
    borderColor: colors.border,
    marginBottom: 16,
  },
  dropdownButtonContent: {
    flexDirection: "row",
    alignItems: "center",
  },
  dropdownButtonText: {
    ...typography.body,
    color: colors.text,
    marginLeft: 8,
    fontWeight: "500",
  },
  chevron: {
    transform: [{ rotate: "0deg" }],
  },
  chevronRotated: {
    transform: [{ rotate: "180deg" }],
  },
  ticketDropdown: {
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: colors.border,
  },
  ticketRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  ticketInfo: {
    flex: 1,
  },
  ticketLabel: {
    ...typography.body,
    color: colors.text,
    fontWeight: "600",
    marginBottom: 2,
  },
  ticketDescription: {
    ...typography.bodySmall,
    color: colors.textMuted,
    marginBottom: 4,
  },
  ticketPrice: {
    ...typography.body,
    color: colors.accent,
    fontWeight: "600",
  },
  ticketControls: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  ticketControlButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.surface,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: colors.accent,
  },
  ticketControlButtonDisabled: {
    backgroundColor: colors.border,
    borderColor: colors.border,
  },
  ticketQuantity: {
    ...typography.body,
    color: colors.text,
    fontWeight: "600",
    minWidth: 24,
    textAlign: "center",
  },
  ticketSummary: {
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    alignItems: "center",
  },
  ticketSummaryText: {
    ...typography.body,
    color: colors.accent,
    fontWeight: "600",
  },
  reviewTicketBreakdown: {
    flex: 1,
    alignItems: "flex-end",
  },
  reviewTicketLine: {
    ...typography.bodySmall,
    color: colors.text,
    textAlign: "right",
    marginBottom: 2,
  },
});