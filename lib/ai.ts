import { GoogleGenerativeAI } from "@google/generative-ai";

const API_KEY = process.env.EXPO_PUBLIC_GEMINI_API_KEY || "";

if (!API_KEY) {
  console.warn("⚠️ EXPO_PUBLIC_GEMINI_API_KEY non définie dans .env");
}

const genAI = new GoogleGenerativeAI(API_KEY);

/**
 * Liste de modèles par ordre de préférence.
 * Si l'un tombe (503 surcharge, 404 déprécié, etc.), on essaie le suivant.
 */
const MODELS = [
  "gemini-3-flash-preview",        // ✅ Testé et fonctionne parfaitement
  "gemini-3.1-flash-lite",         // Fallback v3.1 lite
  "gemini-3.1-flash-lite-preview", // Fallback v3.1 lite preview
  "gemini-flash-lite-latest",      // Alias lite
  "gemini-flash-latest",           // Alias général
  "gemini-3.1-pro-preview",        // Pro en dernier recours
];

/**
 * Extrait le texte d'une réponse Gemini en gérant les réponses multi-parts.
 */
function extractText(response: any): string {
  try {
    const candidates = response?.candidates || [];
    if (candidates.length === 0) return "";
    const parts = candidates[0]?.content?.parts || [];
    // Récupérer tout le texte (parfois le modèle split en plusieurs parts)
    return parts
      .map((p: any) => p?.text || "")
      .join("")
      .trim();
  } catch {
    return "";
  }
}

/**
 * Essaie un modèle avec retry automatique.
 */
async function tryModel(
  modelName: string,
  systemPrompt: string,
  userMessage: string,
  options?: { temperature?: number; maxTokens?: number },
  history?: { role: "user" | "model"; text: string }[]
): Promise<string> {
  const model = genAI.getGenerativeModel({
    model: modelName,
    systemInstruction: systemPrompt,
    generationConfig: {
      temperature: options?.temperature ?? 0.7,
      maxOutputTokens: options?.maxTokens ?? 1024,
    },
  });

  if (history && history.length > 0) {
    const chat = model.startChat({
      history: history.map((h) => ({
        role: h.role,
        parts: [{ text: h.text }],
      })),
    });
    const result = await chat.sendMessage(userMessage);
    return extractText(result.response);
  } else {
    const result = await model.generateContent(userMessage);
    return extractText(result.response);
  }
}

/**
 * Retry une fonction async avec backoff exponentiel.
 */
async function retry<T>(
  fn: () => Promise<T>,
  attempts: number = 2,
  delayMs: number = 1000
): Promise<T> {
  let lastError: any;
  for (let i = 0; i < attempts; i++) {
    try {
      return await fn();
    } catch (e: any) {
      lastError = e;
      const isRetryable =
        e?.message?.includes("503") ||
        e?.message?.includes("Service Unavailable") ||
        e?.message?.includes("high demand") ||
        e?.message?.includes("429") ||
        e?.message?.includes("UNAVAILABLE");

      if (!isRetryable || i === attempts - 1) {
        throw e;
      }
      // Attendre avant de réessayer
      await new Promise((r) => setTimeout(r, delayMs * (i + 1)));
    }
  }
  throw lastError;
}

/**
 * Envoie un message à Gemini avec fallback automatique sur plusieurs modèles.
 */
export async function askGemini(
  systemPrompt: string,
  userMessage: string,
  options?: { temperature?: number; maxTokens?: number }
): Promise<string> {
  let lastError: any = null;

  for (const modelName of MODELS) {
    try {
      console.log(`🤖 Essai modèle: ${modelName}`);
      const text = await retry(
        () => tryModel(modelName, systemPrompt, userMessage, options),
        2,
        800
      );

      if (text) {
        console.log(`✅ Réponse via ${modelName}`);
        return text;
      }
      console.warn(`⚠️ Réponse vide de ${modelName}, essai suivant`);
    } catch (e: any) {
      console.warn(`❌ Échec ${modelName}:`, e?.message);
      lastError = e;
      // Continue avec le modèle suivant
    }
  }

  // Tous les modèles ont échoué
  const msg = lastError?.message || "Erreur inconnue";
  if (msg.includes("503") || msg.includes("high demand")) {
    throw new Error("Tous les serveurs IA sont surchargés. Réessaie dans 30 secondes.");
  }
  if (msg.includes("PERMISSION_DENIED") || msg.includes("403")) {
    throw new Error("API non activée. Vérifie ton projet Google Cloud.");
  }
  if (msg.includes("429") || msg.includes("quota")) {
    throw new Error("Quota dépassé. Réessaie dans une minute.");
  }
  throw new Error("L'IA est temporairement indisponible. Réessaie dans un instant.");
}

/**
 * Chat multi-tours avec fallback.
 */
export async function chatWithGemini(
  systemPrompt: string,
  history: { role: "user" | "model"; text: string }[],
  newMessage: string
): Promise<string> {
  let lastError: any = null;

  for (const modelName of MODELS) {
    try {
      console.log(`🤖 Chat avec: ${modelName}`);
      const text = await retry(
        () => tryModel(modelName, systemPrompt, newMessage, { temperature: 0.8, maxTokens: 1024 }, history),
        2,
        800
      );

      if (text) {
        console.log(`✅ Réponse via ${modelName}`);
        return text;
      }
    } catch (e: any) {
      console.warn(`❌ Échec ${modelName}:`, e?.message);
      lastError = e;
    }
  }

  const msg = lastError?.message || "Erreur inconnue";
  if (msg.includes("503") || msg.includes("high demand")) {
    throw new Error("Tous les serveurs IA sont surchargés. Réessaie dans 30 secondes.");
  }
  if (msg.includes("PERMISSION_DENIED") || msg.includes("403")) {
    throw new Error("API non activée.");
  }
  if (msg.includes("429") || msg.includes("quota")) {
    throw new Error("Quota dépassé. Réessaie dans une minute.");
  }
  throw new Error("L'IA est temporairement indisponible. Réessaie.");
}
