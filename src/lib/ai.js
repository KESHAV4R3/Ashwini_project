const API_KEY = process.env.GEMINI_API_KEY;

/**
 * Extracts verifiable claims from raw PDF text using pure fetch.
 */
export async function extractClaims(text) {
  if (!API_KEY) throw new Error("GEMINI_API_KEY is not set in .env.local");

  const prompt = `
You are a claim extraction engine. Analyze the following document text and extract ALL specific, verifiable claims.
Focus on: statistics, percentages, financial figures, dates, market data, technical claims, and named entities with attributed facts.

Return ONLY a valid JSON array of strings. Each string is one distinct claim. No explanations. No markdown.
Example output: ["Claim 1 text", "Claim 2 text"]

Document text:
"""
${text.slice(0, 15000)}
"""
`;

  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-flash-latest:generateContent?key=${API_KEY}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
      }),
    }
  );

  if (!response.ok) {
    const errorText = await response.text();
    console.error("Gemini Direct API Error (Extract):", errorText);
    throw new Error(`Google API Error: ${response.status} ${response.statusText}`);
  }

  const data = await response.json();
  const resultText = data.candidates?.[0]?.content?.parts?.[0]?.text || "[]";
  const cleaned = resultText.replace(/```json|```/g, "").trim();

  try {
    return JSON.parse(cleaned);
  } catch {
    const match = cleaned.match(/\[[\s\S]*\]/);
    if (match) return JSON.parse(match[0]);
    return [];
  }
}

/**
 * Verifies a single claim against provided web search results using pure fetch.
 */
export async function verifyClaim(claim, searchResults) {
  if (!API_KEY) throw new Error("GEMINI_API_KEY is not set in .env.local");

  const prompt = `
You are a professional fact-checker. Evaluate the following claim against the provided web search evidence.

CLAIM: "${claim}"

WEB EVIDENCE:
${searchResults
  .map((r, i) => `[${i + 1}] ${r.title}\nURL: ${r.url}\nSnippet: ${r.content}`)
  .join("\n\n")}

Based on the evidence, classify this claim and provide:
1. status: "verified" | "inaccurate" | "false"
   - "verified" = claim matches evidence
   - "inaccurate" = claim is outdated or partially wrong
   - "false" = claim contradicts evidence or no evidence found
2. explanation: 1-2 sentence explanation of the verdict
3. correction: If inaccurate/false, state the correct fact. If verified, write "null"
4. source: The most relevant URL from evidence (or "null" if none)

Return ONLY valid JSON. No markdown.
Example: {"status":"verified","explanation":"...","correction":null,"source":"https://..."}
`;

  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-flash-latest:generateContent?key=${API_KEY}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
      }),
    }
  );

  if (!response.ok) {
    const errorText = await response.text();
    console.error("Gemini Direct API Error (Verify):", errorText);
    return {
      status: "false",
      explanation: "API Error during verification.",
      correction: null,
      source: null,
    };
  }

  const data = await response.json();
  const resultText = data.candidates?.[0]?.content?.parts?.[0]?.text || "{}";
  const cleaned = resultText.replace(/```json|```/g, "").trim();

  try {
    return JSON.parse(cleaned);
  } catch {
    const match = cleaned.match(/\{[\s\S]*\}/);
    if (match) return JSON.parse(match[0]);
    return {
      status: "false",
      explanation: "Unable to verify due to parsing error.",
      correction: null,
      source: null,
    };
  }
}
