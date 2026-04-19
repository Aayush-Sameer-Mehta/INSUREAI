import Claim from "../models/Claim.js";
import { GoogleGenAI, Type } from "@google/genai";

/**
 * AI Claim Analysis Engine
 * Produces comprehensive analysis with approval probability,
 * settlement recommendation, fraud detection, and actionable insights using Google Gemini.
 */
export async function analyzeClaimAI({
  claimAmount,
  incidentDate,
  description,
  policyId,
  policyCoverage,
  policyCategory,
  documents = [],
  userId,
}) {
  const amount = Number(claimAmount || 0);
  const coverage = Number(policyCoverage || 0);

  // ── 1. Gather Context ───────────────────────────────────
  let pastClaimCount = 0;
  if (userId) {
    try {
      pastClaimCount = await Claim.countDocuments({ user: userId });
    } catch {
      // non-blocking
    }
  }

  // ── 2. Call Gemini API ──────────────────────────────────
  if (process.env.GEMINI_API_KEY) {
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
      
      const systemInstruction = `You are the InsureAI Claims Analysis & Fraud Detection Engine.
You must analyze the provided insurance claim details and calculate an approval probability, a fraud risk score, and provide a settlement recommendation based on the coverage limit.
Be strict but fair. High claim amounts vs coverage, very old incident dates, missing documents, or vague descriptions should increase fraud risk and lower approval probability.
Return purely JSON matching the schema.`;

      const prompt = `Please analyze the following claim:
- Policy Category: ${policyCategory}
- Policy Coverage Limit: ₹${coverage.toLocaleString()}
- Claim Amount Requested: ₹${amount.toLocaleString()}
- Incident Date: ${incidentDate || "Not provided"}
- Description: "${description || ""}"
- Number of attached documents: ${documents.length}
- Document File Names: ${documents.length > 0 ? documents.map(d => typeof d === 'string' ? d : "AttachedFile").join(', ') : "None"}
- User's Past Claim Count: ${pastClaimCount}

Evaluate the fraud risk and approval probability. Name any specifically missing documents (e.g. "FIR copy", "Medical bills") based on the category.`;

      const response = await ai.models.generateContent({
          model: "gemini-2.5-flash",
          contents: prompt,
          config: {
              systemInstruction,
              temperature: 0.2, // Low temp for analytical consistency
              responseMimeType: "application/json",
              responseSchema: {
                  type: Type.OBJECT,
                  properties: {
                      approvalProbability: { type: Type.INTEGER, description: "0-100 probability of approval" },
                      suggestedAmount: { type: Type.INTEGER, description: "Suggested settlement amount (must not exceed coverage limit or claim amount)" },
                      fraudRiskScore: { type: Type.INTEGER, description: "0-100 score of fraud risk" },
                      fraudRiskLevel: { type: Type.STRING, description: "One of: 'Low', 'Medium', 'High'" },
                      flags: { type: Type.ARRAY, items: { type: Type.STRING }, description: "Array of red flags or concerns (e.g., 'Claim exceeds coverage', 'Vague description', 'High past claim count')" },
                      missingDocuments: { type: Type.ARRAY, items: { type: Type.STRING }, description: "Specific missing documents required for this claim category" },
                      reasoning: { type: Type.STRING, description: "A paragraph explaining the rationale behind the scores and suggestion" },
                      estimatedProcessingTime: { type: Type.STRING, description: "E.g., '3-5 Working days', '10-15 Working days (fraud review required)'" }
                  },
                  required: ["approvalProbability", "suggestedAmount", "fraudRiskScore", "fraudRiskLevel", "flags", "missingDocuments", "reasoning", "estimatedProcessingTime"]
              }
          }
      });

      if (response.text) {
          const result = JSON.parse(response.text);
          return {
              approvalProbability: result.approvalProbability,
              suggestedAmount: result.suggestedAmount,
              fraudRiskScore: result.fraudRiskScore,
              fraudRiskLevel: result.fraudRiskLevel,
              flags: result.flags || [],
              reasoning: result.reasoning,
              missingDocuments: result.missingDocuments || [],
              estimatedProcessingTime: result.estimatedProcessingTime,
              pastClaimCount,
          };
      }
    } catch (error) {
        console.error("Gemini Claim Analysis failed, falling back:", error.message);
    }
  }

  // ── 3. Fallback (if API fails or key is missing) ─────────
  return {
    approvalProbability: 50,
    suggestedAmount: Math.round(amount * 0.5),
    fraudRiskScore: 50,
    fraudRiskLevel: "Medium",
    flags: ["AI API Unavailable - Manual Review Required"],
    reasoning: "The Gemini AI engine is not configured or failed to respond. This claim requires manual review by an agent.",
    missingDocuments: ["Please verify all documents manually"],
    estimatedProcessingTime: "10-15 Working days",
    pastClaimCount,
  };
}
