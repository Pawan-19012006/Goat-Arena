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

const RELATED_CATEGORIES: Record<string, string[]> = {
  goals: ["records", "clutch_performances", "consistency", "peak_performance", "trophies", "longevity"],
  awards: ["legacy", "popularity", "records", "trophies"],
  world_cup: ["clutch_performances", "international_performance", "trophies", "legacy"],
  champions_league: ["clutch_performances", "trophies", "records", "peak_performance"],
  dribbling: ["skill", "creativity", "technique", "natural_ability"],
  passing: ["assists", "playmaking", "football_iq", "creativity"],
  assists: ["playmaking", "passing", "creativity", "influence"],
  playmaking: ["passing", "assists", "vision", "creativity"],
  leadership: ["mentality", "consistency", "influence"],
  longevity: ["consistency", "records", "physicality"],
  league_adaptability: ["trophies", "consistency", "records"],
  clutch_performances: ["peak_performance", "trophies", "mentality"],
  international_performance: ["world_cup", "trophies", "legacy"],
  trophies: ["records", "legacy", "clutch_performances"],
  records: ["goals", "trophies", "longevity"],
  consistency: ["longevity", "mentality", "peak_performance"],
  team_dependency: ["league_adaptability", "consistency", "leadership"],
  physicality: ["peak_performance", "longevity", "mentality"],
  mentality: ["leadership", "consistency", "clutch_performances"],
  peak_performance: ["consistency", "goals", "records"],
  early_career: ["career_start", "academy_development", "youth_talent"],
  academy_development: ["early_career", "youth_talent", "natural_ability"],
  youth_talent: ["potential", "natural_ability", "early_career"],
  natural_ability: ["skill", "technique", "potential"],
  fanbase: ["popularity", "influence", "legacy"],
  influence: ["fanbase", "popularity", "legacy"],
  popularity: ["fanbase", "influence", "legacy"],
  legacy: ["records", "trophies", "influence"],
  career_start: ["early_career", "potential"],
  potential: ["youth_talent", "natural_ability", "potential"],
  football_iq: ["vision", "creativity", "skill"],
  skill: ["technique", "dribbling", "creativity"],
  vision: ["passing", "playmaking", "football_iq"],
  creativity: ["playmaking", "dribbling", "skill"],
  technique: ["skill", "dribbling", "passing"]
};

