import { useCallback, useMemo, useState } from "react";
import { ActivityIndicator, Image, Modal, Pressable, RefreshControl, ScrollView, StyleSheet, Text, TextInput, View } from "react-native";
import { AlertTriangle, CheckCircle2, MessageSquare, Trash2, X } from "lucide-react-native";

import {
  AnalysisFeedbackReason,
  AnalysisResult,
  RejectedFeedbackReport,
  clearAnalyses,
  listAnalyses,
  listRejectedFeedback,
  submitFeedback
} from "../api/client";
import { PrimaryButton } from "../components/PrimaryButton";
import { colors } from "../theme/colors";

type HistoryFilter = "all" | "reported" | "rejected";
type HistoryEntry =
  | { kind: "analysis"; id: string; date: string; item: AnalysisResult }
  | { kind: "rejected"; id: string; date: string; item: RejectedFeedbackReport };

const filters: Array<{ value: HistoryFilter; label: string }> = [
  { value: "all", label: "Todos" },
  { value: "reported", label: "Reportados" },
  { value: "rejected", label: "Rechazos" }
];

const feedbackOptions: Array<{ reason: AnalysisFeedbackReason; label: string }> = [
  { reason: "not_leaf", label: "No era una hoja" },
  { reason: "wrong_result", label: "El resultado parece incorrecto" },
  { reason: "poor_image", label: "La imagen era poco clara" },
  { reason: "other", label: "Otro" }
];

