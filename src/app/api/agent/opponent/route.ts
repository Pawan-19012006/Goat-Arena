import { NextResponse } from "next/server";
import { defaultModelProvider, DebateMessage } from "@/lib/qvac";
import { getEntityMultiSectionContext } from "@/lib/retrieval";

/**
 * Trims a response to a maximum word count at the nearest sentence boundary.
 */
function trimToWordLimit(text: string, maxWords = 80): string {
  const words = text.trim().split(/\s+/);
  if (words.length <= maxWords) return text.trim();
  // Find last sentence boundary within limit
  const truncated = words.slice(0, maxWords).join(" ");
  const lastPeriod = Math.max(
    truncated.lastIndexOf("."),
    truncated.lastIndexOf("!"),
    truncated.lastIndexOf("?")
  );
  if (lastPeriod > truncated.length * 0.5) {
    return truncated.slice(0, lastPeriod + 1).trim();
  }
  return truncated.trim() + ".";
}

/**
 * Validates if the user's message is a simple greeting or filler rather than a debate argument.
 */
function checkNonArgument(text: string, side: string): string | null {
  const clean = text.toLowerCase().trim().replace(/[.,\/#!$%\^&\*;:{}=\-_`~()?]/g, "");
  const greetings = ["hello", "hi", "hey", "yo", "sup", "howdy", "hola", "greetings"];

  if (greetings.includes(clean)) {
    return `That's not a football argument. Give me an actual claim about ${side.toUpperCase()} and I'll tear it apart.`;
  }
  if (clean === "ok" || clean === "okay") {
    return `Make your case. What's your strongest point for ${side.toUpperCase()}?`;
  }
  if (clean === "hmm" || clean === "nice" || clean === "cool" || clean === "interesting") {
    return `I need a real football argument, not small talk. What's your claim?`;
  }
  if (clean.length < 10) {
    const debateTerms = ["score", "goal", "win", "stat", "troph", "cup", "play", "best", "goat", "beat", "rate", "year", "ucl", "ballon", "world", "champion", "title"];
    const hasDebateTerm = debateTerms.some(term => clean.includes(term));
    if (!hasDebateTerm) {
      return `State your case. Give me a real football point about ${side.toUpperCase()} worth debating.`;
    }
  }
  return null;
}

/**
 * Checks if the generated text praises the user's side, criticizes the opponent's own side,
 * or contains soft concessions / self-deprecating first-person phrases.
 */
function validateOpponentResponse(text: string, userSide: string, opponentSide: string): boolean {
  const t = text.toLowerCase().trim();
  const u = userSide.toLowerCase().replace("team ", "").trim();
  const o = opponentSide.toLowerCase().replace("team ", "").trim();

  // Hard concessions — never acceptable
  const concessions = [
    "that's true", "that is true", "i agree", "you are correct", "you make a good point",
    "good point", "to be fair", "admittedly", "fair enough", "i must admit", "indeed impressive",
    "is indeed impressive", "are indeed impressive", "have a point", "you're right",
    "you are right", "that's fair", "that is fair", "i concede", "i'll admit",
    "you make a strong case", "i cannot deny"
  ];
  for (const w of concessions) {
    if (t.includes(w)) {
      console.log(`[Validation] Concession phrase "${w}". Rejecting.`);
      return false;
    }
  }

  // First-person self-deprecation about own side
  const selfDeprecationFirstPerson = [
    "we've lost", "we've not", "we haven't", "we couldn't", "we failed",
    "we were weak", "we struggled to", "our weakness", "our biggest flaw",
    "we didn't win", "we have not won", "we couldn't win", "we are not",
    "we're not as strong", "we're weaker"
  ];
  for (const w of selfDeprecationFirstPerson) {
    if (t.includes(w)) {
      console.log(`[Validation] First-person self-deprecation "${w}". Rejecting.`);
      return false;
    }
  }

  // Praise words for the user's side
  const userPraiseWords = [
    `${u} is better`, `${u} is superior`, `${u} has the edge`,
    `${u} is the greatest`, `${u} is the best`, `${u} is dominant`,
    `${u} is stronger`, `${u} is unmatched`, `${u} is unbeatable`
  ];
  if (u.includes("messi")) {
    userPraiseWords.push("messi is the goat", "messi is the greatest", "messi is better", "messi wins", "messi dominates");
  }
  if (u.includes("ronaldo")) {
    userPraiseWords.push("ronaldo is the goat", "ronaldo is the greatest", "ronaldo is better", "ronaldo wins", "ronaldo dominates");
  }
  if (u.includes("mbappe")) {
    userPraiseWords.push("mbappe is better", "mbappe is the best", "mbappe wins");
  }
  if (u.includes("haaland")) {
    userPraiseWords.push("haaland is better", "haaland is the best", "haaland wins");
  }
  if (u.includes("argentina")) {
    userPraiseWords.push("argentina is better", "argentina is superior", "argentina is the best", "argentina wins");
  }
  if (u.includes("brazil")) {
    userPraiseWords.push("brazil is better", "brazil is superior", "brazil is the best", "brazil wins");
  }

  for (const w of userPraiseWords) {
    if (t.includes(w)) {
      console.log(`[Validation] User-praise keyword "${w}". Rejecting.`);
      return false;
    }
  }

  // Self deprecation about own named side
  const selfDeprecation = [
    `${o} is weak`, `${o} is worse`, `${o} is inferior`,
    `${o} cannot compare`, `${o} has failed`, `${o} has struggled`,
    `${o} is losing`, `${o} is poor`, `${o} is overrated`
  ];
  if (o.includes("ronaldo")) selfDeprecation.push("ronaldo is weak", "ronaldo failed", "ronaldo is overrated");
  if (o.includes("messi")) selfDeprecation.push("messi is weak", "messi failed", "messi is overrated");
  if (o.includes("mbappe")) selfDeprecation.push("mbappe is weak", "mbappe failed");
  if (o.includes("haaland")) selfDeprecation.push("haaland is weak", "haaland failed");
  if (o.includes("brazil")) selfDeprecation.push("brazil is weak", "brazil failed", "brazil is poor");
  if (o.includes("argentina")) selfDeprecation.push("argentina is weak", "argentina failed");

  for (const w of selfDeprecation) {
    if (t.includes(w)) {
      console.log(`[Validation] Self-deprecating keyword "${w}". Rejecting.`);
      return false;
    }
  }

  return true;
}

/**
 * Safe fallback rebuttals — confident and on-side.
 */
function getFallbackRebuttal(rival: string): string {
  const r = rival.toLowerCase();
  if (r.includes("messi")) return "Messi's 8 Ballon d'Ors and the 2022 World Cup define the greatest footballer of all time. No one else comes close to that combination.";
  if (r.includes("ronaldo")) return "Cristiano Ronaldo has scored over 890 goals and won the Champions League 5 times across 3 different clubs. That adaptability is unmatched.";
  if (r.includes("mbappe")) return "Mbappé won the World Cup at 19 and became the second-highest scorer in World Cup history. His ceiling is limitless.";
  if (r.includes("haaland")) return "Haaland scored 52 goals in a single Premier League season. No striker in history has ever hit that rate so consistently.";
  if (r.includes("brazil")) return "Brazil's 5 World Cup titles and the legacy of Pelé, Ronaldo, Ronaldinho, and Neymar makes them the greatest football nation in history.";
  if (r.includes("argentina")) return "Argentina are the reigning World Cup champions with 3 titles, 16 Copa Américas, and Messi — the greatest player ever. The records speak for themselves.";
  return `${rival} has the superior statistics, records, and historical legacy. The numbers are undeniable.`;
}

/**
 * AI Rival Legend (Opponent) Agent Route Handler.
 */
export async function POST(request: Request) {
  try {
    const { side, rival, argument, opponentTopics } = await request.json() as {
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

    // 1. Check for non-argument inputs
    const nonArgumentReply = checkNonArgument(argument, side);
    if (nonArgumentReply) {
      console.log("[Opponent] Non-argument bypass. Input:", argument);
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
          "x-opponent-intent": "GREETING_BYPASS",
          "x-selected-file": rival.toLowerCase() + ".md",
          "x-selected-section": "Greeting Filter",
          "x-prompt-length": "0",
          "x-retrieval-length": "0",
          "x-retrieved-snippets": encodeURIComponent("Non-argument bypass")
        }
      });
    }

    // 2. Route argument to relevant counter-context sections
    const argLower = argument.toLowerCase();
    let targetSections = ["Counter Points", "Weaknesses"];

    if (argLower.includes("defense") || argLower.includes("squad") || argLower.includes("depth") || argLower.includes("tactic") || argLower.includes("bench") || argLower.includes("manager") || argLower.includes("coach")) {
      targetSections = ["Tactics", "Strengths"];
    } else if (argLower.includes("goal") || argLower.includes("score") || argLower.includes("record") || argLower.includes("stat") || argLower.includes("assist") || argLower.includes("number")) {
      targetSections = ["Records", "Achievements"];
    } else if (argLower.includes("trophy") || argLower.includes("won") || argLower.includes("achiev") || argLower.includes("award") || argLower.includes("ballon") || argLower.includes("cup") || argLower.includes("copa") || argLower.includes("title") || argLower.includes("ucl") || argLower.includes("champions league")) {
      targetSections = ["Achievements", "Counter Points"];
    } else if (argLower.includes("history") || argLower.includes("origin") || argLower.includes("born") || argLower.includes("founded")) {
      targetSections = ["History", "Strengths"];
    } else if (argLower.includes("recent") || argLower.includes("form") || argLower.includes("current") || argLower.includes("season")) {
      targetSections = ["Recent Form", "Strengths"];
    }

    const context = await getEntityMultiSectionContext(rival, targetSections);

    // 3. Memory guard against repeating topics
    let repetitionGuard = "";
    if (opponentTopics && opponentTopics.length > 0) {
      repetitionGuard = `Do NOT repeat arguments about: ${opponentTopics.slice(-3).join(", ")}. Find a different angle.`;
    }

    // 4. Lean, focused prompt — optimised for 1B model
    const u = side.replace("TEAM ", "").trim();
    const o = rival.replace("TEAM ", "").trim();

    const prompt = `You are defending ${o} in a live football debate against ${u}.

Facts about ${o}:
${context || "Use your knowledge of " + o}

The opponent just said: "${argument}"

${repetitionGuard}

Respond with ONE confident paragraph (30-60 words). Directly challenge what they said, then state ONE strong fact that proves ${o} is superior. End with a punchy closing line.

RULES:
- Never agree, concede, or say "that's true", "I agree", "to be fair", or "admittedly".
- Never say "we lost", "we failed", or anything negative about ${o}.  
- Never praise ${u} or say they are better.
- No bullet points, no headers, no labels like "Challenge:" or "Counter:".
- Speak like a confident football pundit, not a robot.`;

    // Debug
    console.log("========================================");
    console.log("[DEBUG] Opponent Side Assignment:");
    console.log(`- userSide: ${side} | opponentSide: ${rival}`);
    console.log(`- sections: ${targetSections.join(", ")}`);
    console.log("========================================");
    console.log("Opponent Prompt Length:", prompt.length);

    // 5. Generate with validation retry loop
    let finalRebuttal = "";
    let validated = false;
    let attempts = 0;

    while (!validated && attempts < 3) {
      attempts++;
      const raw = await defaultModelProvider.generateText(prompt, []);
      finalRebuttal = trimToWordLimit(raw, 80);
      validated = validateOpponentResponse(finalRebuttal, side, rival);
      if (!validated) {
        console.log(`[Validation Failed] Attempt ${attempts}: "${finalRebuttal}". Regenerating...`);
      }
    }

    if (!validated) {
      console.log("[Validation Fallback] Using safe fallback.");
      finalRebuttal = getFallbackRebuttal(rival);
    }

    console.log(`[Validation OK] Attempt ${attempts}: "${finalRebuttal}"`);

    const encoder = new TextEncoder();
    const stream = new ReadableStream({
      start(controller) {
        controller.enqueue(encoder.encode(finalRebuttal));
        controller.close();
      }
    });

    return new Response(stream, {
      headers: {
        "Content-Type": "text/plain; charset=utf-8",
        "Cache-Control": "no-cache",
        "x-prompt-length": prompt.length.toString(),
        "x-retrieval-length": context.length.toString(),
        "x-retrieved-snippets": encodeURIComponent(context.slice(0, 150)),
        "x-opponent-intent": "DEBATE_REBUTTAL",
        "x-selected-file": rival.toLowerCase().trim() + ".md",
        "x-selected-section": targetSections.join(", ")
      }
    });

  } catch (error: unknown) {
    const errorMsg = error instanceof Error ? error.message : String(error);
    console.error("[API/Agent/Opponent] Error:", errorMsg);
    return NextResponse.json({ error: errorMsg }, { status: 500 });
  }
}
