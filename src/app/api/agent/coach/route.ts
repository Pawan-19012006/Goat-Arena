import { NextResponse } from "next/server";
import { defaultModelProvider } from "@/lib/qvac";
import { getEntityMultiSectionContext } from "@/lib/retrieval";

type CoachIntent =
  | "SUPPORT_POINTS"
  | "COUNTER_ARGUMENTS"
  | "HISTORY"
  | "FACTS"
  | "ACHIEVEMENTS"
  | "WEAKNESSES"
  | "DEBATE_STRATEGY";

/**
 * AI Tactical Coach Agent Route Handler with Query Routing Layer & Dedicated Prompt Templates.
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

    // 1. Deterministic Intent Classification
    const q = question.toLowerCase();
    let intent: CoachIntent = "DEBATE_STRATEGY";
    let targetSections: string[] = ["TACTICS"];

    if (q.includes("support") || q.includes("point") || q.includes("pro") || q.includes("argue for") || q.includes("help me defend") || q.includes("reasons for") || q.includes("why should")) {
      intent = "SUPPORT_POINTS";
      targetSections = ["RECORDS", "ACHIEVEMENTS"];
    } else if (q.includes("counter") || q.includes("against") || q.includes("rebut") || q.includes("refute") || q.includes("defeat") || q.includes("how to answer") || q.includes("beat")) {
      intent = "COUNTER_ARGUMENTS";
      targetSections = ["TACTICS", "WEAKNESSES"];
    } else if (q.includes("history") || q.includes("origin") || q.includes("timeline") || q.includes("old") || q.includes("young") || q.includes("first") || q.includes("when") || q.includes("born") || q.includes("who") || q.includes("founder") || q.includes("began") || q.includes("start")) {
      intent = "HISTORY";
      targetSections = ["HISTORY"];
    } else if (q.includes("trophy") || q.includes("won") || q.includes("achieve") || q.includes("award") || q.includes("ballon") || q.includes("cup") || q.includes("copa") || q.includes("title") || q.includes("medal")) {
      intent = "ACHIEVEMENTS";
      targetSections = ["ACHIEVEMENTS"];
    } else if (q.includes("weak") || q.includes("loophole") || q.includes("poor") || q.includes("flaw") || q.includes("concede") || q.includes("error") || q.includes("mistake")) {
      intent = "WEAKNESSES";
      targetSections = ["WEAKNESSES"];
    } else if (q.includes("record") || q.includes("stat") || q.includes("goal") || q.includes("assist") || q.includes("most") || q.includes("number")) {
      intent = "FACTS";
      targetSections = ["RECORDS"];
    }

    // 2. Fetch specific segmented context from the markdown profiles
    const context = await getEntityMultiSectionContext(side, targetSections);

    // 3. Choose the dedicated prompt template for the routed intent
    let prompt = "";
    switch (intent) {
      case "SUPPORT_POINTS":
        prompt = `You are a private football research assistant supporting the Team ${side.toUpperCase()} side.
Using the factual information below, output exactly 3 to 5 concise bullet points of debate arguments supporting Team ${side.toUpperCase()}.
Do NOT write long essays. Keep each bullet point under 12 words.

Context:
${context}

User Question: "${question}"`;
        break;

      case "COUNTER_ARGUMENTS":
        prompt = `You are a private football research assistant. Using the context, output exactly 1 or 2 short sentences providing direct, aggressive counterpoints to use against Team ${side.toUpperCase()}'s opponent.
Do NOT write bullet points. Keep it strictly under 30 words.

Context:
${context}

User Question: "${question}"`;
        break;

      case "HISTORY":
        prompt = `You are a private football history assistant. Answer the user's historical query: "${question}" factually and historically using the context details.
CRITICAL LIMITATIONS:
- Keep your response strictly to 1 or 2 short sentences.
- Do NOT provide tactical strategy, debate tips, or current coach advice. Focus 100% on historical facts.

Context:
${context}`;
        break;

      case "FACTS":
        prompt = `You are a private football statistical assistant. Answer the user's statistical query: "${question}" using only the numbers and statistics in the context.
CRITICAL LIMITATIONS:
- Output exactly 1 or 2 short sentences. Do NOT write list items or bullet points.
- Do NOT include tactical strategy, formations, or generic advice.

Context:
${context}`;
        break;

      case "ACHIEVEMENTS":
        prompt = `You are a private football research assistant. List only the relevant achievements or trophies for Team ${side.toUpperCase()} matching the user's query: "${question}" based on the context.
CRITICAL LIMITATIONS:
- Keep your response strictly under 2 sentences.
- Do NOT write general tactical advice or player coaching tips. Focus only on trophies and accomplishments.

Context:
${context}`;
        break;

      case "WEAKNESSES":
        prompt = `You are a private football research assistant. Identify the tactical weaknesses or loopholes of Team ${side.toUpperCase()} based on the user's query: "${question}" and context.
CRITICAL LIMITATIONS:
- Output exactly 1 or 2 short sentences.
- Avoid general history or records. Focus strictly on flaws and weaknesses.

Context:
${context}`;
        break;

      case "DEBATE_STRATEGY":
      default:
        prompt = `You are a private tactical football coach advising Team ${side.toUpperCase()}.
Provide exactly 1 or 2 short sentences of strategic guidance or debate focus angles based on the query: "${question}" and context.
Do NOT write list items or copy-paste arguments. Keep it extremely brief.

Context:
${context}`;
        break;
    }

    // Debug logs
    console.log("Coach Prompt Length:", prompt.length);
    console.log("Coach Routed Intent:", intent, "Sections:", targetSections);

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
