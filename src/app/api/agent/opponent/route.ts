import { NextResponse } from "next/server";
import { defaultModelProvider, DebateMessage } from "@/lib/qvac";
import { getEntityMultiSectionContext } from "@/lib/retrieval";

/**
 * Validates if the user's message is a simple greeting or filler rather than a debate argument
 */
function checkNonArgument(text: string, side: string): string | null {
  const clean = text.toLowerCase().trim().replace(/[.,\/#!$%\^&\*;:{}=\-_`~()?]/g, "");
  const greetings = ["hello", "hi", "hey", "yo", "sup", "howdy", "hola", "greetings"];
  
  if (greetings.includes(clean)) {
    return "We haven't started debating yet. State your case or give me a reason why " + side.toUpperCase() + " is superior.";
  }
  if (clean === "ok" || clean === "okay") {
    return "What's your strongest argument for " + side.toUpperCase() + "?";
  }
  if (clean.length < 12) {
    // Check if it contains core debate terms
    const debateTerms = ["score", "goal", "win", "stat", "troph", "cup", "play", "best", "goat", "beat", "rate", "year", "ucl", "ballon"];
    const hasDebateTerm = debateTerms.some(term => clean.includes(term));
    if (!hasDebateTerm) {
      return "State your case. Provide some actual football evidence for " + side.toUpperCase() + ".";
    }
  }
  return null;
}

/**
 * AI Rival Legend (Opponent) Agent Route Handler with Rebuttal Validation.
 */
export async function POST(request: Request) {
  try {
    const { side, rival, argument, userTopics, opponentTopics } = await request.json() as {
      side: string;
      rival: string;
      argument: string;
      history?: DebateMessage[];
      userTopics?: string[];
      opponentTopics?: string[];
    };

    if (!rival || !argument) {
      return NextResponse.json({ error: "Missing required parameters: rival or argument" }, { status: 400 });
    }

    // 1. Validate if user statement is a non-argument (Issue 1)
    const nonArgumentReply = checkNonArgument(argument, side);
    if (nonArgumentReply) {
      console.log("Opponent Non-Argument Validation Triggered. Input:", argument);
      const encoder = new TextEncoder();
      const stream = new ReadableStream({
        start(controller) {
          controller.enqueue(encoder.encode(nonArgumentReply));
          controller.close();
        }
      });
      return new Response(stream, {
        headers: {
          "Content-Type": "text/plain; charset=utf-8",
          "Cache-Control": "no-cache",
          "Connection": "keep-alive",
          "x-prompt-length": "0",
          "x-retrieval-length": "0",
          "x-retrieved-snippets": encodeURIComponent("Non-argument greeting bypass"),
          "x-opponent-intent": "GREETING_BYPASS",
          "x-selected-file": rival.toLowerCase() + ".md",
          "x-selected-section": "Greeting Filter"
        }
      });
    }

    // 2. Query Routing for Opponent: Map user argument to relevant counter-context sections
    const argLower = argument.toLowerCase();
    let targetSections = ["Counter Points", "Weaknesses"];
    if (argLower.includes("defense") || argLower.includes("defender") || argLower.includes("backline") || argLower.includes("squad") || argLower.includes("depth") || argLower.includes("bench") || argLower.includes("manager") || argLower.includes("coach") || argLower.includes("tactic")) {
      targetSections = ["Tactics", "Weaknesses"];
    } else if (argLower.includes("goal") || argLower.includes("score") || argLower.includes("record") || argLower.includes("stat") || argLower.includes("assist") || argLower.includes("most") || argLower.includes("number")) {
      targetSections = ["Records", "Counter Points"];
    } else if (argLower.includes("trophy") || argLower.includes("won") || argLower.includes("achieve") || argLower.includes("award") || argLower.includes("ballon") || argLower.includes("cup") || argLower.includes("copa") || argLower.includes("title") || argLower.includes("champions league") || argLower.includes("ucl")) {
      targetSections = ["Achievements", "Counter Points"];
    } else if (argLower.includes("history") || argLower.includes("timeline") || argLower.includes("origins") || argLower.includes("born")) {
      targetSections = ["History", "Origins"];
    }

    const context = await getEntityMultiSectionContext(rival, targetSections);

    // 3. Compile lightweight memory topics check to prevent duplication (Issue 4)
    let repetitionGuard = "";
    if (opponentTopics && opponentTopics.length > 0) {
      repetitionGuard = `Avoid repeating points or evidence already mentioned on these topics: ${opponentTopics.join(", ")}. Introduce new arguments or statistics from other sections of the context.`;
    }

    // 4. Compose specialized prompt with strict negative instructions (Issue 2 & 3)
    const prompt = `You are a competitive supporter of TEAM ${rival.toUpperCase()} in a live football debate vs ${side.toUpperCase()}.
Factual Context Details about Team ${rival.toUpperCase()}:
${context || "None"}

User statement to counter: "${argument}"

${repetitionGuard}

Write a sharp, competitive rebuttal directly challenging the user's statement.
CRITICAL CONSTRAINTS:
- Directly challenge the User statement: "${argument}" before presenting your counterpoint. Speak naturally as a person debating in a live match.
- NEVER use these metalanguage words or structural labels: "User", "Claim", "Argument", "Rebuttal", "Debate structure", "User's claim", "Acknowledge the point", "Counter", "Conclusion", or "Rival".
- Keep your response strictly between 15 and 50 words.
- Output exactly ONE single paragraph. Do NOT write multiple paragraphs, list items, or headers.`;

    // Debug logs
    console.log("Opponent Prompt Length:", prompt.length);
    console.log("Opponent Mapping Entity:", rival, "Routed Sections:", targetSections);
    console.log("Opponent Memory Summary:", { userTopics, opponentTopics });

    // 5. Generate stream
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
        "x-retrieved-snippets": encodeURIComponent(context.slice(0, 150)),
        "x-opponent-intent": "DEBATE_REBUTTAL",
        "x-selected-file": rival.toLowerCase() + ".md",
        "x-selected-section": targetSections.join(", ")
      }
    });

  } catch (error: unknown) {
    const errorMsg = error instanceof Error ? error.message : String(error);
    console.error("[API/Agent/Opponent] Error:", errorMsg);
    return NextResponse.json({ error: errorMsg }, { status: 500 });
  }
}