const FALLBACK_POOL: Record<string, string[]> = {
  ronaldo: [
    "Cristiano Ronaldo has scored over 890 goals and won the Champions League 5 times across 3 different clubs. That adaptability is unmatched.",
    "Ronaldo is the all-time top scorer in Champions League history with 140 goals and the greatest international goalscorer of all time with 130+ goals.",
    "Individual voting awards are subjective media popularity contests. Ronaldo's 5 Ballon d'Ors across two different leagues prove his absolute peak dominance.",
    "Ronaldo has scored 67 Champions League knockout stage goals, proving himself as the most clutch big-game player in football history.",
    "At age 39, Ronaldo won the domestic league Golden Boot with 35 goals in a single season. His longevity is unparalleled in the modern era."
  ],
  messi: [
    "Lionel Messi's 8 Ballon d'Or awards and the 2022 World Cup define the greatest footballer of all time. No one else comes close to that combination.",
    "Messi registered 91 goals in a single calendar year (2012) and holds the record for the most assists in football history with over 360 assists.",
    "Messi has won 44 major team trophies, making him the most decorated footballer in the history of the sport.",
    "Messi's playmaking assists and dribbling statistics are mathematically twice as efficient as any other modern player.",
    "With two World Cup Golden Balls, a Copa América trophy, and back-to-back international titles, Messi has completed football at every level."
  ],
  mbappe: [
    "Mbappé won the World Cup at 19 and scored a hat-trick in a World Cup final. His big-game impact is unmatched by anyone at his age.",
    "Mbappé holds the record for the most goals in PSG history and has won domestic league titles consecutively with Monaco and Paris.",
    "Mbappé's explosive speed and clinical finishing makes him the most lethal transition threat in modern football.",
    "Mbappé won the Golden Boot at the 2022 World Cup and has consistently dominated European knockout stages.",
    "Mbappé's combination of World Cup glory and Champions League goal rate makes him the heir to the football throne."
  ],
  haaland: [
    "Haaland scored 52 goals in a single Premier League season, breaking the all-time goalscoring record in his debut campaign.",
    "Haaland won the continental treble with Manchester City while finishing as the top scorer in both the Premier League and Champions League.",
    "Haaland has the highest goals-per-minute ratio in UEFA Champions League history, proving his clinical nature.",
    "Haaland's physical dominance and elite box positioning makes him the ultimate goal-scoring machine of this generation.",
    "Haaland scored 9 goals in a single U-20 World Cup match, showing his lethal instinct early in his career."
  ],
  brazil: [
    "Brazil's 5 World Cup titles and the legacy of Pelé, Ronaldo, Ronaldinho, and Neymar makes them the greatest football nation in history.",
    "Brazil is the only nation to have played in every single World Cup tournament and has produced the most iconic superstars of the game.",
    "The legendary Jogo Bonito style developed by Brazil defined the artistic standard of modern football.",
    "Brazil won consecutive World Cups in 1958 and 1962, a feat that has rarely been matched in football history.",
    "Brazil's historical Copa América dominance and legacy of individual skills makes their football heritage unmatched."
  ],
  argentina: [
    "Argentina are the reigning World Cup champions with 3 titles, 16 Copa Américas, and Messi — the greatest player ever.",
    "Argentina won back-to-back Copa Américas and the World Cup, maintaining the absolute number one FIFA ranking.",
    "Argentina's defensive stability under Scaloni led to a historic 36-game unbeaten run, one of the longest in football history.",
    "Argentina has produced the most passionate fans, legendary icons like Maradona and Messi, and pure footballing heritage.",
    "Argentina's tactical flexibility and big-game mentality enabled them to dominate the international football scene completely."
  ]
};

/**
 * Returns forbidden self-criticism keywords for an entity.
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
 * Helper to identify if text contains word as a standalone word (whole-word boundary check).
 */
function hasWholeWord(text: string, word: string): boolean {
  const escaped = word.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
  const regex = new RegExp(`\\b${escaped}\\b`, 'i');
  return regex.test(text);
}

/**
 * Helper to sanitize strings for duplicate comparisons
 */
