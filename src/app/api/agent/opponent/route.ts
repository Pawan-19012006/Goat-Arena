import { NextResponse } from "next/server";
import { defaultModelProvider, DebateMessage } from "@/lib/qvac";
import { getEntityMultiSectionContext } from "@/lib/retrieval";

/**
 * Returns forbidden self-criticism keywords for an entity.
 * If the opponent is defending this entity, they are prohibited from using these words,
 * which prevents them from repeating or validating user criticisms.
 */
function getForbiddenKeywords(entityName: string): string[] {
  const normalized = entityName.toLowerCase().trim();
  if (normalized.includes("messi")) {
    return ["collapse", "system", "work rate", "pressing", "press", "hormone", "psg", "inter miami"];
  }
  if (normalized.includes("ronaldo")) {
    return ["press", "pressing", "dribble", "wingers", "service", "penalty", "penalties", "inflated", "world cup knockout", "no world cup"];
  }
  if (normalized.includes("mbappe") || normalized.includes("mbappé")) {
    return ["ballon", "champions league", "ucl title", "not won ucl", "ligue 1", "farmers"];
  }
  if (normalized.includes("haaland")) {
    return ["service", "poacher", "ghost", "big game", "norway", "world cup"];
  }
  if (normalized.includes("argentina")) {
    return ["penalty", "penalties", "referee", "fifa help", "drought", "28 years"];
  }
  if (normalized.includes("brazil")) {
    return ["drought", "germany", "7-1", "7 - 1", "neymar", "overrated"];
  }
  return [];
}

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
/**
 * Ensures name consistency, preventing hallucinated mutations like Rodrigo or Ronaldinho.
 */
