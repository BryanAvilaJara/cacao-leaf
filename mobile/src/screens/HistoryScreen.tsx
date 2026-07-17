import { useCallback, useState } from "react";
import { ActivityIndicator, Image, Modal, Pressable, RefreshControl, ScrollView, StyleSheet, Text, View } from "react-native";
import { AlertTriangle, CheckCircle2, Trash2, X } from "lucide-react-native";

import { AnalysisResult, clearAnalyses, listAnalyses } from "../api/client";
import { PrimaryButton } from "../components/PrimaryButton";
import { colors } from "../theme/colors";

export function HistoryScreen() {
  const [items, setItems] = useState<AnalysisResult[]>([]);
  const [selectedItem, setSelectedItem] = useState<AnalysisResult | null>(null);
  const [confirmClear, setConfirmClear] = useState(false);
  const [loading, setLoading] = useState(false);
  const [clearing, setClearing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      setItems(await listAnalyses());
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
      setItems([]);
      setSelectedItem(null);
      setConfirmClear(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : "No se pudo limpiar el historial.");
    } finally {
      setClearing(false);
    }
  }

  return (
    <ScrollView
      contentContainerStyle={styles.screen}
      refreshControl={<RefreshControl refreshing={loading} onRefresh={load} />}
      onLayout={() => {
        if (!items.length && !loading) load();
      }}
    >
      <Text accessibilityRole="header" style={styles.title}>Historial</Text>
      <Text style={styles.copy}>Desliza hacia abajo para actualizar los analisis registrados.</Text>

      {items.length ? (
        <PrimaryButton
          label={clearing ? "Limpiando..." : "Limpiar historial"}
          icon={Trash2}
          onPress={() => setConfirmClear(true)}
          disabled={clearing}
          variant="secondary"
          accessibilityHint="Abre una confirmacion antes de eliminar todos los analisis guardados."
        />
      ) : null}

      {loading && !items.length ? (
        <ActivityIndicator accessibilityLabel="Cargando historial" accessibilityRole="progressbar" color={colors.primary} size="large" />
      ) : null}
      {error ? (
        <Text accessibilityRole="alert" accessibilityLiveRegion="assertive" style={styles.error}>
          {error}
        </Text>
      ) : null}
      {!loading && !items.length && !error ? <Text style={styles.empty}>Todavia no hay analisis guardados.</Text> : null}

      {items.map((item) => (
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={`${item.status_display}. ${item.disease_label}. Confianza ${Number(item.confidence).toFixed(2)} por ciento. Fecha ${new Date(item.created_at).toLocaleString()}.`}
          accessibilityHint="Abre el detalle del analisis."
          key={item.id}
          onPress={() => setSelectedItem(item)}
          style={({ pressed }) => [styles.row, pressed && styles.rowPressed]}
        >
          {item.image_url ? (
            <Image
              source={{ uri: item.image_url }}
              style={styles.thumb}
              accessibilityLabel="Miniatura de la hoja analizada."
            />
          ) : null}
          <View style={styles.rowText}>
            <View style={styles.statusLine}>
              {item.status === "pathology" ? (
                <AlertTriangle
                  size={18}
                  color={colors.danger}
                  accessibilityElementsHidden
                  importantForAccessibility="no"
                />
              ) : (
                <CheckCircle2
                  size={18}
                  color={colors.primary}
                  accessibilityElementsHidden
                  importantForAccessibility="no"
                />
              )}
              <Text style={[styles.status, item.status === "pathology" && styles.statusDanger]}>
                {item.status_display}
              </Text>
            </View>
            <Text style={styles.disease}>{item.disease_label}</Text>
            <Text style={styles.meta}>{Number(item.confidence).toFixed(2)}% confianza</Text>
            <Text style={styles.meta}>{new Date(item.created_at).toLocaleString()}</Text>
            <Text style={styles.openHint}>Ver detalle</Text>
          </View>
        </Pressable>
      ))}

      <Modal visible={Boolean(selectedItem)} transparent animationType="fade" onRequestClose={() => setSelectedItem(null)}>
        <View style={styles.modalBackdrop}>
          <View accessibilityViewIsModal style={styles.modalCard}>
            <View style={styles.modalHeader}>
              <Text accessibilityRole="header" style={styles.modalTitle}>Detalle del analisis</Text>
              <Pressable
                accessibilityRole="button"
                accessibilityLabel="Cerrar detalle del analisis"
                onPress={() => setSelectedItem(null)}
                style={styles.closeButton}
              >
                <X size={22} color={colors.text} accessibilityElementsHidden importantForAccessibility="no" />
              </Pressable>
            </View>

            {selectedItem ? (
              <ScrollView contentContainerStyle={styles.modalContent}>
                {selectedItem.image_url ? (
                  <Image
                    source={{ uri: selectedItem.image_url }}
                    style={styles.largeImage}
                    accessibilityLabel="Imagen ampliada de la hoja analizada."
                  />
                ) : null}

                <View style={styles.statusLine}>
                  {selectedItem.status === "pathology" ? (
                    <AlertTriangle
                      size={22}
                      color={colors.danger}
                      accessibilityElementsHidden
                      importantForAccessibility="no"
                    />
                  ) : (
                    <CheckCircle2
                      size={22}
                      color={colors.primary}
                      accessibilityElementsHidden
                      importantForAccessibility="no"
                    />
                  )}
                  <Text style={[styles.modalStatus, selectedItem.status === "pathology" && styles.statusDanger]}>
                    {selectedItem.status_display}
                  </Text>
                </View>

                <View style={styles.detailBlock}>
                  <Text style={styles.detailLabel}>Resultado</Text>
                  <Text style={styles.detailText}>{selectedItem.disease_label}</Text>
                </View>
                <View style={styles.detailBlock}>
                  <Text style={styles.detailLabel}>Confianza</Text>
                  <Text style={styles.detailText}>{Number(selectedItem.confidence).toFixed(2)}%</Text>
                </View>
                <View style={styles.detailBlock}>
                  <Text style={styles.detailLabel}>Fecha</Text>
                  <Text style={styles.detailText}>{new Date(selectedItem.created_at).toLocaleString()}</Text>
                </View>
                <View style={styles.detailBlock}>
                  <Text style={styles.detailLabel}>Observacion</Text>
                  <Text style={styles.detailText}>{selectedItem.notes}</Text>
                </View>
                <View style={styles.detailBlock}>
                  <Text style={styles.detailLabel}>Recomendacion</Text>
                  <Text style={styles.detailText}>{selectedItem.recommendation}</Text>
                </View>
              </ScrollView>
            ) : null}
          </View>
        </View>
      </Modal>

      <Modal visible={confirmClear} transparent animationType="fade" onRequestClose={() => setConfirmClear(false)}>
        <View style={styles.modalBackdrop}>
          <View accessibilityViewIsModal style={styles.confirmCard}>
            <Text accessibilityRole="header" style={styles.modalTitle}>Limpiar historial</Text>
            <Text style={styles.detailText}>
              Se eliminaran todos los analisis guardados. Esta accion no se puede deshacer.
            </Text>
            <View style={styles.confirmActions}>
              <PrimaryButton
                label="Cancelar"
                onPress={() => setConfirmClear(false)}
                disabled={clearing}
                variant="secondary"
                style={styles.confirmButton}
                accessibilityHint="Cierra la confirmacion sin eliminar registros."
              />
              <PrimaryButton
                label={clearing ? "Limpiando..." : "Limpiar"}
                icon={Trash2}
                onPress={clearHistory}
                disabled={clearing}
                style={styles.confirmButton}
                accessibilityLabel="Confirmar limpieza del historial"
                accessibilityHint="Elimina todos los analisis guardados."
              />
            </View>
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: {
    padding: 24,
    gap: 14,
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
  error: {
    color: colors.danger,
    fontWeight: "700"
  },
  empty: {
    color: colors.textMuted,
    fontWeight: "700"
  },
  row: {
    minHeight: 96,
    borderRadius: 8,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 10,
    flexDirection: "row",
    gap: 12,
    alignItems: "center"
  },
  rowPressed: {
    backgroundColor: colors.surfaceMuted
  },
  thumb: {
    width: 76,
    height: 76,
    borderRadius: 8,
    backgroundColor: colors.surfaceMuted
  },
  rowText: {
    flex: 1,
    gap: 4
  },
  statusLine: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6
  },
  status: {
    color: colors.primary,
    fontWeight: "800",
    fontSize: 16
  },
  statusDanger: {
    color: colors.danger
  },
  disease: {
    color: colors.text,
    fontSize: 14,
    fontWeight: "700"
  },
  meta: {
    color: colors.textMuted,
    fontSize: 13
  },
  openHint: {
    color: colors.primary,
    fontSize: 13,
    fontWeight: "800",
    marginTop: 2
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: "rgba(10, 18, 12, 0.45)",
    padding: 18,
    justifyContent: "center"
  },
  modalCard: {
    maxHeight: "88%",
    borderRadius: 8,
    backgroundColor: colors.surface,
    overflow: "hidden"
  },
  modalHeader: {
    minHeight: 58,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    paddingHorizontal: 18,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between"
  },
  modalTitle: {
    color: colors.text,
    fontSize: 18,
    fontWeight: "800"
  },
  closeButton: {
    width: 44,
    height: 44,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center"
  },
  modalContent: {
    padding: 18,
    gap: 14
  },
  largeImage: {
    width: "100%",
    height: 300,
    borderRadius: 8,
    backgroundColor: colors.surfaceMuted
  },
  modalStatus: {
    color: colors.primary,
    fontSize: 20,
    fontWeight: "800"
  },
  detailBlock: {
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: "#fbfffc",
    padding: 12,
    gap: 4
  },
  detailLabel: {
    color: colors.textMuted,
    fontSize: 13,
    fontWeight: "800"
  },
  detailText: {
    color: colors.text,
    fontSize: 15,
    lineHeight: 22
  },
  confirmCard: {
    borderRadius: 8,
    backgroundColor: colors.surface,
    padding: 18,
    gap: 14
  },
  confirmActions: {
    flexDirection: "row",
    gap: 10
  },
  confirmButton: {
    flex: 1
  }
});