function sanitizeForDuplicateCheck(text: string): string {
  return text
    .toLowerCase()
    .replace(/[.,\/#!$%\^&\*;:{}=\-_`~()?]/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

/**
 * Classifies a user's argument into one of the 35 debate categories.
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
 * Validates if the user's message is a simple greeting or filler.
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
 * Ensures name consistency.
 */
function validateEntityNames(text: string, opponentSide: string): boolean {
  const t = text.toLowerCase();
  const o = opponentSide.toLowerCase().trim();

  if (o.includes("ronaldo")) {
    const wrongRonaldoNames = ["rodrigo", "ronaldinho", "ronalds", "cristiano rodrigo", "cristiano ronaldinho"];
    for (const wrong of wrongRonaldoNames) {
      if (t.includes(wrong)) {
        console.log(`[Entity Validation] Invalid name mutation "${wrong}". Rejecting.`);
        return false;
      }
    }
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
 * Validates third person narration.
 */
function validateThirdPerson(text: string): boolean {
  const t = text.toLowerCase();
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
 */
function checkStanceCrossContamination(text: string, userSide: string, opponentSide: string): boolean {
  const t = text.toLowerCase();
  const o = opponentSide.toLowerCase();

  // Ronaldo Opponent Stance Validation
  if (o.includes("ronaldo")) {
    const messiNames = ["messi", "lionel", "leo"];
    const ronaldoStats = [
      "890", "900", "140 goal", "140-goal", "champions league 5", "5 champions league", 
      "5 ucl", "ucl 5", "saudi", "35 goal", "age 39", "39 year", "consecutive world cup", 
      "consecutive world cups", "5 consecutive", "euro 2016", "nations league", 
      "manchester united", "sporting cp", "real madrid", "serie a", "juventus"
    ];
    const sentences = t.split(/[.!?]+/);
    for (const s of sentences) {
      const hasMessi = messiNames.some(name => s.includes(name));
      const hasRonaldoStat = ronaldoStats.some(stat => s.includes(stat));
      if (hasMessi && hasRonaldoStat) {
        const hasRonaldoName = ["ronaldo", "cristiano", "cr7"].some(name => s.includes(name));
        if (!hasRonaldoName) {
          console.log(`[Stance Validation] Crossed association: Messi is linked with Ronaldo stat in: "${s.trim()}"`);
          return false;
        }
      }
    }
  }

  // Messi Opponent Stance Validation
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
        const hasMessiName = ["messi", "lionel", "leo"].some(name => s.includes(name));
        if (!hasMessiName) {
          console.log(`[Stance Validation] Crossed association: Ronaldo is linked with Messi stat in: "${s.trim()}"`);
          return false;
        }
      }
    }
  }

  // Mbappe Opponent Stance Validation
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
        const hasMbappeName = ["mbappe", "mbappé", "kylian"].some(name => s.includes(name));
        if (!hasMbappeName) {
          console.log(`[Stance Validation] Crossed association: Haaland is linked with Mbappe stat in: "${s.trim()}"`);
          return false;
        }
      }
    }
  }

  // Haaland Opponent Stance Validation
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
        const hasHaalandName = ["haaland", "erling"].some(name => s.includes(name));
        if (!hasHaalandName) {
          console.log(`[Stance Validation] Crossed association: Mbappe is linked with Haaland stat in: "${s.trim()}"`);
          return false;
        }
      }
    }
  }

  // Argentina Opponent Stance Validation
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
        const hasArgentinaName = ["argentina", "argentine"].some(name => s.includes(name));
        if (!hasArgentinaName) {
          console.log(`[Stance Validation] Crossed association: Brazil is linked with Argentina stat in: "${s.trim()}"`);
          return false;
        }
      }
    }
  }

  // Brazil Opponent Stance Validation
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
        const hasBrazilName = ["brazil", "brazilian"].some(name => s.includes(name));
        if (!hasBrazilName) {
          console.log(`[Stance Validation] Crossed association: Argentina is linked with Brazil stat in: "${s.trim()}"`);
          return false;
        }
      }
    }
  }

  return true;
}

/**
 * Main response validation wrapper.
 */
function validateOpponentResponse(
  text: string, 
  userSide: string, 
  opponentSide: string,
  dynamicForbidden: string[] = [],
  category = ""
): boolean {
  const t = text.toLowerCase().trim();
  const u = userSide.toLowerCase().replace("team ", "").trim();
  const o = opponentSide.toLowerCase().replace("team ", "").trim();

  const wordCount = text.trim().split(/\s+/).length;
  if (wordCount < 20 || wordCount > 95) {
    console.log(`[Validation] Word count out of bounds (${wordCount} words). Rejecting.`);
    return false;
  }

  if (!checkStanceCrossContamination(text, userSide, opponentSide)) {
    return false;
  }

  if (!validateEntityNames(text, opponentSide)) {
    return false;
  }

  if (!validateThirdPerson(text)) {
    return false;
  }

  // Dynamic memory checks using whole-word matches
  for (const word of dynamicForbidden) {
    if (hasWholeWord(t, word)) {
      console.log(`[Repetition Validation] Re-use of recently used key reasoning word "${word}". Rejecting.`);
      return false;
    }
  }

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

  // Forbidden self-criticism keywords check using whole-word matches, bypassing if related to active category
  const forbidden = getForbiddenKeywords(o);
  for (const w of forbidden) {
    if (category.includes(w) || w.includes(category)) {
      continue;
    }
    if (hasWholeWord(t, w)) {
      console.log(`[Validation] Forbidden self-criticism keyword "${w}" in response. Rejecting.`);
      return false;
    }
  }

  return true;
}

/**
 * Memory-safe fallback retriever.
 */
