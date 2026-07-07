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

    if (!side || !argument) {
      return NextResponse.json({ error: "Missing required parameters: side or argument" }, { status: 400 });
    }

    // 1. Retrieve relevant facts based on the user's side and current argument
    const searchQuery = `${side} ${argument.slice(0, 100)}`;
    const context = await getRetrievalContext(searchQuery, 1);

    // 2. Format history into readable text for context (last 2 turns only)
    const recentHistory = history && history.length > 0 ? history.slice(-2) : [];
    const formattedHistory = recentHistory.length > 0 
      ? recentHistory.map(h => `${h.role === "user" ? "Client" : "Opponent"}: ${h.content}`).join("\n")
      : "None yet.";

    // 3. Compose highly compressed prompt for the analyst
    const prompt = `You are AI Coach for Team ${side.toUpperCase()} vs ${rival?.toUpperCase()}.
Context: ${context || "None"}
History:
${formattedHistory}
User says: "${argument}"

Provide:
1. 1 key strength of user's argument.
2. 1 loophole to defend.
3. 1 statistical fact to cite.
Keep bullets extremely concise. Max 100 words.`;

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
          console.error("[Analyst Stream Error]", e);
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
    console.error("[API/Agent/Analyst] Error:", errorMsg);
    return NextResponse.json({ error: errorMsg }, { status: 500 });
  }
}
