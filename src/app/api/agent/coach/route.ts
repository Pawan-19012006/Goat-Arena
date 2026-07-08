import { NextResponse } from "next/server";
import { defaultModelProvider } from "@/lib/qvac";
import { getEntityContext } from "@/lib/retrieval";

/**
 * AI Tactical Coach Agent Route Handler refactored as a Private Research Assistant.
 * Answers direct user questions using only the user's side of the debate.
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

    // 2. Compose specialised research prompt
    const prompt = `You are a private football research assistant helping the user.
Context (factual info about the entity):
${context || "None"}

User's Question: "${question}"

You MUST format your output strictly in this exact structure, including the headers in caps. Always use bullet points (•), and write a maximum of 6 bullets per section.

KEY FACTS
• [bullet points here]

ACHIEVEMENTS
• [bullet points here]

COUNTERS
• [bullet points here]

TACTICAL ADVICE
• [bullet points here]`;

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
