import { ImageBackground, StyleSheet, Text, View } from "react-native";
import { Camera } from "lucide-react-native";

import { PrimaryButton } from "../components/PrimaryButton";
import { colors } from "../theme/colors";

type Props = {
  onStart: () => void;
};

export function HomeScreen({ onStart }: Props) {
  return (
    <View style={styles.screen}>
      <ImageBackground
        accessible={false}
        source={{
          uri: "https://www.growables.org/information/TropicalFruit/images/CocoaStarr300.jpg"
        }}
        resizeMode="cover"
        style={styles.hero}
        imageStyle={styles.heroImage}
      >
        <View style={styles.overlay}>
          <Text accessibilityRole="header" style={styles.title}>Cacao Leaf</Text>
          <Text style={styles.subtitle}>
            Analisis preliminar de hojas de cacao desde una foto, con resultado e historial en segundos.
          </Text>
          <PrimaryButton
            label="Analizar hoja"
            icon={Camera}
            onPress={onStart}
            style={styles.button}
            accessibilityHint="Abre la pantalla para tomar o seleccionar una foto de una hoja de cacao."
          />
        </View>
      </ImageBackground>

      <View style={styles.summary}>
        <Text accessibilityRole="header" style={styles.sectionTitle}>Como usar la app</Text>
        <View style={styles.metrics}>
          <View accessible accessibilityLabel="Paso 1. Captura o selecciona una hoja clara." style={styles.metric}>
            <Text style={styles.metricNumber}>1</Text>
            <Text style={styles.metricText}>Captura o selecciona una hoja clara.</Text>
          </View>
          <View accessible accessibilityLabel="Paso 2. La app procesa la imagen." style={styles.metric}>
            <Text style={styles.metricNumber}>2</Text>
            <Text style={styles.metricText}>La app procesa la imagen.</Text>
          </View>
          <View accessible accessibilityLabel="Paso 3. Revisa confianza, notas e historial." style={styles.metric}>
            <Text style={styles.metricNumber}>3</Text>
            <Text style={styles.metricText}>Revisa confianza, notas e historial.</Text>
          </View>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.background
  },
  hero: {
    minHeight: 430,
    justifyContent: "flex-end"
  },
  heroImage: {
    opacity: 0.95
  },
  overlay: {
    padding: 24,
    paddingTop: 80,
    backgroundColor: "rgba(10, 18, 12, 0.46)"
  },
  title: {
    color: "#ffffff",
    fontSize: 42,
    fontWeight: "800"
  },
  subtitle: {
    color: "#eef4eb",
    fontSize: 17,
    lineHeight: 25,
    marginTop: 10
  },
  button: {
    marginTop: 24,
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
