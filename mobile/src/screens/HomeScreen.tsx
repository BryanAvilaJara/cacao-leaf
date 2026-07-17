import { ScrollView, StyleSheet, Text, View } from "react-native";
import { Camera } from "lucide-react-native";

import { PrimaryButton } from "../components/PrimaryButton";
import { colors } from "../theme/colors";

type Props = {
  onStart: () => void;
};

export function HomeScreen({ onStart }: Props) {
  return (
    <ScrollView style={styles.scroll} contentContainerStyle={styles.screen}>
      <View style={styles.hero}>
        <View style={styles.heroPattern} />
        <View style={styles.heroContent}>
          <Text accessibilityRole="header" style={styles.title}>Cacao Leaf</Text>
          <Text style={styles.subtitle}>
            Análisis preliminar de hojas de cacao desde una foto, con resultado e historial en segundos.
          </Text>
          <PrimaryButton
            label="Analizar hoja"
            icon={Camera}
            onPress={onStart}
            style={styles.button}
            accessibilityHint="Abre la pantalla para tomar o seleccionar una foto de una hoja de cacao."
          />
        </View>
      </View>

      <View style={styles.summary}>
        <Text accessibilityRole="header" style={styles.sectionTitle}>Cómo usar la app</Text>
        <View style={styles.metrics}>
          <View accessible accessibilityLabel="Paso 1. Captura o selecciona una hoja clara." style={styles.metric}>
            <Text style={styles.metricNumber}>1</Text>
            <Text style={styles.metricText}>Captura o selecciona una hoja clara.</Text>
          </View>
          <View accessible accessibilityLabel="Paso 2. La app analiza la imagen." style={styles.metric}>
            <Text style={styles.metricNumber}>2</Text>
            <Text style={styles.metricText}>La app analiza la imagen.</Text>
          </View>
          <View accessible accessibilityLabel="Paso 3. Revisa confianza, recomendaciones e historial." style={styles.metric}>
            <Text style={styles.metricNumber}>3</Text>
            <Text style={styles.metricText}>Revisa confianza, recomendaciones e historial.</Text>
          </View>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scroll: {
    flex: 1,
    backgroundColor: colors.background
  },
  screen: {
    backgroundColor: colors.background,
    paddingBottom: 24
  },
  hero: {
    minHeight: 330,
    justifyContent: "flex-end",
    backgroundColor: colors.primaryDark,
    overflow: "hidden"
  },
  heroPattern: {
    position: "absolute",
    right: -50,
    top: -40,
    width: 220,
    height: 220,
    borderRadius: 110,
    backgroundColor: "rgba(223, 241, 231, 0.22)"
  },
  heroContent: {
    padding: 24,
    paddingTop: 56,
    gap: 10
  },
  title: {
    color: "#ffffff",
    fontSize: 38,
    fontWeight: "800"
  },
  subtitle: {
    color: "#eef4eb",
    fontSize: 17,
    lineHeight: 25
  },
  button: {
    marginTop: 12,
    alignSelf: "flex-start"
  },
  summary: {
    padding: 24,
    gap: 14
  },
  sectionTitle: {
    color: colors.text,
    fontSize: 20,
    fontWeight: "800",
    marginBottom: 8
  },
  metrics: {
    gap: 10
  },
  metric: {
    minHeight: 70,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    padding: 14,
    flexDirection: "row",
    alignItems: "center",
    gap: 12
  },
  metricNumber: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.primarySoft,
    color: colors.primary,
    textAlign: "center",
    lineHeight: 32,
    fontWeight: "800"
  },
  metricText: {
    flex: 1,
    color: colors.text,
    fontSize: 15,
    lineHeight: 21,
    fontWeight: "700"
  }
});