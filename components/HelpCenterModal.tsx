import React, { useState } from "react";
import {
  Modal,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Linking,
  Platform
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { X, Mail, Phone, MessageCircle, HelpCircle, ExternalLink } from "lucide-react-native";
import colors from "@/constants/colors";
import typography from "@/constants/typography";
import * as Analytics from "@/utils/analytics";

interface HelpCenterModalProps {
  visible: boolean;
  onClose: () => void;
}

const HelpCenterModal: React.FC<HelpCenterModalProps> = ({ visible, onClose }) => {
  const [expandedFaq, setExpandedFaq] = useState<number | null>(null);

  const toggleFaq = (index: number) => {
    if (expandedFaq === index) {
      setExpandedFaq(null);
    } else {
      setExpandedFaq(index);
      
      // Log FAQ view event
      Analytics.logEvent("view_faq_item", {
        faq_id: index,
        faq_question: faqs[index].question
      });
    }
  };

  const handleContactMethod = (method: string, action: () => void) => {
    // Log contact method selection
    Analytics.logEvent(Analytics.Events.CONTACT_SUPPORT, {
      contact_method: method
    });
    
    action();
  };

  const faqs = [
    {
      question: "How do I make a reservation?",
      answer: "To make a reservation, navigate to the venue details page and tap the 'Reserve' button. Select your preferred date and time, then confirm your reservation."
    },
    {
      question: "Can I cancel my reservation?",
      answer: "Yes, you can cancel your reservation up to 24 hours before the scheduled time. Go to the 'Reservations' tab, find your reservation, and tap 'Cancel'."
    },
    {
      question: "How do I update my profile information?",
      answer: "You can update your profile information by going to the 'Profile' tab and tapping on 'Edit Profile'. Make your changes and save them."
    },
    {
      question: "What is the difference between subscription tiers?",
      answer: "The Free tier allows basic access to venues and limited reservations. Premium tier offers unlimited reservations, exclusive venues, and priority booking. VIP tier includes all Premium benefits plus personalized recommendations and special event access."
    },
    {
      question: "How do I report an issue with a venue?",
      answer: "If you encounter an issue with a venue, please contact our support team through email or phone. Provide details about the venue and the issue you experienced."
    }
  ];

  return (
    <Modal
      animationType="slide"
      transparent={true}
      visible={visible}
      onRequestClose={onClose}
    >
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.container}>
          <View style={styles.header}>
            <Text style={styles.title}>Help Center</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <X size={24} color={colors.primary.text} />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
            <Text style={styles.sectionTitle}>Frequently Asked Questions</Text>
            
            {faqs.map((faq, index) => (
              <View key={index} style={styles.faqItem}>
                <TouchableOpacity
                  style={styles.faqQuestion}
                  onPress={() => toggleFaq(index)}
                >
                  <Text style={styles.faqQuestionText}>{faq.question}</Text>
                  <HelpCircle
                    size={20}
                    color={expandedFaq === index ? colors.primary.accent : colors.primary.muted}
                  />
                </TouchableOpacity>
                
                {expandedFaq === index && (
                  <Text style={styles.faqAnswer}>{faq.answer}</Text>
                )}
              </View>
            ))}

            <Text style={[styles.sectionTitle, { marginTop: 24 }]}>Contact Support</Text>
            
            <View style={styles.contactOptions}>
              <TouchableOpacity
                style={styles.contactOption}
                onPress={() => handleContactMethod("email", () => 
                  Linking.openURL("mailto:support@timeframe.app")
                )}
              >
                <Mail size={24} color={colors.primary.accent} />
                <Text style={styles.contactOptionText}>Email Support</Text>
                <ExternalLink size={16} color={colors.primary.muted} />
              </TouchableOpacity>
              
              <TouchableOpacity
                style={styles.contactOption}
                onPress={() => handleContactMethod("phone", () => 
                  Linking.openURL("tel:+18005551234")
                )}
              >
                <Phone size={24} color={colors.primary.accent} />
                <Text style={styles.contactOptionText}>Call Support</Text>
                <ExternalLink size={16} color={colors.primary.muted} />
              </TouchableOpacity>
              
              <TouchableOpacity
                style={styles.contactOption}
                onPress={() => handleContactMethod("chat", () => {
                  // In a real app, this would open a chat interface
                  alert("Live chat would open here in a production app");
                })}
              >
                <MessageCircle size={24} color={colors.primary.accent} />
                <Text style={styles.contactOptionText}>Live Chat</Text>
              </TouchableOpacity>
            </View>

            <Text style={styles.supportHours}>
              Support Hours: Monday-Friday, 9AM-6PM EST
            </Text>
            
            <TouchableOpacity
              style={styles.knowledgeBaseButton}
              onPress={() => {
                Analytics.logEvent("view_knowledge_base", {});
                Linking.openURL("https://timeframe.app/help");
              }}
            >
              <Text style={styles.knowledgeBaseText}>Visit Knowledge Base</Text>
              <ExternalLink size={16} color={colors.primary.background} />
            </TouchableOpacity>
          </ScrollView>
        </View>
      </SafeAreaView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)"
  },
  container: {
    flex: 1,
    backgroundColor: colors.primary.background,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    marginTop: 50
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: colors.primary.border
  },
  title: {
    ...typography.heading2,
    color: colors.primary.text
  },
  closeButton: {
    padding: 8
  },
  content: {
    flex: 1,
    padding: 20
  },
  sectionTitle: {
    ...typography.heading3,
    marginBottom: 16,
    color: colors.primary.text
  },
  faqItem: {
    marginBottom: 16,
    backgroundColor: colors.primary.card,
    borderRadius: 12,
    overflow: "hidden"
  },
  faqQuestion: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16
  },
  faqQuestionText: {
    ...typography.body,
    fontWeight: "600",
    flex: 1,
    marginRight: 8
  },
  faqAnswer: {
    ...typography.body,
    padding: 16,
    paddingTop: 0,
    color: colors.primary.muted
  },
  contactOptions: {
    marginTop: 8
  },
  contactOption: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.primary.card,
    padding: 16,
    borderRadius: 12,
    marginBottom: 12
  },
  contactOptionText: {
    ...typography.body,
    flex: 1,
    marginLeft: 12
  },
  supportHours: {
    ...typography.bodySmall,
    color: colors.primary.muted,
    textAlign: "center",
    marginTop: 24,
    marginBottom: 24
  },
  knowledgeBaseButton: {
    backgroundColor: colors.primary.accent,
    borderRadius: 12,
    padding: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 40
  },
  knowledgeBaseText: {
    ...typography.body,
    color: colors.primary.background,
    fontWeight: "600",
    marginRight: 8
  }
});

export default HelpCenterModal;