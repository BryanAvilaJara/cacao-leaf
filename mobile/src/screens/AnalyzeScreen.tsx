import * as ImagePicker from "expo-image-picker";
import { useState } from "react";
import { ActivityIndicator, Image, ScrollView, StyleSheet, Text, View } from "react-native";
import { AlertTriangle, Camera, CheckCircle2, ImagePlus, Send } from "lucide-react-native";

import { AnalysisResult, createAnalysis } from "../api/client";
import { PrimaryButton } from "../components/PrimaryButton";
import { colors } from "../theme/colors";

const photoTips = ["Hoja completa", "Buena luz", "Fondo limpio"];

export function AnalyzeScreen() {
  const [imageUri, setImageUri] = useState<string | null>(null);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function pickImage() {
    setError(null);
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      setError("Activa el permiso de galeria para seleccionar una imagen.");
      return;
    }

    const selection = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.85
    });

    if (!selection.canceled) {
      setImageUri(selection.assets[0].uri);
      setResult(null);
    }
  }

  async function takePhoto() {
    setError(null);
    const permission = await ImagePicker.requestCameraPermissionsAsync();
    if (!permission.granted) {
      setError("Activa el permiso de camara para tomar una foto.");
      return;
    }

    const capture = await ImagePicker.launchCameraAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.85
    });

    if (!capture.canceled) {
      setImageUri(capture.assets[0].uri);
      setResult(null);
    }
  }

  async function analyze() {
    if (!imageUri) return;

    try {
      setLoading(true);
      setError(null);
      setResult(await createAnalysis(imageUri));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error inesperado.");
    } finally {
      setLoading(false);
    }
  }

  const confidence = result ? Number(result.confidence) : 0;
  const isLowConfidence = result ? confidence < 70 : false;
  const isPathology = result?.status === "pathology";

  return (
    <ScrollView contentContainerStyle={styles.screen}>
      <Text accessibilityRole="header" style={styles.title}>Analisis de hoja</Text>
      <Text style={styles.copy}>
        Selecciona una foto clara de una hoja de cacao. El resultado es preliminar y no reemplaza
        la revision de un especialista agricola.
      </Text>

      <View style={styles.tips}>
        {photoTips.map((tip) => (
          <Text key={tip} style={styles.tip}>
            {tip}
          </Text>
        ))}
      </View>

      <View style={styles.preview}>
        {imageUri ? (
          <Image
            source={{ uri: imageUri }}
            style={styles.image}
            accessibilityLabel="Imagen seleccionada de una hoja de cacao para analizar."
          />
        ) : (
          <View accessible accessibilityLabel="No hay imagen seleccionada." style={styles.empty}>
            <ImagePlus
              size={42}
              color={colors.primary}
              accessibilityElementsHidden
              importantForAccessibility="no"
            />
            <Text style={styles.emptyText}>Sin imagen seleccionada</Text>
          </View>
        )}
      </View>

      <View style={styles.actions}>
        <View style={styles.sourceActions}>
          <PrimaryButton
            label="Camara"
            icon={Camera}
            onPress={takePhoto}
            style={styles.sourceButton}
            accessibilityLabel="Tomar foto con la camara"
            accessibilityHint="Solicita permiso de camara y abre la camara del dispositivo."
          />
          <PrimaryButton
            label="Galeria"
            icon={ImagePlus}
            onPress={pickImage}
            variant="secondary"
            style={styles.sourceButton}
            accessibilityLabel="Seleccionar imagen desde la galeria"
            accessibilityHint="Solicita permiso de galeria y permite elegir una imagen existente."
          />
        </View>
        <PrimaryButton
          label={loading ? "Procesando..." : "Procesar imagen"}
          icon={Send}
          onPress={analyze}
          disabled={!imageUri || loading}
          accessibilityLabel="Procesar imagen seleccionada"
          accessibilityHint="Envia la imagen al servidor para obtener una clasificacion preliminar."
        />
      </View>

      {loading ? (
        <ActivityIndicator
          accessibilityLabel="Procesando imagen"
          accessibilityRole="progressbar"
          color={colors.primary}
          size="large"
          style={styles.loader}
        />
      ) : null}
      {error ? (
        <Text accessibilityRole="alert" accessibilityLiveRegion="assertive" style={styles.error}>
          {error}
        </Text>
      ) : null}

      {result ? (
        <View style={[styles.result, isPathology ? styles.resultDanger : styles.resultOk]}>
          <View style={styles.resultHeader}>
            {isPathology ? (
              <AlertTriangle
                size={24}
                color={colors.danger}
                accessibilityElementsHidden
                importantForAccessibility="no"
              />
            ) : (
              <CheckCircle2
                size={24}
                color={colors.primary}
                accessibilityElementsHidden
                importantForAccessibility="no"
              />
            )}
            <View style={styles.resultTitleWrap}>
              <Text accessibilityRole="header" style={[styles.resultLabel, isPathology && styles.resultLabelDanger]}>
                {result.status_display}
              </Text>
              <Text style={styles.resultSubLabel}>{result.disease_label}</Text>
            </View>
          </View>
          <View
            accessible
            accessibilityLabel={`Confianza del resultado ${Number(result.confidence).toFixed(2)} por ciento.`}
            style={styles.confidenceTrack}
          >
            <View style={[styles.confidenceFill, { width: `${Math.max(4, Math.min(100, confidence))}%` }]} />
          </View>
          <Text style={styles.confidence}>{Number(result.confidence).toFixed(2)}% de confianza</Text>
          {isLowConfidence ? (
            <Text style={styles.warning}>
              Confianza baja: repite la foto con mejor iluminacion o valida con un especialista.
            </Text>
          ) : null}
          <Text style={styles.notes}>{result.notes}</Text>
          <Text style={styles.recommendation}>{result.recommendation}</Text>
        </View>
      ) : null}
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
  tips: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8
  },
  tip: {
    borderRadius: 8,
    backgroundColor: colors.primarySoft,
    color: colors.primary,
    fontSize: 13,
    fontWeight: "800",
    paddingHorizontal: 10,
    paddingVertical: 7
  },
  preview: {
    height: 310,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    overflow: "hidden"
  },
  image: {
    width: "100%",
    height: "100%"
  },
  empty: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: 10
  },
  emptyText: {
    color: colors.textMuted,
    fontWeight: "700"
  },
  actions: {
    gap: 12
  },
  sourceActions: {
    flexDirection: "row",
    gap: 12
  },
  sourceButton: {
    flex: 1
  },
  loader: {
    marginTop: 8
  },
  error: {
    color: colors.danger,
    fontSize: 14,
    fontWeight: "700"
  },
  result: {
    borderRadius: 8,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 18,
    gap: 10
  },
  resultOk: {
    borderColor: colors.primary,
    backgroundColor: "#fbfffc"
  },
  resultDanger: {
    borderColor: colors.danger,
    backgroundColor: "#fffafa"
  },
  resultHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8
  },
  resultTitleWrap: {
    flex: 1
  },
  resultLabel: {
    color: colors.primary,
    fontSize: 22,
    fontWeight: "800"
  },
  resultLabelDanger: {
    color: colors.danger
  },
  resultSubLabel: {
    color: colors.textMuted,
    fontSize: 14,
    marginTop: 2
  },
  confidenceTrack: {
    height: 10,
    borderRadius: 8,
    backgroundColor: colors.surfaceMuted,
    overflow: "hidden"
  },
  confidenceFill: {
    height: "100%",
    borderRadius: 8,
    backgroundColor: colors.warning
  },
  confidence: {
    color: colors.warning,
    fontSize: 16,
    fontWeight: "800"
  },
  warning: {
    color: colors.danger,
    fontSize: 14,
    fontWeight: "700",
    lineHeight: 20
  },
  notes: {
    color: colors.textMuted,
    lineHeight: 22
  },
  recommendation: {
    color: colors.text,
    lineHeight: 22
  }
});
