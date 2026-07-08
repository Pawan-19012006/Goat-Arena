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

    // 2. Format history and extract previous opponent arguments to prevent repetition
    const usedArguments: string[] = [];
    if (history) {
      const historyStr = history.map(h => h.content.toLowerCase()).join(" ");
      if (historyStr.includes("champions") || historyStr.includes("ucl")) usedArguments.push("UCL/Champions League");
      if (historyStr.includes("ballon")) usedArguments.push("Ballon d'Or honors");
      if (historyStr.includes("world cup") || historyStr.includes("worldcup")) usedArguments.push("World Cup success");
      if (historyStr.includes("goals") || historyStr.includes("scorer")) usedArguments.push("All-time goal totals");
      if (historyStr.includes("assists") || historyStr.includes("playmaker")) usedArguments.push("Assists/Playmaking");
      if (historyStr.includes("longevity") || historyStr.includes("age") || historyStr.includes("years old")) usedArguments.push("Career longevity");
    }

    const recentHistory = history && history.length > 0 ? history.slice(-3) : [];
    const formattedHistory = recentHistory.length > 0
      ? recentHistory.map(h => {
          const shortVal = h.content.length > 80 ? h.content.slice(0, 80) + "..." : h.content;
          return h.role === "assistant" ? `You (Opponent): ${shortVal}` : `User: ${shortVal}`;
        }).join("\n")
      : "None yet.";

    const repetitionGuard = usedArguments.length > 0
      ? `DO NOT repeat or focus on these already used topics: ${usedArguments.join(", ")}. Pivot to a different statistics or trophy angle.`
      : "Start with a strong competitive opening counterargument.";

    // 3. Compose specialised Opponent prompt
    const prompt = `You are a competitive supporter of TEAM ${rival.toUpperCase()} vs ${side.toUpperCase()}.
Context (factual info about your team):
${context || "None"}

History:
${formattedHistory}
User says: "${argument}"

${repetitionGuard}

Write a sharp rebuttal. Be competitive and aggressive.
CRITICAL LIMITATIONS:
- Keep your response strictly between 20 and 60 words.
- Attack only one argument at a time.
- Output exactly ONE single concise paragraph. Do NOT write multiple paragraphs, headers, or bullet points.`;

    // Debug logs
    console.log("Opponent Prompt Length:", prompt.length);
    console.log("Opponent Mapping Entity:", rival);

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
