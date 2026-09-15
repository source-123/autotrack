import { GoogleGenerativeAI } from "@google/generative-ai";

const API_KEY = process.env.EXPO_PUBLIC_GEMINI_API_KEY || "";

if (!API_KEY) {
  console.warn("⚠️ EXPO_PUBLIC_GEMINI_API_KEY non définie dans .env");
}

const genAI = new GoogleGenerativeAI(API_KEY);

/**
 * Envoie un message à Gemini avec un contexte système.
 * Retourne la réponse texte.
 */
export async function askGemini(
  systemPrompt: string,
  userMessage: string,
  options?: { temperature?: number; maxTokens?: number }
): Promise<string> {
  try {
    const model = genAI.getGenerativeModel({
      model: "gemini-3.6-flash",
      systemInstruction: systemPrompt,
      generationConfig: {
        temperature: options?.temperature ?? 0.7,
        maxOutputTokens: options?.maxTokens ?? 1024,
      },
    });

    const result = await model.generateContent(userMessage);
    const response = result.response;
    return response.text();
  } catch (e: any) {
    console.error("❌ Gemini error:", e);
    if (e?.message?.includes("PERMISSION_DENIED")) {
      throw new Error("API non activée. Vérifie ton projet Google Cloud.");
    }
    if (e?.message?.includes("quota")) {
      throw new Error("Quota dépassé. Réessaie dans une minute.");
    }
    throw new Error(e?.message || "Erreur inconnue de l'IA");
  }
}

/**
 * Envoie une conversation multi-tours.
 */
export async function chatWithGemini(
  systemPrompt: string,
  history: { role: "user" | "model"; text: string }[],
  newMessage: string
): Promise<string> {
  try {
    const model = genAI.getGenerativeModel({
      model: "gemini-3.6-flash",
      systemInstruction: systemPrompt,
      generationConfig: {
        temperature: 0.8,
        maxOutputTokens: 1024,
      },
    });

    const chat = model.startChat({
      history: history.map((h) => ({
        role: h.role,
        parts: [{ text: h.text }],
      })),
    });

    const result = await chat.sendMessage(newMessage);
    return result.response.text();
  } catch (e: any) {
    console.error("❌ Gemini chat error:", e);
    if (e?.message?.includes("PERMISSION_DENIED")) {
      throw new Error("API non activée.");
    }
    if (e?.message?.includes("quota")) {
      throw new Error("Quota dépassé. Réessaie dans une minute.");
    }
    throw new Error(e?.message || "Erreur de l'IA");
  }
}
