import { NextResponse } from "next/server";
import { defaultModelProvider } from "@/lib/qvac";
import { getEntityMultiSectionContext } from "@/lib/retrieval";

type CoachIntent =
  | "FACT"
  | "HISTORY"
  | "ACHIEVEMENT"
  | "SUPPORT_POINTS"
  | "COUNTER_ARGUMENT"
  | "WEAKNESSES"
  | "TACTICAL_ADVICE";

/**
 * Deterministic fact lookup — bypasses LLM entirely for raw factual queries.
 * Returns null if no match found.
 */
function lookupDeterministicFact(side: string, query: string): string | null {
  const q = query.toLowerCase();
  const s = side.toLowerCase();

  const matches = (keys: string[]) => keys.some(k => q.includes(k));

  if (s.includes("messi")) {
    if (matches(["country", "nation", "represent", "nationality", "from", "born in", "where is"])) return "Lionel Messi represents Argentina.";
    if (matches(["age", "born", "birthday", "how old", "when was"])) return "Lionel Messi was born on June 24, 1987.";
    if (matches(["club", "play for", "current club", "team now"])) return "Lionel Messi currently plays for Inter Miami in MLS.";
    if (matches(["goals", "how many goals", "goal count", "total goals"])) return "Lionel Messi has scored over 850 official career goals.";
    if (matches(["ballon", "awards", "trophies", "titles", "champions league", "world cup", "copa"])) return "Messi has won 8 Ballon d'Ors, 1 World Cup (2022), 2 Copa Américas (2021, 2024), 4 Champions Leagues, and 44 major trophies.";
    if (matches(["manager", "coach", "who coached", "who managed"])) return "Messi played under Frank Rijkaard, Pep Guardiola, Luis Enrique, and Lionel Scaloni.";
    if (matches(["history", "origin", "background", "story", "career start"])) return "Messi was born in Rosario, Argentina. Diagnosed with growth hormone deficiency, he moved to Barcelona's La Masia in 2000 and debuted in 2004.";
    if (matches(["assist", "how many assists"])) return "Messi has over 380 career assists — the most in football history.";
  }
  if (s.includes("ronaldo")) {
    if (matches(["country", "nation", "represent", "nationality", "from", "born in", "where is"])) return "Cristiano Ronaldo represents Portugal.";
    if (matches(["age", "born", "birthday", "how old", "when was"])) return "Cristiano Ronaldo was born on February 5, 1985.";
    if (matches(["club", "play for", "current club", "team now"])) return "Cristiano Ronaldo currently plays for Al-Nassr in Saudi Arabia.";
    if (matches(["goals", "how many goals", "goal count", "total goals"])) return "Cristiano Ronaldo has scored over 890 official career goals — the highest in history.";
    if (matches(["ballon", "awards", "trophies", "titles", "champions league", "world cup", "euro"])) return "Ronaldo has won 5 Ballon d'Ors, 5 Champions Leagues, 1 Euro (2016), and 35 major trophies. He has 0 FIFA World Cups.";
    if (matches(["manager", "coach", "who coached", "who managed"])) return "Ronaldo played under Sir Alex Ferguson, José Mourinho, Carlo Ancelotti, and Zinedine Zidane.";
    if (matches(["history", "origin", "background", "story", "career start"])) return "Ronaldo was born in Madeira, Portugal. He started at Sporting CP before joining Manchester United in 2003.";
  }
  if (s.includes("mbappe")) {
    if (matches(["country", "nation", "represent", "nationality", "from", "born in", "where is"])) return "Kylian Mbappé represents France.";
    if (matches(["age", "born", "birthday", "how old", "when was"])) return "Kylian Mbappé was born on December 20, 1998.";
    if (matches(["club", "play for", "current club", "team now"])) return "Kylian Mbappé currently plays for Real Madrid.";
    if (matches(["goals", "how many goals", "goal count", "total goals"])) return "Kylian Mbappé has scored over 330 official career goals.";
    if (matches(["ballon", "awards", "trophies", "titles", "world cup", "champions league"])) return "Mbappé has won 1 FIFA World Cup (2018), 1 UEFA Nations League, and 17 major trophies. He has 0 Ballon d'Ors and 0 Champions Leagues.";
    if (matches(["history", "origin", "background", "story", "career start"])) return "Mbappé was born in Paris, France. He developed at Clairefontaine, debuted professionally at Monaco, and transferred to PSG in 2017 for €180m.";
  }
  if (s.includes("haaland")) {
    if (matches(["country", "nation", "represent", "nationality", "from", "born in", "where is"])) return "Erling Haaland represents Norway.";
    if (matches(["age", "born", "birthday", "how old", "when was"])) return "Erling Haaland was born on July 21, 2000.";
    if (matches(["club", "play for", "current club", "team now"])) return "Erling Haaland currently plays for Manchester City in the Premier League.";
    if (matches(["goals", "how many goals", "goal count", "total goals", "premier league goals"])) return "Erling Haaland has scored over 250 official career goals, including a record 36 Premier League goals in a single season.";
    if (matches(["ballon", "awards", "trophies", "titles", "champions league", "world cup"])) return "Haaland has won 1 Champions League (2023, as part of the Treble), 2 Premier League titles, and 10 major trophies. He has 0 Ballon d'Ors and 0 World Cups.";
    if (matches(["history", "origin", "background", "story", "career start"])) return "Haaland was born in Leeds, England, to Norwegian footballer Alfie Haaland. He started at Bryne, then Molde, RB Salzburg, Borussia Dortmund, and Man City.";
  }
  if (s.includes("argentina")) {
    if (matches(["world cup", "how many world cups", "world cup titles", "world cup wins"])) return "Argentina has won 3 FIFA World Cups: 1978, 1986, and 2022.";
    if (matches(["copa", "copa america", "south america"])) return "Argentina has won 16 Copa Américas — more than any other nation.";
    if (matches(["trophies", "titles", "achievements", "honors"])) return "Argentina has won 3 FIFA World Cups, 16 Copa Américas, 1 Confederations Cup, and 1 Finalissima.";
    if (matches(["history", "origin", "founded", "background", "oldest", "first game"])) return "Argentina Football Association was founded in 1893. They played their first official international in 1901 against Uruguay.";
    if (matches(["manager", "coach", "who coaches", "who managed"])) return "Argentina has been managed by César Menotti, Carlos Bilardo, Alfio Basile, and currently Lionel Scaloni.";
    if (matches(["rank", "fifa rank", "world rank", "number one", "top"])) return "Argentina are currently ranked #1 in the world by FIFA.";
    if (matches(["represent", "country", "nation", "where", "which country"])) return "Argentina represents the South American nation of Argentina.";
  }
  if (s.includes("brazil")) {
    if (matches(["world cup", "how many world cups", "world cup titles", "world cup wins"])) return "Brazil has won 5 FIFA World Cups: 1958, 1962, 1970, 1994, and 2002 — more than any other nation.";
    if (matches(["copa", "copa america", "south america"])) return "Brazil has won 9 Copa Américas.";
    if (matches(["trophies", "titles", "achievements", "honors"])) return "Brazil has won 5 FIFA World Cups (most in history), 9 Copa Américas, 4 Confederations Cups, and 2 Olympic Gold Medals.";
    if (matches(["history", "origin", "founded", "background", "oldest", "first game"])) return "Brazil Football Confederation was founded in 1914. They played their first international in 1914 against Exeter City.";
    if (matches(["manager", "coach", "who coaches", "who managed"])) return "Brazil has been managed by Vicente Feola, Mário Zagallo, Carlos Alberto Parreira, Luiz Felipe Scolari, and Tite.";
    if (matches(["represent", "country", "nation", "where", "which country"])) return "Brazil represents the South American nation of Brazil.";
    if (matches(["pele", "legends", "greatest players", "best players"])) return "Brazil's greatest legends include Pelé, Ronaldo Nazário, Ronaldinho, Garrincha, Zico, Rivaldo, and Cafu.";
  }

  return null;
}

