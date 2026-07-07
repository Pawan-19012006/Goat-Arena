import { NextResponse } from "next/server";
import { defaultModelProvider, DebateMessage } from "@/lib/qvac";
import { getRetrievalContext } from "@/lib/retrieval";

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

    // 1. Retrieve facts matching the rival and user argument to support the opponent's side
    const searchQuery = `${rival} ${argument.slice(0, 100)}`;
    const context = await getRetrievalContext(searchQuery, 1);

    // 2. Format history and extract previous opponent arguments to prevent repetition
    const previousOpponentArguments: string[] = [];
    if (history) {
      for (const h of history) {
        if (h.role === "assistant") {
          previousOpponentArguments.push(h.content);
        }
      }
    }

    const recentHistory = history && history.length > 0 ? history.slice(-2) : [];
    const formattedHistory = recentHistory.length > 0
      ? recentHistory.map(h => h.role === "assistant" ? `You (Opponent): ${h.content}` : `User: ${h.content}`).join("\n")
      : "None yet.";

    const repetitionGuard = previousOpponentArguments.length > 0
      ? `DO NOT repeat these previous arguments: ${previousOpponentArguments.map(arg => `"${arg.slice(0, 50)}..."`).join(", ")}`
      : "Start with a strong opening counterargument.";

    // 3. Compose prompt for the opponent
    const prompt = `You are a competitive supporter of TEAM ${rival.toUpperCase()} vs ${side.toUpperCase()}.
Context: ${context || "None"}
History:
${formattedHistory}
User says: "${argument}"

${repetitionGuard}

Write a sharp rebuttal. Keep it under 100 words. No intro fluff. Start directly with the rebuttal.`;

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
        "Connection": "keep-alive"
      }
    });

  } catch (error: unknown) {
    const errorMsg = error instanceof Error ? error.message : String(error);
    console.error("[API/Agent/Opponent] Error:", errorMsg);
    return NextResponse.json({ error: errorMsg }, { status: 500 });
  }
}
