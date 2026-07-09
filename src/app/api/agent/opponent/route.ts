import { NextResponse } from "next/server";
import { defaultModelProvider, DebateMessage } from "@/lib/qvac";
import { DEBATE_DATABASE } from "@/lib/debateDb";

const ALL_CATEGORIES = [
  "goals", "awards", "world_cup", "champions_league", "dribbling", "playmaking",
  "passing", "assists", "leadership", "longevity", "league_adaptability",
  "clutch_performances", "international_performance", "trophies", "records",
  "consistency", "team_dependency", "physicality", "mentality", "peak_performance",
  "early_career", "academy_development", "youth_talent", "natural_ability", 
  "fanbase", "influence", "popularity", "legacy", "career_start", "potential", 
  "football_iq", "skill", "vision", "creativity", "technique"
];

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
 * Classifies a user's argument into one of the 35 debate categories.
 * Deterministic regex/phrase keyword matching.
 */
function classifyArgument(text: string): string {
  const clean = text.toLowerCase();
  
  // Specific debuts, starts, early careers
  if (clean.includes("debut") || clean.includes("early") || clean.includes("young") || clean.includes("start") || clean.includes("teenager") || clean.includes("age of")) return "early_career";
  if (clean.includes("academy") || clean.includes("la masia") || clean.includes("sporting cp") || clean.includes("monaco") || clean.includes("salzburg") || clean.includes("youth")) return "academy_development";
  if (clean.includes("talent") || clean.includes("prodigy") || clean.includes("wonderkid")) return "youth_talent";
  if (clean.includes("natural") || clean.includes("gift") || clean.includes("born with")) return "natural_ability";
  if (clean.includes("fanbase") || clean.includes("fans") || clean.includes("followers")) return "fanbase";
  if (clean.includes("influence") || clean.includes("impact") || clean.includes("cultural")) return "influence";
  if (clean.includes("popular") || clean.includes("popularity") || clean.includes("famous")) return "popularity";
  if (clean.includes("legacy") || clean.includes("history books") || clean.includes("remembered")) return "legacy";
  if (clean.includes("potential") || clean.includes("ceiling") || clean.includes("future")) return "potential";
  if (clean.includes("iq") || clean.includes("intelligence") || clean.includes("smart") || clean.includes("reading the game")) return "football_iq";
  if (clean.includes("skill") || clean.includes("skills") || clean.includes("tricks")) return "skill";
  if (clean.includes("vision") || clean.includes("see the pass") || clean.includes("eye for")) return "vision";
  if (clean.includes("create") || clean.includes("creative") || clean.includes("creativity")) return "creativity";
  if (clean.includes("technique") || clean.includes("technical") || clean.includes("touch")) return "technique";

  // General core categories
  if (clean.includes("world cup") || clean.includes("worldcup") || clean.includes(" wc ") || clean.includes("qatar")) return "world_cup";
  if (clean.includes("champions league") || clean.includes("ucl") || clean.includes("european cup")) return "champions_league";
  if (clean.includes("ballon") || clean.includes("award") || clean.includes("best player") || clean.includes("golden ball") || clean.includes("fifa best") || clean.includes("laureus")) return "awards";
  if (clean.includes("golden boot") || clean.includes("goal") || clean.includes("goals") || clean.includes("scorer") || clean.includes("scoring") || clean.includes("score") || clean.includes("shoot")) return "goals";
  if (clean.includes("assist") || clean.includes("assists") || clean.includes("setup")) return "assists";
  if (clean.includes("dribble") || clean.includes("dribbling") || clean.includes("run") || clean.includes("takeon")) return "dribbling";
  if (clean.includes("playmake") || clean.includes("playmaker") || clean.includes("chance")) return "playmaking";
  if (clean.includes("pass") || clean.includes("passing") || clean.includes("cross")) return "passing";
  if (clean.includes("leader") || clean.includes("captain") || clean.includes("lead") || clean.includes("leadership")) return "leadership";
  if (clean.includes("longevity") || clean.includes("age") || clean.includes("years") || clean.includes("old") || clean.includes("season count")) return "longevity";
  if (clean.includes("league") || clean.includes("adapt") || clean.includes("country") || clean.includes("countries") || clean.includes("different club")) return "league_adaptability";
  if (clean.includes("clutch") || clean.includes("final") || clean.includes("knockout") || clean.includes("big game") || clean.includes("decisive")) return "clutch_performances";
  if (clean.includes("national team") || clean.includes("copa") || clean.includes("euro")) return "international_performance";
  if (clean.includes("trophy") || clean.includes("trophies") || clean.includes("cup") || clean.includes("titles") || clean.includes("won")) return "trophies";
  if (clean.includes("record") || clean.includes("records") || clean.includes("all-time")) return "records";
  if (clean.includes("consistent") || clean.includes("consistency") || clean.includes("every year")) return "consistency";
  if (clean.includes("system") || clean.includes("xavi") || clean.includes("iniesta") || clean.includes("teammate") || clean.includes("team-dependent") || clean.includes("dependency")) return "team_dependency";
  if (clean.includes("physical") || clean.includes("specimen") || clean.includes("height") || clean.includes("jump") || clean.includes("pace") || clean.includes("speed") || clean.includes("athlete")) return "physicality";
  if (clean.includes("mentality") || clean.includes("discipline") || clean.includes("work ethic") || clean.includes("willpower")) return "mentality";
  if (clean.includes("peak") || clean.includes("prime") || clean.includes("best season") || clean.includes("2012")) return "peak_performance";
  
  return "general";
}

