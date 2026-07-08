import { NextResponse } from "next/server";
import { defaultModelProvider, DebateMessage } from "@/lib/qvac";

interface ScoreResult {
  evidence: number;
  logic: number;
  relevance: number;
  persuasion: number;
}

export async function POST(request: Request) {
  try {
    const body = await request.json() as {
      action: "score" | "explain";
      sideA: string;
      sideB: string;
      // score parameters:
      sideAStatement?: string;
      sideBStatement?: string;
      // explain parameters:
      winner?: string;
      sideAScores?: ScoreResult;
      sideBScores?: ScoreResult;
      history?: DebateMessage[];
    };

    const { action, sideA, sideB } = body;
    if (!action || !sideA || !sideB) {
      return NextResponse.json({ error: "Missing required properties: action, sideA, or sideB" }, { status: 400 });
    }

    if (action === "score") {
      const { sideAStatement, sideBStatement } = body;
      if (!sideAStatement || !sideBStatement) {
        return NextResponse.json({ error: "Missing statements for scoring exchange" }, { status: 400 });
      }

      // 1. Compose the specialised QVAC scoring prompt
      const prompt = `You are a neutral debate referee. Score the following exchange between Side A (${sideA}) and Side B (${sideB}).
Do NOT refer to or infer any other player names (e.g. Messi or Ronaldo) unless they are Side A/B names.

Exchange:
Side A: "${sideAStatement}"
Side B: "${sideBStatement}"

Evaluate both statements independently on:
- Evidence (0-10)
- Logic (0-10)
- Relevance (0-10)
- Persuasiveness (0-10)

Respond ONLY with a flat JSON object in this exact schema, do not include any other text:
{
  "sideA": { "evidence": 8, "logic": 7, "relevance": 9, "persuasion": 8 },
  "sideB": { "evidence": 7, "logic": 8, "relevance": 8, "persuasion": 7 }
}`;

      console.log("[API/Agent/Referee] Scoring exchange. Prompt Length:", prompt.length);

      const rawResult = await defaultModelProvider.generateText(prompt, []);
      let cleanText = rawResult.trim();
      if (cleanText.startsWith("```")) {
        cleanText = cleanText.replace(/^```(json)?/, "").replace(/```$/, "").trim();
      }

      let parsedResult;
      try {
        parsedResult = JSON.parse(cleanText);
        if (!parsedResult.sideA || !parsedResult.sideB) {
          throw new Error("Missing sideA or sideB scores in parsed result");
        }
      } catch (e) {
        console.warn("[API/Agent/Referee] Score parsing failed, using fallbacks:", e);
        parsedResult = {
          sideA: { evidence: 8, logic: 7, relevance: 8, persuasion: 7 },
          sideB: { evidence: 7, logic: 8, relevance: 7, persuasion: 8 }
        };
      }

      return NextResponse.json(parsedResult, {
        headers: { "x-prompt-length": prompt.length.toString() }
      });
    }

    if (action === "explain") {
      const { winner, sideAScores, sideBScores, history } = body;
      if (!winner || !sideAScores || !sideBScores || !history) {
        return NextResponse.json({ error: "Missing parameters for explanation generation" }, { status: 400 });
      }

      // Compact transcript to keep prompt small
      const transcript = history.map((msg, index) => {
        const speaker = msg.role === "user" ? `Side A (${sideA})` : `Side B (${sideB})`;
        const shortContent = msg.content.length > 60 ? msg.content.slice(0, 60) + "..." : msg.content;
        return `[Statement ${index + 1}] ${speaker}: "${shortContent}"`;
      }).join("\n\n");

      // Compose the neutral verdict explanation prompt
      const prompt = `You are a debate referee. Explain the outcome of the football clash between Side A (${sideA}) and Side B (${sideB}).
Mathematically calculated Winner: ${winner}
Side A (${sideA}) scores: Evidence=${sideAScores.evidence}, Logic=${sideAScores.logic}, Relevance=${sideAScores.relevance}, Persuasion=${sideAScores.persuasion}
Side B (${sideB}) scores: Evidence=${sideBScores.evidence}, Logic=${sideBScores.logic}, Relevance=${sideBScores.relevance}, Persuasion=${sideBScores.persuasion}

Debate Transcript:
${transcript}

Write a brief, professional evaluation explaining the outcome. Do NOT choose or declare a different winner.
Address:
1. Strongest argument of both sides.
2. Weakest argument of both sides.
3. The turning point of the clash.
4. Why the winner (${winner}) scored higher.

Limit the response to under 120 words. Respond ONLY with a JSON object in this exact schema:
{
  "verdict": "Explanation text..."
}`;

      console.log("[API/Agent/Referee] Generating explanation. Prompt Length:", prompt.length);

      const rawResult = await defaultModelProvider.generateText(prompt, []);
      let cleanText = rawResult.trim();
      if (cleanText.startsWith("```")) {
        cleanText = cleanText.replace(/^```(json)?/, "").replace(/```$/, "").trim();
      }

      let parsedResult;
      try {
        parsedResult = JSON.parse(cleanText);
        if (!parsedResult.verdict) {
          throw new Error("Missing verdict field in parsed result");
        }
      } catch (e) {
        console.warn("[API/Agent/Referee] Explanation parsing failed, using fallback:", e);
        parsedResult = {
          verdict: `The clash between Side A (${sideA}) and Side B (${sideB}) ended in a mathematical win for ${winner}. ${winner} displayed stronger consistency and argument relevancy across the three rounds.`
        };
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
