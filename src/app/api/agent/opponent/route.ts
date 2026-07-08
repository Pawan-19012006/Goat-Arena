import { NextResponse } from "next/server";
import { defaultModelProvider, DebateMessage } from "@/lib/qvac";
import { getEntityContext } from "@/lib/retrieval";

export async function POST(request: Request) {
  try {
    const { side, rival, argument, history } = await request.json() as {
      side: string;
      rival: string;
      argument: string;
      history: DebateMessage[];
    };

    if (!rival || !argument) {
      return NextResponse.json({ error: "Missing required parameters: rival or argument" }, { status: 400 });
    }

    // 1. Retrieve the exact target rival entity file (e.g. ronaldo.md, brazil.md)
    const context = await getEntityContext(rival);

    // 2. Format history and extract previous opponent topics to prevent repetition
    const usedTopics: string[] = [];
    if (history) {
      const historyStr = history.map(h => h.content.toLowerCase()).join(" ");
      if (historyStr.includes("world cup") || historyStr.includes("worldcup") || historyStr.includes("trophies")) {
        usedTopics.push("world_cups");
      }
      if (historyStr.includes("recent") || historyStr.includes("form") || historyStr.includes("streak") || historyStr.includes("current")) {
        usedTopics.push("recent_form");
      }
      if (historyStr.includes("defense") || historyStr.includes("defender") || historyStr.includes("backline")) {
        usedTopics.push("defense");
      }
      if (historyStr.includes("squad") || historyStr.includes("depth") || historyStr.includes("bench")) {
        usedTopics.push("squad_depth");
      }
      if (historyStr.includes("manager") || historyStr.includes("coach") || historyStr.includes("tactics")) {
        usedTopics.push("manager");
      }
      if (historyStr.includes("star") || historyStr.includes("players") || historyStr.includes("ballon")) {
        usedTopics.push("star_players");
      }
    }

    const recentHistory = history && history.length > 0 ? history.slice(-3) : [];
    const formattedHistory = recentHistory.length > 0
      ? recentHistory.map(h => {
          const shortVal = h.content.length > 80 ? h.content.slice(0, 80) + "..." : h.content;
          return h.role === "assistant" ? `You (Opponent): ${shortVal}` : `User: ${shortVal}`;
        }).join("\n")
      : "None yet.";

    const repetitionGuard = usedTopics.length > 0
      ? `DO NOT discuss, repeat, or mention these topics: ${usedTopics.join(", ")}. Pivot to a different topic or statistic.`
      : "Rebut the user directly.";

    // 3. Compose specialised Opponent prompt with 15-40 words constraint
    const prompt = `You are a competitive supporter of TEAM ${rival.toUpperCase()} vs ${side.toUpperCase()}.
Context (factual info about your team):
${context || "None"}

History:
${formattedHistory}
User says: "${argument}"

${repetitionGuard}

Write a sharp, competitive rebuttal.
CRITICAL CONSTRAINTS:
- Keep your response strictly between 15 and 40 words.
- Attack only one User argument at a time.
- Output exactly ONE single concise paragraph. Do NOT write multiple paragraphs, headers, or bullet points.`;

    // Debug logs
    console.log("Opponent Prompt Length:", prompt.length);
    console.log("Opponent Mapping Entity:", rival);
    console.log("Opponent Used Topics Memory:", usedTopics);

    // 4. Generate stream
    const encoder = new TextEncoder();
    const qvacStream = await defaultModelProvider.generateStream(prompt, []);

    const stream = new ReadableStream({
      async start(controller) {
        try {
          for await (const token of qvacStream) {
            controller.enqueue(encoder.encode(token));
          }
          controller.close();
        } catch (e) {
          console.error("[Opponent Stream Error]", e);
          controller.error(e);
        }
      }
    });

    return new Response(stream, {
      headers: {
        "Content-Type": "text/plain; charset=utf-8",
        "Cache-Control": "no-cache",
        "Connection": "keep-alive",
        "x-prompt-length": prompt.length.toString(),
        "x-retrieval-length": context.length.toString(),
        "x-retrieved-snippets": encodeURIComponent(context.slice(0, 150))
      }
    });

  } catch (error: unknown) {
    const errorMsg = error instanceof Error ? error.message : String(error);
    console.error("[API/Agent/Opponent] Error:", errorMsg);
    return NextResponse.json({ error: errorMsg }, { status: 500 });
  }
}
