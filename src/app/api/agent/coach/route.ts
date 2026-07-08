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
 * Deterministic facts lookup to bypass LLM model invocation for raw facts
 */
function lookupDeterministicFact(side: string, query: string): string | null {
  const q = query.toLowerCase();
  const s = side.toLowerCase();

  // Helper to check if query matches key keywords
  const matches = (keys: string[]) => keys.some(k => q.includes(k));

  if (s.includes("messi")) {
    if (matches(["country", "nation", "represent"])) return "Lionel Messi represents Argentina.";
    if (matches(["age", "born", "birthday", "how old"])) return "Lionel Messi was born on June 24, 1987.";
    if (matches(["club", "team", "play for"])) return "Lionel Messi currently plays for Inter Miami.";
    if (matches(["goal", "score", "goals count"])) return "Lionel Messi has scored over 850 official career goals.";
    if (matches(["troph", "cup", "world cup", "champions league", "ballon", "copa"])) return "Lionel Messi has won a record 8 Ballon d'Or awards, 1 FIFA World Cup (2022), 2 Copa Américas, 4 Champions Leagues, and 44 major trophies in total.";
    if (matches(["manager", "coach", "boss"])) return "Lionel Messi played under Frank Rijkaard, Pep Guardiola, Luis Enrique, and Lionel Scaloni.";
    if (matches(["history", "origin", "background"])) return "Lionel Messi was born in Rosario, Argentina. Diagnosed with growth hormone deficiency, he moved to Barcelona's La Masia in 2000, making his debut in 2004.";
  }
  if (s.includes("ronaldo")) {
    if (matches(["country", "nation", "represent"])) return "Cristiano Ronaldo represents Portugal.";
    if (matches(["age", "born", "birthday", "how old"])) return "Cristiano Ronaldo was born on February 5, 1985.";
    if (matches(["club", "team", "play for"])) return "Cristiano Ronaldo currently plays for Al-Nassr.";
    if (matches(["goal", "score", "goals count"])) return "Cristiano Ronaldo has scored over 890 official career goals.";
    if (matches(["troph", "cup", "world cup", "champions league", "ballon", "euro"])) return "Cristiano Ronaldo has won 5 Ballon d'Or awards, 5 UEFA Champions Leagues, 1 UEFA Euro (2016), and 33 major trophies in total. He has won 0 FIFA World Cups.";
    if (matches(["manager", "coach", "boss"])) return "Cristiano Ronaldo played under Sir Alex Ferguson, Jose Mourinho, Carlo Ancelotti, and Zinedine Zidane.";
    if (matches(["history", "origin", "background"])) return "Cristiano Ronaldo was born in Madeira, Portugal. Started his career at Sporting CP before joining Manchester United in 2003.";
  }
  if (s.includes("mbappe")) {
    if (matches(["country", "nation", "represent"])) return "Kylian Mbappé represents France.";
    if (matches(["age", "born", "birthday", "how old"])) return "Kylian Mbappé was born on December 20, 1998.";
    if (matches(["club", "team", "play for"])) return "Kylian Mbappé currently plays for Real Madrid.";
    if (matches(["goal", "score", "goals count"])) return "Kylian Mbappé has scored over 330 official career goals.";
    if (matches(["troph", "cup", "world cup", "champions league", "ballon", "euro", "nations league"])) return "Kylian Mbappé has won 1 FIFA World Cup (2018), 1 UEFA Nations League, and 17 major trophies in total. He has won 0 Ballon d'Or awards.";
    if (matches(["manager", "coach", "boss"])) return "Kylian Mbappé played under Leonardo Jardim, Thomas Tuchel, Mauricio Pochettino, Luis Enrique, Carlo Ancelotti, and Didier Deschamps.";
    if (matches(["history", "origin", "background"])) return "Kylian Mbappé was born in Paris, France. Developed at Clairefontaine, professional debut at Monaco, transferred to PSG in 2017 for €180m.";
  }
  if (s.includes("haaland")) {
    if (matches(["country", "nation", "represent"])) return "Erling Haaland represents Norway.";
    if (matches(["age", "born", "birthday", "how old"])) return "Erling Haaland was born on July 21, 2000.";
    if (matches(["club", "team", "play for"])) return "Erling Haaland currently plays for Manchester City.";
    if (matches(["goal", "score", "goals count"])) return "Erling Haaland has scored over 250 official career goals.";
    if (matches(["troph", "cup", "world cup", "champions league", "ballon", "premier league"])) return "Erling Haaland has won 1 UEFA Champions League, 2 Premier League titles, and 10 major trophies in total. He has won 0 Ballon d'Or awards and 0 FIFA World Cups.";
    if (matches(["manager", "coach", "boss"])) return "Erling Haaland played under Ole Gunnar Solskjaer (at Molde), Marco Rose, and Pep Guardiola.";
    if (matches(["history", "origin", "background"])) return "Erling Haaland was born in Leeds, England, to Norwegian footballer Alfie Haaland. Began career at Bryne, moved to Molde, Salzburg, Dortmund, and Man City.";
  }
  if (s.includes("argentina")) {
    if (matches(["country", "nation", "represent", "where"])) return "Argentina National Team represents the country of Argentina.";
    if (matches(["world cup", "champion"])) return "Argentina has won 3 FIFA World Cups (1978, 1986, 2022).";
    if (matches(["troph", "cup", "copa"])) return "Argentina has won 3 FIFA World Cups, 16 Copa Américas, 1 Confederations Cup, and 1 Finalissima.";
    if (matches(["manager", "coach", "boss"])) return "Argentina was managed by Cesar Luis Menotti, Carlos Bilardo, Alfio Basile, and Lionel Scaloni.";
    if (matches(["history", "origin", "background", "founded"])) return "Argentina Football Association was founded in 1893. Played first official international match in 1901 vs Uruguay.";
  }
  if (s.includes("brazil")) {
    if (matches(["country", "nation", "represent", "where"])) return "Brazil National Team represents the country of Brazil.";
    if (matches(["world cup", "champion"])) return "Brazil has won 5 FIFA World Cups (1958, 1962, 1970, 1994, 2002).";
    if (matches(["troph", "cup", "copa"])) return "Brazil has won 5 FIFA World Cups (most in history), 9 Copa Américas, 4 Confederations Cups, and 2 Olympic Gold Medals.";
    if (matches(["manager", "coach", "boss"])) return "Brazil was managed by Vicente Feola, Mário Zagallo, Carlos Alberto Parreira, Luiz Felipe Scolari, and Tite.";
    if (matches(["history", "origin", "background", "founded"])) return "Brazil Football Confederation was founded in 1914. Played first match in 1914 vs Exeter City.";
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

    // 1. Check for deterministic facts lookup to avoid LLM calls
    const deterministicFact = lookupDeterministicFact(side, question);
    if (deterministicFact) {
      console.log("Coach Deterministic Facts Lookup Bypass Triggered. Entity:", side);
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
          "Connection": "keep-alive",
          "x-prompt-length": "0",
          "x-retrieval-length": "0",
          "x-retrieved-snippets": encodeURIComponent("Deterministic facts lookup bypass"),
          "x-coach-intent": "FACT",
          "x-selected-file": side.toLowerCase() + ".md",
          "x-selected-section": "Deterministic Fact Lookup"
        }
      });
    }

    // 2. Classify Query Intent based on query keywords
    const q = question.toLowerCase();
    let intent: CoachIntent = "TACTICAL_ADVICE";
    let targetSections: string[] = ["Recent Form", "Strengths"];

    if (q.includes("support") || q.includes("point") || q.includes("pro") || q.includes("argue for") || q.includes("help me defend") || q.includes("reasons for") || q.includes("why should")) {
      intent = "SUPPORT_POINTS";
      targetSections = ["Debate Points", "Strengths"];
    } else if (q.includes("counter") || q.includes("against") || q.includes("rebut") || q.includes("refute") || q.includes("defeat") || q.includes("how to answer") || q.includes("beat")) {
      intent = "COUNTER_ARGUMENT";
      targetSections = ["Counter Points", "Weaknesses"];
    } else if (q.includes("history") || q.includes("origin") || q.includes("timeline") || q.includes("old") || q.includes("young") || q.includes("first") || q.includes("when") || q.includes("born") || q.includes("who") || q.includes("founder") || q.includes("began") || q.includes("start")) {
      intent = "HISTORY";
      targetSections = ["History", "Origins"];
    } else if (q.includes("trophy") || q.includes("won") || q.includes("achieve") || q.includes("award") || q.includes("ballon") || q.includes("cup") || q.includes("copa") || q.includes("title") || q.includes("medal")) {
      intent = "ACHIEVEMENT";
      targetSections = ["Achievements", "Major Tournaments"];
    } else if (q.includes("weak") || q.includes("loophole") || q.includes("poor") || q.includes("flaw") || q.includes("concede") || q.includes("error") || q.includes("mistake")) {
      intent = "WEAKNESSES";
      targetSections = ["Weaknesses"];
    } else if (q.includes("record") || q.includes("stat") || q.includes("goal") || q.includes("assist") || q.includes("most") || q.includes("number")) {
      intent = "FACT";
      targetSections = ["Records", "Country", "Club Career"];
    }

    // 3. Fetch specific segmented context from the markdown profiles
    const context = await getEntityMultiSectionContext(side, targetSections);

    // 4. Select the dedicated prompt template
    let prompt = "";
    switch (intent) {
      case "SUPPORT_POINTS":
        prompt = `You are a private football research assistant supporting the Team ${side.toUpperCase()} side.
Identify achievements, debate points, or strengths in the context. Format your response strictly as 3 to 4 short, concise bullet points (•) representing debate arguments supporting Team ${side.toUpperCase()}.
Do NOT write long essays. Keep each bullet point under 15 words.

Context:
${context}

User Question: "${question}"`;
        break;

      case "COUNTER_ARGUMENT":
        prompt = `You are a private football research assistant. Using the context details, identify weaknesses or counter-points. Output exactly 1 or 2 short sentences providing direct counter-arguments to use against the rival team.
Do NOT write bullet points or list items. Keep it strictly under 35 words.

Context:
${context}

User Question: "${question}"`;
        break;

      case "HISTORY":
        prompt = `You are a private football history assistant. Answer the user's historical query: "${question}" using the history or origins in the context.
CRITICAL LIMITATIONS:
- Output exactly 1 or 2 short sentences. Do NOT write list items or bullet points.
- Do NOT provide tactical debate advice or current coach suggestions. Focus 100% on history.

Context:
${context}`;
        break;

      case "FACT":
        prompt = `You are a private football statistical assistant. Answer the user's factual query: "${question}" using only the records or stats in the context.
CRITICAL LIMITATIONS:
- Output exactly 1 or 2 short sentences.
- Do NOT write bullet points. Focus purely on facts and numbers.

Context:
${context}`;
        break;

      case "ACHIEVEMENT":
        prompt = `You are a private football research assistant. List only the relevant achievements or trophies for Team ${side.toUpperCase()} matching the user's query: "${question}" based on the context.
CRITICAL LIMITATIONS:
- Keep your response strictly under 2 sentences.
- Focus purely on trophies, awards, and achievements. No tactics.

Context:
${context}`;
        break;

      case "WEAKNESSES":
        prompt = `You are a private football research assistant. Identify the tactical weaknesses or loopholes of Team ${side.toUpperCase()} based on the user's query: "${question}" and context.
CRITICAL LIMITATIONS:
- Output exactly 1 or 2 short sentences.
- Focus strictly on weaknesses, flaws, and loopholes.

Context:
${context}`;
        break;

      case "TACTICAL_ADVICE":
      default:
        prompt = `You are a private tactical football coach advising Team ${side.toUpperCase()}.
Provide exactly 1 or 2 short sentences of strategic guidance or debate focus angles based on the query: "${question}" and context.
Do NOT write list items or copy-paste arguments. Keep it extremely brief (max 35 words).

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