/**
 * AI Tactical Coach Agent Route Handler with Query Routing Layer.
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

    // 1. Deterministic lookup bypass
    const deterministicFact = lookupDeterministicFact(side, question);
    if (deterministicFact) {
      console.log("[Coach] Deterministic bypass. Entity:", side, "| Query:", question);
      const encoder = new TextEncoder();
      const stream = new ReadableStream({
        start(controller) {
          controller.enqueue(encoder.encode(deterministicFact));
          controller.close();
        }
      });
      return new Response(stream, {
        headers: {
          "Content-Type": "text/plain; charset=utf-8",
          "Cache-Control": "no-cache",
          "x-coach-intent": "FACT",
          "x-selected-file": side.toLowerCase() + ".md",
          "x-selected-section": "Deterministic Fact Lookup",
          "x-prompt-length": "0",
          "x-retrieval-length": "0",
          "x-retrieved-snippets": encodeURIComponent("Deterministic facts bypass")
        }
      });
    }

    // 2. Classify Intent — broader keyword coverage
    const q = question.toLowerCase();
    let intent: CoachIntent = "TACTICAL_ADVICE";
    let targetSections: string[] = ["Recent Form", "Strengths"];

    // FACT: direct factual questions using pronouns and question words
    if (
      q.includes("who is") || q.includes("who was") || q.includes("what is") || q.includes("what are") ||
      q.includes("when did") || q.includes("where did") || q.includes("where is") || q.includes("how many") ||
      q.includes("which country") || q.includes("nationality") || q.includes("does he") || q.includes("did he") ||
      q.includes("is he") || q.includes("was he") || q.includes("plays for") || q.includes("represent") ||
      (q.includes("who") && (q.includes("coach") || q.includes("manager")))
    ) {
      intent = "FACT";
      targetSections = ["Records", "Country", "Club Career", "Managers"];
    }
    // SUPPORT_POINTS: building the user's case
    else if (
      q.includes("support") || q.includes("points for") || q.includes("argue for") ||
      q.includes("help me") || q.includes("reasons for") || q.includes("why should") ||
      q.includes("give me") || q.includes("how do i argue") || q.includes("case for") ||
      (q.includes("point") && !q.includes("counter")) || q.includes("pro ") || q.includes("pros ")
    ) {
      intent = "SUPPORT_POINTS";
      targetSections = ["Debate Points", "Strengths", "Achievements"];
    }
    // COUNTER_ARGUMENT: attacking the opponent
    else if (
      q.includes("counter") || q.includes("against") || q.includes("rebut") || q.includes("refute") ||
      q.includes("defeat") || q.includes("how to beat") || q.includes("how to answer") ||
      q.includes("challenge") || q.includes("respond to") || q.includes("reply to")
    ) {
      intent = "COUNTER_ARGUMENT";
      targetSections = ["Counter Points", "Weaknesses"];
    }
    // HISTORY
    else if (
      q.includes("history") || q.includes("origin") || q.includes("timeline") ||
      q.includes("founded") || q.includes("background") || q.includes("story") ||
      q.includes("first") || q.includes("when did they start") || q.includes("career start")
    ) {
      intent = "HISTORY";
      targetSections = ["History", "Origins"];
    }
    // ACHIEVEMENT
    else if (
      q.includes("trophy") || q.includes("trophies") || q.includes("won") || q.includes("win") ||
      q.includes("achiev") || q.includes("award") || q.includes("ballon") || q.includes("titles") ||
      q.includes("medal") || q.includes("championship") || q.includes("honours") || q.includes("honors")
    ) {
      intent = "ACHIEVEMENT";
      targetSections = ["Achievements", "Major Tournaments"];
    }
    // WEAKNESSES
    else if (
      q.includes("weak") || q.includes("flaw") || q.includes("poor") || q.includes("concede") ||
      q.includes("loophole") || q.includes("error") || q.includes("mistake") || q.includes("bad at") ||
      q.includes("downside") || q.includes("negative")
    ) {
      intent = "WEAKNESSES";
      targetSections = ["Weaknesses"];
    }
    // FACT catch-all for records/stats
    else if (
      q.includes("record") || q.includes("stat") || q.includes("goal") || q.includes("assist") ||
      q.includes("most") || q.includes("number") || q.includes("how much") || q.includes("score")
    ) {
      intent = "FACT";
      targetSections = ["Records", "Achievements"];
    }

    // 3. Retrieve context
    const context = await getEntityMultiSectionContext(side, targetSections);

    // 4. Tightly constrained prompt per intent
    let prompt = "";
    const sideName = side.replace("TEAM ", "").trim();

    switch (intent) {
      case "SUPPORT_POINTS":
        prompt = `You are a football research assistant. Using the context, list exactly 3 debate points supporting ${sideName}.

Context:
${context}

User question: "${question}"

Rules:
- Output EXACTLY 3 bullet points using • symbol.
- Each bullet must be under 15 words.
- Use only facts from the context.
- No intros, no summaries, no extra sentences. Just 3 bullets.`;
        break;

      case "COUNTER_ARGUMENT":
        prompt = `You are a football research assistant. Using the context, give ONE specific counter-argument to use against the opponent.

Context:
${context}

User question: "${question}"

Rules:
- Output 1-2 short sentences ONLY. Maximum 30 words total.
- Be specific — name a weakness, failed tournament, or gap in the opponent's record.
- No bullet points, no intros, no summaries.`;
        break;

      case "HISTORY":
        prompt = `You are a football history expert. Answer this historical question factually: "${question}"

Context:
${context}

Rules:
- Output 1-2 sentences ONLY. Maximum 35 words.
- Answer the history or timeline question directly.
- No tactics, no debate advice, just history.`;
        break;

      case "FACT":
        prompt = `You are a football statistics expert. Answer this factual question directly: "${question}"

Context:
${context}

Rules:
- Output 1 sentence ONLY. Maximum 25 words.
- State the fact or number directly. No debate framing.
- If the context doesn't have the answer, use your knowledge of ${sideName}.`;
        break;

      case "ACHIEVEMENT":
        prompt = `You are a football records expert. List the relevant achievements for ${sideName} that answer: "${question}"

Context:
${context}

Rules:
- Output 1-2 sentences ONLY. Maximum 35 words.
- Focus purely on trophies, awards, and titles. No tactics.`;
        break;

      case "WEAKNESSES":
        prompt = `You are a football analyst. Identify the most exploitable weakness in ${sideName}'s record or profile.

Context:
${context}

User question: "${question}"

Rules:
- Output 1-2 sentences ONLY. Maximum 30 words.
- Be specific — name an exact weakness, gap, or tournament failure.
- No bullet points.`;
        break;

      case "TACTICAL_ADVICE":
      default:
        prompt = `You are a private tactical football coach for ${sideName}. Give ONE strategic debate tip based on the question: "${question}"

Context:
${context}

Rules:
- Output 1-2 short sentences ONLY. Maximum 30 words.
- Suggest a specific angle to argue or a topic to focus on.
- No bullet points, no essays.`;
        break;
    }

    console.log("Coach Prompt Length:", prompt.length);
    console.log("Coach Routed Intent:", intent, "| Sections:", targetSections);

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
        "x-prompt-length": prompt.length.toString(),
        "x-retrieval-length": context.length.toString(),
        "x-retrieved-snippets": encodeURIComponent(context.slice(0, 150)),
        "x-coach-intent": intent,
        "x-selected-file": side.toLowerCase() + ".md",
        "x-selected-section": targetSections.join(", ")
      }
    });

  } catch (error: unknown) {
    const errorMsg = error instanceof Error ? error.message : String(error);
    console.error("[API/Agent/Coach] Error:", errorMsg);
    return NextResponse.json({ error: errorMsg }, { status: 500 });
  }
}
