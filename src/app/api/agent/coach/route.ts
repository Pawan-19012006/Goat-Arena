import { NextResponse } from "next/server";
import { defaultModelProvider } from "@/lib/qvac";
import { getEntitySectionContext } from "@/lib/retrieval";

/**
 * AI Tactical Coach Agent Route Handler refactored as a Private Timeout Advisor with Query Routing.
 * Classifies user intent and returns exactly 1-2 sentences of strategic/factual advice based on the routed segment.
 */
export async function POST(request: Request) {
  try {
    const { side, question } = await request.json() as {
      side: string;
      question: string;
    };

    if (!side || !question) {
      return NextResponse.json({ error: "Missing required parameters: side or question" }, { status: 400 });
    }

    // 1. Retrieve segmented query context using the query routing layer
    const { section, content } = await getEntitySectionContext(side, question);

    // 2. Compose specialised strategic advice prompt advising the model of the intent section
    const prompt = `You are a private tactical football coach advising your client on the Team ${side.toUpperCase()} side.
Detected Query Intent Category: ${section}
Factual Section Context (${section} section details):
${content || "None"}

User's Question: "${question}"

Write exactly 1 or 2 short sentences in response.
CRITICAL RULES:
- Answer according to the detected intent (${section}):
  * If HISTORY/RECORDS/ACHIEVEMENTS, answer factually using the context (do NOT force tactical/coach tips).
  * If TACTICS, give specific formation or role advice.
  * If WEAKNESSES, suggest weaknesses to exploit or protect.
- Do NOT write bullet points, lists, or full copy-pasteable debate arguments.
- Keep the response extremely brief (1-2 sentences max).`;

    // Debug logs
    console.log("Coach Prompt Length:", prompt.length);
    console.log("Coach Mapping Entity:", side, "Routed Section:", section);

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
        "x-retrieval-length": content.length.toString(),
        "x-retrieved-snippets": encodeURIComponent(content.slice(0, 150))
      }
    });

  } catch (error: unknown) {
    const errorMsg = error instanceof Error ? error.message : String(error);
    console.error("[API/Agent/Coach] Error:", errorMsg);
    return NextResponse.json({ error: errorMsg }, { status: 500 });
  }
}
