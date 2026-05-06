import { NextResponse } from "next/server";
import { extractTextFromPDF } from "@/lib/pdf";
import { extractClaims, verifyClaim } from "@/lib/ai";
import { searchWeb } from "@/lib/search";

export const maxDuration = 60; // Vercel function timeout

export async function POST(request) {
  try {
    const formData = await request.formData();
    const file = formData.get("pdf");

    if (!file) {
      return NextResponse.json({ error: "No PDF file provided" }, { status: 400 });
    }

    if (file.type !== "application/pdf") {
      return NextResponse.json({ error: "File must be a PDF" }, { status: 400 });
    }

    if (file.size > 10 * 1024 * 1024) {
      return NextResponse.json({ error: "File too large. Max size is 10MB." }, { status: 400 });
    }

    // Step 1: Extract text from PDF
    let text;
    try {
      const arrayBuffer = await file.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);
      text = await extractTextFromPDF(buffer);
    } catch (extractError) {
      return NextResponse.json(
        { error: extractError.message },
        { status: 422 }
      );
    }

    if (!text || text.trim().length < 50) {
      return NextResponse.json(
        { error: "Could not extract readable text from this PDF." },
        { status: 422 }
      );
    }

    // Step 2: Extract verifiable claims using AI
    const claims = await extractClaims(text);

    if (!claims || claims.length === 0) {
      return NextResponse.json(
        { error: "No verifiable claims found in the document." },
        { status: 422 }
      );
    }

    // Step 3: Verify each claim against live web (cap at 15 claims for cost/time)
    const claimsToCheck = claims.slice(0, 15);
    const results = [];

    for (const claim of claimsToCheck) {
      try {
        // Search the web for evidence
        const searchResults = await searchWeb(claim);

        // Verify claim against search results
        const verdict = await verifyClaim(claim, searchResults);

        results.push({
          claim,
          status: verdict.status,
          explanation: verdict.explanation,
          correction: verdict.correction,
          source: verdict.source,
        });
      } catch (claimError) {
        console.error(`Error verifying claim: ${claim}`, claimError);
        results.push({
          claim,
          status: "false",
          explanation: "Could not verify this claim due to a search error.",
          correction: null,
          source: null,
        });
      }
    }

    // Step 4: Compute summary stats
    const summary = {
      total: results.length,
      verified: results.filter((r) => r.status === "verified").length,
      inaccurate: results.filter((r) => r.status === "inaccurate").length,
      false: results.filter((r) => r.status === "false").length,
    };

    return NextResponse.json({ results, summary }, { status: 200 });
  } catch (error) {
    console.error("Fact-check API error:", error);
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}
