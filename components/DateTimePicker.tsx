import React, { useState, useEffect } from "react";
import { StyleSheet, Text, View, TouchableOpacity, ScrollView, Alert } from "react-native";
import { Calendar as CalendarIcon, Clock, ChevronLeft, ChevronRight } from "lucide-react-native";
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
  const [availableSlots, setAvailableSlots] = useState<string[]>([]);
  
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
  
  // Generate time slots based on selected date
  const generateTimeSlots = (date: Date) => {
    const slots = [];
    const openingHour = 9; // 9 AM
    const closingHour = 17; // 5 PM
    const now = new Date();
    const isToday = date.toDateString() === now.toDateString();
    const currentHour = now.getHours();
    const currentMinute = now.getMinutes();
    
    for (let hour = openingHour; hour < closingHour; hour++) {
      // Skip past time slots if it's today
      if (isToday && hour <= currentHour) {
        // If it's the current hour, check if we're past 30 minutes
        if (hour === currentHour && currentMinute < 30) {
          // Only add the 30-minute slot if we're before 30 minutes
          const hourFormatted = hour > 12 ? hour - 12 : hour;
          const amPm = hour >= 12 ? 'PM' : 'AM';
          slots.push(`${hourFormatted}:30 ${amPm}`);
        }
        continue;
      }
      
      const hourFormatted = hour > 12 ? hour - 12 : hour;
      const amPm = hour >= 12 ? 'PM' : 'AM';
      
      // Add both :00 and :30 slots
      slots.push(`${hourFormatted}:00 ${amPm}`);
      slots.push(`${hourFormatted}:30 ${amPm}`);
    }
    
    return slots;
  };
  
  // Set initial marked dates for the calendar
  const [markedDates, setMarkedDates] = useState<any>({});
  
  useEffect(() => {
    if (initialDate) {
      const formattedDate = formatCalendarDate(initialDate);
      setMarkedDates({
        [formattedDate]: { selected: true, selectedColor: colors.accent }
      });
      setAvailableSlots(generateTimeSlots(initialDate));
    }
  }, [initialDate]);
  
  // Handle date selection
  const handleDateSelect = (day: any) => {
    // Parse the date string properly to avoid timezone issues
    const [year, month, dayNum] = day.dateString.split('-').map(Number);
    // Create date at noon to avoid timezone issues
    const selectedDate = new Date(year, month - 1, dayNum, 12, 0, 0, 0); // month is 0-indexed, set to noon
    setSelectedDate(selectedDate);
    
    console.log('Selected date:', {
      dateString: day.dateString,
      parsedDate: selectedDate,
      displayDate: selectedDate.toLocaleDateString('en-US', {
        weekday: 'long',
        month: 'long',
        day: 'numeric'
      })
    });
    
    // Generate available time slots for the selected date
    const slots = generateTimeSlots(selectedDate);
    setAvailableSlots(slots);
    
    // Clear time slot selection when date changes
    setSelectedTimeSlot(null);
    
    // Update marked dates
    setMarkedDates({
      [day.dateString]: { selected: true, selectedColor: colors.accent }
    });
    
    // Show feedback for date selection
    const dateString = selectedDate.toLocaleDateString('en-US', {
      weekday: 'long',
      month: 'long',
      day: 'numeric'
    });
    
    // If no slots available, show alert
    if (slots.length === 0) {
      Alert.alert(
        "No Available Times",
        `Sorry, there are no available time slots for ${dateString}. Please select a different date.`,
        [{ text: "OK" }]
      );
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
  
  // Custom header component to avoid timezone display
  const renderCustomHeader = (date: any) => {
    const monthNames = [
      'January', 'February', 'March', 'April', 'May', 'June',
      'July', 'August', 'September', 'October', 'November', 'December'
    ];
    
    // Parse the date properly - date comes as a timestamp or date object
    let currentDate: Date;
    if (typeof date === 'number') {
      currentDate = new Date(date);
    } else if (date && typeof date === 'object' && date.timestamp) {
      currentDate = new Date(date.timestamp);
    } else if (date && typeof date === 'object' && date.year && date.month) {
      currentDate = new Date(date.year, date.month - 1, 1);
    } else {
      currentDate = new Date();
    }
    
    const monthName = monthNames[currentDate.getMonth()];
    const year = currentDate.getFullYear();
    
    return (
      <View style={styles.customCalendarHeader}>
        <TouchableOpacity 
          style={styles.headerArrow}
          onPress={() => {
            // Navigate to previous month
          }}
        >
          <ChevronLeft size={20} color={colors.accent} />
        </TouchableOpacity>
        
        <Text style={styles.customHeaderText}>
          {monthName} {year}
        </Text>
        
        <TouchableOpacity 
          style={styles.headerArrow}
          onPress={() => {
            // Navigate to next month
          }}
        >
          <ChevronRight size={20} color={colors.accent} />
        </TouchableOpacity>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.calendarContainer}>
        <View style={styles.calendarHeader}>
          <CalendarIcon size={20} color={colors.accent} />
          <Text style={styles.calendarTitle}>Select Date</Text>
        </View>
        
        <Calendar
          minDate={minDate}
          maxDate={maxDate}
          onDayPress={handleDateSelect}
          markedDates={markedDates}
          hideArrows={true}
          hideExtraDays={true}
          disableMonthChange={false}
          firstDay={1}
          hideDayNames={false}
          showWeekNumbers={false}
          enableSwipeMonths={true}
          disableAllTouchEventsForDisabledDays={true}
          displayLoadingIndicator={false}
          customHeader={renderCustomHeader}
          theme={{
            calendarBackground: colors.card,
            textSectionTitleColor: colors.text,
            selectedDayBackgroundColor: colors.accent,
            selectedDayTextColor: colors.white,
            todayTextColor: colors.accent,
            dayTextColor: colors.text,
            textDisabledColor: colors.textMuted,
            dotColor: colors.accent,
            monthTextColor: colors.text,
            indicatorColor: colors.accent,
            textDayFontFamily: 'System',
            textMonthFontFamily: 'System',
            textDayHeaderFontFamily: 'System',
            textDayFontWeight: '400',
            textMonthFontWeight: '700',
            textDayHeaderFontWeight: '600',
            arrowColor: colors.accent,
            disabledArrowColor: colors.textMuted,
            textMonthFontSize: 18,
            textDayHeaderFontSize: 13,
            textDayFontSize: 16,
          }}
        />
      </View>
      
      {selectedDate && (
        <View style={styles.timeSlotContainer}>
          <View style={styles.timeSlotHeader}>
            <Clock size={20} color={colors.accent} />
            <Text style={styles.timeSlotTitle}>Select Time</Text>
          </View>
          
          {availableSlots.length > 0 ? (
            <ScrollView 
              horizontal 
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.timeSlotScrollContent}
            >
              {availableSlots.map((timeSlot) => (
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
          ) : (
            <View style={styles.noSlotsContainer}>
              <Text style={styles.noSlotsText}>
                No available time slots for {formatDisplayDate(selectedDate)}
              </Text>
              <Text style={styles.noSlotsSubtext}>
                Please select a different date
              </Text>
            </View>
          )}
        </View>
      )}
      
      {selectedDate && selectedTimeSlot && (
        <View style={styles.selectionSummary}>
          <View style={styles.summaryContent}>
            <Text style={styles.summaryTitle}>Your Selection</Text>
            <Text style={styles.summaryText}>
              {formatDisplayDate(selectedDate)} at {selectedTimeSlot}
            </Text>
          </View>
          <View style={styles.summaryCheckmark}>
            <Text style={styles.checkmarkText}>✓</Text>
          </View>
        </View>
      )}
      
      {!selectedDate && (
        <View style={styles.instructionContainer}>
          <Text style={styles.instructionText}>
            👆 Select a date above to see available time slots
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
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
    minHeight: 380,
  },
  calendarHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  calendarTitle: {
    ...typography.heading4,
    marginLeft: 8,
    color: colors.text,
  },
  timeSlotContainer: {
    marginBottom: 20,
  },
  timeSlotHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  timeSlotTitle: {
    ...typography.heading4,
    marginLeft: 8,
    color: colors.text,
  },
  timeSlotScrollContent: {
    paddingBottom: 8,
  },
  timeSlotButton: {
    backgroundColor: colors.card,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 8,
    marginRight: 8,
    borderWidth: 1,
    borderColor: colors.border,
    minWidth: 80,
    alignItems: 'center',
  },
  selectedTimeSlot: {
    backgroundColor: colors.accent,
    borderColor: colors.accent,
  },
  timeSlotText: {
    ...typography.body,
    color: colors.text,
    fontSize: 14,
  },
  selectedTimeSlotText: {
    color: colors.white,
    fontWeight: '600',
  },
  noSlotsContainer: {
    backgroundColor: colors.card,
    padding: 20,
    borderRadius: 8,
    alignItems: 'center',
  },
  noSlotsText: {
    ...typography.body,
    color: colors.text,
    textAlign: 'center',
    marginBottom: 4,
  },
  noSlotsSubtext: {
    ...typography.bodySmall,
    color: colors.textMuted,
    textAlign: 'center',
  },
  selectionSummary: {
    backgroundColor: 'rgba(172, 137, 1, 0.15)',
    padding: 16,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  summaryContent: {
    flex: 1,
  },
  summaryTitle: {
    ...typography.body,
    color: colors.accent,
    fontWeight: '600',
    marginBottom: 4,
  },
  summaryText: {
    ...typography.body,
    color: colors.accent,
    fontWeight: '600',
  },
  summaryCheckmark: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: colors.success,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkmarkText: {
    color: colors.white,
    fontSize: 14,
    fontWeight: 'bold',
  },
  instructionContainer: {
    backgroundColor: colors.card,
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  instructionText: {
    ...typography.bodySmall,
    color: colors.textMuted,
    textAlign: 'center',
  },
  customCalendarHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: colors.card,
  },
  headerArrow: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: 'rgba(172, 137, 1, 0.1)',
  },
  customHeaderText: {
    ...typography.heading4,
    color: colors.text,
    fontWeight: '700',
  },
});