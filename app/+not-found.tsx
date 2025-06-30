import React, { useState } from "react";
import { StyleSheet, View, Text } from "react-native";
import { useRouter } from "expo-router";
import { Calendar, Home } from "lucide-react-native";
import colors from "@/constants/colors";
import typography from "@/constants/typography";
import Button from "@/components/Button";
import EmptyState from "@/components/EmptyState";
import ReservationModal from "@/components/ReservationModal";
import { useVenueStore } from "@/store/useVenueStore";

export default function NotFoundScreen() {
  const router = useRouter();
  const { venues } = useVenueStore();
  const [showReservationModal, setShowReservationModal] = useState(false);

  const handleMakeReservation = (venue: any, date: Date, timeSlot: string) => {
    // This will be handled by the ReservationModal's onReserve prop
    setShowReservationModal(false);
    // Navigate to reservations to see the new reservation
    router.replace("/reservations");
  };

  return (
    <View style={styles.container}>
      <EmptyState
        icon={<Calendar size={48} color={colors.accent} />}
        title="Page Not Found"
        message="The page you're looking for doesn't exist, but you can make a reservation for one of our amazing venues!"
        action={
          <View style={styles.actionContainer}>
            <Button
              title="Make Reservation"
              onPress={() => setShowReservationModal(true)}
              variant="primary"
              icon={<Calendar size={18} color={colors.primary} />}
            />
            <Button
              title="Go to Home"
              onPress={() => router.replace("/")}
              variant="secondary"
              icon={<Home size={18} color={colors.text} />}
            />
          </View>
        }
      />
      
      <ReservationModal
        visible={showReservationModal}
        onClose={() => setShowReservationModal(false)}
        venues={venues}
        onReserve={handleMakeReservation}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.primary,
  },
  actionContainer: {
    gap: 12,
    width: "100%",
  },
});