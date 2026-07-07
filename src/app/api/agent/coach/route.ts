import { NextResponse } from "next/server";
import { defaultModelProvider, DebateMessage } from "@/lib/qvac";
import { getRetrievalContext } from "@/lib/retrieval";

/**
 * AI Tactical Coach Agent Route Handler.
 * Supports:
 * 1. Automatic round-based coaching (triggered by argument submissions).
 * 2. Real-time direct Q&A (triggered by typing into the Coach Panel input box).
 */
export async function POST(request: Request) {
  try {
    const { side, rival, argument, question, history } = await request.json() as {
      side: string;
      rival: string;
      argument?: string;
      question?: string;
      history: DebateMessage[];
    };

    if (!side) {
      return NextResponse.json({ error: "Missing required parameter: side" }, { status: 400 });
    }

    const queryText = question || argument || "";
    // 1. Retrieve 1 matching snippet from the local Markdown knowledge base
    const searchQuery = `${side} ${queryText.slice(0, 100)}`;
    const context = await getRetrievalContext(searchQuery, 1);

    // 2. Map recent history (last 2 turns)
    const recentHistory = history && history.length > 0 ? history.slice(-2) : [];
    const formattedHistory = recentHistory.length > 0 
      ? recentHistory.map(h => `${h.role === "user" ? "Client" : "Opponent"}: ${h.content}`).join("\n")
      : "None yet.";

    // 3. Customize instructions based on whether this is a direct question or round analysis
    let instructions = "";
    if (question) {
      instructions = `Answer the client's direct question: "${question}".
Use facts from the Context to construct your answer. Do not debate the client.`;
    } else {
      instructions = `Analyze the client's current input: "${argument}".
Identify:
1. 1 strength of their argument.
2. 1 logical gap to defend.
3. 1 statistical fact to cite.`;
    }

    // 4. Compose token-capped prompt
    const prompt = `You are the AI Tactical Coach, a football analyst helping Team ${side.toUpperCase()} defeat ${rival?.toUpperCase() || "the opponent"}.
Context: ${context || "None"}
History:
${formattedHistory}

${instructions}
Keep your response supportive, bulleted, and extremely concise. Max 100 words.`;

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
          console.error("[Coach Stream Error]", e);
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
    console.error("[API/Agent/Coach] Error:", errorMsg);
    return NextResponse.json({ error: errorMsg }, { status: 500 });
  }
}
