import React from "react";
import { StyleSheet, Text, View, Image, TouchableOpacity, Platform } from "react-native";
import { useRouter } from "expo-router";
import { Calendar, Clock, MapPin, Users, Tag, Crown, Star, Ticket } from "lucide-react-native";
import colors from "@/constants/colors";
import typography from "@/constants/typography";
import { Event, AccessLevel } from "@/types/event";
import { useEventsStore } from "@/store/useEventsStore";
import * as Analytics from "@/utils/analytics";

interface EventCardProps {
  event: Event;
  compact?: boolean;
  onPress?: () => void;
  hasAccess?: boolean;
}

export default function EventCard({ event, compact = false, onPress, hasAccess = true }: EventCardProps) {
  const router = useRouter();
  const isUserRegistered = useEventsStore((state: any) => state.isUserRegisteredForEvent(event.id));
  
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString(undefined, { 
      weekday: "short", 
      month: "short", 
      day: "numeric" 
    });
  };
  
  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString(undefined, { 
      hour: "numeric", 
      minute: "2-digit"
    });
  };
  
  const getAccessLevelIcon = (accessLevel: AccessLevel) => {
    switch (accessLevel) {
      case AccessLevel.COLLECTOR:
        return <Crown size={16} color="#9C27B0" />;
      case AccessLevel.EXPLORER:
        return <Star size={16} color="#FFD700" />;
      case AccessLevel.ESSENTIAL:
        return <Ticket size={16} color={colors.accent} />;
      default:
        return <Ticket size={16} color={colors.accent} />;
    }
  };
  
  const getAccessLevelColor = (accessLevel: AccessLevel) => {
    switch (accessLevel) {
      case AccessLevel.COLLECTOR:
        return "#9C27B0";
      case AccessLevel.EXPLORER:
        return "#FFD700";
      case AccessLevel.ESSENTIAL:
        return colors.accent;
      default:
        return colors.accent;
    }
  };
  
  const handlePress = () => {
    // Log analytics event
    Analytics.logEvent("event_card_click", {
      event_id: event.id,
      event_title: event.title,
      event_type: event.type,
      access_level: event.accessLevel
    });
    
    // Use the provided onPress handler or navigate to event details
    if (onPress) {
      onPress();
    } else {
      router.push(`/event/${event.id}`);
    }
  };
  
  if (compact) {
    return (
      <TouchableOpacity 
        style={styles.compactContainer} 
        onPress={handlePress}
        activeOpacity={0.7}
      >
        <Image source={{ uri: event.image }} style={styles.compactImage} />
        <View style={styles.compactContent}>
          <View style={styles.compactHeader}>
            <Text style={[typography.bodySmall, styles.compactType]}>{event.type}</Text>
            {getAccessLevelIcon(event.accessLevel)}
          </View>
          <Text style={[typography.bodySmall, styles.compactTitle]} numberOfLines={2}>
            {event.title}
          </Text>
          <View style={styles.compactFooter}>
            <View style={styles.compactDateContainer}>
              <Calendar size={12} color={colors.muted} />
              <Text style={styles.compactDateText}>{formatDate(event.date)}</Text>
            </View>
            {isUserRegistered && (
              <View style={styles.compactRegisteredBadge}>
                <Text style={styles.compactRegisteredText}>Registered</Text>
              </View>
            )}
          </View>
        </View>
      </TouchableOpacity>
    );
  }
  
  return (
    <TouchableOpacity 
      style={styles.container} 
      onPress={handlePress}
      activeOpacity={0.7}
    >
      <Image source={{ uri: event.image }} style={styles.image} />
      
      <View style={[
        styles.accessLevelBadge, 
        { backgroundColor: getAccessLevelColor(event.accessLevel) }
      ]}>
        {getAccessLevelIcon(event.accessLevel)}
        <Text style={styles.accessLevelText}>
          {event.accessLevel.charAt(0).toUpperCase() + event.accessLevel.slice(1)}
        </Text>
      </View>
      
      {isUserRegistered && (
        <View style={styles.registeredBadge}>
          <Text style={styles.registeredText}>Registered</Text>
        </View>
      )}
      
      <View style={styles.content}>
        <Text style={[typography.bodySmall, styles.eventType]}>{event.type}</Text>
        <Text style={[typography.heading4, styles.title]} numberOfLines={2}>
          {event.title}
        </Text>
        
        <View style={styles.infoRow}>
          <Calendar size={16} color={colors.muted} style={styles.infoIcon} />
          <Text style={styles.infoText}>{formatDate(event.date)}</Text>
        </View>
        
        <View style={styles.infoRow}>
          <Clock size={16} color={colors.muted} style={styles.infoIcon} />
          <Text style={styles.infoText}>
            {formatTime(event.date)} - {formatTime(event.endDate)}
          </Text>
        </View>
        
        <View style={styles.infoRow}>
          <MapPin size={16} color={colors.muted} style={styles.infoIcon} />
          <Text style={styles.infoText} numberOfLines={1}>{event.location}</Text>
        </View>
        
        <View style={styles.footer}>
          <View style={styles.capacityContainer}>
            <Users size={16} color={colors.muted} style={styles.infoIcon} />
            <Text style={styles.capacityText}>
              {event.remainingSpots} spots left
            </Text>
          </View>
          
          <View style={styles.priceContainer}>
            <Text style={styles.priceText}>
              {typeof event.price === 'string' && event.price.startsWith('$') ? event.price : `$${event.price}`}
            </Text>
          </View>
        </View>
        
        {event.tags && event.tags.length > 0 && (
          <View style={styles.tagsContainer}>
            <Tag size={14} color={colors.muted} style={styles.tagIcon} />
            <Text style={styles.tagsText} numberOfLines={1}>
              {event.tags.join(", ")}
            </Text>
          </View>
        )}
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.card,
    borderRadius: 12,
    overflow: "hidden",
    marginBottom: 16,
    borderWidth: 1,
    borderColor: colors.border,
  },
  image: {
    width: "100%",
    height: 180,
    resizeMode: "cover",
  },
  accessLevelBadge: {
    position: "absolute",
    top: 12,
    left: 12,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 16,
  },
  accessLevelText: {
    ...typography.caption,
    color: "#FFFFFF",
    fontWeight: "600",
    marginLeft: 4,
  },
  registeredBadge: {
    position: "absolute",
    top: 12,
    right: 12,
    backgroundColor: colors.status.success,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 16,
  },
  registeredText: {
    ...typography.caption,
    color: "#FFFFFF",
    fontWeight: "600",
  },
  content: {
    padding: 16,
  },
  eventType: {
    color: colors.muted,
    marginBottom: 4,
  },
  title: {
    marginBottom: 12,
  },
  infoRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  infoIcon: {
    marginRight: 8,
  },
  infoText: {
    ...typography.bodySmall,
    color: colors.text,
    flex: 1,
  },
  footer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  capacityContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  capacityText: {
    ...typography.bodySmall,
    color: colors.muted,
  },
  priceContainer: {
    backgroundColor: colors.surface,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  priceText: {
    ...typography.bodySmall,
    color: colors.text,
    fontWeight: "600",
  },
  tagsContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 8,
  },
  tagIcon: {
    marginRight: 6,
  },
  tagsText: {
    ...typography.caption,
    color: colors.muted,
    flex: 1,
  },
  
  // Compact styles
  compactContainer: {
    flexDirection: "row",
    backgroundColor: colors.card,
    borderRadius: 8,
    overflow: "hidden",
    marginBottom: 12,
    height: 80,
    borderWidth: 1,
    borderColor: colors.border,
  },
  compactImage: {
    width: 80,
    height: 80,
    resizeMode: "cover",
  },
  compactContent: {
    flex: 1,
    padding: 8,
    justifyContent: "space-between",
  },
  compactHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  compactType: {
    color: colors.muted,
    fontSize: 10,
  },
  compactTitle: {
    fontWeight: "600",
    marginVertical: 4,
  },
  compactFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  compactDateContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  compactDateText: {
    ...typography.caption,
    color: colors.muted,
    marginLeft: 4,
  },
  compactRegisteredBadge: {
    backgroundColor: colors.status.success,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  compactRegisteredText: {
    ...typography.caption,
    color: "#FFFFFF",
    fontSize: 8,
    fontWeight: "600",
  },
});