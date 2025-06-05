import React, { useState, useEffect } from "react";
import { 
  StyleSheet, 
  Text, 
  View, 
  Modal, 
  TouchableOpacity, 
  TextInput,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Keyboard,
  TouchableWithoutFeedback
} from "react-native";
import { X, CreditCard, Lock } from "lucide-react-native";
import colors from "@/constants/colors";
import typography from "@/constants/typography";
import Button from "./Button";

interface PaymentMethodModalProps {
  visible: boolean;
  onClose: () => void;
  onSave: (paymentDetails: PaymentDetails) => void;
}

export interface PaymentDetails {
  cardNumber: string;
  expirationDate: string;
  cvv: string;
  zipCode: string;
}

export default function PaymentMethodModal({ 
  visible, 
  onClose,
  onSave
}: PaymentMethodModalProps) {
  const [cardNumber, setCardNumber] = useState("");
  const [expirationDate, setExpirationDate] = useState("");
  const [cvv, setCvv] = useState("");
  const [zipCode, setZipCode] = useState("");
  const [errors, setErrors] = useState<{[key: string]: string}>({});
  const [keyboardVisible, setKeyboardVisible] = useState(false);
  const [cardType, setCardType] = useState<"amex" | "other" | null>(null);

  // Reset form when modal is opened
  useEffect(() => {
    if (visible) {
      setCardNumber("");
      setExpirationDate("");
      setCvv("");
      setZipCode("");
      setErrors({});
      setCardType(null);
    }
  }, [visible]);

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

  // Detect card type based on first digits
  const detectCardType = (number: string): "amex" | "other" | null => {
    if (!number || number.length < 2) return null;
    
    const cleaned = number.replace(/\D/g, "");
    
    // American Express cards start with 34 or 37
    if (/^3[47]/.test(cleaned)) {
      return "amex";
    }
    
    // For all other card types (Visa, Mastercard, Discover, etc.)
    if (/^[456]/.test(cleaned)) {
      return "other";
    }
    
    return null;
  };

  const formatCardNumber = (text: string) => {
    // Remove all non-digits
    const cleaned = text.replace(/\D/g, "");
    
    // Detect card type
    const type = detectCardType(cleaned);
    setCardType(type);
    
    // Format based on card type
    if (type === "amex") {
      // American Express format: XXXX XXXXXX XXXXX (4-6-5)
      let formatted = cleaned;
      if (cleaned.length > 4) {
        formatted = `${cleaned.slice(0, 4)} ${cleaned.slice(4)}`;
      }
      if (cleaned.length > 10) {
        formatted = `${formatted.slice(0, 11)} ${formatted.slice(11)}`;
      }
      // Limit to 17 characters (15 digits + 2 spaces)
      return formatted.slice(0, 17);
    } else {
      // Standard format: XXXX XXXX XXXX XXXX (4-4-4-4)
      const formatted = cleaned.replace(/(\d{4})(?=\d)/g, "$1 ");
      // Limit to 19 characters (16 digits + 3 spaces)
      return formatted.slice(0, 19);
    }
  };

  const formatExpirationDate = (text: string) => {
    // Remove all non-digits
    const cleaned = text.replace(/\D/g, "");
    // Format as MM/YY
    if (cleaned.length > 2) {
      return `${cleaned.slice(0, 2)}/${cleaned.slice(2, 4)}`;
    }
    return cleaned;
  };

  const handleCardNumberChange = (text: string) => {
    setCardNumber(formatCardNumber(text));
    if (errors.cardNumber) {
      setErrors({...errors, cardNumber: ""});
    }
  };

  const handleExpirationDateChange = (text: string) => {
    setExpirationDate(formatExpirationDate(text));
    if (errors.expirationDate) {
      setErrors({...errors, expirationDate: ""});
    }
  };

  const validateForm = () => {
    const newErrors: {[key: string]: string} = {};
    const cleanedCardNumber = cardNumber.replace(/\s/g, "");
    
    // Validate card number based on card type
    if (cardType === "amex") {
      // American Express should be 15 digits
      if (cleanedCardNumber.length !== 15) {
        newErrors.cardNumber = "Please enter a valid 15-digit American Express card number";
      }
    } else {
      // Other cards should be 16 digits
      if (cleanedCardNumber.length !== 16) {
        newErrors.cardNumber = "Please enter a valid 16-digit card number";
      }
    }
    
    // Validate expiration date (should be MM/YY format)
    if (!expirationDate.match(/^(0[1-9]|1[0-2])\/\d{2}$/)) {
      newErrors.expirationDate = "Please enter a valid expiration date (MM/YY)";
    } else {
      // Check if the card is expired
      const [month, year] = expirationDate.split("/");
      const expiryDate = new Date(2000 + parseInt(year), parseInt(month) - 1, 1);
      const today = new Date();
      if (expiryDate < today) {
        newErrors.expirationDate = "Card has expired";
      }
    }
    
    // Validate CVV (3 digits for most cards, 4 for American Express)
    if (cardType === "amex") {
      if (!cvv.match(/^\d{4}$/)) {
        newErrors.cvv = "Please enter a valid 4-digit CVV for American Express";
      }
    } else {
      if (!cvv.match(/^\d{3}$/)) {
        newErrors.cvv = "Please enter a valid 3-digit CVV";
      }
    }
    
    // Validate zip code (should be 5 digits for US)
    if (!zipCode.match(/^\d{5}$/)) {
      newErrors.zipCode = "Please enter a valid 5-digit zip code";
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = () => {
    if (validateForm()) {
      onSave({
        cardNumber,
        expirationDate,
        cvv,
        zipCode
      });
      
      // Reset form
      setCardNumber("");
      setExpirationDate("");
      setCvv("");
      setZipCode("");
      setErrors({});
      
      onClose();
    }
  };

  const resetAndClose = () => {
    setCardNumber("");
    setExpirationDate("");
    setCvv("");
    setZipCode("");
    setErrors({});
    onClose();
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={resetAndClose}
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
              <Text style={[typography.heading3, styles.title]}>Update Payment Method</Text>
              <TouchableOpacity 
                style={styles.closeButton} 
                onPress={resetAndClose}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              >
                <X size={24} color={colors.primary.text} />
              </TouchableOpacity>
            </View>
            
            <ScrollView 
              showsVerticalScrollIndicator={false}
              contentContainerStyle={styles.scrollContent}
              keyboardShouldPersistTaps="handled"
            >
              <View style={styles.formContainer}>
                <View style={styles.securityNote}>
                  <Lock size={16} color={colors.primary.accent} />
                  <Text style={styles.securityText}>
                    Your payment information is encrypted and stored securely
                  </Text>
                </View>
                
                <View style={styles.inputGroup}>
                  <Text style={styles.label}>Card Number</Text>
                  <View style={[
                    styles.cardInputContainer,
                    errors.cardNumber ? styles.inputError : null
                  ]}>
                    <CreditCard size={20} color={colors.primary.muted} style={styles.cardIcon} />
                    <TextInput
                      style={styles.cardInput}
                      value={cardNumber}
                      onChangeText={handleCardNumberChange}
                      placeholder={cardType === "amex" ? "3782 822463 10005" : "1234 5678 9012 3456"}
                      placeholderTextColor={colors.primary.muted}
                      keyboardType="number-pad"
                      maxLength={cardType === "amex" ? 17 : 19}
                    />
                  </View>
                  {errors.cardNumber ? (
                    <Text style={styles.errorText}>{errors.cardNumber}</Text>
                  ) : (
                    cardType === "amex" && (
                      <Text style={styles.cardTypeText}>American Express</Text>
                    )
                  )}
                </View>
                
                <View style={styles.row}>
                  <View style={[styles.inputGroup, styles.halfWidth]}>
                    <Text style={styles.label}>Expiration Date</Text>
                    <TextInput
                      style={[styles.input, errors.expirationDate ? styles.inputError : null]}
                      value={expirationDate}
                      onChangeText={handleExpirationDateChange}
                      placeholder="MM/YY"
                      placeholderTextColor={colors.primary.muted}
                      keyboardType="number-pad"
                      maxLength={5}
                    />
                    {errors.expirationDate ? (
                      <Text style={styles.errorText}>{errors.expirationDate}</Text>
                    ) : null}
                  </View>
                  
                  <View style={[styles.inputGroup, styles.halfWidth]}>
                    <Text style={styles.label}>CVV</Text>
                    <TextInput
                      style={[styles.input, errors.cvv ? styles.inputError : null]}
                      value={cvv}
                      onChangeText={(text) => {
                        setCvv(text.replace(/\D/g, ""));
                        if (errors.cvv) setErrors({...errors, cvv: ""});
                      }}
                      placeholder={cardType === "amex" ? "4321" : "123"}
                      placeholderTextColor={colors.primary.muted}
                      keyboardType="number-pad"
                      maxLength={cardType === "amex" ? 4 : 3}
                      secureTextEntry
                    />
                    {errors.cvv ? (
                      <Text style={styles.errorText}>{errors.cvv}</Text>
                    ) : cardType === "amex" ? (
                      <Text style={styles.helperText}>4 digits for American Express</Text>
                    ) : null}
                  </View>
                </View>
                
                <View style={styles.inputGroup}>
                  <Text style={styles.label}>Billing Zip Code</Text>
                  <TextInput
                    style={[styles.input, errors.zipCode ? styles.inputError : null]}
                    value={zipCode}
                    onChangeText={(text) => {
                      setZipCode(text.replace(/\D/g, ""));
                      if (errors.zipCode) setErrors({...errors, zipCode: ""});
                    }}
                    placeholder="12345"
                    placeholderTextColor={colors.primary.muted}
                    keyboardType="number-pad"
                    maxLength={5}
                  />
                  {errors.zipCode ? (
                    <Text style={styles.errorText}>{errors.zipCode}</Text>
                  ) : null}
                </View>
              </View>
            </ScrollView>
            
            <View style={styles.footer}>
              <Button
                title="Save Payment Method"
                onPress={handleSave}
                variant="primary"
              />
            </View>
          </View>
        </KeyboardAvoidingView>
      </TouchableWithoutFeedback>
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
    backgroundColor: colors.primary.background,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    height: Platform.OS === "ios" ? "80%" : "90%",
    maxHeight: 600,
  },
  scrollContent: {
    flexGrow: 1,
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
  formContainer: {
    padding: 20,
  },
  securityNote: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(172, 137, 1, 0.1)",
    padding: 12,
    borderRadius: 8,
    marginBottom: 20,
  },
  securityText: {
    ...typography.bodySmall,
    color: colors.primary.text,
    marginLeft: 8,
    flex: 1,
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    ...typography.bodySmall,
    color: colors.primary.muted,
    marginBottom: 8,
  },
  input: {
    backgroundColor: colors.primary.card,
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    color: colors.primary.text,
    fontSize: 16,
    borderWidth: 1,
    borderColor: colors.primary.border,
  },
  cardInput: {
    flex: 1,
    color: colors.primary.text,
    fontSize: 16,
    paddingVertical: 12,
  },
  inputError: {
    borderColor: colors.status.error,
  },
  errorText: {
    ...typography.caption,
    color: colors.status.error,
    marginTop: 4,
  },
  cardTypeText: {
    ...typography.caption,
    color: colors.primary.accent,
    marginTop: 4,
  },
  helperText: {
    ...typography.caption,
    color: colors.primary.muted,
    marginTop: 4,
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  halfWidth: {
    width: "48%",
  },
  cardInputContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.primary.card,
    borderRadius: 8,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: colors.primary.border,
  },
  cardIcon: {
    marginRight: 8,
  },
  footer: {
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: colors.primary.border,
  },
});