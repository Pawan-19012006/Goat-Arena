import { NextResponse } from "next/server";
import { defaultModelProvider } from "@/lib/qvac";
import { getEntityContext } from "@/lib/retrieval";

/**
 * AI Tactical Coach Agent Route Handler refactored as a Private Timeout Advisor.
 * Returns exactly 1-2 sentences of strategic advice based on the user's side.
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

    // 1. Retrieve the exact target side entity file (e.g. messi.md, argentina.md)
    const context = await getEntityContext(side);

    // 2. Compose specialised strategic advice prompt
    const prompt = `You are a private tactical football coach advising your client on the Team ${side.toUpperCase()} side.
Context (factual info about your team):
${context || "None"}

User's Question: "${question}"

Write exactly 1 or 2 short sentences of strategic guidance. Do NOT write bullet points, list items, statistics, or full arguments that can be copied. Guide the user on what angle/statistic to focus on or avoid. Keep it extremely brief.`;

    // Debug logs
    console.log("Coach Prompt Length:", prompt.length);
    console.log("Coach Mapping Entity:", side);

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