export function HistoryScreen() {
  const [analyses, setAnalyses] = useState<AnalysisResult[]>([]);
  const [rejectedReports, setRejectedReports] = useState<RejectedFeedbackReport[]>([]);
  const [selectedEntry, setSelectedEntry] = useState<HistoryEntry | null>(null);
  const [filter, setFilter] = useState<HistoryFilter>("all");
  const [confirmClear, setConfirmClear] = useState(false);
  const [feedbackOpen, setFeedbackOpen] = useState(false);
  const [feedbackReason, setFeedbackReason] = useState<AnalysisFeedbackReason>("wrong_result");
  const [feedbackComment, setFeedbackComment] = useState("");
  const [feedbackSending, setFeedbackSending] = useState(false);
  const [loading, setLoading] = useState(false);
  const [clearing, setClearing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  const entries = useMemo<HistoryEntry[]>(() => {
    const analysisEntries = analyses.map((item) => ({
      kind: "analysis" as const,
      id: `analysis-${item.id}`,
      date: item.created_at,
      item
    }));
    const rejectedEntries = rejectedReports.map((item) => ({
      kind: "rejected" as const,
      id: `rejected-${item.id}`,
      date: item.created_at,
      item
    }));

    return [...analysisEntries, ...rejectedEntries].sort(
      (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
    );
  }, [analyses, rejectedReports]);

  const reportedCount = analyses.filter((item) => item.feedback_count > 0).length;
  const rejectedCount = rejectedReports.length;
  const totalCount = entries.length;

  const filteredEntries = useMemo(() => {
    if (filter === "reported") {
      return entries.filter((entry) => entry.kind === "analysis" && entry.item.feedback_count > 0);
    }
    if (filter === "rejected") {
      return entries.filter((entry) => entry.kind === "rejected");
    }
    return entries;
  }, [entries, filter]);

  const load = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const [analysisItems, rejectedItems] = await Promise.all([listAnalyses(), listRejectedFeedback()]);
      setAnalyses(analysisItems);
      setRejectedReports(rejectedItems);
    } catch (err) {
      setError(err instanceof Error ? err.message : "No se pudo cargar el historial.");
    } finally {
      setLoading(false);
    }
  }, []);

  async function clearHistory() {
    try {
      setClearing(true);
      setError(null);
      await clearAnalyses();
      await load();
      setSelectedEntry(null);
      setConfirmClear(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : "No se pudo limpiar el historial.");
    } finally {
      setClearing(false);
    }
  }

  function openFeedback() {
    setFeedbackReason("wrong_result");
    setFeedbackComment("");
    setStatusMessage(null);
    setFeedbackOpen(true);
  }

  async function sendFeedback() {
    if (!selectedEntry || selectedEntry.kind !== "analysis") return;

    try {
      setFeedbackSending(true);
      await submitFeedback(selectedEntry.item.id, feedbackReason, feedbackComment);
      setFeedbackOpen(false);
      setStatusMessage("Reporte guardado. Este análisis queda marcado para revisión.");
      await load();
    } catch (err) {
      setStatusMessage(err instanceof Error ? err.message : "No se pudo enviar el reporte.");
    } finally {
      setFeedbackSending(false);
    }
  }

  return (
    <ScrollView
      contentContainerStyle={styles.screen}
      refreshControl={<RefreshControl refreshing={loading} onRefresh={load} />}
      onLayout={() => {
        if (!entries.length && !loading) load();
      }}
    >
      <Text accessibilityRole="header" style={styles.title}>Historial</Text>
      <Text style={styles.copy}>Revisa análisis, reportes y casos observados para seguimiento o mejora futura.</Text>

      <View style={styles.filters} accessibilityRole="tablist">
        {filters.map((option) => {
          const selected = filter === option.value;
          const count = option.value === "all" ? totalCount : option.value === "reported" ? reportedCount : rejectedCount;
          return (
            <Pressable key={option.value} accessibilityRole="tab" accessibilityState={{ selected }} onPress={() => setFilter(option.value)} style={[styles.filterButton, selected && styles.filterButtonActive]}>
              <Text style={[styles.filterText, selected && styles.filterTextActive]}>{`${option.label} (${count})`}</Text>
            </Pressable>
          );
        })}
      </View>

      {entries.length ? (
        <PrimaryButton
          label={clearing ? "Limpiando..." : "Limpiar análisis"}
          icon={Trash2}
          onPress={() => setConfirmClear(true)}
          disabled={clearing}
          variant="secondary"
          accessibilityHint="Abre una confirmación antes de eliminar los análisis guardados. Los reportes se conservan."
        />
      ) : null}

      {loading && !entries.length ? (
        <ActivityIndicator accessibilityLabel="Cargando historial" accessibilityRole="progressbar" color={colors.primary} size="large" />
      ) : null}
      {error ? <Text accessibilityRole="alert" accessibilityLiveRegion="assertive" style={styles.error}>{error}</Text> : null}
      {statusMessage ? <Text accessibilityRole="status" accessibilityLiveRegion="polite" style={styles.feedbackStatus}>{statusMessage}</Text> : null}
      {!loading && !filteredEntries.length && !error ? <Text style={styles.empty}>No hay registros para este filtro. Procesa una hoja o reporta un caso para iniciar la trazabilidad.</Text> : null}

      {filteredEntries.map((entry) => (
        <HistoryRow key={entry.id} entry={entry} onPress={() => setSelectedEntry(entry)} />
      ))}

      <Modal visible={Boolean(selectedEntry)} transparent animationType="fade" onRequestClose={() => setSelectedEntry(null)}>
        <View style={styles.modalBackdrop}>
          <View accessibilityViewIsModal style={styles.modalCard}>
            <View style={styles.modalHeader}>
              <Text accessibilityRole="header" style={styles.modalTitle}>{selectedEntry?.kind === "rejected" ? "Detalle del rechazo" : "Detalle del análisis"}</Text>
              <Pressable accessibilityRole="button" accessibilityLabel="Cerrar detalle" onPress={() => setSelectedEntry(null)} style={styles.closeButton}>
                <X size={22} color={colors.text} accessibilityElementsHidden importantForAccessibility="no" />
              </Pressable>
            </View>

            {selectedEntry ? (
              <ScrollView contentContainerStyle={styles.modalContent}>
                <DetailImage entry={selectedEntry} />
                {selectedEntry.kind === "analysis" ? (
                  <AnalysisDetail entry={selectedEntry} onReport={openFeedback} />
                ) : (
                  <RejectedDetail entry={selectedEntry} />
                )}
              </ScrollView>
            ) : null}
          </View>
        </View>
      </Modal>

      <Modal visible={feedbackOpen} transparent animationType="fade" onRequestClose={() => setFeedbackOpen(false)}>
        <View style={styles.modalBackdrop}>
          <View accessibilityViewIsModal style={styles.confirmCard}>
            <View style={styles.modalHeaderCompact}>
              <Text accessibilityRole="header" style={styles.modalTitle}>Reportar resultado</Text>
              <Pressable accessibilityRole="button" accessibilityLabel="Cerrar reporte" onPress={() => setFeedbackOpen(false)} style={styles.closeButton}>
                <X size={22} color={colors.text} accessibilityElementsHidden importantForAccessibility="no" />
              </Pressable>
            </View>
            <Text style={styles.detailText}>Marca este análisis como observado para revisarlo después o usarlo como evidencia de mejora.</Text>
            <Text style={styles.detailLabel}>¿Qué ocurrió?</Text>
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
            <Text style={styles.detailLabel}>Comentario opcional</Text>
            <TextInput value={feedbackComment} onChangeText={setFeedbackComment} multiline maxLength={500} placeholder="Escribe una observación breve" placeholderTextColor={colors.textMuted} style={styles.commentInput} />
            <View style={styles.confirmActions}>
              <PrimaryButton label="Cancelar" onPress={() => setFeedbackOpen(false)} disabled={feedbackSending} variant="secondary" style={styles.confirmButton} />
              <PrimaryButton label={feedbackSending ? "Enviando..." : "Guardar reporte"} onPress={sendFeedback} disabled={feedbackSending} style={styles.confirmButton} />
            </View>
          </View>
        </View>
      </Modal>

      <Modal visible={confirmClear} transparent animationType="fade" onRequestClose={() => setConfirmClear(false)}>
        <View style={styles.modalBackdrop}>
          <View accessibilityViewIsModal style={styles.confirmCard}>
            <Text accessibilityRole="header" style={styles.modalTitle}>Limpiar análisis</Text>
            <Text style={styles.detailText}>Se eliminarán los análisis guardados. Los reportes de rechazo se conservan para revisión.</Text>
            <View style={styles.confirmActions}>
              <PrimaryButton label="Cancelar" onPress={() => setConfirmClear(false)} disabled={clearing} variant="secondary" style={styles.confirmButton} />
              <PrimaryButton label={clearing ? "Limpiando..." : "Limpiar"} icon={Trash2} onPress={clearHistory} disabled={clearing} style={styles.confirmButton} accessibilityLabel="Confirmar limpieza del historial" />
            </View>
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
}

