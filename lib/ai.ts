import { GoogleGenerativeAI } from "@google/generative-ai";

const API_KEY = process.env.EXPO_PUBLIC_GEMINI_API_KEY || "";

if (!API_KEY) {
  console.warn("⚠️ EXPO_PUBLIC_GEMINI_API_KEY non définie dans .env");
}

const genAI = new GoogleGenerativeAI(API_KEY);

/**
 * Modèles par ordre de préférence (testés et fonctionnels).
 * Le 1er qui répond prend la main.
 */
const MODELS = [
  "gemini-3-flash-preview",        // ✅ Testé - fonctionne bien
  "gemini-3.1-flash-lite",         // Fallback v3.1
  "gemini-flash-lite-latest",      // Alias lite
  "gemini-flash-latest",           // Alias général
  "gemini-3.1-pro-preview",        // Pro en dernier recours
];

/** Extrait le texte de la réponse Gemini (gère multi-parts) */
function extractText(response: any): string {
  try {
    const candidates = response?.candidates || [];
    if (candidates.length === 0) return "";
    const parts = candidates[0]?.content?.parts || [];
    return parts
      .map((p: any) => p?.text || "")
      .join("")
      .trim();
  } catch {
    return "";
  }
}

/** Essaie un seul modèle, une seule fois. */
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

/** Vérifie si l'erreur indique un rate limit. */
function isRateLimit(e: any): boolean {
  const m = e?.message || "";
  return (
    m.includes("429") ||
    m.includes("Too Many Requests") ||
    m.includes("rate limit") ||
    m.includes("quota")
  );
}

/** Vérifie si l'erreur indique un modèle indisponible. */
function isModelUnavailable(e: any): boolean {
  const m = e?.message || "";
  return (
    m.includes("404") ||
    m.includes("NOT_FOUND") ||
    m.includes("no longer available") ||
    m.includes("503") ||
    m.includes("high demand") ||
    m.includes("UNAVAILABLE")
  );
}

/**
 * Envoie un message à Gemini avec fallback automatique.
 * Un seul essai par modèle pour économiser le quota.
 */
export async function askGemini(
  systemPrompt: string,
  userMessage: string,
  options?: { temperature?: number; maxTokens?: number }
): Promise<string> {
  let lastError: any = null;

  for (const modelName of MODELS) {
    try {
      console.log(`🤖 Essai: ${modelName}`);
      const text = await tryModel(modelName, systemPrompt, userMessage, options);
      if (text) {
        console.log(`✅ Succès via ${modelName}`);
        return text;
      }
    } catch (e: any) {
      console.warn(`❌ ${modelName}:`, (e?.message || "").slice(0, 100));
      lastError = e;

      // Si c'est un rate limit, NE PAS essayer d'autres modèles (ça aggraverait)
      if (isRateLimit(e)) {
        throw new Error("Trop de requêtes. Attends 60 secondes puis réessaie.");
      }
      // Sinon on essaie le modèle suivant
    }
  }

  // Tous les modèles ont échoué
  const msg = lastError?.message || "Erreur inconnue";
  console.error("Tous les modèles ont échoué:", msg.slice(0, 200));

  if (msg.includes("PERMISSION_DENIED") && msg.includes("has not been used")) {
    throw new Error("L'API Gemini n'est pas activée sur le projet Google Cloud.");
  }
  if (msg.includes("API_KEY_INVALID") || msg.includes("API key not valid")) {
    throw new Error("Clé API invalide. Vérifie ton fichier .env");
  }
  throw new Error("L'IA est temporairement indisponible. Réessaie dans 30 secondes.");
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
      console.log(`💬 Chat via: ${modelName}`);
      const text = await tryModel(
        modelName,
        systemPrompt,
        newMessage,
        { temperature: 0.8, maxTokens: 1024 },
        history
      );
      if (text) {
        console.log(`✅ Succès via ${modelName}`);
        return text;
      }
    } catch (e: any) {
      console.warn(`❌ ${modelName}:`, (e?.message || "").slice(0, 100));
      lastError = e;

      if (isRateLimit(e)) {
        throw new Error("Trop de requêtes. Attends 60 secondes puis réessaie.");
      }
    }
  }

  const msg = lastError?.message || "Erreur inconnue";
  console.error("Tous les modèles ont échoué:", msg.slice(0, 200));

  if (msg.includes("API_KEY_INVALID") || msg.includes("API key not valid")) {
    throw new Error("Clé API invalide.");
  }
  throw new Error("L'IA est temporairement indisponible. Réessaie dans 30 secondes.");
}
