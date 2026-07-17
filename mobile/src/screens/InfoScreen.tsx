import { ScrollView, StyleSheet, Text, View } from "react-native";
import { AlertCircle, Database, Leaf, ShieldCheck } from "lucide-react-native";

import { colors } from "../theme/colors";

const symptoms = [
  "Manchas oscuras o necrosis visible en la hoja.",
  "Amarillamiento o pérdida de color no habitual.",
  "Deformaciones o cambios de textura en la superficie.",
  "Daños extendidos que se repiten en varias hojas."
];

export function InfoScreen() {
  return (
    <ScrollView contentContainerStyle={styles.screen}>
      <Text accessibilityRole="header" style={styles.title}>Patologías detectables</Text>
      <Text style={styles.copy}>
        Cacao Leaf apoya la clasificación preliminar de síntomas visibles en hojas de cacao mediante imágenes.
      </Text>

      <View style={styles.block}>
        <View style={styles.blockHeader}>
          <Leaf size={22} color={colors.primary} accessibilityElementsHidden importantForAccessibility="no" />
          <Text accessibilityRole="header" style={styles.blockTitle}>Señales visuales</Text>
        </View>
        {symptoms.map((item) => (
          <Text key={item} style={styles.item}>
            {item}
          </Text>
        ))}
      </View>

      <View style={styles.block}>
        <View style={styles.blockHeader}>
          <AlertCircle size={22} color={colors.warning} accessibilityElementsHidden importantForAccessibility="no" />
          <Text accessibilityRole="header" style={styles.blockTitle}>Limitación</Text>
        </View>
        <Text style={styles.copy}>
          La precisión depende de la calidad, iluminación y variedad del dataset. El resultado
          no reemplaza el diagnóstico profesional de un especialista agrícola.
        </Text>
      </View>

      <View style={styles.block}>
        <View style={styles.blockHeader}>
          <ShieldCheck size={22} color={colors.primary} accessibilityElementsHidden importantForAccessibility="no" />
          <Text accessibilityRole="header" style={styles.blockTitle}>Uso recomendado</Text>
        </View>
        <Text style={styles.copy}>
          Usa el resultado como apoyo inicial para priorizar revisión, registrar evidencias y
          decidir si conviene repetir la foto o consultar a un especialista.
        </Text>
      </View>

      <View style={styles.block}>
        <View style={styles.blockHeader}>
          <Database size={22} color={colors.primary} accessibilityElementsHidden importantForAccessibility="no" />
          <Text accessibilityRole="header" style={styles.blockTitle}>Privacidad y mejora</Text>
        </View>
        <Text style={styles.copy}>
          Las imágenes y observaciones reportadas pueden conservarse para revisión técnica y mejora del sistema.
          Usa esta función solo cuando quieras dejar evidencia para análisis posterior.
        </Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: {
    padding: 24,
    gap: 16,
    backgroundColor: colors.background
  },
  title: {
    color: colors.text,
    fontSize: 28,
    fontWeight: "800"
  },
  copy: {
    color: colors.textMuted,
    fontSize: 15,
    lineHeight: 23
  },
  block: {
    borderRadius: 8,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 18,
    gap: 10
  },
  blockHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8
  },
  blockTitle: {
    color: colors.text,
    fontSize: 18,
    fontWeight: "800"
  },
  item: {
    color: colors.textMuted,
    fontSize: 15,
    lineHeight: 22
  }
});