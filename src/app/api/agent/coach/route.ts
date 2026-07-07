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
    // 1. Retrieve matching snippets from local Markdown knowledge base
    const searchQuery = queryText.slice(0, 100);
    const context = await getRetrievalContext(searchQuery, 3);

    // 2. Map recent history (last 2 turns)
    const recentHistory = history && history.length > 0 ? history.slice(-2) : [];
    const formattedHistory = recentHistory.length > 0 
      ? recentHistory.map(h => {
          const shortVal = h.content.length > 80 ? h.content.slice(0, 80) + "..." : h.content;
          return `${h.role === "user" ? "Client" : "Opponent"}: ${shortVal}`;
        }).join("\n")
      : "None yet.";

    // 3. Customize instructions based on whether this is a direct question or round analysis
    let instructions = "";
    if (question) {
      instructions = `Answer the client's direct question: "${question}".
Use facts from the Context to construct your answer. Do not debate or criticise the client.`;
    } else {
      instructions = `Analyze the client's current input: "${argument}".
Extract 1 key strength, 1 logical gap to defend, and 1 statistical recommendation.`;
    }

    // 4. Compose token-capped prompt
    const prompt = `You are the AI Tactical Coach, a football analyst helping Team ${side.toUpperCase()} defeat ${rival?.toUpperCase() || "the opponent"}.
Context: ${context || "None"}
History:
${formattedHistory}

${instructions}
Never refuse normal football discussion. Keep your response supportive and extremely concise (max 120 words).
You MUST format your output in this exact structure, including the headers in caps:

FACTS
- [supporting statistic or fact from Context]

ACHIEVEMENTS
- [player career honors or accolades]

COUNTERPOINTS
- [rebuttals to challenge opponent arguments]

TACTICAL ADVICE
- [strategic advice for next rounds]`;

    // Debug logs as requested
    console.log("Prompt Length:", prompt.length);
    console.log("Retrieved Context:", context);

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
        "Connection": "keep-alive",
        "x-prompt-length": prompt.length.toString(),
        "x-retrieval-length": context.length.toString(),
        "x-retrieved-snippets": encodeURIComponent(context.slice(0, 150))
      }
    });

  } catch (error: unknown) {
    const errorMsg = error instanceof Error ? error.message : String(error);
    console.error("[API/Agent/Coach] Error:", errorMsg);
    return NextResponse.json({ error: errorMsg }, { status: 500 });
  }
}
