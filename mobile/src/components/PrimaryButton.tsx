import { Pressable, StyleSheet, Text, ViewStyle } from "react-native";
import { LucideIcon } from "lucide-react-native";

import { colors } from "../theme/colors";

type Props = {
  label: string;
  icon?: LucideIcon;
  onPress: () => void;
  disabled?: boolean;
  style?: ViewStyle;
  variant?: "primary" | "secondary";
  accessibilityLabel?: string;
  accessibilityHint?: string;
};

export function PrimaryButton({
  label,
  icon: Icon,
  onPress,
  disabled,
  style,
  variant = "primary",
  accessibilityLabel,
  accessibilityHint
}: Props) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel || label}
      accessibilityHint={accessibilityHint}
      accessibilityState={{ disabled: Boolean(disabled) }}
      disabled={disabled}
      onPress={onPress}
      style={({ pressed }) => [
        styles.button,
        variant === "secondary" && styles.secondary,
        disabled && styles.disabled,
        pressed && !disabled && styles.pressed,
        pressed && !disabled && variant === "secondary" && styles.secondaryPressed,
        style
      ]}
    >
      {Icon ? (
        <Icon
          size={20}
          color={variant === "secondary" ? colors.primary : "#ffffff"}
          accessibilityElementsHidden
          importantForAccessibility="no"
        />
      ) : null}
      <Text style={[styles.label, variant === "secondary" && styles.secondaryLabel]}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    minHeight: 48,
    paddingHorizontal: 18,
    borderRadius: 8,
    backgroundColor: colors.primary,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    gap: 10
  },
  pressed: {
    backgroundColor: colors.primaryDark
  },
  secondary: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.primary
  },
  secondaryPressed: {
    backgroundColor: colors.surfaceMuted
  },
  disabled: {
    opacity: 0.55
  },
  label: {
    color: "#ffffff",
    fontSize: 16,
    fontWeight: "700",
    flexShrink: 1,
    textAlign: "center"
  },
  secondaryLabel: {
    color: colors.primary
  }
});
