import React from "react";
import { StyleSheet, TextInput, View, TouchableOpacity, ViewStyle } from "react-native";
import { Search, X } from "lucide-react-native";
import colors from "@/constants/colors";

interface SearchBarProps {
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
  onClear?: () => void;
  style?: ViewStyle;
}

export default function SearchBar({
  value,
  onChangeText,
  placeholder = "Search...",
  onClear,
  style,
}: SearchBarProps) {
  return (
    <View style={[styles.container, style]}>
      <Search size={20} color={colors.primary.muted} style={styles.icon} />
      <TextInput
        style={styles.input}
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={colors.primary.muted}
        selectionColor={colors.primary.accent}
      />
      {value.length > 0 && (
        <TouchableOpacity
          style={styles.clearButton}
          onPress={() => {
            onChangeText("");
            if (onClear) onClear();
          }}
        >
          <X size={18} color={colors.primary.muted} />
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.primary.card,
    borderRadius: 12,
    paddingHorizontal: 12,
    height: 48,
  },
  icon: {
    marginRight: 8,
  },
  input: {
    flex: 1,
    color: colors.primary.text,
    fontSize: 16,
    height: "100%",
    fontFamily: "Arapey",
  },
  clearButton: {
    padding: 4,
  },
});