function HistoryRow({ entry, onPress }: { entry: HistoryEntry; onPress: () => void }) {
  const isRejected = entry.kind === "rejected";
  const analysis = entry.kind === "analysis" ? entry.item : null;
  const rejected = entry.kind === "rejected" ? entry.item : null;
  const reported = analysis ? analysis.feedback_count > 0 : true;

  return (
    <Pressable accessibilityRole="button" accessibilityHint="Abre el detalle del registro." onPress={onPress} style={({ pressed }) => [styles.row, pressed && styles.rowPressed]}>
      {(analysis?.image_url || rejected?.image_url) ? <Image source={{ uri: analysis?.image_url || rejected?.image_url || "" }} style={styles.thumb} accessibilityLabel="Miniatura del registro." /> : null}
      <View style={styles.rowText}>
        <View style={styles.statusLine}>
          {isRejected || analysis?.status === "pathology" ? <AlertTriangle size={18} color={isRejected ? colors.warning : colors.danger} accessibilityElementsHidden importantForAccessibility="no" /> : <CheckCircle2 size={18} color={colors.primary} accessibilityElementsHidden importantForAccessibility="no" />}
          <Text style={[styles.status, isRejected && styles.statusWarning, analysis?.status === "pathology" && styles.statusDanger]}>{isRejected ? "Rechazo reportado" : analysis?.status_display}</Text>
        </View>
        <Text style={styles.disease}>{isRejected ? rejected?.reason_display : analysis?.disease_label}</Text>
        <Text style={styles.meta}>{isRejected ? "Imagen enviada para revisión" : `${Number(analysis?.confidence || 0).toFixed(2)}% confianza`}</Text>
        <Text style={styles.meta}>{new Date(entry.date).toLocaleString()}</Text>
        <View style={styles.badgeLine}>
          {reported ? <Text style={styles.reportBadge}>Reportado</Text> : null}
          <Text style={styles.openHint}>Ver detalle</Text>
        </View>
      </View>
    </Pressable>
  );
}

