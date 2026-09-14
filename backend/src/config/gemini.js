import { GoogleGenAI, Type } from "@google/genai";

export { Type };

/**
 * Returns an initialized GoogleGenAI instance or null if GEMINI_API_KEY is not set.
 */
export function getGeminiClient() {
  const apiKey = process.env.GEMINI_API_KEY ? process.env.GEMINI_API_KEY.trim() : null;
  if (!apiKey) return null;
  return new GoogleGenAI({ apiKey });
}

/**
 * Returns the configured Gemini model name from GEMINI_MODEL env or defaults to gemini-2.5-flash.
 */
export function getGeminiModel() {
  return process.env.GEMINI_MODEL ? process.env.GEMINI_MODEL.trim() : "gemini-3.6-flash";
}
