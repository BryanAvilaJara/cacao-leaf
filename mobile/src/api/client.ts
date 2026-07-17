import { Platform } from "react-native";

export type AnalysisResult = {
  id: number;
  image_url: string | null;
  status: "healthy" | "pathology";
  status_display: string;
  confidence: string;
  disease_label: string;
  recommendation: string;
  notes: string;
  created_at: string;
};

const PRODUCTION_API_URL = "https://cacao-leaf-api.onrender.com";

const localHost = Platform.select({
  android: "http://10.0.2.2:8000",
  default: "http://127.0.0.1:8000"
});

const configuredBaseUrl = (globalThis as { process?: { env?: Record<string, string | undefined> } }).process
  ?.env?.EXPO_PUBLIC_API_URL;

function getDefaultBaseUrl() {
  if (Platform.OS !== "web") {
    return localHost || "http://127.0.0.1:8000";
  }

  const location = (globalThis as { location?: Location }).location;
  const host = location?.hostname || "";
  const isLocalWeb = host === "localhost" || host === "127.0.0.1" || host === "";

  return isLocalWeb ? "http://127.0.0.1:8000" : PRODUCTION_API_URL;
}

export const API_BASE_URL = configuredBaseUrl || getDefaultBaseUrl();

async function getErrorMessage(response: Response, fallback: string): Promise<string> {
  try {
    const payload = await response.json();
    const imageError = Array.isArray(payload?.image) ? payload.image[0] : payload?.image;
    const detail = payload?.detail || imageError || payload?.non_field_errors?.[0];
    return typeof detail === "string" ? detail : fallback;
  } catch {
    return fallback;
  }
}

function appendImage(formData: FormData, imageUri: string, filename: string): Promise<void> | void {
  if (Platform.OS === "web") {
    return fetch(imageUri).then(async (imageResponse) => {
      const imageBlob = await imageResponse.blob();
      formData.append("image", imageBlob, filename);
    });
  }

  formData.append("image", {
    uri: imageUri,
    name: filename,
    type: "image/jpeg"
  } as unknown as Blob);
}

export async function createAnalysis(imageUri: string): Promise<AnalysisResult> {
  const formData = new FormData();
  await appendImage(formData, imageUri, "cacao-leaf.jpg");

  const response = await fetch(`${API_BASE_URL}/api/analyses/`, {
    method: "POST",
    body: formData,
    headers: {
      Accept: "application/json"
    }
  });

  if (!response.ok) {
    throw new Error(await getErrorMessage(response, "No se pudo procesar la imagen."));
  }

  return response.json();
}

export async function listAnalyses(): Promise<AnalysisResult[]> {
  const response = await fetch(`${API_BASE_URL}/api/analyses/`);

  if (!response.ok) {
    throw new Error("No se pudo cargar el historial.");
  }

  return response.json();
}

export async function clearAnalyses(): Promise<void> {
  const response = await fetch(`${API_BASE_URL}/api/analyses/clear/`, {
    method: "DELETE"
  });

  if (!response.ok) {
    throw new Error("No se pudo limpiar el historial.");
  }
}

export type AnalysisFeedbackReason = "not_leaf" | "wrong_result" | "poor_image" | "other";
export type RejectedFeedbackReason = "was_leaf" | "related_vegetation" | "poor_image" | "other";

export async function submitFeedback(analysisId: number, reason: AnalysisFeedbackReason, comment: string): Promise<void> {
  const response = await fetch(`${API_BASE_URL}/api/analyses/${analysisId}/feedback/`, {
    method: "POST",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json"
    },
    body: JSON.stringify({ reason, comment })
  });

  if (!response.ok) {
    throw new Error("No se pudo enviar el reporte.");
  }
}

export async function submitRejectedFeedback(
  imageUri: string,
  reason: RejectedFeedbackReason,
  comment: string,
  errorMessage: string
): Promise<void> {
  const formData = new FormData();
  await appendImage(formData, imageUri, "rejected-cacao-leaf.jpg");
  formData.append("reason", reason);
  formData.append("comment", comment);
  formData.append("error_message", errorMessage);

  const response = await fetch(`${API_BASE_URL}/api/rejected-feedback/`, {
    method: "POST",
    body: formData,
    headers: {
      Accept: "application/json"
    }
  });

  if (!response.ok) {
    throw new Error("No se pudo enviar el reporte.");
  }
}
