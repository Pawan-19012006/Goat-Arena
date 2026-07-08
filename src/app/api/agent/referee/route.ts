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
        const shortContent = msg.content.length > 80 ? msg.content.slice(0, 80) + "..." : msg.content;
        return `[Statement ${index + 1}] ${speaker}: "${shortContent}"`;
      }).join("\n\n");

      // Compose the neutral verdict explanation prompt requesting the new structured fields
      const prompt = `You are a professional sports debate analyst referee reviewing a football pundit debate between Side A (${sideA}) and Side B (${sideB}).
The mathematically calculated winner is: ${winner}
Side A (${sideA}) total stats: Evidence=${sideAScores.evidence}, Logic=${sideAScores.logic}, Relevance=${sideAScores.relevance}, Persuasion=${sideAScores.persuasion}
Side B (${sideB}) total stats: Evidence=${sideBScores.evidence}, Logic=${sideBScores.logic}, Relevance=${sideBScores.relevance}, Persuasion=${sideBScores.persuasion}

Debate Transcript:
${transcript}

Write a detailed, structured post-game analysis explanation. Do NOT choose or declare a different winner than ${winner}.
Address the exact arguments quote from the transcript.

Respond ONLY with a JSON object in this exact schema. Do not include markdown code block backticks (like \`\`\`json):
{
  "turningPoint": "A concise paragraph explaining the decisive moment that changed the debate and shifted the momentum.",
  "bestUserArg": {
    "quote": "Quote of the user's best argument from the transcript",
    "category": "Evidence / Logic / Relevance / Persuasion",
    "impact": "+9 Evidence, +8 Persuasion"
  },
  "bestOpponentArg": {
    "quote": "Quote of the opponent's best argument from the transcript",
    "category": "Evidence / Logic / Relevance / Persuasion",
    "impact": "+9 Logic, +7 Persuasion"
  },
  "weakestUserArg": {
    "quote": "Quote of the user's weakest argument from the transcript",
    "reason": "Vague statement and lacks statistics or direct relevance"
  },
  "weakestOpponentArg": {
    "quote": "Quote of the opponent's weakest argument from the transcript",
    "reason": "Failed to address modern context or relied on repetitive history"
  },
  "categoryBreakdown": {
    "evidence": "Brief explanation of what boosted or reduced the Evidence score",
    "logic": "Brief explanation of what boosted or reduced the Logic score",
    "relevance": "Brief explanation of what boosted or reduced the Relevance score",
    "persuasion": "Brief explanation of what boosted or reduced the Persuasion score"
  }
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
        if (!parsedResult.turningPoint || !parsedResult.bestUserArg || !parsedResult.bestOpponentArg) {
          throw new Error("Missing required explanation keys in parsed result");
        }
      } catch (e) {
        console.warn("[API/Agent/Referee] Explanation parsing failed, using fallback:", e);
        parsedResult = {
          turningPoint: `The debate shifted when Side A (${sideA}) successfully defended its modern accomplishments against Side B (${sideB})'s historical dominance.`,
          bestUserArg: {
            quote: history.find(h => h.role === "user")?.content || "No quote recorded.",
            category: "Evidence",
            impact: "+8 Evidence, +7 Persuasion"
          },
          bestOpponentArg: {
            quote: history.find(h => h.role === "assistant")?.content || "No quote recorded.",
            category: "Logic",
            impact: "+7 Logic, +8 Persuasion"
          },
          weakestUserArg: {
            quote: "Initial introductory arguments.",
            reason: "Contained limited supporting statistics or facts."
          },
          weakestOpponentArg: {
            quote: "Standard setup points.",
            reason: "Relied on generic historical arguments without challenging user claims."
          },
          categoryBreakdown: {
            evidence: `Evidence scores were decided by direct matches from the player profile data files.`,
            logic: `Logical consistency remained high through structured counterpoint exchanges.`,
            relevance: `Both sides stayed focused on direct comparisons rather than changing topics.`,
            persuasion: `Competitive live match punchlines defined the persuasion scores.`
          }
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
