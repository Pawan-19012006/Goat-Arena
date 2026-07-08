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
 * Checks if the generated text praises the user's side or criticizes the opponent's own side.
 */
function validateOpponentResponse(text: string, userSide: string, opponentSide: string): boolean {
  const t = text.toLowerCase();
  const u = userSide.toLowerCase().replace("team ", "").trim();
  const o = opponentSide.toLowerCase().replace("team ", "").trim();

  // Praise words for the user's side
  const userPraiseWords = [
    `${u} is better`, `${u} is superior`, `${u} has the edge`,
    `${u} is the greatest`, `praise ${u}`, `great ${u}`,
    `support ${u}`, `love ${u}`, `prefer ${u}`,
    `i agree with ${u}`, `you are right about ${u}`,
    `${u} is the best`, `${u} has been on fire`,
    `${u} is dominant`
  ];

  if (u.includes("messi")) {
    userPraiseWords.push("messi is better", "messi is superior", "messi is the goat", "messi is the greatest", "messi is the king");
  }
  if (u.includes("ronaldo")) {
    userPraiseWords.push("ronaldo is better", "ronaldo is superior", "ronaldo is the goat", "ronaldo is the greatest", "ronaldo is the king");
  }
  if (u.includes("mbappe")) {
    userPraiseWords.push("mbappe is better", "mbappe is superior", "mbappe is the best");
  }
  if (u.includes("haaland")) {
    userPraiseWords.push("haaland is better", "haaland is superior", "haaland is the best");
  }
  if (u.includes("argentina")) {
    userPraiseWords.push("argentina is better", "argentina is superior", "argentina has been on fire");
  }
  if (u.includes("brazil")) {
    userPraiseWords.push("brazil is better", "brazil is superior", "brazil has been on fire");
  }

  for (const w of userPraiseWords) {
    if (t.includes(w)) {
      console.log(`[Validation Check] Rebuttal contains user-praise keyword "${w}". Rejecting.`);
      return false;
    }
  }

  // Self deprecation words about the opponent's own side
  const selfDeprecation = [
    `${o} is weak`, `${o} is worse`, `${o} is inferior`,
    `${o} cannot compare`, `${o} lacks`, `${o} has failed`
  ];
  
  if (o.includes("messi")) {
    selfDeprecation.push("messi lacks", "messi failed", "messi is weak");
  }
  if (o.includes("ronaldo")) {
    selfDeprecation.push("ronaldo lacks", "ronaldo failed", "ronaldo is weak");
  }

  for (const w of selfDeprecation) {
    if (t.includes(w)) {
      console.log(`[Validation Check] Rebuttal contains self-deprecating keyword "${w}". Rejecting.`);
      return false;
    }
  }

  return true;
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
You are defending ${rival.toUpperCase()}.
Never support ${side.toUpperCase()}.
Never praise ${side.toUpperCase()}.
Always argue from the perspective of ${rival.toUpperCase()}.

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
    const loadedContextFile = `${rival.toLowerCase().trim()}.md`;
    const loadedEntity = rival;

    console.log("========================================");
    console.log("[DEBUG] Opponent Side Assignment Audit:");
    console.log(`- userSide: ${side}`);
    console.log(`- opponentSide: ${rival}`);
    console.log(`- loadedEntity: ${loadedEntity}`);
    console.log(`- loadedContextFile: ${loadedContextFile}`);
    console.log("========================================");

    console.log("Opponent Prompt Length:", prompt.length);
    console.log("Opponent Mapping Entity:", rival, "Routed Sections:", targetSections);
    console.log("Opponent Memory Summary:", { userTopics, opponentTopics });

    // 5. Generate response with self-validation and regeneration retry loop
    let finalRebuttal = "";
    let validated = false;
    let attempts = 0;

    while (!validated && attempts < 3) {
      attempts++;
      finalRebuttal = await defaultModelProvider.generateText(prompt, []);
      validated = validateOpponentResponse(finalRebuttal, side, rival);
      if (!validated) {
        console.log(`[Validation Failed] Attempt ${attempts} generated: "${finalRebuttal}". Regenerating...`);
      }
    }

    if (!validated) {
      console.log("[Validation Fallback] Forcing safe fallback statement.");
      if (rival.toLowerCase().includes("messi")) {
        finalRebuttal = "Messi is the ultimate playmaker. Copa America and World Cup glory proves his unmatched legacy.";
      } else if (rival.toLowerCase().includes("ronaldo")) {
        finalRebuttal = "Cristiano Ronaldo's scoring records and athletic dominance make him the absolute best in football history.";
      } else if (rival.toLowerCase().includes("mbappe")) {
        finalRebuttal = "Kylian Mbappe's speed and World Cup final records put him far ahead of the competition.";
      } else if (rival.toLowerCase().includes("haaland")) {
        finalRebuttal = "Erling Haaland's cyborg goalscoring rate and Premier League goal records are unbeatable.";
      } else if (rival.toLowerCase().includes("argentina")) {
        finalRebuttal = "Argentina is the reigning World Cup champion and Copa America winner. Our record is absolute.";
      } else if (rival.toLowerCase().includes("brazil")) {
        finalRebuttal = "Brazil has won five World Cups and produced the greatest legends in history. The pentachampions are supreme.";
      } else {
        finalRebuttal = `${rival} has the superior records, performance statistics, and historical achievements.`;
      }
    }

    console.log(`[Validation Success] Selected Rebuttal (Attempt ${attempts}): "${finalRebuttal}"`);

    // Stream the validated response chunk by chunk to maintain UI compatibility
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
        "Connection": "keep-alive",
        "x-prompt-length": prompt.length.toString(),
        "x-retrieval-length": context.length.toString(),
        "x-retrieved-snippets": encodeURIComponent(context.slice(0, 150)),
        "x-opponent-intent": "DEBATE_REBUTTAL",
        "x-selected-file": loadedContextFile,
        "x-selected-section": targetSections.join(", ")
      }
    });

  } catch (error: unknown) {
    const errorMsg = error instanceof Error ? error.message : String(error);
    console.error("[API/Agent/Opponent] Error:", errorMsg);
    return NextResponse.json({ error: errorMsg }, { status: 500 });
  }
}
