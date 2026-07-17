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

const localHost = Platform.select({
  android: "http://10.0.2.2:8000",
  default: "http://127.0.0.1:8000"
});

const configuredBaseUrl = (globalThis as { process?: { env?: Record<string, string | undefined> } }).process
  ?.env?.EXPO_PUBLIC_API_URL;

export const API_BASE_URL = configuredBaseUrl || localHost || "http://127.0.0.1:8000";

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

export async function createAnalysis(imageUri: string): Promise<AnalysisResult> {
  const formData = new FormData();

  if (Platform.OS === "web") {
    const imageResponse = await fetch(imageUri);
    const imageBlob = await imageResponse.blob();
    formData.append("image", imageBlob, "cacao-leaf.jpg");
  } else {
    formData.append("image", {
      uri: imageUri,
      name: "cacao-leaf.jpg",
      type: "image/jpeg"
    } as unknown as Blob);
  }

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