function validateEntityNames(text: string, opponentSide: string): boolean {
  const t = text.toLowerCase();
  const o = opponentSide.toLowerCase().trim();

  // If opponent is Ronaldo
  if (o.includes("ronaldo")) {
    const wrongRonaldoNames = ["rodrigo", "ronaldinho", "ronalds", "cristiano rodrigo", "cristiano ronaldinho"];
    for (const wrong of wrongRonaldoNames) {
      if (t.includes(wrong)) {
        console.log(`[Entity Validation] Invalid name mutation "${wrong}". Rejecting.`);
        return false;
      }
    }
    // Check if "cristiano" is followed by a wrong word
    const words = t.replace(/[.,\/#!$%\^&\*;:{}=\-_`~()?]/g, " ").split(/\s+/);
    for (let i = 0; i < words.length; i++) {
      if (words[i] === "cristiano") {
        const nextWord = words[i + 1];
        if (nextWord && nextWord !== "ronaldo" && nextWord !== "ronaldo's" && nextWord !== "is" && nextWord !== "has" && nextWord !== "scored" && nextWord !== "won" && nextWord !== "plays" && nextWord !== "and" && nextWord !== "the" && nextWord !== "in") {
          console.log(`[Entity Validation] Invalid name combo "cristiano ${nextWord}". Rejecting.`);
          return false;
        }
      }
    }
  }

  // If opponent is Messi
  if (o.includes("messi")) {
    const wrongMessiNames = ["messinho", "scaloni", "lionel rodrigo", "lionel ronaldinho"];
    for (const wrong of wrongMessiNames) {
      if (t.includes(wrong)) {
        console.log(`[Entity Validation] Invalid name mutation "${wrong}". Rejecting.`);
        return false;
      }
    }
  }

  return true;
}

/**
 * Validates that the agent speaks strictly in the third person.
 * Prevents the AI opponent from roleplaying as the player ("my goals", "I won").
 */
function validateThirdPerson(text: string): boolean {
  const t = text.toLowerCase();

  // List of first-person roleplay indicators
  const roleplayPhrases = [
    "i scored", "i won", "i have won", "i have scored", "i created", "i dribbled", "i did",
    "my goals", "my trophies", "my champions", "my ballon", "my world cup", 
    "my leagues", "my stats", "my career", "my playing", "my playstyle", "my teammate",
    "i am the greatest", "i am the goat", "i am better", "i am the best",
    "i am superior", "i'm the greatest", "i'm the goat", "i'm the best", "i'm superior",
    "my coach", "my manager", "my ucl", "my records", "teammates with me"
  ];

  for (const phrase of roleplayPhrases) {
    if (t.includes(phrase)) {
      console.log(`[Perspective Validation] First-person roleplay phrase detected: "${phrase}". Rejecting.`);
      return false;
    }
  }

  return true;
}

/**
 * Checks if the generated text praises the user's side, criticizes the opponent's own side,
 * or contains soft concessions / self-deprecating first-person phrases.
 */
function validateOpponentResponse(
  text: string, 
  userSide: string, 
  opponentSide: string,
  dynamicForbidden: string[] = []
): boolean {
  const t = text.toLowerCase().trim();
  const u = userSide.toLowerCase().replace("team ", "").trim();
  const o = opponentSide.toLowerCase().replace("team ", "").trim();

  // 1. Entity name locks & alias checks
  if (!validateEntityNames(text, opponentSide)) {
    return false;
  }

  // 2. Third person lock (no player roleplay)
  if (!validateThirdPerson(text)) {
    return false;
  }

  // 3. Dynamic vocabulary memory check (no repeating key arguments within previous 3 turns)
  for (const word of dynamicForbidden) {
    if (t.includes(word)) {
      console.log(`[Repetition Validation] Re-use of recently used key reasoning word "${word}". Rejecting.`);
      return false;
    }
  }

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

  // Forbidden self-criticism keywords check
  const forbidden = getForbiddenKeywords(o);
  for (const w of forbidden) {
    if (t.includes(w)) {
      console.log(`[Validation] Forbidden self-criticism keyword "${w}" in response. Rejecting.`);
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
    const { side, rival, argument, opponentTopics, history } = await request.json() as {
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

    // 2. Resolve names
    const uName = side.replace("TEAM ", "").trim();
    const oName = rival.replace("TEAM ", "").trim();

    // Determine relevant sections to pull for positive context (defense) and negative context (attack)
    const argLower = argument.toLowerCase();
    
    let opponentDefendSections = ["Strengths", "Debate Points"];
    let userAttackSections = ["Counter Points", "Weaknesses"];

    if (argLower.includes("defense") || argLower.includes("squad") || argLower.includes("depth") || argLower.includes("tactic") || argLower.includes("bench") || argLower.includes("manager") || argLower.includes("coach")) {
      opponentDefendSections = ["Tactics", "Strengths"];
    } else if (argLower.includes("goal") || argLower.includes("score") || argLower.includes("record") || argLower.includes("stat") || argLower.includes("assist") || argLower.includes("number")) {
      opponentDefendSections = ["Records", "Strengths"];
      userAttackSections = ["Weaknesses", "Counter Points"];
    } else if (argLower.includes("trophy") || argLower.includes("won") || argLower.includes("achiev") || argLower.includes("award") || argLower.includes("ballon") || argLower.includes("cup") || argLower.includes("copa") || argLower.includes("title") || argLower.includes("ucl") || argLower.includes("champions league")) {
      opponentDefendSections = ["Achievements", "Records"];
      userAttackSections = ["Counter Points", "Weaknesses"];
    } else if (argLower.includes("history") || argLower.includes("origin") || argLower.includes("born") || argLower.includes("founded")) {
      opponentDefendSections = ["History", "Origins"];
    } else if (argLower.includes("recent") || argLower.includes("form") || argLower.includes("current") || argLower.includes("season")) {
      opponentDefendSections = ["Recent Form", "Strengths"];
    }

    // Retrieve positive points for opponent and negative points for user.
    // SELF-WEAKNESS CONTEXT IS INTENTIONALLY EXCLUDED to avoid semantic leakage.
    const defendContext = await getEntityMultiSectionContext(oName, opponentDefendSections);
    const attackContext = await getEntityMultiSectionContext(uName, userAttackSections);
    const totalContextLength = defendContext.length + attackContext.length;

    // 3. Memory guard against repeating topics
    let repetitionGuard = "";
    if (opponentTopics && opponentTopics.length > 0) {
      repetitionGuard = `Do NOT repeat arguments about: ${opponentTopics.slice(-3).join(", ")}. Find a different angle.`;
    }

    // 4. Argument vocabulary memory to prevent reuse of key terms within previous 3 turns
    const dynamicForbidden: string[] = [];
    if (history && history.length > 0) {
      const assistantMsgs = history
        .filter(m => m.role === "assistant" || m.role === "system")
        .slice(-3); // inspect last 3 turns
      
      const combinedHistoryText = assistantMsgs.map(m => m.content.toLowerCase()).join(" ");
      
      if (combinedHistoryText.includes("goat")) dynamicForbidden.push("goat");
      if (combinedHistoryText.includes("king")) dynamicForbidden.push("king");
      if (combinedHistoryText.includes("greatest ever") || combinedHistoryText.includes("greatest of all time")) {
        dynamicForbidden.push("greatest ever", "greatest of all time");
      }
      if (combinedHistoryText.includes("champions league") || combinedHistoryText.includes("ucl")) {
        dynamicForbidden.push("champions league", "ucl");
      }
      if (combinedHistoryText.includes("ballon")) {
        dynamicForbidden.push("ballon");
      }
      if (combinedHistoryText.includes("world cup") || combinedHistoryText.includes("worldcup")) {
        dynamicForbidden.push("world cup", "worldcup");
      }
    }

    if (dynamicForbidden.length > 0) {
      console.log("[Repetition Memory] Forbidden words for this turn:", dynamicForbidden);
    }

    // 5. Redesigned System Prompt - Tribal, Biased Fan Persona + Third Person Locks
    const prompt = `You are a biased, cocky, and tribal supporter of ${oName}. You are debating a delusional fan of ${uName}.
Your sole mission is to defend ${oName} at all costs and mock the user's claims. Speak like a passionate stadium fan, not a sports journalist.

---
UNSHAKABLE FACTS PROVING ${oName} IS THE GOAT (Use these to build your case):
${defendContext || "Use your general knowledge of " + oName}

---
THE TRUTH ABOUT ${uName}'s WEAKNESSES AND FAILURES (Use these to mock and counter-attack):
${attackContext || "Use your general knowledge of " + uName}

---
The user said: "${argument}"

${repetitionGuard}

Respond with ONE confident, sarcastic paragraph (30-60 words). 
Dismiss the user's claim completely, target a weakness of ${uName}, and state one positive fact about ${oName} to secure victory.

RULES:
1. You are a passionate football fan defending ${oName}. Never roleplay as ${oName} or speak in the first person ("I", "my", "me" when referring to the player's achievements). Always speak in the third person ("he", "his", "${oName}").
2. Never criticize ${oName}, never admit their weaknesses, and never say anything negative about them.
3. Never agree with the user. Treat all criticism of ${oName} as absolute garbage.
4. Be sarcastic, cocky, and relentless. No balanced analysis. No professionalism.
5. No bullet points, no lists, no labels. Just one cohesive paragraph.
6. Speak like a stubborn football fan in a stadium debate.`;

    // Debug
    console.log("========================================");
    console.log("[DEBUG] Opponent Side Assignment:");
    console.log(`- userSide: ${side} | opponentSide: ${rival}`);
    console.log(`- defendSections: ${opponentDefendSections.join(", ")}`);
    console.log(`- attackSections: ${userAttackSections.join(", ")}`);
    console.log("========================================");
    console.log("Opponent Prompt Length:", prompt.length);

    // 6. Generate with validation and generative correction loop
    let finalRebuttal = "";
    let validated = false;
    let attempts = 0;

    while (!validated && attempts < 3) {
      attempts++;
      
      let raw = "";
      if (attempts === 1) {
        // Normal generation
        raw = await defaultModelProvider.generateText(prompt, []);
      } else {
        // Generative self-correction check request
        console.log(`[Validation Correction] Running generative rewrite attempt ${attempts}...`);
        const correctionPrompt = `You wrote a draft debate rebuttal defending ${oName} against ${uName} that violated rules by conceding points, speaking in the first person, using incorrect names, or repeating negative critiques of ${oName}.
Draft: "${finalRebuttal}"

Rewrite the draft completely to be 100% loyal, biased, and written in the third person (he/him/Ronaldo/Messi). Mock ${uName}'s failures, dismiss their criticisms of ${oName}, and assert ${oName}'s absolute superiority. Keep it under 60 words, one paragraph, no concessions, no self-criticisms. Do not explain your changes, just output the corrected paragraph.`;
        raw = await defaultModelProvider.generateText(correctionPrompt, []);
      }
      
      finalRebuttal = trimToWordLimit(raw, 80);
      validated = validateOpponentResponse(finalRebuttal, side, rival, dynamicForbidden);
      if (!validated) {
        console.log(`[Validation Failed] Attempt ${attempts}: "${finalRebuttal}".`);
      }
    }

    if (!validated) {
      console.log("[Validation Fallback] All attempts failed. Using safe fallback.");
      finalRebuttal = getFallbackRebuttal(rival);
    }

    console.log(`[Validation OK] Final Rebuttal: "${finalRebuttal}"`);

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
        "x-retrieval-length": totalContextLength.toString(),
        "x-retrieved-snippets": encodeURIComponent(defendContext.slice(0, 150)),
        "x-opponent-intent": "DEBATE_REBUTTAL",
        "x-selected-file": rival.toLowerCase().trim() + ".md",
        "x-selected-section": opponentDefendSections.join(", ")
      }
    });

  } catch (error: unknown) {
    const errorMsg = error instanceof Error ? error.message : String(error);
    console.error("[API/Agent/Opponent] Error:", errorMsg);
    return NextResponse.json({ error: errorMsg }, { status: 500 });
  }
}
