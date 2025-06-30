import React, { useState, useEffect } from 'react';
import { 
  Modal, 
  StyleSheet, 
  View, 
  Text, 
  TouchableOpacity, 
  ScrollView,
  Switch,
  Platform,
  Alert
} from 'react-native';
import { X, Shield, Eye, EyeOff, Database, BarChart } from 'lucide-react-native';
import colors from '@/constants/colors';
import typography from '@/constants/typography';
import { usePrivacyStore } from '@/store/usePrivacyStore';
import * as Analytics from '@/utils/analytics';

interface PrivacySettingsModalProps {
  visible: boolean;
  onClose: () => void;
}

const PrivacySettingsModal = ({ visible, onClose }: PrivacySettingsModalProps) => {
  const { 
    dataCollection, 
    locationTracking, 
    personalization, 
    analyticsEnabled,
    setDataCollection,
    setLocationTracking,
    setPersonalization,
    setAnalyticsEnabled
  } = usePrivacyStore();

  // Local state to track changes before saving
  const [localDataCollection, setLocalDataCollection] = useState(dataCollection);
  const [localLocationTracking, setLocalLocationTracking] = useState(locationTracking);
  const [localPersonalization, setLocalPersonalization] = useState(personalization);
  const [localAnalyticsEnabled, setLocalAnalyticsEnabled] = useState(analyticsEnabled);
  const [isSaving, setIsSaving] = useState(false);

  // Reset local state when modal becomes visible
  useEffect(() => {
    if (visible) {
      setLocalDataCollection(dataCollection);
      setLocalLocationTracking(locationTracking);
      setLocalPersonalization(personalization);
      setLocalAnalyticsEnabled(analyticsEnabled);
      
      // Log modal open event
      Analytics.logEvent("privacy_settings_open");
    }
  }, [visible, dataCollection, locationTracking, personalization, analyticsEnabled]);

  const handleSave = async () => {
    setIsSaving(true);
    
    try {
      // Update the store with local state
      setDataCollection(localDataCollection);
      setLocationTracking(localLocationTracking);
      setPersonalization(localPersonalization);
      setAnalyticsEnabled(localAnalyticsEnabled);
      
      // Update analytics collection based on user preference
      Analytics.setAnalyticsEnabled(localAnalyticsEnabled);
      
      // Log privacy settings update
      Analytics.logEvent("privacy_settings_updated", {
        data_collection: localDataCollection,
        location_tracking: localLocationTracking,
        personalization: localPersonalization,
        analytics_enabled: localAnalyticsEnabled
      });
      
      // Set user property for analytics
      Analytics.setUserProperties({
        [Analytics.UserProperties.LOCATION_ENABLED]: localLocationTracking ? "true" : "false"
      });
      
      // Show success message
      Alert.alert(
        "Settings Saved",
        "Your privacy preferences have been updated successfully.",
        [{ text: "OK", onPress: onClose }]
      );
    } catch (error) {
      console.error("Error saving privacy settings:", error);
      Alert.alert(
        "Error",
        "There was an error saving your settings. Please try again.",
        [{ text: "OK" }]
      );
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
    >
      <View style={styles.modalContainer}>
        <View style={styles.modalContent}>
          <View style={styles.header}>
            <Text style={styles.headerTitle}>Privacy Settings</Text>
            <TouchableOpacity style={styles.closeButton} onPress={onClose}>
              <X size={24} color={colors.text} />
            </TouchableOpacity>
          </View>
          
          <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <Shield size={24} color={colors.accent} />
                <Text style={styles.sectionTitle}>Data Privacy</Text>
              </View>
              <Text style={styles.sectionDescription}>
                Control how your data is collected and used within the app.
              </Text>
              
              <View style={styles.settingItem}>
                <View style={styles.settingTextContainer}>
                  <Text style={styles.settingTitle}>Data Collection</Text>
                  <Text style={styles.settingDescription}>
                    Allow us to collect usage data to improve your experience
                  </Text>
                </View>
                <Switch
                  value={localDataCollection}
                  onValueChange={setLocalDataCollection}
                  trackColor={{ false: colors.textMuted, true: colors.accent }}
                  thumbColor={Platform.OS === 'ios' ? '#FFFFFF' : localDataCollection ? colors.accent : '#f4f3f4'}
                />
              </View>
              
              <View style={styles.settingItem}>
                <View style={styles.settingTextContainer}>
                  <Text style={styles.settingTitle}>Location Tracking</Text>
                  <Text style={styles.settingDescription}>
                    Allow us to track your location to show nearby venues
                  </Text>
                </View>
                <Switch
                  value={localLocationTracking}
                  onValueChange={setLocalLocationTracking}
                  trackColor={{ false: colors.textMuted, true: colors.accent }}
                  thumbColor={Platform.OS === 'ios' ? '#FFFFFF' : localLocationTracking ? colors.accent : '#f4f3f4'}
                />
              </View>
              
              <View style={styles.settingItem}>
                <View style={styles.settingTextContainer}>
                  <Text style={styles.settingTitle}>Personalization</Text>
                  <Text style={styles.settingDescription}>
                    Allow us to personalize content based on your preferences
                  </Text>
                </View>
                <Switch
                  value={localPersonalization}
                  onValueChange={setLocalPersonalization}
                  trackColor={{ false: colors.textMuted, true: colors.accent }}
                  thumbColor={Platform.OS === 'ios' ? '#FFFFFF' : localPersonalization ? colors.accent : '#f4f3f4'}
                />
              </View>
            </View>
            
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <BarChart size={24} color={colors.accent} />
                <Text style={styles.sectionTitle}>Analytics</Text>
              </View>
              <Text style={styles.sectionDescription}>
                Control how we analyze your usage to improve our services.
              </Text>
              
              <View style={styles.settingItem}>
                <View style={styles.settingTextContainer}>
                  <Text style={styles.settingTitle}>Usage Analytics</Text>
                  <Text style={styles.settingDescription}>
                    Allow us to collect anonymous usage statistics
                  </Text>
                </View>
                <Switch
                  value={localAnalyticsEnabled}
                  onValueChange={setLocalAnalyticsEnabled}
                  trackColor={{ false: colors.textMuted, true: colors.accent }}
                  thumbColor={Platform.OS === 'ios' ? '#FFFFFF' : localAnalyticsEnabled ? colors.accent : '#f4f3f4'}
                />
              </View>
            </View>
            
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <Database size={24} color={colors.accent} />
                <Text style={styles.sectionTitle}>Your Data</Text>
              </View>
              
              <TouchableOpacity 
                style={styles.dataButton}
                onPress={() => {
                  // Log data export request
                  Analytics.logEvent("request_data_export");
                  Alert.alert(
                    "Data Export",
                    "Your data export request has been received. You will receive an email with your data within 24 hours.",
                    [{ text: "OK" }]
                  );
                }}
              >
                <Text style={styles.dataButtonText}>Request Data Export</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={[styles.dataButton, styles.deleteButton]}
                onPress={() => {
                  // Log data deletion request
                  Analytics.logEvent("request_data_deletion");
                  Alert.alert(
                    "Data Deletion",
                    "Are you sure you want to request deletion of all your data? This action cannot be undone.",
                    [
                      { text: "Cancel", style: "cancel" },
                      { 
                        text: "Request Deletion", 
                        style: "destructive",
                        onPress: () => {
                          Alert.alert(
                            "Request Submitted",
                            "Your data deletion request has been submitted. You will receive a confirmation email shortly.",
                            [{ text: "OK" }]
                          );
                        }
                      }
                    ]
                  );
                }}
              >
                <Text style={[styles.dataButtonText, styles.deleteButtonText]}>Request Data Deletion</Text>
              </TouchableOpacity>
            </View>
            
            <Text style={styles.privacyPolicyText}>
              For more information, please read our{' '}
              <Text 
                style={styles.privacyPolicyLink}
                onPress={() => {
                  // Log privacy policy view
                  Analytics.logEvent("view_privacy_policy");
                  
                  Alert.alert(
                    "Privacy Policy",
                    "This would open the privacy policy in a real app.",
                    [{ text: "OK" }]
                  );
                }}
              >
                Privacy Policy
              </Text>
            </Text>
          </ScrollView>
          
          <View style={styles.footer}>
            <TouchableOpacity 
              style={styles.cancelButton}
              onPress={onClose}
              disabled={isSaving}
            >
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={[styles.saveButton, isSaving && styles.saveButtonDisabled]}
              onPress={handleSave}
              disabled={isSaving}
            >
              <Text style={styles.saveButtonText}>
                {isSaving ? "Saving..." : "Save Changes"}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: colors.background,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    height: '90%',
    paddingBottom: Platform.OS === 'ios' ? 40 : 20,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  headerTitle: {
    ...typography.heading3,
    color: colors.text,
  },
  closeButton: {
    padding: 4,
  },
  scrollView: {
    flex: 1,
    padding: 20,
  },
  section: {
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  sectionTitle: {
    ...typography.heading3,
    marginLeft: 12,
    color: colors.text,
  },
  sectionDescription: {
    ...typography.body,
    color: colors.textMuted,
    marginBottom: 16,
  },
  settingItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  settingTextContainer: {
    flex: 1,
    marginRight: 16,
  },
  settingTitle: {
    ...typography.body,
    fontWeight: '600',
    marginBottom: 4,
    color: colors.text,
  },
  settingDescription: {
    ...typography.bodySmall,
    color: colors.textMuted,
  },
  dataButton: {
    backgroundColor: colors.card,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 12,
  },
  dataButtonText: {
    ...typography.body,
    color: colors.accent,
    fontWeight: '600',
  },
  deleteButton: {
    backgroundColor: 'rgba(244, 67, 54, 0.1)',
  },
  deleteButtonText: {
    color: colors.error,
  },
  privacyPolicyText: {
    ...typography.bodySmall,
    color: colors.textMuted,
    textAlign: 'center',
    marginBottom: 24,
  },
  privacyPolicyLink: {
    color: colors.accent,
    textDecorationLine: 'underline',
  },
  footer: {
    flexDirection: 'row',
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  cancelButton: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    marginRight: 8,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
  },
  cancelButtonText: {
    ...typography.body,
    color: colors.text,
  },
  saveButton: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    marginLeft: 8,
    backgroundColor: colors.accent,
    borderRadius: 8,
  },
  saveButtonDisabled: {
    backgroundColor: colors.textMuted,
  },
  saveButtonText: {
    ...typography.body,
    color: colors.background,
    fontWeight: '600',
  },
});

export default PrivacySettingsModal;