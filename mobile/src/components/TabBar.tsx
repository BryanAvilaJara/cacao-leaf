import { Pressable, StyleSheet, Text, View } from "react-native";
import { LucideIcon } from "lucide-react-native";

import { colors } from "../theme/colors";

type TabItem<T extends string> = {
  key: T;
  label: string;
  icon: LucideIcon;
};

type Props<T extends string> = {
  active: T;
  items: TabItem<T>[];
  onChange: (key: T) => void;
};

export function TabBar<T extends string>({ active, items, onChange }: Props<T>) {
  return (
    <View style={styles.wrap}>
      {items.map((item) => {
        const selected = active === item.key;
        const Icon = item.icon;

        return (
          <Pressable
            accessibilityRole="tab"
            accessibilityLabel={`Pestana ${item.label}`}
            accessibilityHint={`Muestra la pantalla ${item.label}`}
            accessibilityState={{ selected }}
            key={item.key}
            onPress={() => onChange(item.key)}
            style={[styles.item, selected && styles.itemActive]}
          >
            <Icon
              size={22}
              color={selected ? colors.primary : colors.textMuted}
              accessibilityElementsHidden
              importantForAccessibility="no"
            />
            <Text style={[styles.label, selected && styles.labelActive]}>{item.label}</Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    height: 72,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    backgroundColor: colors.surface,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-around"
  },
  item: {
    width: 82,
    height: 56,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
    gap: 4
  },
  itemActive: {
    backgroundColor: colors.primarySoft
  },
  label: {
    color: colors.textMuted,
    fontSize: 12,
    fontWeight: "600"
  },
  labelActive: {
    color: colors.primary
  }
});
