import React, { useState, useEffect } from "react";
import { 
  StyleSheet, 
  Text, 
  View, 
  Modal, 
  TouchableOpacity, 
  ScrollView,
  Platform,
  Alert,
  KeyboardAvoidingView,
  Keyboard,
  TouchableWithoutFeedback,
  ActivityIndicator
} from "react-native";
import { X, Check, Crown, Ticket, Star, Zap, CreditCard, AlertTriangle } from "lucide-react-native";
import colors from "@/constants/colors";
import typography from "@/constants/typography";
import Button from "./Button";
import { useProfileStore } from "@/store/useProfileStore";
import PaymentMethodModal, { PaymentDetails } from "./PaymentMethodModal";
import StripePaymentMethodModal from "./StripePaymentMethodModal";
import * as Analytics from "@/utils/analytics";
import { useStripe } from "@/context/StripeContext";
import { SUBSCRIPTION_PLANS } from "@/config/stripe";

interface SubscriptionModalProps {
  visible: boolean;
  onClose: () => void;
}

interface SubscriptionTier {
  id: string;
  name: string;
  price: number;
  icon: React.ReactNode;
  description: string;
  features: string[];
  color: string;
  emoji?: string;
  isFree?: boolean;
  stripePriceId?: string | null;
}

type ModalState = "selection" | "confirmation" | "payment" | "processing";

