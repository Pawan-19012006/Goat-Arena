import { NextResponse } from "next/server";
import { defaultModelProvider, DebateMessage } from "@/lib/qvac";

interface ScoreResult {
  evidence: number;
  logic: number;
  relevance: number;
  persuasion: number;
}

/**
 * Extracts the first valid JSON object from a string that may contain extra text.
 */
function extractJson(raw: string): string {
  const start = raw.indexOf("{");
  const end = raw.lastIndexOf("}");
  if (start === -1 || end === -1 || end <= start) return raw.trim();
  return raw.slice(start, end + 1).trim();
}

/**
 * Clamps a number between min and max.
 */
function clamp(val: unknown, min = 0, max = 10): number {
  const n = typeof val === "number" ? val : parseFloat(String(val));
  if (isNaN(n)) return Math.floor((min + max) / 2);
  return Math.max(min, Math.min(max, Math.round(n)));
}

export async function POST(request: Request) {
  try {
    const body = await request.json() as {
      action: "score" | "explain";
      sideA: string;
      sideB: string;
      sideAStatement?: string;
      sideBStatement?: string;
      winner?: string;
      sideAScores?: ScoreResult;
      sideBScores?: ScoreResult;
      history?: DebateMessage[];
    };

    const { action, sideA, sideB } = body;
    if (!action || !sideA || !sideB) {
      return NextResponse.json({ error: "Missing: action, sideA, or sideB" }, { status: 400 });
    }

    // ─── SCORE ACTION ─────────────────────────────────────────────────────────
    if (action === "score") {
      const { sideAStatement, sideBStatement } = body;
      if (!sideAStatement || !sideBStatement) {
        return NextResponse.json({ error: "Missing statements for scoring" }, { status: 400 });
      }

      const prompt = `You are a neutral football debate referee. Score this exchange between ${sideA} and ${sideB}.

${sideA} said: "${sideAStatement.slice(0, 120)}"
${sideB} said: "${sideBStatement.slice(0, 120)}"

Score each side on 4 criteria (0-10 integers only):
- evidence: quality and accuracy of facts used
- logic: how well-reasoned and structured the argument is
- relevance: how directly it addresses the debate topic
- persuasion: how convincing and confident the delivery is

Output ONLY this JSON, nothing else:
{"sideA":{"evidence":7,"logic":7,"relevance":7,"persuasion":7},"sideB":{"evidence":7,"logic":7,"relevance":7,"persuasion":7}}`;

      console.log("[Referee] Scoring exchange. Prompt length:", prompt.length);

      const rawResult = await defaultModelProvider.generateText(prompt, []);
      const cleanText = extractJson(rawResult);

      let parsedResult: { sideA: ScoreResult; sideB: ScoreResult };
      try {
        const p = JSON.parse(cleanText);
        // Validate and clamp each field
        parsedResult = {
          sideA: {
            evidence: clamp(p?.sideA?.evidence),
            logic: clamp(p?.sideA?.logic),
            relevance: clamp(p?.sideA?.relevance),
            persuasion: clamp(p?.sideA?.persuasion)
          },
          sideB: {
            evidence: clamp(p?.sideB?.evidence),
            logic: clamp(p?.sideB?.logic),
            relevance: clamp(p?.sideB?.relevance),
            persuasion: clamp(p?.sideB?.persuasion)
          }
        };
      } catch (e) {
        console.warn("[Referee] Score parse failed, using balanced fallback:", e);
        parsedResult = {
          sideA: { evidence: 7, logic: 7, relevance: 7, persuasion: 7 },
          sideB: { evidence: 7, logic: 7, relevance: 7, persuasion: 7 }
        };
      }

      return NextResponse.json(parsedResult, {
        headers: { "x-prompt-length": prompt.length.toString() }
      });
    }

    // ─── EXPLAIN ACTION ────────────────────────────────────────────────────────
    if (action === "explain") {
      const { winner, sideAScores, sideBScores, history } = body;
      if (!winner || !sideAScores || !sideBScores || !history) {
        return NextResponse.json({ error: "Missing explain parameters" }, { status: 400 });
      }

      // Compact transcript — only take last 8 messages max and trim each
      const transcript = history.slice(-8).map((msg, i) => {
        const speaker = msg.role === "user" ? `${sideA}` : `${sideB}`;
        const content = msg.content.length > 100 ? msg.content.slice(0, 100) + "..." : msg.content;
        return `[${i + 1}] ${speaker}: "${content}"`;
      }).join("\n");

      const totalA = sideAScores.evidence + sideAScores.logic + sideAScores.relevance + sideAScores.persuasion;
      const totalB = sideBScores.evidence + sideBScores.logic + sideBScores.relevance + sideBScores.persuasion;

      const prompt = `You are a professional football debate analyst. ${winner} won this debate mathematically (${totalA} vs ${totalB} points).

Transcript:
${transcript}

${sideA} scores — Evidence:${sideAScores.evidence} Logic:${sideAScores.logic} Relevance:${sideAScores.relevance} Persuasion:${sideAScores.persuasion}
${sideB} scores — Evidence:${sideBScores.evidence} Logic:${sideBScores.logic} Relevance:${sideBScores.relevance} Persuasion:${sideBScores.persuasion}

Write a concise post-match analysis. The winner is ${winner} — do NOT change this.

Output ONLY this JSON (no markdown, no backticks):
{"turningPoint":"One sentence about the decisive moment in the debate.","bestUserArg":{"quote":"Quote the user's best statement (under 60 chars)","category":"Evidence","impact":"+8 Evidence, +7 Persuasion"},"bestOpponentArg":{"quote":"Quote the opponent's best statement (under 60 chars)","category":"Logic","impact":"+7 Logic, +6 Persuasion"},"weakestUserArg":{"quote":"Quote user's weakest statement (under 60 chars)","reason":"One sentence on why it was weak."},"weakestOpponentArg":{"quote":"Quote opponent's weakest statement (under 60 chars)","reason":"One sentence on why it was weak."},"categoryBreakdown":{"evidence":"One sentence on evidence quality.","logic":"One sentence on logic quality.","relevance":"One sentence on relevance.","persuasion":"One sentence on persuasion."}}`;

      console.log("[Referee] Generating explanation. Prompt length:", prompt.length);

      const rawResult = await defaultModelProvider.generateText(prompt, []);
      const cleanText = extractJson(rawResult);

      // Build a safe default from available transcript data
      const userStatements = history.filter(h => h.role === "user");
      const assistantStatements = history.filter(h => h.role === "assistant");
      const bestUserQuote = userStatements[Math.floor(userStatements.length * 0.6)]?.content?.slice(0, 80) || userStatements[0]?.content?.slice(0, 80) || "Opening argument.";
      const bestOppQuote = assistantStatements[Math.floor(assistantStatements.length * 0.6)]?.content?.slice(0, 80) || assistantStatements[0]?.content?.slice(0, 80) || "Opening counterpoint.";
      const weakUserQuote = userStatements[0]?.content?.slice(0, 80) || "Initial statement.";
      const weakOppQuote = assistantStatements[0]?.content?.slice(0, 80) || "Opening rebuttal.";

      const safeDefault = {
        turningPoint: `${winner} seized the momentum by consistently backing claims with concrete statistics while the opponent struggled to match that precision.`,
        bestUserArg: {
          quote: bestUserQuote,
          category: "Evidence",
          impact: "+8 Evidence, +7 Persuasion"
        },
        bestOpponentArg: {
          quote: bestOppQuote,
          category: "Logic",
          impact: "+7 Logic, +6 Persuasion"
        },
        weakestUserArg: {
          quote: weakUserQuote,
          reason: "The opening lacked specific statistics or direct comparisons."
        },
        weakestOpponentArg: {
          quote: weakOppQuote,
          reason: "Failed to address the user's point directly, defaulting to generic claims."
        },
        categoryBreakdown: {
          evidence: `${sideA} presented more verifiable facts and specific trophy/record data.`,
          logic: `Both sides built logically consistent arguments, though ${sideA} was more structured.`,
          relevance: `${sideA} stayed more focused on the direct debate topic throughout.`,
          persuasion: `${winner} delivered arguments with greater confidence and precision.`
        }
      };

      let parsedResult;
      try {
        const p = JSON.parse(cleanText);
        // Merge: use AI output per key, fall back per key if invalid
        parsedResult = {
          turningPoint: (typeof p.turningPoint === "string" && p.turningPoint.length > 5) ? p.turningPoint : safeDefault.turningPoint,
          bestUserArg: (p.bestUserArg?.quote) ? p.bestUserArg : safeDefault.bestUserArg,
          bestOpponentArg: (p.bestOpponentArg?.quote) ? p.bestOpponentArg : safeDefault.bestOpponentArg,
          weakestUserArg: (p.weakestUserArg?.quote) ? p.weakestUserArg : safeDefault.weakestUserArg,
          weakestOpponentArg: (p.weakestOpponentArg?.quote) ? p.weakestOpponentArg : safeDefault.weakestOpponentArg,
          categoryBreakdown: {
            evidence: (p.categoryBreakdown?.evidence && p.categoryBreakdown.evidence.length > 5) ? p.categoryBreakdown.evidence : safeDefault.categoryBreakdown.evidence,
            logic: (p.categoryBreakdown?.logic && p.categoryBreakdown.logic.length > 5) ? p.categoryBreakdown.logic : safeDefault.categoryBreakdown.logic,
            relevance: (p.categoryBreakdown?.relevance && p.categoryBreakdown.relevance.length > 5) ? p.categoryBreakdown.relevance : safeDefault.categoryBreakdown.relevance,
            persuasion: (p.categoryBreakdown?.persuasion && p.categoryBreakdown.persuasion.length > 5) ? p.categoryBreakdown.persuasion : safeDefault.categoryBreakdown.persuasion,
          }
        };
      } catch (e) {
        console.warn("[Referee] Explanation parse failed, using full safe default:", e);
        parsedResult = safeDefault;
      }

      return NextResponse.json(parsedResult, {
        headers: { "x-prompt-length": prompt.length.toString() }
      });
    }

    return NextResponse.json({ error: "Invalid action" }, { status: 400 });

  } catch (error: unknown) {
    const errorMsg = error instanceof Error ? error.message : String(error);
    console.error("[API/Agent/Referee] Error:", errorMsg);
    return NextResponse.json({ error: errorMsg }, { status: 500 });
  }
}
