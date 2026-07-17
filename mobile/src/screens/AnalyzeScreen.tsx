import * as ImagePicker from "expo-image-picker";
import { useState } from "react";
import { ActivityIndicator, Image, Modal, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from "react-native";
import { AlertTriangle, Camera, CheckCircle2, ImagePlus, MessageSquare, Send, X } from "lucide-react-native";

import {
  AnalysisFeedbackReason,
  AnalysisResult,
  RejectedFeedbackReason,
  createAnalysis,
  submitFeedback,
  submitRejectedFeedback
} from "../api/client";
import { PrimaryButton } from "../components/PrimaryButton";
import { colors } from "../theme/colors";

const photoTips = ["Hoja completa", "Buena luz", "Fondo limpio"];
const analysisFeedbackOptions: Array<{ reason: AnalysisFeedbackReason; label: string }> = [
  { reason: "not_leaf", label: "No era una hoja" },
  { reason: "wrong_result", label: "El resultado parece incorrecto" },
  { reason: "poor_image", label: "La imagen era poco clara" },
  { reason: "other", label: "Otro" }
];
const rejectedFeedbackOptions: Array<{ reason: RejectedFeedbackReason; label: string }> = [
  { reason: "was_leaf", label: "Si era una hoja" },
  { reason: "related_vegetation", label: "Era vegetacion relacionada" },
  { reason: "poor_image", label: "La imagen era poco clara" },
  { reason: "other", label: "Otro" }
];

type FeedbackMode = "analysis" | "rejection";
type FeedbackReason = AnalysisFeedbackReason | RejectedFeedbackReason;

function isRejectionError(message: string | null) {
  return Boolean(message?.toLowerCase().includes("no parece corresponder"));
}

export function AnalyzeScreen() {
  const [imageUri, setImageUri] = useState<string | null>(null);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [feedbackOpen, setFeedbackOpen] = useState(false);
  const [feedbackMode, setFeedbackMode] = useState<FeedbackMode>("analysis");
  const [feedbackReason, setFeedbackReason] = useState<FeedbackReason>("wrong_result");
  const [feedbackComment, setFeedbackComment] = useState("");
  const [feedbackSending, setFeedbackSending] = useState(false);
  const [feedbackMessage, setFeedbackMessage] = useState<string | null>(null);

  async function pickImage() {
    setError(null);
    setFeedbackMessage(null);
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
    setFeedbackMessage(null);
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
      setFeedbackMessage(null);
      setResult(await createAnalysis(imageUri));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error inesperado.");
    } finally {
      setLoading(false);
    }
  }

  function openAnalysisFeedback() {
    setFeedbackMode("analysis");
    setFeedbackReason("wrong_result");
    setFeedbackComment("");
    setFeedbackMessage(null);
    setFeedbackOpen(true);
  }

  function openRejectedFeedback() {
    setFeedbackMode("rejection");
    setFeedbackReason("was_leaf");
    setFeedbackComment("");
    setFeedbackMessage(null);
    setFeedbackOpen(true);
  }

  async function sendFeedback() {
    try {
      setFeedbackSending(true);
      if (feedbackMode === "analysis") {
        if (!result) return;
        await submitFeedback(result.id, feedbackReason as AnalysisFeedbackReason, feedbackComment);
        setFeedbackMessage("Reporte enviado. Gracias por ayudar a mejorar el analisis.");
      } else {
        if (!imageUri || !error) return;
        await submitRejectedFeedback(imageUri, feedbackReason as RejectedFeedbackReason, feedbackComment, error);
        setFeedbackMessage("Reporte enviado. Revisaremos este rechazo para mejorar el filtro.");
      }
      setFeedbackOpen(false);
    } catch (err) {
      setFeedbackMessage(err instanceof Error ? err.message : "No se pudo enviar el reporte.");
    } finally {
      setFeedbackSending(false);
    }
  }

  const confidence = result ? Number(result.confidence) : 0;
  const isLowConfidence = result ? confidence < 70 : false;
  const isPathology = result?.status === "pathology";
  const feedbackOptions = feedbackMode === "analysis" ? analysisFeedbackOptions : rejectedFeedbackOptions;
  const modalTitle = feedbackMode === "analysis" ? "Reportar resultado" : "Reportar rechazo";
  const modalCopy = feedbackMode === "analysis"
    ? "Ayudanos a mejorar Cacao Leaf indicando que ocurrio con este analisis."
    : "Ayudanos a revisar este caso si la imagen si correspondia a una hoja o vegetacion.";

  return (
    <ScrollView contentContainerStyle={styles.screen}>
      <Text accessibilityRole="header" style={styles.title}>Analisis de hoja</Text>
      <Text style={styles.copy}>
        Selecciona una foto clara de una hoja de cacao. El resultado es preliminar y no reemplaza
        la revision de un especialista agricola.
      </Text>

      <View style={styles.tips}>
        {photoTips.map((tip) => (
          <Text key={tip} style={styles.tip}>{tip}</Text>
        ))}
      </View>

      <View style={styles.preview}>
        {imageUri ? (
          <Image source={{ uri: imageUri }} style={styles.image} accessibilityLabel="Imagen seleccionada de una hoja de cacao para analizar." />
        ) : (
          <View accessible accessibilityLabel="No hay imagen seleccionada." style={styles.empty}>
            <ImagePlus size={42} color={colors.primary} accessibilityElementsHidden importantForAccessibility="no" />
            <Text style={styles.emptyText}>Sin imagen seleccionada</Text>
          </View>
        )}
      </View>

      <View style={styles.actions}>
        <View style={styles.sourceActions}>
          <PrimaryButton label="Camara" icon={Camera} onPress={takePhoto} style={styles.sourceButton} accessibilityLabel="Tomar foto con la camara" accessibilityHint="Solicita permiso de camara y abre la camara del dispositivo." />
          <PrimaryButton label="Galeria" icon={ImagePlus} onPress={pickImage} variant="secondary" style={styles.sourceButton} accessibilityLabel="Seleccionar imagen desde la galeria" accessibilityHint="Solicita permiso de galeria y permite elegir una imagen existente." />
        </View>
        <PrimaryButton label={loading ? "Procesando..." : "Procesar imagen"} icon={Send} onPress={analyze} disabled={!imageUri || loading} accessibilityLabel="Procesar imagen seleccionada" accessibilityHint="Envia la imagen al servidor para obtener una clasificacion preliminar." />
      </View>

      {loading ? <ActivityIndicator accessibilityLabel="Procesando imagen" accessibilityRole="progressbar" color={colors.primary} size="large" style={styles.loader} /> : null}
      {error ? <Text accessibilityRole="alert" accessibilityLiveRegion="assertive" style={styles.error}>{error}</Text> : null}
      {error && isRejectionError(error) ? (
        <View style={styles.feedbackPrompt}>
          <Text style={styles.feedbackQuestion}>Crees que este rechazo fue un error?</Text>
          <Pressable accessibilityRole="button" accessibilityLabel="Reportar rechazo" accessibilityHint="Abre un formulario para enviar una observacion sobre este rechazo." onPress={openRejectedFeedback} style={({ pressed }) => [styles.feedbackButton, pressed && styles.feedbackButtonPressed]}>
            <MessageSquare size={18} color={colors.primary} accessibilityElementsHidden importantForAccessibility="no" />
            <Text style={styles.feedbackButtonText}>Reportar rechazo</Text>
          </Pressable>
        </View>
      ) : null}
      {feedbackMessage ? <Text accessibilityRole="status" accessibilityLiveRegion="polite" style={styles.feedbackStatus}>{feedbackMessage}</Text> : null}

      {result ? (
        <View style={[styles.result, isPathology ? styles.resultDanger : styles.resultOk]}>
          <View style={styles.resultHeader}>
            {isPathology ? <AlertTriangle size={24} color={colors.danger} accessibilityElementsHidden importantForAccessibility="no" /> : <CheckCircle2 size={24} color={colors.primary} accessibilityElementsHidden importantForAccessibility="no" />}
            <View style={styles.resultTitleWrap}>
              <Text accessibilityRole="header" style={[styles.resultLabel, isPathology && styles.resultLabelDanger]}>{result.status_display}</Text>
              <Text style={styles.resultSubLabel}>{result.disease_label}</Text>
            </View>
          </View>
          <View accessible accessibilityLabel={`Confianza del resultado ${Number(result.confidence).toFixed(2)} por ciento.`} style={styles.confidenceTrack}>
            <View style={[styles.confidenceFill, { width: `${Math.max(4, Math.min(100, confidence))}%` }]} />
          </View>
          <Text style={styles.confidence}>{Number(result.confidence).toFixed(2)}% de confianza</Text>
          {isLowConfidence ? <Text style={styles.warning}>Confianza baja: repite la foto con mejor iluminacion o valida con un especialista.</Text> : null}
          <Text style={styles.notes}>{result.notes}</Text>
          <Text style={styles.recommendation}>{result.recommendation}</Text>

          <View style={styles.feedbackPrompt}>
            <Text style={styles.feedbackQuestion}>El resultado no coincide?</Text>
            <Pressable accessibilityRole="button" accessibilityLabel="Reportar resultado" accessibilityHint="Abre un formulario para enviar una observacion sobre este analisis." onPress={openAnalysisFeedback} style={({ pressed }) => [styles.feedbackButton, pressed && styles.feedbackButtonPressed]}>
              <MessageSquare size={18} color={colors.primary} accessibilityElementsHidden importantForAccessibility="no" />
              <Text style={styles.feedbackButtonText}>Reportar resultado</Text>
            </Pressable>
          </View>
        </View>
      ) : null}

      <Modal visible={feedbackOpen} transparent animationType="fade" onRequestClose={() => setFeedbackOpen(false)}>
        <View style={styles.modalBackdrop}>
          <View accessibilityViewIsModal style={styles.modalCard}>
            <View style={styles.modalHeader}>
              <Text accessibilityRole="header" style={styles.modalTitle}>{modalTitle}</Text>
              <Pressable accessibilityRole="button" accessibilityLabel="Cerrar reporte" onPress={() => setFeedbackOpen(false)} style={styles.closeButton}>
                <X size={22} color={colors.text} accessibilityElementsHidden importantForAccessibility="no" />
              </Pressable>
            </View>

            <View style={styles.modalContent}>
              <Text style={styles.copy}>{modalCopy}</Text>
              <Text style={styles.fieldLabel}>Que ocurrio?</Text>
              <View style={styles.reasonList}>
                {feedbackOptions.map((option) => {
                  const selected = feedbackReason === option.reason;
                  return (
                    <Pressable key={option.reason} accessibilityRole="radio" accessibilityState={{ selected }} onPress={() => setFeedbackReason(option.reason)} style={[styles.reasonOption, selected && styles.reasonOptionSelected]}>
                      <Text style={[styles.reasonText, selected && styles.reasonTextSelected]}>{option.label}</Text>
                    </Pressable>
                  );
                })}
              </View>
              <Text style={styles.fieldLabel}>Comentario opcional</Text>
              <TextInput value={feedbackComment} onChangeText={setFeedbackComment} multiline maxLength={500} placeholder="Escribe una observacion breve" placeholderTextColor={colors.textMuted} style={styles.commentInput} />
              <View style={styles.modalActions}>
                <PrimaryButton label="Cancelar" onPress={() => setFeedbackOpen(false)} disabled={feedbackSending} variant="secondary" style={styles.modalButton} />
                <PrimaryButton label={feedbackSending ? "Enviando..." : "Enviar reporte"} onPress={sendFeedback} disabled={feedbackSending} style={styles.modalButton} />
              </View>
            </View>
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: { padding: 24, gap: 16, backgroundColor: colors.background },
  title: { color: colors.text, fontSize: 28, fontWeight: "800" },
  copy: { color: colors.textMuted, fontSize: 15, lineHeight: 23 },
  tips: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  tip: { borderRadius: 8, backgroundColor: colors.primarySoft, color: colors.primary, fontSize: 13, fontWeight: "800", paddingHorizontal: 10, paddingVertical: 7 },
  preview: { height: 310, borderRadius: 8, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.surface, overflow: "hidden" },
  image: { width: "100%", height: "100%" },
  empty: { flex: 1, alignItems: "center", justifyContent: "center", gap: 10 },
  emptyText: { color: colors.textMuted, fontWeight: "700" },
  actions: { gap: 12 },
  sourceActions: { flexDirection: "row", gap: 12 },
  sourceButton: { flex: 1 },
  loader: { marginTop: 8 },
  error: { color: colors.danger, fontSize: 14, fontWeight: "700" },
  feedbackStatus: { color: colors.primary, fontSize: 14, fontWeight: "800", lineHeight: 20 },
  result: { borderRadius: 8, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border, padding: 18, gap: 10 },
  resultOk: { borderColor: colors.primary, backgroundColor: "#fbfffc" },
  resultDanger: { borderColor: colors.danger, backgroundColor: "#fffafa" },
  resultHeader: { flexDirection: "row", alignItems: "center", gap: 8 },
  resultTitleWrap: { flex: 1 },
  resultLabel: { color: colors.primary, fontSize: 22, fontWeight: "800" },
  resultLabelDanger: { color: colors.danger },
  resultSubLabel: { color: colors.textMuted, fontSize: 14, marginTop: 2 },
  confidenceTrack: { height: 10, borderRadius: 8, backgroundColor: colors.surfaceMuted, overflow: "hidden" },
  confidenceFill: { height: "100%", borderRadius: 8, backgroundColor: colors.warning },
  confidence: { color: colors.warning, fontSize: 16, fontWeight: "800" },
  warning: { color: colors.danger, fontSize: 14, fontWeight: "700", lineHeight: 20 },
  notes: { color: colors.textMuted, lineHeight: 22 },
  recommendation: { color: colors.text, lineHeight: 22 },
  feedbackPrompt: { borderTopWidth: 1, borderTopColor: colors.border, paddingTop: 12, gap: 8 },
  feedbackQuestion: { color: colors.textMuted, fontSize: 14, fontWeight: "700" },
  feedbackButton: { minHeight: 44, borderRadius: 8, borderWidth: 1, borderColor: colors.primary, backgroundColor: colors.surface, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8, paddingHorizontal: 12 },
  feedbackButtonPressed: { backgroundColor: colors.primarySoft },
  feedbackButtonText: { color: colors.primary, fontWeight: "800", fontSize: 15 },
  modalBackdrop: { flex: 1, backgroundColor: "rgba(10, 18, 12, 0.45)", padding: 18, justifyContent: "center" },
  modalCard: { maxHeight: "88%", borderRadius: 8, backgroundColor: colors.surface, overflow: "hidden" },
  modalHeader: { minHeight: 58, borderBottomWidth: 1, borderBottomColor: colors.border, paddingHorizontal: 18, flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  modalTitle: { color: colors.text, fontSize: 18, fontWeight: "800" },
  closeButton: { width: 44, height: 44, borderRadius: 8, alignItems: "center", justifyContent: "center" },
  modalContent: { padding: 18, gap: 12 },
  fieldLabel: { color: colors.text, fontSize: 14, fontWeight: "800" },
  reasonList: { gap: 8 },
  reasonOption: { minHeight: 44, borderRadius: 8, borderWidth: 1, borderColor: colors.border, paddingHorizontal: 12, justifyContent: "center", backgroundColor: colors.surface },
  reasonOptionSelected: { borderColor: colors.primary, backgroundColor: colors.primarySoft },
  reasonText: { color: colors.text, fontSize: 14, fontWeight: "700" },
  reasonTextSelected: { color: colors.primary },
  commentInput: { minHeight: 86, borderRadius: 8, borderWidth: 1, borderColor: colors.border, padding: 12, color: colors.text, fontSize: 15, textAlignVertical: "top", backgroundColor: "#fbfffc" },
  modalActions: { flexDirection: "row", gap: 10 },
  modalButton: { flex: 1 }
});
