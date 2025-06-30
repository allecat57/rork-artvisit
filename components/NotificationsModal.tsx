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
import { X, Bell, BellOff, Calendar, Heart, Tag, ShoppingBag, MessageCircle } from 'lucide-react-native';
import colors from '@/constants/colors';
import typography from '@/constants/typography';
import { useNotificationsStore } from '@/store/useNotificationsStore';
import * as Analytics from '@/utils/analytics';

interface NotificationsModalProps {
  visible: boolean;
  onClose: () => void;
}

const NotificationsModal = ({ visible, onClose }: NotificationsModalProps) => {
  const { 
    pushEnabled,
    emailEnabled,
    reservationReminders,
    favoriteUpdates,
    promotions,
    orderUpdates,
    messageNotifications,
    setPushEnabled,
    setEmailEnabled,
    setReservationReminders,
    setFavoriteUpdates,
    setPromotions,
    setOrderUpdates,
    setMessageNotifications
  } = useNotificationsStore();

  // Local state to track changes before saving
  const [localPushEnabled, setLocalPushEnabled] = useState(pushEnabled);
  const [localEmailEnabled, setLocalEmailEnabled] = useState(emailEnabled);
  const [localReservationReminders, setLocalReservationReminders] = useState(reservationReminders);
  const [localFavoriteUpdates, setLocalFavoriteUpdates] = useState(favoriteUpdates);
  const [localPromotions, setLocalPromotions] = useState(promotions);
  const [localOrderUpdates, setLocalOrderUpdates] = useState(orderUpdates);
  const [localMessageNotifications, setLocalMessageNotifications] = useState(messageNotifications);
  const [isSaving, setIsSaving] = useState(false);

  // Reset local state when modal becomes visible
  useEffect(() => {
    if (visible) {
      setLocalPushEnabled(pushEnabled);
      setLocalEmailEnabled(emailEnabled);
      setLocalReservationReminders(reservationReminders);
      setLocalFavoriteUpdates(favoriteUpdates);
      setLocalPromotions(promotions);
      setLocalOrderUpdates(orderUpdates);
      setLocalMessageNotifications(messageNotifications);
      
      // Log modal open event
      Analytics.logEvent("notifications_settings_open");
    }
  }, [
    visible, 
    pushEnabled, 
    emailEnabled, 
    reservationReminders, 
    favoriteUpdates, 
    promotions, 
    orderUpdates, 
    messageNotifications
  ]);

  const handleSave = async () => {
    setIsSaving(true);
    
    try {
      // Update the store with local state
      setPushEnabled(localPushEnabled);
      setEmailEnabled(localEmailEnabled);
      setReservationReminders(localReservationReminders);
      setFavoriteUpdates(localFavoriteUpdates);
      setPromotions(localPromotions);
      setOrderUpdates(localOrderUpdates);
      setMessageNotifications(localMessageNotifications);
      
      // Log notification settings update
      Analytics.logEvent("notifications_settings_updated", {
        push_enabled: localPushEnabled,
        email_enabled: localEmailEnabled,
        reservation_reminders: localReservationReminders,
        favorite_updates: localFavoriteUpdates,
        promotions: localPromotions,
        order_updates: localOrderUpdates,
        message_notifications: localMessageNotifications
      });
      
      // Set user property for analytics
      Analytics.setUserProperties({
        notification_enabled: localPushEnabled ? "true" : "false"
      });
      
      // Show success message
      Alert.alert(
        "Settings Saved",
        "Your notification preferences have been updated successfully.",
        [{ text: "OK", onPress: onClose }]
      );
    } catch (error) {
      console.error("Error saving notification settings:", error);
      Alert.alert(
        "Error",
        "There was an error saving your settings. Please try again.",
        [{ text: "OK" }]
      );
    } finally {
      setIsSaving(false);
    }
  };

  const handleToggleAll = (enabled: boolean) => {
    setLocalReservationReminders(enabled);
    setLocalFavoriteUpdates(enabled);
    setLocalPromotions(enabled);
    setLocalOrderUpdates(enabled);
    setLocalMessageNotifications(enabled);
    
    // Log toggle all event
    Analytics.logEvent("notifications_toggle_all", {
      enabled: enabled
    });
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
            <Text style={styles.headerTitle}>Notifications</Text>
            <TouchableOpacity style={styles.closeButton} onPress={onClose}>
              <X size={24} color={colors.text} />
            </TouchableOpacity>
          </View>
          
          <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <Bell size={24} color={colors.accent} />
                <Text style={styles.sectionTitle}>Notification Channels</Text>
              </View>
              <Text style={styles.sectionDescription}>
                Choose how you want to receive notifications.
              </Text>
              
              <View style={styles.settingItem}>
                <View style={styles.settingTextContainer}>
                  <Text style={styles.settingTitle}>Push Notifications</Text>
                  <Text style={styles.settingDescription}>
                    Receive notifications on your device
                  </Text>
                </View>
                <Switch
                  value={localPushEnabled}
                  onValueChange={(value) => {
                    setLocalPushEnabled(value);
                    if (!value) {
                      // If turning off push, log this specific event
                      Analytics.logEvent("push_notifications_disabled");
                    }
                  }}
                  trackColor={{ false: colors.textMuted, true: colors.accent }}
                  thumbColor={Platform.OS === 'ios' ? '#FFFFFF' : localPushEnabled ? colors.accent : '#f4f3f4'}
                />
              </View>
              
              <View style={styles.settingItem}>
                <View style={styles.settingTextContainer}>
                  <Text style={styles.settingTitle}>Email Notifications</Text>
                  <Text style={styles.settingDescription}>
                    Receive notifications via email
                  </Text>
                </View>
                <Switch
                  value={localEmailEnabled}
                  onValueChange={setLocalEmailEnabled}
                  trackColor={{ false: colors.textMuted, true: colors.accent }}
                  thumbColor={Platform.OS === 'ios' ? '#FFFFFF' : localEmailEnabled ? colors.accent : '#f4f3f4'}
                />
              </View>
            </View>
            
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <Bell size={24} color={colors.accent} />
                <Text style={styles.sectionTitle}>Notification Types</Text>
              </View>
              
              <View style={styles.toggleAllContainer}>
                <Text style={styles.toggleAllText}>Toggle all notifications</Text>
                <View style={styles.toggleButtons}>
                  <TouchableOpacity 
                    style={[styles.toggleButton, styles.toggleOnButton]}
                    onPress={() => handleToggleAll(true)}
                  >
                    <Text style={styles.toggleButtonText}>On</Text>
                  </TouchableOpacity>
                  <TouchableOpacity 
                    style={[styles.toggleButton, styles.toggleOffButton]}
                    onPress={() => handleToggleAll(false)}
                  >
                    <Text style={styles.toggleButtonText}>Off</Text>
                  </TouchableOpacity>
                </View>
              </View>
              
              <View style={styles.settingItem}>
                <View style={styles.settingTextContainer}>
                  <View style={styles.settingTitleContainer}>
                    <Calendar size={18} color={colors.accent} />
                    <Text style={[styles.settingTitle, styles.settingTitleWithIcon]}>Reservation Reminders</Text>
                  </View>
                  <Text style={styles.settingDescription}>
                    Reminders about upcoming reservations
                  </Text>
                </View>
                <Switch
                  value={localReservationReminders}
                  onValueChange={setLocalReservationReminders}
                  trackColor={{ false: colors.textMuted, true: colors.accent }}
                  thumbColor={Platform.OS === 'ios' ? '#FFFFFF' : localReservationReminders ? colors.accent : '#f4f3f4'}
                />
              </View>
              
              <View style={styles.settingItem}>
                <View style={styles.settingTextContainer}>
                  <View style={styles.settingTitleContainer}>
                    <Heart size={18} color={colors.accent} />
                    <Text style={[styles.settingTitle, styles.settingTitleWithIcon]}>Favorite Updates</Text>
                  </View>
                  <Text style={styles.settingDescription}>
                    Updates about your favorite venues
                  </Text>
                </View>
                <Switch
                  value={localFavoriteUpdates}
                  onValueChange={setLocalFavoriteUpdates}
                  trackColor={{ false: colors.textMuted, true: colors.accent }}
                  thumbColor={Platform.OS === 'ios' ? '#FFFFFF' : localFavoriteUpdates ? colors.accent : '#f4f3f4'}
                />
              </View>
              
              <View style={styles.settingItem}>
                <View style={styles.settingTextContainer}>
                  <View style={styles.settingTitleContainer}>
                    <Tag size={18} color={colors.accent} />
                    <Text style={[styles.settingTitle, styles.settingTitleWithIcon]}>Promotions & Offers</Text>
                  </View>
                  <Text style={styles.settingDescription}>
                    Special deals and promotional offers
                  </Text>
                </View>
                <Switch
                  value={localPromotions}
                  onValueChange={setLocalPromotions}
                  trackColor={{ false: colors.textMuted, true: colors.accent }}
                  thumbColor={Platform.OS === 'ios' ? '#FFFFFF' : localPromotions ? colors.accent : '#f4f3f4'}
                />
              </View>
              
              <View style={styles.settingItem}>
                <View style={styles.settingTextContainer}>
                  <View style={styles.settingTitleContainer}>
                    <ShoppingBag size={18} color={colors.accent} />
                    <Text style={[styles.settingTitle, styles.settingTitleWithIcon]}>Order Updates</Text>
                  </View>
                  <Text style={styles.settingDescription}>
                    Updates about your orders and purchases
                  </Text>
                </View>
                <Switch
                  value={localOrderUpdates}
                  onValueChange={setLocalOrderUpdates}
                  trackColor={{ false: colors.textMuted, true: colors.accent }}
                  thumbColor={Platform.OS === 'ios' ? '#FFFFFF' : localOrderUpdates ? colors.accent : '#f4f3f4'}
                />
              </View>
              
              <View style={styles.settingItem}>
                <View style={styles.settingTextContainer}>
                  <View style={styles.settingTitleContainer}>
                    <MessageCircle size={18} color={colors.accent} />
                    <Text style={[styles.settingTitle, styles.settingTitleWithIcon]}>Messages</Text>
                  </View>
                  <Text style={styles.settingDescription}>
                    Messages from venues and support
                  </Text>
                </View>
                <Switch
                  value={localMessageNotifications}
                  onValueChange={setLocalMessageNotifications}
                  trackColor={{ false: colors.textMuted, true: colors.accent }}
                  thumbColor={Platform.OS === 'ios' ? '#FFFFFF' : localMessageNotifications ? colors.accent : '#f4f3f4'}
                />
              </View>
            </View>
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
  toggleAllContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  toggleAllText: {
    ...typography.body,
    fontWeight: '600',
    color: colors.text,
  },
  toggleButtons: {
    flexDirection: 'row',
    borderRadius: 8,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: colors.border,
  },
  toggleButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
  },
  toggleOnButton: {
    backgroundColor: colors.accent,
  },
  toggleOffButton: {
    backgroundColor: colors.card,
  },
  toggleButtonText: {
    ...typography.bodySmall,
    fontWeight: '600',
    color: colors.background,
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
  settingTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  settingTitle: {
    ...typography.body,
    fontWeight: '600',
    color: colors.text,
  },
  settingTitleWithIcon: {
    marginLeft: 8,
  },
  settingDescription: {
    ...typography.bodySmall,
    color: colors.textMuted,
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

export default NotificationsModal;