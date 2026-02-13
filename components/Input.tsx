import React from 'react';
import { View, TextInput, Text, StyleSheet, TextInputProps } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { theme } from '../constants/theme';

interface InputProps extends TextInputProps {
  label?: string;
  icon?: keyof typeof Ionicons.glyphMap;
  error?: string;
}

export const Input: React.FC<InputProps> = ({
  label,
  icon,
  error,
  style,
  ...props
}) => {
  return (
    <View style={styles.container}>
      {label && <Text style={styles.label}>{label}</Text>}
      <View style={styles.inputContainer}>
        {icon && (
          <View style={styles.iconContainer}>
            <Ionicons name={icon} size={20} color={theme.colors.textMuted} />
          </View>
        )}
        <TextInput
          style={[
            styles.input,
            icon && styles.inputWithIcon,
            error && styles.inputError,
            style,
          ]}
          placeholderTextColor={theme.colors.textMuted}
          {...props}
        />
      </View>
      {error && <Text style={styles.error}>{error}</Text>}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
  label: {
    fontSize: 16,
    fontWeight: '500',
    color: theme.colors.textMain,
    marginBottom: 8,
    marginLeft: 4,
    // fontFamily: theme.fonts.display, // Comentado temporariamente
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconContainer: {
    position: 'absolute',
    left: 16,
    zIndex: 1,
  },
  input: {
    flex: 1,
    backgroundColor: theme.colors.surfaceLight,
    borderWidth: 1,
    borderColor: theme.colors.champagneBorder,
    borderRadius: theme.borderRadius.lg,
    paddingVertical: 14,
    paddingHorizontal: 16,
    fontSize: 16,
    color: theme.colors.textMain,
    // fontFamily: theme.fonts.sans, // Comentado temporariamente
  },
  inputWithIcon: {
    paddingLeft: 48,
  },
  inputError: {
    borderColor: '#ef4444',
  },
  error: {
    color: '#ef4444',
    fontSize: 12,
    marginTop: 4,
    marginLeft: 4,
  },
});