export default function SubscriptionModal({ 
  visible, 
  onClose
}: SubscriptionModalProps) {
  const { 
    getCurrentSubscription, 
    getCurrentPaymentMethod, 
    setSubscription, 
    setPaymentMethod,
    ensureDefaultSubscription,
    getCurrentStripeCustomerId
  } = useProfileStore();
  
  const { 
    createSubscription, 
    updateSubscription, 
    isLoading: isStripeLoading 
  } = useStripe();
  
  // Ensure user has a default subscription
  useEffect(() => {
    if (visible) {
      ensureDefaultSubscription();
    }
  }, [visible, ensureDefaultSubscription]);
  
  const currentSubscription = getCurrentSubscription();
  const currentPaymentMethod = getCurrentPaymentMethod();
  const currentStripeCustomerId = getCurrentStripeCustomerId();
  
  const [selectedTier, setSelectedTier] = useState<string>(
    currentSubscription?.id || "free"
  );
  const [modalState, setModalState] = useState<ModalState>("selection");
  const [paymentModalVisible, setPaymentModalVisible] = useState(false);
  const [stripePaymentModalVisible, setStripePaymentModalVisible] = useState(false);
  const [keyboardVisible, setKeyboardVisible] = useState(false);
  const [processingError, setProcessingError] = useState<string | null>(null);
  
  // Reset modal state when closed
  useEffect(() => {
    if (!visible) {
      setModalState("selection");
      setPaymentModalVisible(false);
      setStripePaymentModalVisible(false);
      setProcessingError(null);
    } else {
      // When modal opens, set the selected tier to the current subscription
      setSelectedTier(currentSubscription?.id || "free");
    }
  }, [visible, currentSubscription]);

  // Track keyboard visibility
  useEffect(() => {
    const keyboardDidShowListener = Keyboard.addListener(
      'keyboardDidShow',
      () => {
        setKeyboardVisible(true);
      }
    );
    const keyboardDidHideListener = Keyboard.addListener(
      'keyboardDidHide',
      () => {
        setKeyboardVisible(false);
      }
    );

    return () => {
      keyboardDidHideListener.remove();
      keyboardDidShowListener.remove();
    };
  }, []);

  const subscriptionTiers: SubscriptionTier[] = [
    {
      id: "free",
      name: "Free Access",
      price: 0,
      icon: <Zap size={24} color="#4CAF50" />,
      description: "Basic access to explore art venues and exhibitions with limited features.",
      features: [
        "Browse museums and galleries",
        "View basic venue information",
        "Create a personal profile"
      ],
      color: "#4CAF50",
      isFree: true,
      stripePriceId: null
    },
    {
      id: "essential",
      name: "Essential Pass",
      price: 9.00,
      icon: <Ticket size={24} color={colors.primary.accent} />,
      description: "Perfect for casual art enthusiasts who want to explore museums and galleries without commitment.",
      features: [
        "All Free Access features",
        "Access to event invitations and early access notifications",
        "Discounts on select museum and gallery tickets"
      ],
      color: "#E0E0E0",
      stripePriceId: SUBSCRIPTION_PLANS?.essential?.stripePriceId
    },
    {
      id: "explorer",
      name: "Art Explorer",
      price: 12.00,
      icon: <Star size={24} color="#FFD700" />,
      description: "Designed for frequent visitors who want a more immersive art experience.",
      features: [
        "All Essential Pass features",
        "Full access to exclusive event invitations",
        "Priority booking for limited exhibitions and VIP events",
        "Access to behind-the-scenes content, artist interviews, and virtual tours",
        "Personalized recommendations based on visit history and favorites"
      ],
      color: "#FFD700",
      emoji: "🎨",
      stripePriceId: SUBSCRIPTION_PLANS?.explorer?.stripePriceId
    },
    {
      id: "collector",
      name: "Master Collector",
      price: 20.00,
      icon: <Crown size={24} color="#9C27B0" />,
      description: "The ultimate membership for serious art collectors and VIP attendees.",
      features: [
        "All Art Explorer features",
        "Unlimited VIP access to exclusive art events and private gallery openings",
        "First access to purchasing limited-edition artwork",
        "Concierge booking for private tours and consultations with curators",
        "Early invitations to auctions and exclusive networking events",
        "White-glove customer support for all reservations and purchases"
      ],
      color: "#9C27B0",
      emoji: "🌟",
      stripePriceId: SUBSCRIPTION_PLANS?.collector?.stripePriceId
    }
  ];

  const getSelectedTierDetails = () => {
    return subscriptionTiers.find(tier => tier.id === selectedTier);
  };

  const isUpgrade = () => {
    if (!currentSubscription) return selectedTier !== "free";
    
    // Define tier hierarchy for comparison
    const tierValues = {
      "free": 0,
      "essential": 1,
      "explorer": 2,
      "collector": 3
    };
    
    return tierValues[selectedTier as keyof typeof tierValues] > 
           tierValues[currentSubscription.id as keyof typeof tierValues];
  };

  const isDowngrade = () => {
    if (!currentSubscription) return false;
    
    // Define tier hierarchy for comparison
    const tierValues = {
      "free": 0,
      "essential": 1,
      "explorer": 2,
      "collector": 3
    };
    
    return tierValues[selectedTier as keyof typeof tierValues] < 
           tierValues[currentSubscription.id as keyof typeof tierValues];
  };

  const handleContinue = () => {
    const selectedTierDetails = getSelectedTierDetails();
    
    if (!selectedTierDetails) return;
    
    // If selecting free tier, no confirmation needed
    if (selectedTierDetails.isFree) {
      handleSaveSubscription();
      return;
    }
    
    // If no change in subscription, just close
    if (currentSubscription && currentSubscription.id === selectedTier) {
      onClose();
      return;
    }
    
    // Log analytics event
    Analytics.logEvent(Analytics.Events.SUBSCRIPTION_TIER_SELECTED, {
      tier_id: selectedTier,
      tier_name: selectedTierDetails.name,
      tier_price: selectedTierDetails.price,
      is_upgrade: isUpgrade(),
      is_downgrade: isDowngrade()
    });
    
    // Move to confirmation screen
    setModalState("confirmation");
  };

  const handleConfirmUpgrade = () => {
    // Check if user has payment method on file
    if (!currentPaymentMethod && !getSelectedTierDetails()?.isFree) {
      // Log analytics event
      Analytics.logEvent(Analytics.Events.SUBSCRIPTION_PAYMENT_REQUIRED, {
        tier_id: selectedTier
      });
      
      // Show Stripe payment modal instead of the old one
      setStripePaymentModalVisible(true);
    } else {
      // User has payment method, proceed with subscription
      handleProcessSubscription();
    }
  };

  const handleSavePaymentMethod = (paymentDetails: PaymentDetails) => {
    // In a real app, you would securely send this to your backend
    // For this demo, we'll just store the last 4 digits of the card
    const cardNumber = paymentDetails.cardNumber.replace(/\s/g, "");
    const last4 = cardNumber.length >= 4 ? cardNumber.substring(cardNumber.length - 4) : "****";
    
    // Log payment method update
    Analytics.logEvent(Analytics.Events.PAYMENT_METHOD_ADDED, {
      card_type: getCardType(cardNumber),
      for_subscription: true
    });
    
    setPaymentMethod({
      cardType: getCardType(cardNumber),
      last4: last4,
      expirationDate: paymentDetails.expirationDate
    });
    
    // Close payment modal
    setPaymentModalVisible(false);
    
    // Proceed with subscription
    handleProcessSubscription();
  };
  
  const handleSaveStripePaymentMethod = (paymentMethod: any) => {
    // Store the payment method details in our profile store
    setPaymentMethod({
      cardType: paymentMethod.card.brand,
      last4: paymentMethod.card.last4,
      expirationDate: `${paymentMethod.card.exp_month}/${paymentMethod.card.exp_year.toString().slice(-2)}`,
      stripePaymentMethodId: paymentMethod.id
    });
    
    // Log payment method update
    Analytics.logEvent(Analytics.Events.STRIPE_PAYMENT_METHOD_ADDED, {
      card_type: paymentMethod.card.brand,
      for_subscription: true
    });
    
    // Close payment modal
    setStripePaymentModalVisible(false);
    
    // Proceed with subscription
    handleProcessSubscription();
  };
  
  const getCardType = (cardNumber: string) => {
    if (!cardNumber || cardNumber.length < 2) {
      return "Unknown Card";
    }
    // Improved card type detection
    const firstDigit = cardNumber.charAt(0);
    const firstTwoDigits = cardNumber.length >= 2 ? cardNumber.substring(0, 2) : "";
    
    if (firstTwoDigits === "34" || firstTwoDigits === "37") {
      return "American Express";
    }
    if (firstDigit === "4") return "Visa";
    if (firstDigit === "5") return "Mastercard";
    if (firstDigit === "6") return "Discover";
    
    return "Credit Card";
  };

  const handleProcessSubscription = async () => {
    setModalState("processing");
    setProcessingError(null);
    
    const selectedTierDetails = getSelectedTierDetails();
    if (!selectedTierDetails) {
      setProcessingError("Invalid subscription tier selected");
      return;
    }
    
    try {
      // For free tier, just update locally
      if (selectedTierDetails.isFree) {
        handleSaveSubscription();
        return;
      }
      
      // Log analytics event
      Analytics.logEvent(Analytics.Events.SUBSCRIPTION_PROCESSING_STARTED, {
        tier_id: selectedTier,
        tier_name: selectedTierDetails.name,
        tier_price: selectedTierDetails.price,
        is_upgrade: isUpgrade(),
        is_downgrade: isDowngrade(),
        has_stripe_customer_id: !!currentStripeCustomerId
      });
      
      // For paid tiers, process with Stripe
      if (!selectedTierDetails.stripePriceId) {
        throw new Error("Invalid price ID for selected tier");
      }
      
      // Get payment method ID from current payment method
      const paymentMethodId = currentPaymentMethod?.stripePaymentMethodId || "pm_card_visa";
      
      let result;
      
      // If user already has a subscription, update it
      if (currentSubscription && currentSubscription.stripeSubscriptionId && currentSubscription.id !== "free") {
        result = await updateSubscription(
          currentSubscription.stripeSubscriptionId,
          selectedTierDetails.stripePriceId
        );
        
        // Log analytics event
        Analytics.logEvent(Analytics.Events.SUBSCRIPTION_UPDATED, {
          previous_tier: currentSubscription.id,
          new_tier: selectedTier,
          subscription_id: currentSubscription.stripeSubscriptionId
        });
      } else {
        // Create a new subscription
        result = await createSubscription(
          selectedTierDetails.stripePriceId,
          paymentMethodId
        );
        
        // Log analytics event
        Analytics.logEvent(Analytics.Events.SUBSCRIPTION_CREATED, {
          tier_id: selectedTier,
          subscription_id: result.id
        });
      }
      
      // If we get here, the subscription was successful
      console.log("Subscription result:", result);
      
      // Update local subscription data with Stripe details
      handleSaveSubscription(result.id);
      
    } catch (error) {
      console.error("Subscription error:", error);
      setProcessingError(error instanceof Error ? error.message : "Failed to process subscription");
      setModalState("confirmation");
      
      // Log analytics event
      Analytics.logEvent(Analytics.Events.SUBSCRIPTION_ERROR, {
        tier_id: selectedTier,
        error: error instanceof Error ? error.message : "Unknown error"
      });
    }
  };

  const handleSaveSubscription = (stripeSubscriptionId?: string) => {
    const selectedSubscriptionTier = getSelectedTierDetails();
    
    if (selectedSubscriptionTier) {
      // Log subscription change
      Analytics.logEvent(Analytics.Events.CHANGE_SUBSCRIPTION, {
        previous_tier: currentSubscription?.id || "none",
        new_tier: selectedSubscriptionTier.id,
        price: selectedSubscriptionTier.price
      });
      
      setSubscription({
        id: selectedSubscriptionTier.id,
        name: selectedSubscriptionTier.name,
        price: selectedSubscriptionTier.price,
        renewalDate: selectedSubscriptionTier.isFree ? "Never" : getRenewalDate(),
        stripeSubscriptionId: stripeSubscriptionId,
        stripePriceId: selectedSubscriptionTier.stripePriceId || undefined
      });
      
      // Show success message
      Alert.alert(
        "Subscription Updated",
        `You are now subscribed to the ${selectedSubscriptionTier.name} plan.`,
        [{ text: "OK" }]
      );
    }
    
    onClose();
  };
  
  const getRenewalDate = () => {
    const date = new Date();
    date.setMonth(date.getMonth() + 1);
    return date.toISOString().split('T')[0];
  };

  const renderSelectionView = () => (
    <>
      <ScrollView 
        showsVerticalScrollIndicator={false} 
        style={styles.scrollContainer}
        contentContainerStyle={styles.scrollContent}
      >
        <Text style={styles.subtitle}>Choose your membership tier</Text>
        
        {subscriptionTiers.map((tier) => (
          <TouchableOpacity
            key={tier.id}
            style={[
              styles.tierCard,
              selectedTier === tier.id && styles.selectedTierCard,
              { borderColor: selectedTier === tier.id ? tier.color : colors.primary.border }
            ]}
            onPress={() => {
              setSelectedTier(tier.id);
              
              // Log analytics event
              Analytics.logEvent(Analytics.Events.SUBSCRIPTION_TIER_VIEWED, {
                tier_id: tier.id,
                tier_name: tier.name,
                tier_price: tier.price
              });
            }}
            activeOpacity={0.7}
          >
            <View style={styles.tierHeader}>
              <View style={[styles.tierIconContainer, { backgroundColor: `${tier.color}20` }]}>
                {tier.icon}
              </View>
              <View style={styles.tierTitleContainer}>
                <Text style={[typography.heading4, styles.tierName]}>{tier.name}</Text>
                <Text style={styles.tierPrice}>
                  {tier.isFree ? "Free" : `$${tier.price.toFixed(2)}/month`}
                </Text>
              </View>
              <View style={[
                styles.radioButton,
                selectedTier === tier.id && styles.radioButtonSelected,
                { borderColor: selectedTier === tier.id ? tier.color : colors.primary.border }
              ]}>
                {selectedTier === tier.id && (
                  <View style={[styles.radioButtonInner, { backgroundColor: tier.color }]} />
                )}
              </View>
            </View>
            
            <Text style={styles.tierDescription}>{tier.description}</Text>
            
            <View style={styles.featuresContainer}>
              {tier.features.map((feature, index) => (
                <View key={index} style={styles.featureRow}>
                  {tier.emoji ? (
                    <Text style={styles.featureEmoji}>{tier.emoji}</Text>
                  ) : (
                    <Check size={16} color={tier.color} style={styles.featureIcon} />
                  )}
                  <Text style={styles.featureText}>{feature}</Text>
                </View>
              ))}
            </View>
          </TouchableOpacity>
        ))}
        
        {currentSubscription && (
          <View style={styles.currentSubscriptionInfo}>
            <Text style={styles.currentSubscriptionText}>
              Current plan: <Text style={styles.currentSubscriptionHighlight}>{currentSubscription.name}</Text>
            </Text>
            <Text style={styles.renewalText}>
              {currentSubscription.renewalDate === "Never" 
                ? "No renewal (free plan)" 
                : `Next renewal: ${currentSubscription.renewalDate}`}
            </Text>
          </View>
        )}
      </ScrollView>
      
      <View style={styles.footer}>
        <Button
          title={currentSubscription ? "Continue" : "Select Plan"}
          onPress={handleContinue}
          variant="primary"
          analyticsEventName={Analytics.Events.SUBSCRIPTION_CONTINUE_BUTTON}
        />
      </View>
    </>
  );

  const renderConfirmationView = () => {
    const selectedTierDetails = getSelectedTierDetails();
    if (!selectedTierDetails) return null;
    
    return (
      <>
        <ScrollView 
          showsVerticalScrollIndicator={false} 
          style={styles.scrollContainer}
          contentContainerStyle={styles.scrollContent}
        >
          <View style={styles.confirmationContainer}>
            <View style={[styles.tierIconContainer, { 
              backgroundColor: `${selectedTierDetails.color}20`,
              width: 60,
              height: 60,
              borderRadius: 30,
              marginBottom: 16
            }]}>
              {selectedTierDetails.icon}
            </View>
            
            <Text style={[typography.heading3, styles.confirmationTitle]}>
              {isUpgrade() ? "Upgrade to " : "Switch to "}
              {selectedTierDetails.name}
            </Text>
            
            <Text style={styles.confirmationPrice}>
              ${selectedTierDetails.price.toFixed(2)}/month
            </Text>
            
            <View style={styles.divider} />
            
            <View style={styles.summaryContainer}>
              <Text style={styles.summaryTitle}>Subscription Summary</Text>
              
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>New Plan:</Text>
                <Text style={styles.summaryValue}>{selectedTierDetails.name}</Text>
              </View>
              
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Price:</Text>
                <Text style={styles.summaryValue}>${selectedTierDetails.price.toFixed(2)}/month</Text>
              </View>
              
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Billing Date:</Text>
                <Text style={styles.summaryValue}>Today</Text>
              </View>
              
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Next Renewal:</Text>
                <Text style={styles.summaryValue}>{getRenewalDate()}</Text>
              </View>
              
              {currentPaymentMethod ? (
                <View style={styles.paymentMethodContainer}>
                  <View style={styles.paymentMethodHeader}>
                    <CreditCard size={20} color={colors.primary.muted} />
                    <Text style={styles.paymentMethodTitle}>Payment Method</Text>
                  </View>
                  <Text style={styles.paymentMethodDetails}>
                    {currentPaymentMethod.cardType} •••• {currentPaymentMethod.last4}
                  </Text>
                  <Text style={styles.paymentMethodExpiry}>
                    Expires: {currentPaymentMethod.expirationDate}
                  </Text>
                </View>
              ) : (
                <View style={styles.noPaymentWarning}>
                  <AlertTriangle size={20} color={colors.status.warning} />
                  <Text style={styles.noPaymentText}>
                    You will need to add a payment method to complete this subscription.
                  </Text>
                </View>
              )}
            </View>
            
            {processingError && (
              <View style={styles.errorContainer}>
                <AlertTriangle size={20} color={colors.status.error} />
                <Text style={styles.errorText}>{processingError}</Text>
              </View>
            )}
            
            {isDowngrade() && (
              <View style={styles.downgradeWarning}>
                <AlertTriangle size={20} color={colors.status.warning} />
                <Text style={styles.downgradeWarningText}>
                  Downgrading will reduce your access to premium features immediately.
                </Text>
              </View>
            )}
          </View>
        </ScrollView>
        
        <View style={styles.footer}>
          <View style={styles.footerButtonRow}>
            <Button
              title="Cancel"
              onPress={() => {
                setModalState("selection");
                
                // Log analytics event
                Analytics.logEvent(Analytics.Events.SUBSCRIPTION_CONFIRMATION_CANCELLED, {
                  tier_id: selectedTier
                });
              }}
              variant="outline"
              style={styles.cancelButton}
              analyticsEventName={Analytics.Events.SUBSCRIPTION_CONFIRMATION_CANCEL}
            />
            <Button
              title={currentPaymentMethod ? "Confirm" : "Add Payment Method"}
              onPress={() => {
                if (currentPaymentMethod) {
                  handleConfirmUpgrade();
                  
                  // Log analytics event
                  Analytics.logEvent(Analytics.Events.SUBSCRIPTION_CONFIRMED, {
                    tier_id: selectedTier,
                    tier_name: selectedTierDetails.name,
                    tier_price: selectedTierDetails.price
                  });
                } else {
                  setStripePaymentModalVisible(true);
                  
                  // Log analytics event
                  Analytics.logEvent(Analytics.Events.SUBSCRIPTION_ADD_PAYMENT_METHOD, {
                    tier_id: selectedTier
                  });
                }
              }}
              variant="primary"
              style={styles.confirmButton}
              analyticsEventName={currentPaymentMethod ? Analytics.Events.SUBSCRIPTION_CONFIRM : Analytics.Events.SUBSCRIPTION_ADD_PAYMENT_METHOD}
            />
          </View>
        </View>
      </>
    );
  };

  const renderProcessingView = () => (
    <View style={styles.processingContainer}>
      <ActivityIndicator size="large" color={colors.primary.accent} />
      <Text style={styles.processingText}>Processing your subscription...</Text>
      <Text style={styles.processingSubtext}>Please do not close this screen.</Text>
    </View>
  );

  return (
    <>
      <Modal
        visible={visible}
        transparent
        animationType="slide"
        onRequestClose={onClose}
      >
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <KeyboardAvoidingView
            behavior={Platform.OS === "ios" ? "padding" : "height"}
            style={styles.modalContainer}
            keyboardVerticalOffset={Platform.OS === "ios" ? 40 : 0}
          >
            <View style={[
              styles.modalContent,
              keyboardVisible && Platform.OS === "android" ? { height: "95%" } : {}
            ]}>
              <View style={styles.header}>
                <Text style={[typography.heading3, styles.title]}>
                  {modalState === "selection" ? "Manage Subscription" : 
                  modalState === "confirmation" ? "Confirm Subscription" : 
                  modalState === "processing" ? "Processing" :
                  "Payment Required"}
                </Text>
                <TouchableOpacity 
                  style={styles.closeButton} 
                  onPress={() => {
                    onClose();
                    
                    // Log analytics event
                    Analytics.logEvent(Analytics.Events.SUBSCRIPTION_MODAL_CLOSED, {
                      state: modalState
                    });
                  }}
                  hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                  disabled={modalState === "processing"}
                >
                  <X size={24} color={modalState === "processing" ? colors.primary.muted : colors.primary.text} />
                </TouchableOpacity>
              </View>
              
              {modalState === "selection" && renderSelectionView()}
              {modalState === "confirmation" && renderConfirmationView()}
              {modalState === "processing" && renderProcessingView()}
            </View>
          </KeyboardAvoidingView>
        </TouchableWithoutFeedback>
      </Modal>
      
      {/* Legacy payment modal - can be removed once Stripe is fully integrated */}
      <PaymentMethodModal
        visible={paymentModalVisible}
        onClose={() => setPaymentModalVisible(false)}
        onSave={handleSavePaymentMethod}
      />
      
      {/* New Stripe payment modal */}
      <StripePaymentMethodModal
        visible={stripePaymentModalVisible}
        onClose={() => setStripePaymentModalVisible(false)}
        onSave={handleSaveStripePaymentMethod}
      />
    </>
  );
}

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    justifyContent: "flex-end",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  modalContent: {
    backgroundColor: colors.primary.background,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    height: Platform.OS === "ios" ? "90%" : "90%",
    maxHeight: 650,
  },
  header: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: colors.primary.border,
    position: "relative",
  },
  title: {
    textAlign: "center",
  },
  closeButton: {
    position: "absolute",
    right: 20,
    padding: 8,
    zIndex: 10,
  },
  scrollContainer: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 40,
  },
  subtitle: {
    ...typography.body,
    color: colors.primary.muted,
    marginBottom: 20,
    textAlign: "center",
  },
  tierCard: {
    backgroundColor: colors.primary.card,
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderWidth: 2,
    borderColor: colors.primary.border,
  },
  selectedTierCard: {
    borderWidth: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  tierHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  tierIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  tierTitleContainer: {
    flex: 1,
  },
  tierName: {
    marginBottom: 4,
  },
  tierPrice: {
    ...typography.bodySmall,
    color: colors.primary.muted,
    fontWeight: "600",
  },
  radioButton: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: colors.primary.border,
    justifyContent: "center",
    alignItems: "center",
  },
  radioButtonSelected: {
    borderColor: colors.primary.accent,
  },
  radioButtonInner: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: colors.primary.accent,
  },
  tierDescription: {
    ...typography.bodySmall,
    color: colors.primary.text,
    marginBottom: 16,
  },
  featuresContainer: {
    marginTop: 8,
  },
  featureRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: 8,
  },
  featureIcon: {
    marginRight: 8,
  },
  featureEmoji: {
    fontSize: 16,
    marginRight: 8,
  },
  featureText: {
    ...typography.bodySmall,
    color: colors.primary.text,
    flex: 1,
  },
  currentSubscriptionInfo: {
    backgroundColor: colors.primary.secondary,
    borderRadius: 12,
    padding: 16,
    marginTop: 8,
  },
  currentSubscriptionText: {
    ...typography.bodySmall,
    color: colors.primary.text,
  },
  currentSubscriptionHighlight: {
    fontWeight: "600",
    color: colors.primary.accent,
  },
  renewalText: {
    ...typography.caption,
    color: colors.primary.muted,
    marginTop: 4,
  },
  footer: {
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: colors.primary.border,
  },
  footerButtonRow: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  cancelButton: {
    flex: 1,
    marginRight: 8,
  },
  confirmButton: {
    flex: 1,
    marginLeft: 8,
  },
  confirmationContainer: {
    alignItems: "center",
  },
  confirmationTitle: {
    marginBottom: 8,
    textAlign: "center",
  },
  confirmationPrice: {
    ...typography.heading4,
    color: colors.primary.accent,
    marginBottom: 24,
  },
  divider: {
    height: 1,
    backgroundColor: colors.primary.border,
    width: "100%",
    marginBottom: 24,
  },
  summaryContainer: {
    width: "100%",
    marginBottom: 24,
  },
  summaryTitle: {
    ...typography.heading4,
    marginBottom: 16,
  },
  summaryRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 12,
  },
  summaryLabel: {
    ...typography.body,
    color: colors.primary.muted,
  },
  summaryValue: {
    ...typography.body,
    fontWeight: "600",
  },
  paymentMethodContainer: {
    backgroundColor: colors.primary.card,
    borderRadius: 12,
    padding: 16,
    marginTop: 16,
  },
  paymentMethodHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  paymentMethodTitle: {
    ...typography.bodySmall,
    fontWeight: "600",
    marginLeft: 8,
  },
  paymentMethodDetails: {
    ...typography.body,
    marginBottom: 4,
  },
  paymentMethodExpiry: {
    ...typography.caption,
    color: colors.primary.muted,
  },
  noPaymentWarning: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255, 193,7,0.1)",
    borderRadius: 12,
    padding: 16,
    marginTop: 16,
  },
  noPaymentText: {
    ...typography.bodySmall,
    color: colors.primary.text,
    marginLeft: 8,
    flex: 1,
  },
  downgradeWarning: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255,193,7,0.1)",
    borderRadius: 12,
    padding: 16,
    marginTop: 16,
    width: "100%",
  },
  downgradeWarningText: {
    ...typography.bodySmall,
    color: colors.primary.text,
    marginLeft: 8,
    flex: 1,
  },
  errorContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(244,67,54,0.1)",
    borderRadius: 12,
    padding: 16,
    marginTop: 16,
    width: "100%",
  },
  errorText: {
    ...typography.bodySmall,
    color: colors.status.error,
    marginLeft: 8,
    flex: 1,
  },
  processingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  processingText: {
    ...typography.heading4,
    marginTop: 20,
    textAlign: "center",
  },
  processingSubtext: {
    ...typography.body,
    color: colors.primary.muted,
    marginTop: 8,
    textAlign: "center",
  },
});