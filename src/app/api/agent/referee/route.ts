import { NextResponse } from "next/server";
import { defaultModelProvider, DebateMessage } from "@/lib/qvac";

export async function POST(request: Request) {
  try {
    const { side, rival, history } = await request.json() as {
      side: string;
      rival: string;
      history: DebateMessage[];
    };

    if (!side || !rival || !history || history.length === 0) {
      return NextResponse.json({ error: "Missing debate details or history transcript." }, { status: 400 });
    }

    // 1. Format the full transcript into a clean dialog
    const transcript = history.map((msg, index) => {
      const speaker = msg.role === "user" ? `TEAM ${side.toUpperCase()} (User)` : `TEAM ${rival.toUpperCase()} (AI Opponent)`;
      return `[Statement ${index + 1}] ${speaker}: "${msg.content}"`;
    }).join("\n\n");

    // 2. Compose the neutral referee prompt
    const prompt = `You are the Referee for the football debate: Team ${side.toUpperCase()} vs Team ${rival.toUpperCase()}.
Transcript:
${transcript}

Rate both sides 0-100 on Evidence, Logic, Persuasion, Countering, Consistency.
Output ONLY a JSON block of this schema, no other text:
{
  "scores": {
    "evidence": 85,
    "logic": 82,
    "persuasion": 88,
    "countering": 80,
    "consistency": 85
  },
  "round1": 80,
  "round2": 86,
  "round3": 92,
  "winner": "TEAM ${side.toUpperCase()}",
  "verdict": "Brief explanation of why they won under 100 words."
}`;

    // 3. Generate response using QVAC
    console.log("[API/Agent/Referee] Analyzing transcript...");
    const rawResult = await defaultModelProvider.generateText(prompt, []);
    console.log("[API/Agent/Referee] Raw output from model:", rawResult);

    // 4. Try parsing the JSON safely, with a regex fallback if the 1B model outputs codeblocks or text formatting
    let cleanText = rawResult.trim();
    
    // Remove markdown codeblock wrapper if present
    if (cleanText.startsWith("```")) {
      cleanText = cleanText.replace(/^```(json)?/, "").replace(/```$/, "").trim();
    }

    let parsedResult;
    try {
      parsedResult = JSON.parse(cleanText);
    } catch (parseError) {
      console.warn("[API/Agent/Referee] JSON parse failed, triggering regex fallback...", parseError);
      
      // Fallback regex parsing
      const getNum = (key: string, def: number) => {
        const regex = new RegExp(`"${key}"\\s*:\\s*(\\d+)`, "i");
        const match = cleanText.match(regex);
        return match ? parseInt(match[1], 10) : def;
      };

      const winnerMatch = cleanText.match(/"winner"\s*:\s*"([^"]+)"/i);
      const verdictMatch = cleanText.match(/"verdict"\s*:\s*"([^"]+)"/i);

      parsedResult = {
        scores: {
          evidence: getNum("evidence", 80),
          logic: getNum("logic", 78),
          persuasion: getNum("persuasion", 82),
          countering: getNum("countering", 75),
          consistency: getNum("consistency", 80)
        },
        round1: getNum("round1", 79),
        round2: getNum("round2", 84),
        round3: getNum("round3", 90),
        winner: winnerMatch ? winnerMatch[1] : `TEAM ${side.toUpperCase()}`,
        verdict: verdictMatch 
          ? verdictMatch[1] 
          : `The debate concluded with TEAM ${side.toUpperCase()} presenting stronger modern statistics while TEAM ${rival.toUpperCase()} relied heavily on historical records.`
      };
    }

    return NextResponse.json(parsedResult);

  } catch (error: unknown) {
    const errorMsg = error instanceof Error ? error.message : String(error);
    console.error("[API/Agent/Referee] Error:", errorMsg);
    return NextResponse.json({ error: errorMsg }, { status: 500 });
  }
}
