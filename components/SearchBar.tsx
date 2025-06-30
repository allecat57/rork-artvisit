import React from "react";
import { StyleSheet, TextInput, View, TouchableOpacity, ViewStyle } from "react-native";
import { Search, X } from "lucide-react-native";
import typography from "@/constants/typography";

interface SearchBarProps {
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
  onClear?: () => void;
  onSubmit?: (text: string) => void;
  style?: ViewStyle;
}

export default function SearchBar({
  value,
  onChangeText,
  placeholder = "Search...",
  onClear,
  onSubmit,
  style,
}: SearchBarProps) {
  const handleSubmit = () => {
    if (onSubmit) {
      onSubmit(value);
    }
  };

  return (
    <View style={[styles.container, style]}>
      <Search size={20} color="#AC8901" style={styles.icon} />
      <TextInput
        style={styles.input}
        value={value}
        onChangeText={onChangeText}
        onSubmitEditing={handleSubmit}
        placeholder={placeholder}
        placeholderTextColor="#AC8901"
        selectionColor="#AC8901"
        returnKeyType="search"
      />
      {value.length > 0 && (
        <TouchableOpacity
          style={styles.clearButton}
          onPress={() => {
            onChangeText("");
            if (onClear) onClear();
          }}
        >
          <X size={18} color="#AC8901" />
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#1a4037",
    borderRadius: 12,
    paddingHorizontal: 12,
    height: 48,
    borderWidth: 1,
    borderColor: "#AC8901",
  },
  icon: {
    marginRight: 8,
  },
  input: {
    flex: 1,
    color: "#AC8901",
    fontSize: 16,
    height: "100%",
    ...typography.body,
  },
  clearButton: {
    padding: 4,
  },
});