function DetailImage({ entry }: { entry: HistoryEntry }) {
  const url = entry.kind === "analysis" ? entry.item.image_url : entry.item.image_url;
  return url ? <Image source={{ uri: url }} style={styles.largeImage} accessibilityLabel="Imagen ampliada del registro." /> : null;
}

function AnalysisDetail({ entry, onReport }: { entry: Extract<HistoryEntry, { kind: "analysis" }>; onReport: () => void }) {
  const item = entry.item;
  return (
    <>
      <View style={styles.statusLine}>
        {item.status === "pathology" ? <AlertTriangle size={22} color={colors.danger} accessibilityElementsHidden importantForAccessibility="no" /> : <CheckCircle2 size={22} color={colors.primary} accessibilityElementsHidden importantForAccessibility="no" />}
        <Text style={[styles.modalStatus, item.status === "pathology" && styles.statusDanger]}>{item.status_display}</Text>
        {item.feedback_count > 0 ? <Text style={styles.reportBadge}>Reportado</Text> : null}
      </View>
      <DetailBlock label="Resultado" value={item.disease_label} />
      <DetailBlock label="Confianza" value={`${Number(item.confidence).toFixed(2)}%`} />
      <DetailBlock label="Fecha" value={new Date(item.created_at).toLocaleString()} />
      <DetailBlock label="Observación" value={item.notes} />
      <DetailBlock label="Recomendación" value={item.recommendation} />
      {item.feedback_count > 0 ? <DetailBlock label="Último reporte" value={`${item.latest_feedback_reason_display}${item.latest_feedback_comment ? `: ${item.latest_feedback_comment}` : ""}`} /> : null}
      <PrimaryButton label="Reportar resultado" icon={MessageSquare} onPress={onReport} variant={item.feedback_count > 0 ? "secondary" : "primary"} accessibilityHint="Marca este análisis como observado para revisión futura." />
    </>
  );
}

function RejectedDetail({ entry }: { entry: Extract<HistoryEntry, { kind: "rejected" }> }) {
  const item = entry.item;
  return (
    <>
      <View style={styles.statusLine}>
        <AlertTriangle size={22} color={colors.warning} accessibilityElementsHidden importantForAccessibility="no" />
        <Text style={[styles.modalStatus, styles.statusWarning]}>Rechazo reportado</Text>
      </View>
      <DetailBlock label="Motivo reportado" value={item.reason_display} />
      <DetailBlock label="Mensaje original" value={item.error_message} />
      <DetailBlock label="Comentario" value={item.comment || "Sin comentario"} />
      <DetailBlock label="Fecha" value={new Date(item.created_at).toLocaleString()} />
    </>
  );
}

