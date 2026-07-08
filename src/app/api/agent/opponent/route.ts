import { NextResponse } from "next/server";
import { defaultModelProvider, DebateMessage } from "@/lib/qvac";
import { getEntitySectionContext } from "@/lib/retrieval";

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

    // 1. Retrieve segmented context using the query routing layer
    const { section, content } = await getEntitySectionContext(rival, argument);

    // 2. Format history and extract previous opponent topics to prevent repetition (Topic memory)
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
      ? `DO NOT repeat or discuss these already used topics: ${usedTopics.join(", ")}. Focus on another statistic or trophy.`
      : "Directly counter the user's claim.";

    // 3. Compose specialised Opponent prompt with strict direct rebuttals
    const prompt = `You are a competitive supporter of TEAM ${rival.toUpperCase()} vs ${side.toUpperCase()}.
Routed Section: ${section}
Factual Section Context (${section} section details):
${content || "None"}

History:
${formattedHistory}
User says: "${argument}"

${repetitionGuard}

Write a sharp, competitive rebuttal directly addressing the user's latest point.
CRITICAL RULES:
1. Every response must directly address and challenge the user's most recent statement: "${argument}". Do NOT change the topic or write generic football arguments.
2. Structure your response precisely in this format: Acknowledge the point, Counter it with evidence, and state a brief Conclusion.
3. Keep the entire response strictly under 50 words and output exactly ONE single paragraph. No lists or headers.`;

    // Debug logs
    console.log("Opponent Prompt Length:", prompt.length);
    console.log("Opponent Mapping Entity:", rival, "Routed Section:", section);
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
        "x-retrieval-length": content.length.toString(),
        "x-retrieved-snippets": encodeURIComponent(content.slice(0, 150))
      }
    });

  } catch (error: unknown) {
    const errorMsg = error instanceof Error ? error.message : String(error);
    console.error("[API/Agent/Opponent] Error:", errorMsg);
    return NextResponse.json({ error: errorMsg }, { status: 500 });
  }
}