/**
 * Maps entity name string to debate database key.
 */
function resolveEntityKey(name: string): string {
  const clean = name.toLowerCase();
  if (clean.includes("ronaldo")) return "ronaldo";
  if (clean.includes("messi")) return "messi";
  if (clean.includes("mbappe") || clean.includes("mbappé")) return "mbappe";
  if (clean.includes("haaland")) return "haaland";
  if (clean.includes("argentina")) return "argentina";
  if (clean.includes("brazil")) return "brazil";
  return "ronaldo";
}

/**
 * Trims a response to a maximum word count at the nearest sentence boundary.
 */
function trimToWordLimit(text: string, maxWords = 120): string {
  const words = text.trim().split(/\s+/);
  if (words.length <= maxWords) return text.trim();
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
 * Programmatic Stance Cross-Contamination Guard.
 * Ensures the stats, academies, or achievements of one side are never credited to the other side.
 */
function checkStanceCrossContamination(text: string, userSide: string, opponentSide: string): boolean {
  const t = text.toLowerCase();
  const o = opponentSide.toLowerCase();

  // If defending Ronaldo (opponentSide is Ronaldo)
  if (o.includes("ronaldo")) {
    const messiNames = ["messi", "lionel", "leo"];
    const ronaldoStats = [
      "890", "900", "140 goal", "140-goal", "champions league 5", "5 champions league", 
      "5 ucl", "ucl 5", "saudi", "35 goal", "age 39", "39 year", "consecutive world cup", 
      "consecutive world cups", "5 consecutive", "euro 2016", "nations league", 
      "manchester united", "sporting cp", "real madrid", "serie a", "juventus"
    ];
    // Check if any Messi name and Ronaldo stat appear in the same sentence
    const sentences = t.split(/[.!?]+/);
    for (const s of sentences) {
      const hasMessi = messiNames.some(name => s.includes(name));
      const hasRonaldoStat = ronaldoStats.some(stat => s.includes(stat));
      if (hasMessi && hasRonaldoStat) {
        console.log(`[Stance Validation] Crossed association: Messi is linked with Ronaldo stat in: "${s.trim()}"`);
        return false;
      }
    }
  }

  // If defending Messi (opponentSide is Messi)
  if (o.includes("messi")) {
    const ronaldoNames = ["ronaldo", "cristiano", "cr7"];
    const messiStats = [
      "8 ballon", "8 ballons", "eight ballon", "91 goal", "91 in 2012", "calendar year", 
      "6 european golden", "6 golden shoe", "2022 world cup", "world cup golden ball", 
      "44 team troph", "44 major", "44 troph", "most decorated", "barcelona", 
      "la masia", "copa america", "copa américa", "inter miami", "mls"
    ];
    const sentences = t.split(/[.!?]+/);
    for (const s of sentences) {
      const hasRonaldo = ronaldoNames.some(name => s.includes(name));
      const hasMessiStat = messiStats.some(stat => s.includes(stat));
      if (hasRonaldo && hasMessiStat) {
        console.log(`[Stance Validation] Crossed association: Ronaldo is linked with Messi stat in: "${s.trim()}"`);
        return false;
      }
    }
  }

  // If defending Mbappe (opponentSide is Mbappe)
  if (o.includes("mbappe") || o.includes("mbappé")) {
    const haalandNames = ["haaland", "erling"];
    const mbappeStats = [
      "world cup at 19", "monaco", "psg", "hat-trick", "4 goal", "france", "nations league"
    ];
    const sentences = t.split(/[.!?]+/);
    for (const s of sentences) {
      const hasHaaland = haalandNames.some(name => s.includes(name));
      const hasMbappeStat = mbappeStats.some(stat => s.includes(stat));
      if (hasHaaland && hasMbappeStat) {
        console.log(`[Stance Validation] Crossed association: Haaland is linked with Mbappe stat in: "${s.trim()}"`);
        return false;
      }
    }
  }

  // If defending Haaland (opponentSide is Haaland)
  if (o.includes("haaland")) {
    const mbappeNames = ["mbappe", "mbappé", "kylian"];
    const haalandStats = [
      "single-season", "36 goal", "treble", "dortmund", "salzburg", "norway", "gerd muller"
    ];
    const sentences = t.split(/[.!?]+/);
    for (const s of sentences) {
      const hasMbappe = mbappeNames.some(name => s.includes(name));
      const hasHaalandStat = haalandStats.some(stat => s.includes(stat));
      if (hasMbappe && hasHaalandStat) {
        console.log(`[Stance Validation] Crossed association: Mbappe is linked with Haaland stat in: "${s.trim()}"`);
        return false;
      }
    }
  }

  // If defending Argentina (opponentSide is Argentina)
  if (o.includes("argentina")) {
    const brazilNames = ["brazil", "brazilian"];
    const argentinaStats = [
      "3 star", "3 world cup", "reigning champion", "unbeaten streak", "36-game", 
      "romero", "otamendi", "scaloni", "martinez", "martínez"
    ];
    const sentences = t.split(/[.!?]+/);
    for (const s of sentences) {
      const hasBrazil = brazilNames.some(name => s.includes(name));
      const hasArgentinaStat = argentinaStats.some(stat => s.includes(stat));
      if (hasBrazil && hasArgentinaStat) {
        console.log(`[Stance Validation] Crossed association: Brazil is linked with Argentina stat in: "${s.trim()}"`);
        return false;
      }
    }
  }

  // If defending Brazil (opponentSide is Brazil)
  if (o.includes("brazil")) {
    const argentinaNames = ["argentina", "argentine"];
    const brazilStats = [
      "5 world cup", "5 time", "five world cup", "samba", "jogo bonito", 
      "pele", "pelé", "neymar", "ronaldinho", "cafu", "thiago silva"
    ];
    const sentences = t.split(/[.!?]+/);
    for (const s of sentences) {
      const hasArgentina = argentinaNames.some(name => s.includes(name));
      const hasBrazilStat = brazilStats.some(stat => s.includes(stat));
      if (hasArgentina && hasBrazilStat) {
        console.log(`[Stance Validation] Crossed association: Argentina is linked with Brazil stat in: "${s.trim()}"`);
        return false;
      }
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

  // 1. Word Count Boundary Check (Target 40-80 words, hard max 95 words)
  const wordCount = text.trim().split(/\s+/).length;
  if (wordCount < 25 || wordCount > 95) {
    console.log(`[Validation] Word count out of bounds (${wordCount} words). Rejecting.`);
    return false;
  }

  // 1.5 Stance locking validation check
  if (!checkStanceCrossContamination(text, userSide, opponentSide)) {
    return false;
  }

  // 2. Entity name locks & alias checks
  if (!validateEntityNames(text, opponentSide)) {
    return false;
  }

  // 3. Third person lock (no player roleplay)
  if (!validateThirdPerson(text)) {
    return false;
  }

  // 4. Dynamic vocabulary memory check
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
 * Evaluates the relevance of the rebuttal to the user's statement.
 * Rates how directly the rebuttal addresses and refutes the user.
 * Returns a score from 0 to 10.
 */
async function getRelevanceScore(argument: string, rebuttal: string): Promise<number> {
  const checkPrompt = `You are a debate judge. Rate how directly the rebuttal addresses and refutes the user's statement.
User Statement: "${argument}"
Rebuttal: "${rebuttal}"

Output ONLY an integer score from 0 (ignores the user's point completely) to 10 (directly refutes the user's point). Do not write anything else.`;
  try {
    const rawScore = await defaultModelProvider.generateText(checkPrompt, []);
    const parsedScore = parseInt(rawScore.trim().replace(/[^0-9]/g, ""), 10);
    return isNaN(parsedScore) ? 8 : parsedScore;
  } catch (err) {
    console.error("[Relevance Judge] Evaluation error:", err);
    return 8; // Fail-open on network/inference error
  }
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
    
    const rivalKey = resolveEntityKey(oName);

    // 3. Argument Classification Layer
    let category = classifyArgument(argument);
    console.log(`[Debate Engine] Classified User argument as category: "${category}"`);

    // Fallback Semantic Routing
    if (category === "general") {
      console.log("[Debate Engine] Keyword classifier returned 'general'. Running semantic classifier fallback...");
      const classPrompt = `Classify this football debate argument into exactly one of these categories:
Categories: [${ALL_CATEGORIES.join(", ")}]

Argument: "${argument}"

Output ONLY the category name matching one of the options above. Do not write anything else.`;
      try {
        const rawCat = await defaultModelProvider.generateText(classPrompt, []);
        const parsedCat = rawCat.trim().toLowerCase().replace(/[^a-z_]/g, "");
        if (ALL_CATEGORIES.includes(parsedCat)) {
          category = parsedCat;
          console.log(`[Debate Engine] Semantic classifier mapped argument to: "${category}"`);
        } else {
          console.log(`[Debate Engine] Semantic classifier returned invalid category "${parsedCat}". Mapping to general fallback.`);
        }
      } catch (err) {
        console.error("[Debate Engine] Semantic classification failed:", err);
      }
    }

    // 4. Memory-based Category Selection (no reuse within last 3 turns)
    const recentCategories = opponentTopics ? opponentTopics.slice(-3) : [];
    if (category === "general" || recentCategories.includes(category)) {
      const available = ALL_CATEGORIES.filter(cat => !recentCategories.includes(cat));
      if (available.length > 0) {
        category = available[0];
        console.log(`[Debate Engine] Argument Memory clash or general fallback. Routed to category: "${category}"`);
      } else {
        category = "goals";
      }
    }

    // 5. Debate Database Retrieval (Deterministic facts/counterpoints loading)
    const profile = DEBATE_DATABASE[rivalKey];
    const point = profile ? profile[category] : null;
    
    const counterpoint = point ? point.counterpoint : `${oName} has superior statistics and trophies.`;
    const supportingFact = point ? point.supportingFact : `${oName} is the greatest in international history.`;
    const totalContextLength = counterpoint.length + supportingFact.length;

    // 6. Argument vocabulary memory to prevent reuse of key words within previous 3 turns
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

    // 7. Redesigned System Prompt - Sarcastic, Short Debate Rebuttal
    const prompt = `You are a biased, cocky, and highly sarcastic football supporter of ${oName}. You are in a heated debate with a delusional fan of ${uName}.
Your sole mission is to shut down the user's claims immediately with quick, direct banter. Speak like a fan in a heated social media debate, not a sports journalist.

REQUIRED STATEMENTS (You MUST base your response on these exact points):
- Rebut the user's claim using this argument: "${counterpoint}"
- Defend your side using this positive fact: "${supportingFact}"

The user said: "${argument}"

Respond with ONE short, sharp, and highly sarcastic paragraph (40-80 words, 2-4 sentences max).

RULES:
1. You must start your response by directly refuting the user's statement. Be sarcastic and quick. Do not give any filler or introduction.
2. Directly follow the rebuttal with a transition to explain why ${oName} is superior using the required positive fact.
3. Keep the entire response between 40 and 80 words (Hard maximum 90 words).
4. Speak strictly in the third person ("he", "his", "${oName}"). Never roleplay as the player (no "I scored", "my goals", or "we won").
5. Never concede, agree, or say things like "good point", "that is true", or "fair point".
6. Do NOT write fake quotes, fake interviews, or fake speeches (never say "Cristiano Ronaldo says...").
7. Write only one paragraph. No bullet points, headers, or extra sentences.
8. STANCE LOCKING: You must NEVER associate the achievements, statistics, or clubs of ${oName} (such as: "${counterpoint}" or "${supportingFact}") with ${uName}. They belong solely to ${oName}. Do not state that ${uName} achieved them.`;

    // Debug
    console.log("========================================");
    console.log("[DEBUG] Opponent Side Assignment:");
    console.log(`- userSide: ${side} | opponentSide: ${rival}`);
    console.log(`- category: ${category}`);
    console.log(`- counterpoint: ${counterpoint}`);
    console.log(`- fact: ${supportingFact}`);
    console.log("========================================");
    console.log("Opponent Prompt Length:", prompt.length);

    // 8. Generate with validation and generative correction loop
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
        const correctionPrompt = `You wrote a draft debate rebuttal defending ${oName} against ${uName} that violated rules by conceding points, speaking in the first person, using incorrect names, repeating negative critiques, attributing ${oName}'s stats to ${uName}, or being too long.
Draft: "${finalRebuttal}"

Required counterpoint to include: "${counterpoint}"
Required fact to include: "${supportingFact}"

Rewrite the draft completely to be 100% loyal to ${oName}, biased, and written in the third person. Make it highly sarcastic, direct, and very short (40-80 words, 2-4 sentences max). Ensure you never attribute ${oName}'s stats, goals, or trophies to ${uName}. Do not explain your changes, just output the corrected paragraph.`;
        raw = await defaultModelProvider.generateText(correctionPrompt, []);
      }
      
      finalRebuttal = trimToWordLimit(raw, 95);
      const basicValid = validateOpponentResponse(finalRebuttal, side, rival, dynamicForbidden);
      
      if (basicValid) {
        console.log(`[Relevance Judge] Assessing relevance score for: "${finalRebuttal}"`);
        const relevanceScore = await getRelevanceScore(argument, finalRebuttal);
        console.log(`[Relevance Judge] Score: ${relevanceScore}/10`);
        if (relevanceScore >= 7) {
          validated = true;
        } else {
          console.log(`[Relevance Failed] Score ${relevanceScore} is below threshold 7. Regenerating.`);
        }
      } else {
        console.log(`[Validation Failed] Basic filters failed on attempt ${attempts}.`);
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
        "x-retrieved-snippets": encodeURIComponent(counterpoint.slice(0, 150)),
        "x-opponent-intent": "DEBATE_REBUTTAL",
        "x-selected-file": category,
        "x-selected-section": "debateDb"
      }
    });

  } catch (error: unknown) {
    const errorMsg = error instanceof Error ? error.message : String(error);
    console.error("[API/Agent/Opponent] Error:", errorMsg);
    return NextResponse.json({ error: errorMsg }, { status: 500 });
  }
}