function DetailBlock({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.detailBlock}>
      <Text style={styles.detailLabel}>{label}</Text>
      <Text style={styles.detailText}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { padding: 24, gap: 14, backgroundColor: colors.background },
  title: { color: colors.text, fontSize: 28, fontWeight: "800" },
  copy: { color: colors.textMuted, fontSize: 15, lineHeight: 23 },
  filters: { flexDirection: "row", gap: 8 },
  filterButton: { minHeight: 40, borderRadius: 8, borderWidth: 1, borderColor: colors.border, paddingHorizontal: 12, alignItems: "center", justifyContent: "center", backgroundColor: colors.surface },
  filterButtonActive: { borderColor: colors.primary, backgroundColor: colors.primarySoft },
  filterText: { color: colors.textMuted, fontWeight: "800" },
  filterTextActive: { color: colors.primary },
  error: { color: colors.danger, fontWeight: "700" },
  feedbackStatus: { color: colors.primary, fontSize: 14, fontWeight: "800", lineHeight: 20 },
  empty: { color: colors.textMuted, fontWeight: "700", lineHeight: 21 },
  row: { minHeight: 104, borderRadius: 8, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border, padding: 10, flexDirection: "row", gap: 12, alignItems: "center" },
  rowPressed: { backgroundColor: colors.surfaceMuted },
  thumb: { width: 76, height: 76, borderRadius: 8, backgroundColor: colors.surfaceMuted },
  rowText: { flex: 1, gap: 4 },
  statusLine: { flexDirection: "row", alignItems: "center", gap: 6, flexWrap: "wrap" },
  status: { color: colors.primary, fontWeight: "800", fontSize: 16 },
  statusDanger: { color: colors.danger },
  statusWarning: { color: colors.warning },
  disease: { color: colors.text, fontSize: 14, fontWeight: "700" },
  meta: { color: colors.textMuted, fontSize: 13 },
  badgeLine: { flexDirection: "row", gap: 8, alignItems: "center", flexWrap: "wrap" },
  reportBadge: { borderRadius: 8, backgroundColor: "#fff3d7", color: colors.warning, fontSize: 12, fontWeight: "800", paddingHorizontal: 8, paddingVertical: 4 },
  openHint: { color: colors.primary, fontSize: 13, fontWeight: "800", marginTop: 2 },
  modalBackdrop: { flex: 1, backgroundColor: "rgba(10, 18, 12, 0.45)", padding: 18, justifyContent: "center" },
  modalCard: { maxHeight: "88%", borderRadius: 8, backgroundColor: colors.surface, overflow: "hidden" },
  modalHeader: { minHeight: 58, borderBottomWidth: 1, borderBottomColor: colors.border, paddingHorizontal: 18, flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  modalHeaderCompact: { minHeight: 44, flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  modalTitle: { color: colors.text, fontSize: 18, fontWeight: "800" },
  closeButton: { width: 44, height: 44, borderRadius: 8, alignItems: "center", justifyContent: "center" },
  modalContent: { padding: 18, gap: 14 },
  largeImage: { width: "100%", height: 300, borderRadius: 8, backgroundColor: colors.surfaceMuted },
  modalStatus: { color: colors.primary, fontSize: 20, fontWeight: "800" },
  detailBlock: { borderRadius: 8, borderWidth: 1, borderColor: colors.border, backgroundColor: "#fbfffc", padding: 12, gap: 4 },
  detailLabel: { color: colors.textMuted, fontSize: 13, fontWeight: "800" },
  detailText: { color: colors.text, fontSize: 15, lineHeight: 22 },
  confirmCard: { borderRadius: 8, backgroundColor: colors.surface, padding: 18, gap: 14 },
  confirmActions: { flexDirection: "row", gap: 10 },
  confirmButton: { flex: 1 },
  reasonList: { gap: 8 },
  reasonOption: { minHeight: 44, borderRadius: 8, borderWidth: 1, borderColor: colors.border, paddingHorizontal: 12, justifyContent: "center", backgroundColor: colors.surface },
  reasonOptionSelected: { borderColor: colors.primary, backgroundColor: colors.primarySoft },
  reasonText: { color: colors.text, fontSize: 14, fontWeight: "700" },
  reasonTextSelected: { color: colors.primary },
  commentInput: { minHeight: 86, borderRadius: 8, borderWidth: 1, borderColor: colors.border, padding: 12, color: colors.text, fontSize: 15, textAlignVertical: "top", backgroundColor: "#fbfffc" }
});