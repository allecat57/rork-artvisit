import React, { useState, useEffect } from "react";
import { StyleSheet, Text, View, TouchableOpacity, ScrollView } from "react-native";
import { Calendar as CalendarIcon } from "lucide-react-native";
import { Calendar } from "react-native-calendars";
import colors from "@/constants/colors";
import typography from "@/constants/typography";

interface DateTimePickerProps {
  onSelectDateTime: (date: Date, timeSlot: string) => void;
  initialDate?: Date;
  initialTimeSlot?: string;
}

export default function DateTimePicker({ 
  onSelectDateTime,
  initialDate,
  initialTimeSlot
}: DateTimePickerProps) {
  const today = new Date();
  const [selectedDate, setSelectedDate] = useState<Date | null>(initialDate || null);
  const [selectedTimeSlot, setSelectedTimeSlot] = useState<string | null>(initialTimeSlot || null);
  
  // Format date for the calendar component
  const formatCalendarDate = (date: Date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };
  
  // Format date for display
  const formatDisplayDate = (date: Date) => {
    return date.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
    });
  };
  
  // Generate time slots
  const generateTimeSlots = () => {
    const slots = [];
    const openingHour = 9; // 9 AM
    const closingHour = 17; // 5 PM
    
    for (let hour = openingHour; hour < closingHour; hour++) {
      const hourFormatted = hour > 12 ? hour - 12 : hour;
      const amPm = hour >= 12 ? 'PM' : 'AM';
      slots.push(`${hourFormatted}:00 ${amPm}`);
      slots.push(`${hourFormatted}:30 ${amPm}`);
    }
    
    return slots;
  };
  
  const timeSlots = generateTimeSlots();
  
  // Set initial marked dates for the calendar
  const [markedDates, setMarkedDates] = useState<any>({});
  
  useEffect(() => {
    if (initialDate) {
      const formattedDate = formatCalendarDate(initialDate);
      setMarkedDates({
        [formattedDate]: { selected: true, selectedColor: colors.primary.accent }
      });
    }
  }, [initialDate]);
  
  // Handle date selection
  const handleDateSelect = (day: any) => {
    const selectedDate = new Date(day.dateString);
    setSelectedDate(selectedDate);
    
    // Update marked dates
    setMarkedDates({
      [day.dateString]: { selected: true, selectedColor: colors.primary.accent }
    });
    
    // If time slot is already selected, call the callback
    if (selectedTimeSlot) {
      onSelectDateTime(selectedDate, selectedTimeSlot);
    }
  };
  
  // Handle time slot selection
  const handleTimeSlotSelect = (timeSlot: string) => {
    setSelectedTimeSlot(timeSlot);
    
    // If date is already selected, call the callback
    if (selectedDate) {
      onSelectDateTime(selectedDate, timeSlot);
    }
  };
  
  // Get minimum date (today)
  const minDate = formatCalendarDate(today);
  
  // Get maximum date (3 months from today)
  const maxDate = (() => {
    const date = new Date(today);
    date.setMonth(date.getMonth() + 3);
    return formatCalendarDate(date);
  })();

  return (
    <View style={styles.container}>
      <View style={styles.calendarContainer}>
        <View style={styles.calendarHeader}>
          <CalendarIcon size={20} color={colors.primary.accent} />
          <Text style={styles.calendarTitle}>Select Date</Text>
        </View>
        
        <Calendar
          minDate={minDate}
          maxDate={maxDate}
          onDayPress={handleDateSelect}
          markedDates={markedDates}
          theme={{
            calendarBackground: colors.primary.card,
            textSectionTitleColor: colors.primary.text,
            selectedDayBackgroundColor: colors.primary.accent,
            selectedDayTextColor: colors.primary.background,
            todayTextColor: colors.primary.accent,
            dayTextColor: colors.primary.text,
            textDisabledColor: colors.primary.muted,
            dotColor: colors.primary.accent,
            monthTextColor: colors.primary.text,
            indicatorColor: colors.primary.accent,
            textDayFontFamily: 'System',
            textMonthFontFamily: 'System',
            textDayHeaderFontFamily: 'System',
            textDayFontWeight: '400',
            textMonthFontWeight: 'bold',
            textDayHeaderFontWeight: '600',
          }}
        />
      </View>
      
      <View style={styles.timeSlotContainer}>
        <Text style={styles.timeSlotTitle}>Select Time</Text>
        
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.timeSlotScrollContent}
        >
          {timeSlots.map((timeSlot) => (
            <TouchableOpacity
              key={timeSlot}
              style={[
                styles.timeSlotButton,
                selectedTimeSlot === timeSlot && styles.selectedTimeSlot
              ]}
              onPress={() => handleTimeSlotSelect(timeSlot)}
            >
              <Text 
                style={[
                  styles.timeSlotText,
                  selectedTimeSlot === timeSlot && styles.selectedTimeSlotText
                ]}
              >
                {timeSlot}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>
      
      {selectedDate && selectedTimeSlot && (
        <View style={styles.selectionSummary}>
          <Text style={styles.summaryTitle}>Your Selection</Text>
          <Text style={styles.summaryText}>
            {formatDisplayDate(selectedDate)} at {selectedTimeSlot}
          </Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 20,
  },
  calendarContainer: {
    backgroundColor: colors.primary.card,
    borderRadius: 12,
    padding: 12,
    marginBottom: 20,
  },
  calendarHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  calendarTitle: {
    ...typography.heading4,
    marginLeft: 8,
    color: colors.primary.text,
  },
  timeSlotContainer: {
    marginBottom: 20,
  },
  timeSlotTitle: {
    ...typography.heading4,
    marginBottom: 12,
    color: colors.primary.text,
  },
  timeSlotScrollContent: {
    paddingBottom: 8,
  },
  timeSlotButton: {
    backgroundColor: colors.primary.card,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 8,
    marginRight: 8,
  },
  selectedTimeSlot: {
    backgroundColor: colors.primary.accent,
  },
  timeSlotText: {
    ...typography.body,
    color: colors.primary.text,
  },
  selectedTimeSlotText: {
    color: colors.primary.background,
    fontWeight: '600',
  },
  selectionSummary: {
    backgroundColor: 'rgba(172, 137, 1, 0.15)',
    padding: 16,
    borderRadius: 12,
  },
  summaryTitle: {
    ...typography.bodySmall,
    color: colors.primary.accent,
    fontWeight: '600',
    marginBottom: 4,
  },
  summaryText: {
    ...typography.body,
    color: colors.primary.accent,
    fontWeight: '600',
  },
});