function getFallbackRebuttal(rivalKey: string, previousResponses: string[]): string {
  const pool = FALLBACK_POOL[rivalKey] || [
    `${rivalKey} has the superior statistics, records, and historical legacy. The numbers are undeniable.`
  ];
  const unused = pool.filter(item => {
    return !previousResponses.includes(sanitizeForDuplicateCheck(item));
  });
  if (unused.length > 0) {
    return unused[0];
  }
  return pool[0];
}

/**
 * Evaluates the relevance of the rebuttal to the user's statement.
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
    return 8;
  }
}

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
          "x-selected-file": "general",
          "x-selected-section": "Greeting Filter",
          "x-prompt-length": "0",
          "x-retrieval-length": "0",
          "x-retrieved-snippets": encodeURIComponent("Non-argument bypass")
        }
      });
    }

    const uName = side.replace("TEAM ", "").trim();
    const oName = rival.replace("TEAM ", "").trim();
    const rivalKey = resolveEntityKey(oName);

    // Get all previous assistant responses to prevent exact duplicates
    const sanitizedPreviousResponses = (history || [])
      .filter(m => m.role === "assistant")
      .map(m => sanitizeForDuplicateCheck(m.content));

    // 1. Initial Argument Classification
    const detectedCategory = classifyArgument(argument);
    let initialCategory = detectedCategory;

    // Fallback Semantic Routing
    if (initialCategory === "general") {
      console.log("[Debate Engine] Keyword classifier returned 'general'. Running semantic classifier fallback...");
      const classPrompt = `Classify this football debate argument into exactly one of these categories:
Categories: [${ALL_CATEGORIES.join(", ")}]

Argument: "${argument}"

Output ONLY the category name matching one of the options above. Do not write anything else.`;
      try {
        const rawCat = await defaultModelProvider.generateText(classPrompt, []);
        const parsedCat = rawCat.trim().toLowerCase().replace(/[^a-z_]/g, "");
        if (ALL_CATEGORIES.includes(parsedCat)) {
          initialCategory = parsedCat;
          console.log(`[Debate Engine] Semantic classifier mapped argument to: "${initialCategory}"`);
        }
      } catch (err) {
        console.error("[Debate Engine] Semantic classification failed:", err);
      }
    }

    // 2. Intelligent Category Selection & Memory-guard Routing
    const recentCategories = opponentTopics ? opponentTopics.slice(-3) : [];
    const lastCategoryUsed = opponentTopics && opponentTopics.length > 0 
      ? opponentTopics[opponentTopics.length - 1] 
      : null;

    let selectedCategory = initialCategory;
    const memoryBlockedCategories: string[] = [];
    const rejectedCategories: string[] = [];

    const isCategoryBlocked = (cat: string) => {
      return cat === lastCategoryUsed || recentCategories.includes(cat);
    };

    if (selectedCategory === "general") {
      const available = ALL_CATEGORIES.filter(cat => !isCategoryBlocked(cat));
      if (available.length > 0) {
        selectedCategory = available[0];
      } else {
        selectedCategory = "goals";
      }
    } else if (isCategoryBlocked(selectedCategory)) {
      memoryBlockedCategories.push(selectedCategory);
      rejectedCategories.push(selectedCategory);

      // Try related categories first
      const related = RELATED_CATEGORIES[selectedCategory] || [];
      let foundAlternative = false;
      for (const relCat of related) {
        if (!isCategoryBlocked(relCat)) {
          selectedCategory = relCat;
          foundAlternative = true;
          console.log(`[Debate Engine] Switching to related category: "${selectedCategory}" (was "${initialCategory}")`);
          break;
        } else {
          memoryBlockedCategories.push(relCat);
        }
      }

      // If related are blocked, fall back to any available category in the database
      if (!foundAlternative) {
        const available = ALL_CATEGORIES.filter(cat => !isCategoryBlocked(cat));
        if (available.length > 0) {
          selectedCategory = available[0];
          console.log(`[Debate Engine] Related categories blocked. Switched to available category: "${selectedCategory}"`);
        } else {
          const nonConsecutive = ALL_CATEGORIES.filter(cat => cat !== lastCategoryUsed);
          selectedCategory = nonConsecutive.length > 0 ? nonConsecutive[0] : "goals";
          console.log(`[Debate Engine] Memory emergency routing. Selected: "${selectedCategory}"`);
        }
      }
    }

    console.log(`[Debate Engine Decision Log]
- Detected Category: "${detectedCategory}"
- Selected Category: "${selectedCategory}"
- Rejected Categories: [${rejectedCategories.join(", ")}]
- Memory-blocked Categories: [${memoryBlockedCategories.join(", ")}]`);

    // 3. Database Content Retrieval
    const profile = DEBATE_DATABASE[rivalKey];
    const point = profile ? profile[selectedCategory] : null;
    
    const counterpoint = point ? point.counterpoint : `${oName} has superior statistics and trophies.`;
    const supportingFact = point ? point.supportingFact : `${oName} is the greatest in international history.`;
    const totalContextLength = counterpoint.length + supportingFact.length;

    // 4. Word-level dynamic memory guard
    const dynamicForbidden: string[] = [];
    if (history && history.length > 0) {
      const assistantMsgs = history
        .filter(m => m.role === "assistant" || m.role === "system")
        .slice(-3);
      
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

    // 5. System Prompt Construction
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

    // 6. Generation & Validation Loop
    let finalRebuttal = "";
    let validated = false;
    let attempts = 0;

    while (!validated && attempts < 3) {
      attempts++;
      
      let raw = "";
      if (attempts === 1) {
        raw = await defaultModelProvider.generateText(prompt, []);
      } else {
        console.log(`[Validation Correction] Running generative rewrite attempt ${attempts}...`);
        const correctionPrompt = `You wrote a draft debate rebuttal defending ${oName} against ${uName} that violated rules by conceding points, speaking in the first person, using incorrect names, repeating negative critiques, attributing ${oName}'s stats to ${uName}, or being too long.
Draft: "${finalRebuttal}"

Required counterpoint to include: "${counterpoint}"
Required fact to include: "${supportingFact}"

Rewrite the draft completely to be 100% loyal to ${oName}, biased, and written in the third person. Make it highly sarcastic, direct, and very short (40-80 words, 2-4 sentences max). Ensure you never attribute ${oName}'s stats, goals, or trophies to ${uName}. Do not explain your changes, just output the corrected paragraph.`;
        raw = await defaultModelProvider.generateText(correctionPrompt, []);
      }
      
      finalRebuttal = trimToWordLimit(raw, 95);
      
      // Duplication check
      const sanitizedRebuttal = sanitizeForDuplicateCheck(finalRebuttal);
      const isDuplicate = sanitizedPreviousResponses.includes(sanitizedRebuttal);
      
      const basicValid = !isDuplicate && validateOpponentResponse(finalRebuttal, side, rival, dynamicForbidden, selectedCategory);
      
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
        if (isDuplicate) {
          console.log(`[Validation Failed] Duplicate response detected. Regenerating.`);
        } else {
          console.log(`[Validation Failed] Basic filters failed on attempt ${attempts}.`);
        }
      }
    }

    // 7. Strict Safe Fallback Selector with Duplication Memory Protection
    if (!validated) {
      console.log("[Validation Fallback] All attempts failed or duplicate detected. Retrieving safe pool fallback...");
      finalRebuttal = getFallbackRebuttal(rivalKey, sanitizedPreviousResponses);
      console.log(`[Fallback Selected] Rebuttal: "${finalRebuttal}"`);
    }

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
        "x-selected-file": selectedCategory,
        "x-selected-section": "debateDb",
        "x-detected-category": detectedCategory,
        "x-rejected-categories": encodeURIComponent(rejectedCategories.join(",")),
        "x-memory-blocked-categories": encodeURIComponent(memoryBlockedCategories.join(","))
      }
    });

  } catch (error: unknown) {
    const errorMsg = error instanceof Error ? error.message : String(error);
    console.error("[API/Agent/Opponent] Error:", errorMsg);
    return NextResponse.json({ error: errorMsg }, { status: 500 });
  }
}
