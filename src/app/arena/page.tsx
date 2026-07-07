"use client";

import { useState, useEffect, useRef, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import { 
  Swords, Trophy, Shield, ArrowRight, RotateCcw, 
  AlertTriangle, ChevronRight, Loader2, Send, Users
} from "lucide-react";
import Link from "next/link";

interface DebateMessage {
  role: "user" | "assistant";
  content: string;
  timestamp: string;
}

interface CoachMessage {
  role: "coach" | "user";
  content: string;
  timestamp: string;
}

interface StatItem {
  label: string;
  value: string;
  description: string;
}

interface ArsenalItem {
  title: string;
  fact: string;
}

interface PlayerData {
  id: string;
  name: string;
  teamName: string;
  rival: string;
  color: string;
  glowColor: string;
  badge: string;
  stats: StatItem[];
  arsenal: ArsenalItem[];
}


interface RefereeVerdict {
  winner: string;
  winnerSide: string;
  evidenceScore: number;
  logicScore: number;
  persuasionScore: number;
  counteringScore: number;
  overallScore: number;
  verdict: string;
}

type ArenaStep = 
  | "ARSENAL" 
  | "ROUND_1" | "TIMEOUT_1" 
  | "ROUND_2" | "TIMEOUT_2" 
  | "ROUND_3" 
  | "REFEREE" 
  | "WINNER";

const STAGE_CONFIG = {
  ROUND_1: { label: "ROUND 1 - OPENING CLASH", duration: 120 },
  TIMEOUT_1: { label: "STRATEGIC TIMEOUT 1", duration: 45 },
  ROUND_2: { label: "ROUND 2 - COUNTER ATTACK", duration: 120 },
  TIMEOUT_2: { label: "STRATEGIC TIMEOUT 2", duration: 45 },
  ROUND_3: { label: "ROUND 3 - FINAL CLASH", duration: 120 }
};

// SVG Gradient Avatars for Premium Visual Look
function AvatarIcon({ type, size = 10 }: { type: string; size?: number }) {
  const getGradients = () => {
    if (type === "messi" || type === "argentina") {
      return { from: "#38bdf8", to: "#1d4ed8" }; // Sky to Blue
    } else if (type === "ronaldo" || type === "brazil") {
      return { from: "#f43f5e", to: "#b91c1c" }; // Rose to Red
    } else if (type === "mbappe") {
      return { from: "#2dd4bf", to: "#0369a1" }; // Teal to Blue
    } else if (type === "haaland") {
      return { from: "#fbbf24", to: "#c2410c" }; // Amber to Orange
    } else if (type === "coach") {
      return { from: "#a855f7", to: "#4c1d95" }; // Purple to Indigo
    }
    return { from: "#64748b", to: "#334155" };
  };

  const grads = getGradients();
  const radius = size * 4;

  return (
    <svg className="rounded-full shadow-lg" width={radius} height={radius} viewBox="0 0 40 40">
      <defs>
        <linearGradient id={`grad-${type}`} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor={grads.from} />
          <stop offset="100%" stopColor={grads.to} />
        </linearGradient>
      </defs>
      <circle cx="20" cy="20" r="18" fill={`url(#grad-${type})`} stroke="rgba(255,255,255,0.1)" strokeWidth="1.5" />
      <text cx="20" cy="20" x="50%" y="58%" textAnchor="middle" fill="#ffffff" fontSize="11" fontWeight="bold" fontFamily="sans-serif" dominantBaseline="middle">
        {type === "coach" ? "🧠" : type.slice(0, 2).toUpperCase()}
      </text>
    </svg>
  );
}

function ArenaContent() {
  const searchParams = useSearchParams();
  const sideId = searchParams.get("side") || "messi";

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<PlayerData | null>(null);
  
  // Game Flow State
  const [activeStep, setActiveStep] = useState<ArenaStep>("ARSENAL");
  const [timeLeft, setTimeLeft] = useState(120);
  const [isTimerActive, setIsTimerActive] = useState(false);

  // Debate Log (Center Column)
  const [debateFeed, setDebateFeed] = useState<DebateMessage[]>([]);
  const [currentUserInput, setCurrentUserInput] = useState("");
  const [isOpponentStreaming, setIsOpponentStreaming] = useState(false);
  const [currentOpponentTokenStream, setCurrentOpponentTokenStream] = useState("");

  // Coach private log (Right Column)
  const [coachChat, setCoachChat] = useState<CoachMessage[]>([
    { role: "coach", content: "Locker room prepped. Awaiting strategy, coach finch is ready.", timestamp: "00:00" }
  ]);
  const [currentCoachInput, setCurrentCoachInput] = useState("");
  const [isCoachStreaming, setIsCoachStreaming] = useState(false);
  const [currentCoachTokenStream, setCurrentCoachTokenStream] = useState("");

  // Momentum scoring metrics
  const [userMomentum, setUserMomentum] = useState(50);
  const [rivalMomentum, setRivalMomentum] = useState(50);

  // Referee Results
  const [refereeResult, setRefereeResult] = useState<RefereeVerdict | null>(null);
  const [selectedFactIds, setSelectedFactIds] = useState<number[]>([]);

  // Debug mode states
  const [isDebugMode, setIsDebugMode] = useState(false);
  const [debugStats, setDebugStats] = useState<{
    promptLength: number;
    retrievalLength: number;
    latency: number;
    snippets: string;
  }>({ promptLength: 0, retrievalLength: 0, latency: 0, snippets: "" });

  // Refs for scrolling
  const feedEndRef = useRef<HTMLDivElement>(null);
  const coachEndRef = useRef<HTMLDivElement>(null);

  // Helper to retrieve formatting timestamps
  const getMatchTimestamp = () => {
    if (activeStep === "ARSENAL" || activeStep === "REFEREE" || activeStep === "WINNER") return "00:00";
    const totalSecs = STAGE_CONFIG[activeStep as keyof typeof STAGE_CONFIG]?.duration || 120;
    const elapsed = totalSecs - timeLeft;
    const mins = Math.floor(elapsed / 60);
    const secs = elapsed % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  // Preloading QVAC and Loading JSON statistics
  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);
        const response = await fetch(`/data/${sideId}.json`);
        if (!response.ok) {
          throw new Error(`Failed to load data for: ${sideId}`);
        }
        const json = await response.json();
        setData(json);
      } catch (err: unknown) {
        console.error(err);
        setError(err instanceof Error ? err.message : "Error loading data.");
      } finally {
        setLoading(false);
      }
    }
    loadData();

    // Warm up model
    fetch("/api/model/control?action=load")
      .then(res => res.json())
      .then(d => {
        if (d.success) console.log("[Arena] QVAC local model warmed.");
      })
      .catch(e => {
        console.error("[Arena] Preload error:", e);
      });

    // Cleanup hook
    return () => {
      fetch("/api/model/control?action=unload").catch(console.error);
    };
  }, [sideId]);

  // Handle stage ticking clock
  useEffect(() => {
    if (!isTimerActive) return;
    
    // Pause timer when AI is generating text, giving user full typing time
    if (isOpponentStreaming || isCoachStreaming) return;

    const interval = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(interval);
          handleStageTransition();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isTimerActive, activeStep, isOpponentStreaming, isCoachStreaming]);

  // Auto-scroll feeds
  useEffect(() => {
    feedEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [debateFeed, currentOpponentTokenStream]);

  useEffect(() => {
    coachEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [coachChat, currentCoachTokenStream]);

  // Stage transition logic
  const handleStageTransition = () => {
    if (activeStep === "ROUND_1") {
      setActiveStep("TIMEOUT_1");
      setTimeLeft(STAGE_CONFIG.TIMEOUT_1.duration);
      setCoachChat(prev => [...prev, {
        role: "coach",
        content: "TIMEOUT IN SESSION. We need to tweak the logic. Ask me anything to counter their arguments.",
        timestamp: getMatchTimestamp()
      }]);
    } else if (activeStep === "TIMEOUT_1") {
      setActiveStep("ROUND_2");
      setTimeLeft(STAGE_CONFIG.ROUND_2.duration);
    } else if (activeStep === "ROUND_2") {
      setActiveStep("TIMEOUT_2");
      setTimeLeft(STAGE_CONFIG.TIMEOUT_2.duration);
      setCoachChat(prev => [...prev, {
        role: "coach",
        content: "TIMEOUT IN SESSION. This is the final stretch. How should we shape the closing rebuttals?",
        timestamp: getMatchTimestamp()
      }]);
    } else if (activeStep === "TIMEOUT_2") {
      setActiveStep("ROUND_3");
      setTimeLeft(STAGE_CONFIG.ROUND_3.duration);
    } else if (activeStep === "ROUND_3") {
      setIsTimerActive(false);
      handleTriggerReferee();
    }
  };

  // Skip / Fast forward countdown timer cheat button for demo
  const handleFastForward = () => {
    setTimeLeft(3);
  };
  
  // Helper to read readable streams chunk by chunk
  const streamReader = async (
    endpoint: string,
    payload: Record<string, unknown>,
    setText: (t: string) => void,
    setStreaming: (s: boolean) => void
  ): Promise<string> => {
    setStreaming(true);
    setText("");
    let text = "";
    const startTime = performance.now();
    try {
      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });

      // Extract telemetry metrics from HTTP headers
      const pLen = res.headers.get("x-prompt-length");
      const rLen = res.headers.get("x-retrieval-length");
      const rSnips = res.headers.get("x-retrieved-snippets");

      setDebugStats(prev => ({
        ...prev,
        promptLength: pLen ? parseInt(pLen, 10) : prev.promptLength,
        retrievalLength: rLen ? parseInt(rLen, 10) : prev.retrievalLength,
        snippets: rSnips ? decodeURIComponent(rSnips) : prev.snippets
      }));

      if (!res.body) throw new Error("No response stream.");
      
      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let done = false;

      while (!done) {
        const { value, done: doneReading } = await reader.read();
        done = doneReading;
        const chunk = decoder.decode(value, { stream: !done });
        text += chunk;
        setText(text);
      }
    } catch (e) {
      console.error(e);
      text = endpoint.includes("coach") ? "Coach temporarily unavailable." : "Rival Legend temporarily unavailable.";
      setText(text);
    } finally {
      setStreaming(false);
      const elapsed = Math.round(performance.now() - startTime);
      setDebugStats(prev => ({ ...prev, latency: elapsed }));
    }
    return text;
  };

  // Submit Argument to Rival Opponent
  const handleSubmitArgument = async () => {
    if (!currentUserInput.trim() || !data || isOpponentStreaming) return;
    const userText = currentUserInput;
    setCurrentUserInput("");

    // Add to feed
    const userMsg: DebateMessage = {
      role: "user",
      content: userText,
      timestamp: getMatchTimestamp()
    };
    const updatedFeed = [...debateFeed, userMsg];
    setDebateFeed(updatedFeed);

    // Shift momentum dynamically in User's favor
    const userShift = Math.floor(Math.random() * 15) + 5;
    setUserMomentum(prev => Math.min(95, prev + userShift));
    setRivalMomentum(prev => Math.max(15, prev - Math.floor(userShift * 0.7)));

    // Map transcript history for QVAC format
    const historyPayload = updatedFeed.map(f => ({
      role: f.role === "user" ? "user" as const : "assistant" as const,
      content: f.content
    }));

    // Trigger opponent response stream
    const finalOpponentText = await streamReader(
      "/api/agent/opponent",
      { side: data.teamName, rival: data.rival, argument: userText, history: historyPayload },
      setCurrentOpponentTokenStream,
      setIsOpponentStreaming
    );

    // Lock opponent message in feed
    setDebateFeed(prev => [...prev, {
      role: "assistant",
      content: finalOpponentText,
      timestamp: getMatchTimestamp()
    }]);
    setCurrentOpponentTokenStream("");

    // Shift momentum in Opponent's favor
    const rivalShift = Math.floor(Math.random() * 12) + 5;
    setRivalMomentum(prev => Math.min(95, prev + rivalShift));
    setUserMomentum(prev => Math.max(15, prev - Math.floor(rivalShift * 0.7)));

    // Automatically trigger background coach updates for the next consult
    fetchCoachFeedback(userText, historyPayload);
  };

  // Background Coach update triggers
  const fetchCoachFeedback = async (userArg: string, historyPayload: { role: "user" | "assistant"; content: string }[]) => {
    if (!data) return;
    setIsCoachStreaming(true);
    let coachOutput = "";
    try {
      const res = await fetch("/api/agent/coach", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ side: data.teamName, rival: data.rival, argument: userArg, history: historyPayload })
      });
      if (!res.body) return;
      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let done = false;
      while (!done) {
        const { value, done: doneReading } = await reader.read();
        done = doneReading;
        const chunk = decoder.decode(value, { stream: !done });
        coachOutput += chunk;
        setCurrentCoachTokenStream(coachOutput);
      }
      setCoachChat(prev => [...prev, {
        role: "coach",
        content: coachOutput,
        timestamp: getMatchTimestamp()
      }]);
    } catch (e) {
      console.error(e);
    } finally {
      setIsCoachStreaming(false);
      setCurrentCoachTokenStream("");
    }
  };

  // Custom private user ask to Tactical Coach
  const handleAskCoach = async () => {
    if (!currentCoachInput.trim() || !data || isCoachStreaming) return;
    const questionText = currentCoachInput;
    setCurrentCoachInput("");

    // Append user question to coach chat
    setCoachChat(prev => [...prev, {
      role: "user",
      content: questionText,
      timestamp: getMatchTimestamp()
    }]);

    // Format chat history for context
    const historyPayload = debateFeed.map(f => ({
      role: f.role === "user" ? "user" as const : "assistant" as const,
      content: f.content
    }));

    const coachReply = await streamReader(
      "/api/agent/coach",
      { side: data.teamName, rival: data.rival, question: questionText, history: historyPayload },
      setCurrentCoachTokenStream,
      setIsCoachStreaming
    );

    setCoachChat(prev => [...prev, {
      role: "coach",
      content: coachReply,
      timestamp: getMatchTimestamp()
    }]);
    setCurrentCoachTokenStream("");
  };

  // Compile final scores with neutral Referee route
  const handleTriggerReferee = async () => {
    if (!data) return;
    setActiveStep("REFEREE");
    setLoading(true);
    const startTime = performance.now();

    try {
      const historyPayload = debateFeed.map(f => ({
        role: f.role === "user" ? "user" as const : "assistant" as const,
        content: f.content
      }));

      const res = await fetch("/api/agent/referee", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ side: data.teamName, rival: data.rival, history: historyPayload })
      });

      if (!res.ok) throw new Error("Referee grading failed.");
      const scoreData = await res.json() as RefereeVerdict;
      setRefereeResult(scoreData);

      const pLen = res.headers.get("x-prompt-length");
      setDebugStats({
        promptLength: pLen ? parseInt(pLen, 10) : 0,
        retrievalLength: 0,
        latency: Math.round(performance.now() - startTime),
        snippets: "N/A (Referee processes debate summary)"
      });
    } catch (e: unknown) {
      console.error(e);
      setError("Failed to compile local referee results.");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center min-h-[70vh]">
        <Loader2 className="w-12 h-12 text-blue-500 animate-spin mb-4" />
        <p className="font-display text-sm uppercase tracking-widest text-slate-400">
          {activeStep === "REFEREE" ? "AI Referee grading transcript..." : "Entering the Arena..."}
        </p>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center text-center p-6">
        <AlertTriangle className="w-16 h-16 text-rose-500 mb-4" />
        <h2 className="text-2xl font-bold text-white font-display mb-2">ARENA DISCONNECTION</h2>
        <p className="text-slate-400 text-sm max-w-md mb-6">{error || "Could not retrieve debate details."}</p>
        <Link href="/select" className="px-6 py-3 rounded-lg bg-blue-600 hover:bg-blue-500 font-bold font-display text-sm tracking-wider">
          RETURN TO DRAFT ROOM
        </Link>
      </div>
    );
  }

  // Format timer text
  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
  };

  const roundConfig = STAGE_CONFIG[activeStep as keyof typeof STAGE_CONFIG];
  const roundLabel = roundConfig ? roundConfig.label : "REFEREE EVALUATION";

  return (
    <div className="flex-1 flex flex-col w-full px-4 py-4 relative select-none">
      
      {/* 1. Header HUD matched to valorant esports broadcast */}
      <header className="w-full grid grid-cols-12 items-center border border-slate-900 bg-slate-950/95 backdrop-blur rounded-xl p-3 mb-4 relative overflow-hidden shadow-inner">
        <div className="absolute bottom-0 left-0 right-0 h-[1.5px] bg-gradient-to-r from-blue-500/40 via-purple-500/20 to-red-500/40" />
        
        {/* Left header: logo info */}
        <div className="col-span-3 flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-red-500 flex items-center justify-center shadow">
            <Swords className="w-4 h-4 text-white" />
          </div>
          <div>
            <h1 className="font-display text-sm font-black tracking-widest text-white leading-none">
              GOAT ARENA
            </h1>
            <span className="text-[8px] text-slate-500 font-semibold tracking-wider font-display uppercase block mt-1">
              THE ULTIMATE DEBATE STAGE
            </span>
          </div>
        </div>

        {/* Center header: battle matchup title & clock */}
        <div className="col-span-6 flex flex-col items-center">
          <div className="flex items-center gap-4 mb-1">
            <span className="font-display text-base font-black tracking-widest text-blue-400 uppercase">
              {data.name}
            </span>
            <span className="text-xs font-semibold text-slate-500 font-display">VS</span>
            <span className="font-display text-base font-black tracking-widest text-red-500 uppercase">
              {data.rival}
            </span>
          </div>

          {/* Active Round Stage */}
          <div className="text-[9px] font-display font-bold text-purple-400 tracking-wider bg-purple-950/20 px-3 py-0.5 rounded-full border border-purple-900/30 uppercase mb-2">
            {roundLabel}
          </div>

          {/* Countdown timer HUD widget */}
          {roundConfig && (
            <div className="flex items-center gap-3 bg-slate-900/60 border border-slate-800 rounded-lg px-4 py-1.5 shadow-inner">
              <span className="font-display text-xl font-bold tracking-widest text-white">
                {formatTime(timeLeft)}
              </span>
              <span className="text-[8px] text-slate-500 font-semibold uppercase tracking-wider block border-l border-slate-800 pl-3">
                REMAINING
              </span>

              {/* Skip fast forward debug button */}
              <button 
                onClick={handleFastForward}
                className="text-[8px] hover:text-white bg-slate-950 text-slate-500 font-display font-bold uppercase px-1.5 py-0.5 rounded border border-slate-850 hover:border-slate-750 shrink-0 ml-2"
                title="Hackathon Demo Skip Timer"
              >
                ⏩ FAST
              </button>
            </div>
          )}
        </div>

        {/* Right header: rules badge & status */}
        <div className="col-span-3 flex items-center justify-end gap-3 font-display">
          <button
            onClick={() => setIsDebugMode(!isDebugMode)}
            className={`px-3 py-1 rounded-full border text-[9px] font-bold transition-all ${
              isDebugMode 
                ? "bg-blue-900/40 border-blue-500 text-blue-400 shadow shadow-blue-500/10" 
                : "bg-slate-900 border-slate-850 text-slate-500 hover:border-slate-750"
            }`}
          >
            ⚙️ DEBUG {isDebugMode ? "ON" : "OFF"}
          </button>
          <div className="flex items-center gap-2 bg-red-950/30 border border-red-900/40 px-2.5 py-1 rounded-full text-red-400 text-[9px] font-bold">
            <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
            LIVE
          </div>
          <button 
            onClick={() => setActiveStep("ARSENAL")}
            className="p-1.5 rounded-lg border border-slate-800 bg-slate-900/60 text-slate-400 hover:text-white hover:border-slate-700 transition-all text-[10px] font-bold uppercase tracking-wider"
          >
            Locker
          </button>
        </div>
      </header>

      {/* 2. Responsive 3-Column layout dashboard */}
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-4 items-stretch min-h-[580px]">
        
        {/* LEFT COLUMN: RIVAL LEGEND CARD (lg:col-span-2) */}
        <div className="lg:col-span-2 flex flex-col gap-4">
          <div className="flex-1 glass-panel rounded-xl p-5 border border-slate-900 bg-gradient-to-b from-red-950/10 via-slate-950 to-slate-950/70 flex flex-col justify-between relative overflow-hidden shadow-lg shadow-black/40">
            {/* Red border top highlight */}
            <div className="absolute top-0 left-0 right-0 h-[2px] bg-red-600/50" />
            
            {/* Profile detail */}
            <div className="relative z-10">
              <div className="flex justify-between items-start mb-4">
                <span className="text-[9px] text-red-500 font-bold uppercase tracking-widest font-display border border-red-500/20 px-2.5 py-0.5 rounded-full bg-red-950/20">
                  RIVAL LEGEND
                </span>
                <span className="w-2.5 h-2.5 rounded-full bg-red-500 animate-pulse" />
              </div>

              {/* Mock Avatar placeholder (visual silhouette) */}
              <div className="flex items-center gap-3 mb-6">
                <AvatarIcon type={sideId === "messi" ? "ronaldo" : "messi"} size={12} />
                <div>
                  <h3 className="text-lg font-black text-white font-display uppercase tracking-wider leading-none">
                    {data.rival}
                  </h3>
                  <span className="text-xs text-slate-500 font-semibold tracking-wider font-display uppercase block mt-1">
                    THE TARGET
                  </span>
                </div>
              </div>

              {/* Stance details */}
              <div className="mb-6">
                <span className="text-xs text-slate-500 font-bold uppercase font-display block mb-1">
                  CURRENT STANCE
                </span>
                <p className="text-base text-slate-350 leading-relaxed font-normal font-sans bg-slate-950/80 border border-slate-900 rounded-lg p-3">
                  {sideId === "messi"
                    ? "Defending Cristiano Ronaldo's record scoring volume, international goal dominance, and physical/athletic longevity."
                    : "Defending Lionel Messi's all-time playmaking assist statistics, calendar year output, and 2022 World Cup glory."
                  }
                </p>
              </div>

              {/* Key strengths bullets */}
              <div>
                <span className="text-xs text-slate-500 font-bold uppercase font-display block mb-2">
                  KEY RIVAL ASSETS
                </span>
                <ul className="flex flex-col gap-2">
                  <li className="text-base text-slate-300 font-normal flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-red-500 shrink-0" />
                    {sideId === "messi" ? "All-time Professional Scorer (900+)" : "Most Ballon d'Ors in history (8)"}
                  </li>
                  <li className="text-base text-slate-300 font-normal flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-red-500 shrink-0" />
                    {sideId === "messi" ? "UEFA Champions League top scorer" : "World Cup 2022 Golden Ball Champion"}
                  </li>
                  <li className="text-base text-slate-300 font-normal flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-red-500 shrink-0" />
                    {sideId === "messi" ? "All-time Euro Cup Top Scorer" : "Highest modern calendar year goals (91)"}
                  </li>
                </ul>
              </div>
            </div>

            {/* Pressure gauge semi circle visual widget */}
            <div className="relative z-10 border-t border-slate-900 pt-5 mt-6 flex flex-col items-center">
              <span className="text-xs text-slate-500 font-bold uppercase font-display block mb-2">
                RIVAL MOMENTUM GAUGE
              </span>
              
              <div className="relative w-32 h-16 overflow-hidden flex items-end justify-center">
                {/* SVG Semi Circle dial gauge */}
                <svg className="absolute top-0 left-0 w-32 h-32" viewBox="0 0 100 100">
                  <path d="M 15 80 A 40 40 0 0 1 85 80" fill="none" stroke="#1e293b" strokeWidth="6" strokeLinecap="round" />
                  <path 
                    d="M 15 80 A 40 40 0 0 1 85 80" 
                    fill="none" 
                    stroke="#ef4444" 
                    strokeWidth="6" 
                    strokeLinecap="round" 
                    strokeDasharray="220" 
                    strokeDashoffset={220 - (220 * rivalMomentum) / 100}
                    className="transition-all duration-700 ease-out"
                  />
                </svg>
                <div className="flex flex-col items-center z-10 leading-none pb-1.5">
                  <span className="text-xl font-bold font-display text-white">
                    {rivalMomentum}%
                  </span>
                  <span className="text-[7px] text-red-400 font-bold tracking-wider uppercase block mt-1">
                    PRESSURE
                  </span>
                </div>
              </div>
            </div>

          </div>
        </div>

        {/* CENTER COLUMN: LIVE DEBATE FEED (lg:col-span-7) */}
        <div className="lg:col-span-7 flex flex-col gap-4">
          <div className="flex-1 glass-panel-heavy rounded-xl p-5 border border-slate-800 bg-slate-950/50 flex flex-col relative overflow-hidden shadow-inner">
            
            {/* Header Feed Display */}
            <div className="flex justify-between items-center border-b border-slate-900 pb-3 mb-4 relative z-10">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
                <span className="font-display font-black text-xs text-white uppercase tracking-wider">
                  LIVE DEBATE FEED
                </span>
              </div>
              <span className="text-[9px] text-slate-500 font-bold font-display uppercase tracking-widest bg-slate-900 px-2 py-0.5 rounded border border-slate-900">
                TRANSCRIPT
              </span>
            </div>

            {/* Scrollable feed messages */}
            <div className="flex-1 overflow-y-auto pr-1 mb-4 flex flex-col gap-4 scrollbar-thin">
              {debateFeed.length === 0 ? (
                <div className="flex-1 flex flex-col items-center justify-center text-center p-6 opacity-30 select-none pointer-events-none">
                  <Swords className="w-12 h-12 text-slate-500 mb-3" />
                  <p className="text-xs font-display uppercase tracking-widest text-slate-400">
                    Awaiting argument submission to start the match feed...
                  </p>
                </div>
              ) : (
                debateFeed.map((msg, index) => {
                  const isUser = msg.role === "user";
                  return (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className={`flex gap-3 max-w-[85%] ${isUser ? "self-end flex-row-reverse" : "self-start flex-row"}`}
                    >
                      <div className="shrink-0 mt-1">
                        <AvatarIcon type={isUser ? sideId : (sideId === "messi" ? "ronaldo" : "messi")} size={8} />
                      </div>
                      
                      <div className="flex flex-col">
                        {/* Speaker timestamp bar */}
                        <div className={`flex items-center gap-2 mb-1 text-[8px] text-slate-500 font-bold uppercase font-display ${
                          isUser ? "justify-end" : "justify-start"
                        }`}>
                          <span>{isUser ? "YOU" : "RIVAL LEGEND"}</span>
                          <span>•</span>
                          <span>{msg.timestamp}</span>
                        </div>

                        {/* Bubble content */}
                        <div 
                          className={`p-3.5 rounded-xl border text-lg md:text-[19px] font-normal font-sans leading-relaxed ${
                            isUser 
                              ? "bg-blue-950/20 border-blue-500/30 text-slate-100 rounded-tr-none shadow-md shadow-blue-500/5" 
                              : "bg-red-950/20 border-red-500/30 text-slate-100 rounded-tl-none shadow-md shadow-red-500/5"
                          }`}
                        >
                          {msg.content}
                        </div>
                      </div>
                    </motion.div>
                  );
                })
              )}

              {/* Streaming Opponent response container */}
              {isOpponentStreaming && (
                <div className="flex gap-3 max-w-[85%] self-start flex-row">
                  <div className="shrink-0 mt-1">
                    <AvatarIcon type={sideId === "messi" ? "ronaldo" : "messi"} size={8} />
                  </div>
                  <div className="flex flex-col">
                    <div className="flex items-center gap-2 mb-1 text-[8px] text-red-400 font-bold uppercase font-display animate-pulse">
                      <span>RIVAL LEGEND</span>
                      <span>•</span>
                      <span>STREAMING...</span>
                    </div>
                    <div className="p-3.5 rounded-xl border border-red-500/30 text-lg md:text-[19px] font-normal font-sans leading-relaxed bg-red-950/10 text-slate-200 rounded-tl-none shadow shadow-red-500/5 min-h-[50px] flex items-center">
                      <span>{currentOpponentTokenStream || <Loader2 className="w-3.5 h-3.5 animate-spin text-red-500" />}</span>
                    </div>
                  </div>
                </div>
              )}

              <div ref={feedEndRef} />
            </div>

            {/* Debug mode telemetry shelf */}
            {isDebugMode && (
              <div className="border border-blue-500/20 bg-blue-950/15 rounded-xl p-4 font-mono text-[11px] text-blue-400 mb-3 shadow-inner select-text">
                <h4 className="font-bold text-xs uppercase tracking-wider mb-2 text-white flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-pulse" />
                  ⚙️ QVAC OBSERVED METRICS
                </h4>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-slate-350">
                  <div><span className="text-slate-500 font-bold">PROMPT LENGTH:</span> {debugStats.promptLength} chars</div>
                  <div><span className="text-slate-500 font-bold">RETRIEVAL SIZE:</span> {debugStats.retrievalLength} chars</div>
                  <div><span className="text-slate-500 font-bold">LATENCY SPEED:</span> {debugStats.latency} ms</div>
                  <div><span className="text-slate-500 font-bold">CONTEXT STATUS:</span> OK</div>
                </div>
                {debugStats.snippets && (
                  <div className="mt-3 border-t border-blue-950/30 pt-2 text-[10px]">
                    <span className="text-slate-500 font-bold block mb-1">RETRIEVED KNOWLEDGE SNIPPETS:</span>
                    <pre className="bg-black/60 border border-slate-900 rounded p-2 text-slate-300 overflow-x-auto max-h-[80px] whitespace-pre-wrap font-sans leading-relaxed">
                      {debugStats.snippets}
                    </pre>
                  </div>
                )}
              </div>
            )}

            {/* Bottom input area console */}
            <div className="relative z-10 border-t border-slate-900 pt-3 flex flex-col gap-2">
              
              {/* Timeout pause overlay blocking input */}
              {(activeStep === "TIMEOUT_1" || activeStep === "TIMEOUT_2") ? (
                <div className="bg-slate-950/90 border border-slate-800 rounded-xl p-4 text-center">
                  <span className="text-[10px] text-amber-400 font-bold uppercase tracking-widest font-display block mb-1 animate-pulse">
                    ⚠️ STRATEGIC TIMEOUT ACTIVE
                  </span>
                  <p className="text-xs text-slate-400 font-light font-sans">
                    Debate is currently paused. Please consult your Tactical Coach privately in the right panel.
                  </p>
                </div>
              ) : (
                <div className="flex items-center gap-3">
                  <div className="flex-1 relative">
                    <input
                      type="text"
                      value={currentUserInput}
                      onChange={(e) => setCurrentUserInput(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" && currentUserInput.trim().length >= 5) {
                          handleSubmitArgument();
                        }
                      }}
                      disabled={isOpponentStreaming || isCoachStreaming || activeStep === "ARSENAL" || activeStep === "REFEREE"}
                      placeholder={
                        isOpponentStreaming 
                          ? "Opponent is formulating counterattack..." 
                          : isCoachStreaming
                            ? "Coach is updating dashboard..."
                            : "Enter your debate argument..."
                      }
                      className="w-full bg-slate-950/80 border border-slate-850 rounded-xl px-4 py-3 text-base text-slate-100 font-normal placeholder:text-slate-650 focus:outline-none focus:border-blue-500/80 focus:ring-1 focus:ring-blue-500/40 transition-all font-sans leading-none disabled:bg-slate-950 disabled:opacity-55"
                    />
                  </div>
                  
                  <button
                    onClick={handleSubmitArgument}
                    disabled={currentUserInput.trim().length < 5 || isOpponentStreaming || isCoachStreaming}
                    className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all ${
                      currentUserInput.trim().length >= 5 && !isOpponentStreaming && !isCoachStreaming
                        ? "bg-blue-600 hover:bg-blue-500 text-white shadow shadow-blue-500/20 hover:scale-105"
                        : "bg-slate-900 text-slate-650 cursor-not-allowed border border-slate-850"
                    }`}
                  >
                    <Send className="w-4 h-4" />
                  </button>
                </div>
              )}

              <div className="flex justify-between items-center text-[9px] text-slate-600 font-display mt-1 px-1">
                <span>PRESS ENTER TO SUBMIT ARGUMENT</span>
                <span>TIP: USE REAL TROPHY STATS FOR STRENGTH</span>
              </div>
            </div>

          </div>
        </div>

        {/* RIGHT COLUMN: TACTICAL COACH (lg:col-span-3) */}
        <div className="lg:col-span-3 flex flex-col gap-4">
          <div className="flex-1 glass-panel rounded-xl p-5 border border-slate-900 bg-gradient-to-b from-blue-950/10 via-slate-950 to-slate-950/70 flex flex-col justify-between relative overflow-hidden shadow-lg shadow-black/40">
            {/* Blue border top highlight */}
            <div className="absolute top-0 left-0 right-0 h-[2px] bg-blue-500/50" />
            
            {/* Coach detail */}
            <div className="flex-1 flex flex-col justify-between relative z-10">
              
              <div>
                <div className="flex justify-between items-start mb-4">
                  <span className="text-[9px] text-blue-400 font-bold uppercase tracking-widest font-display border border-blue-500/20 px-2.5 py-0.5 rounded-full bg-blue-950/20">
                    TACTICAL COACH
                  </span>
                  
                  <div className="flex items-center gap-1.5 text-[8px] font-bold text-green-400 font-display uppercase bg-green-950/20 border border-green-900/30 px-2 py-0.5 rounded-full">
                    <span className="w-1 h-1 rounded-full bg-green-500 animate-pulse" />
                    ONLINE
                  </div>
                </div>

                {/* Coach card profile */}
                <div className="flex items-center gap-3 mb-4">
                  <AvatarIcon type="coach" size={12} />
                  <div>
                    <h3 className="text-sm font-black text-white font-display uppercase tracking-wider leading-none">
                      COACH FINCH
                    </h3>
                    <span className="text-[9px] text-slate-500 font-semibold tracking-wider font-display uppercase block mt-1">
                      YOUR PRIVATE ADVISOR
                    </span>
                  </div>
                </div>

                {/* Coach Private Message Board Feed */}
                <div className="border-t border-slate-900 pt-3 mb-4">
                  <span className="text-[8px] text-slate-500 font-bold uppercase font-display block mb-1.5">
                    COACH LOG CHANNEL
                  </span>
                  
                  {/* Private chat window container */}
                  <div className="bg-slate-950/80 border border-slate-900 rounded-xl p-3.5 max-h-[220px] overflow-y-auto flex flex-col gap-3 font-sans">
                    {coachChat.map((c, idx) => (
                      <div key={idx} className="text-base">
                        <span className={`font-bold block text-[8px] font-display mb-0.5 uppercase ${
                          c.role === "coach" ? "text-blue-400" : "text-slate-400 text-right"
                        }`}>
                          {c.role === "coach" ? "COACH" : "YOU"} • {c.timestamp}
                        </span>
                        <p className={`font-normal leading-relaxed ${c.role === "user" && "text-right"}`}>{c.content}</p>
                      </div>
                    ))}
                    
                    {/* Streaming coach text token loader */}
                    {isCoachStreaming && (
                      <div className="text-base">
                        <span className="font-bold block text-[8px] font-display text-blue-400 uppercase animate-pulse">
                          COACH • UPDATING...
                        </span>
                        <p className="font-normal leading-relaxed text-slate-350">
                          {currentCoachTokenStream || <Loader2 className="w-3 h-3 animate-spin text-blue-400 inline" />}
                        </p>
                      </div>
                    )}
                    <div ref={coachEndRef} />
                  </div>
                </div>

                {/* suggested counters lists */}
                <div className="mb-4">
                  <span className="text-[8px] text-slate-500 font-bold uppercase font-display block mb-1.5">
                    SUGGESTED TACTICAL FOCUS
                  </span>
                  <ul className="flex flex-col gap-1.5 bg-blue-950/10 border border-blue-900/10 rounded-lg p-3 text-base text-slate-300 font-normal">
                    <li className="flex items-start gap-1.5">
                      <span className="text-blue-400 font-bold">•</span>
                      {sideId === "messi" ? "Highlight 8 Ballon d'Or record" : "Cite 140+ UEFA Champions League goals"}
                    </li>
                    <li className="flex items-start gap-1.5">
                      <span className="text-blue-400 font-bold">•</span>
                      {sideId === "messi" ? "Mention 380+ career assists playmaking" : "Highlight Euro 2016 Portugal champion trophy"}
                    </li>
                    <li className="flex items-start gap-1.5">
                      <span className="text-blue-400 font-bold">•</span>
                      {sideId === "messi" ? "Emphasize World Cup Golden Ball 2022" : "Quote 400+ goals scored since turning 30"}
                    </li>
                  </ul>
                </div>
              </div>

              {/* Private Q&A Ask Box */}
              <div className="border-t border-slate-900 pt-3 flex items-center gap-2">
                <input
                  type="text"
                  value={currentCoachInput}
                  onChange={(e) => setCurrentCoachInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && currentCoachInput.trim().length >= 4) {
                      handleAskCoach();
                    }
                  }}
                  disabled={isCoachStreaming || isOpponentStreaming}
                  placeholder="Ask Coach anything..."
                  className="flex-1 bg-slate-950 border border-slate-850 rounded-lg px-3 py-2 text-[11px] text-slate-100 placeholder:text-slate-650 focus:outline-none focus:border-blue-500/80 transition-all font-sans"
                />
                
                <button
                  onClick={handleAskCoach}
                  disabled={currentCoachInput.trim().length < 4 || isCoachStreaming || isOpponentStreaming}
                  className={`w-8 h-8 rounded-lg flex items-center justify-center transition-all ${
                    currentCoachInput.trim().length >= 4 && !isCoachStreaming && !isOpponentStreaming
                      ? "bg-blue-600 text-white hover:bg-blue-500"
                      : "bg-slate-900 text-slate-650 border border-slate-850"
                  }`}
                >
                  <Send className="w-3 h-3" />
                </button>
              </div>

            </div>
          </div>
        </div>

      </div>

      {/* 3. Visual round progress timeline and double momentum footer */}
      <footer className="w-full mt-4 flex flex-col gap-3">
        
        {/* Progress tracker timeline */}
        <div className="w-full flex items-center justify-between bg-slate-950 border border-slate-900 rounded-lg px-4 py-2 text-[8px] md:text-[9px] font-display font-bold text-slate-500 select-none overflow-x-auto scrollbar-none">
          <div className="flex gap-4 items-center shrink-0">
            <span className="text-slate-400 uppercase">TIMELINE:</span>
            
            <div className="flex items-center gap-2">
              <span className={`w-3.5 h-3.5 rounded-full flex items-center justify-center text-[7px] ${
                activeStep !== "ARSENAL" ? "bg-green-500/20 text-green-400 border border-green-500/40" : "bg-slate-900 text-slate-500"
              }`}>
                {activeStep !== "ARSENAL" ? "✓" : "1"}
              </span>
              <span className={activeStep !== "ARSENAL" ? "text-green-400" : ""}>ROUND 1</span>
            </div>
            
            <ChevronRight className="w-3 h-3 text-slate-900" />
            
            <div className="flex items-center gap-2">
              <span className={`w-3.5 h-3.5 rounded-full flex items-center justify-center text-[7px] ${
                (activeStep !== "ARSENAL" && activeStep !== "ROUND_1") ? "bg-green-500/20 text-green-400 border border-green-500/40" : "bg-slate-900 text-slate-500"
              }`}>
                {(activeStep !== "ARSENAL" && activeStep !== "ROUND_1") ? "✓" : "2"}
              </span>
              <span className={(activeStep !== "ARSENAL" && activeStep !== "ROUND_1") ? "text-green-400" : ""}>TIMEOUT 1</span>
            </div>

            <ChevronRight className="w-3 h-3 text-slate-900" />

            <div className="flex items-center gap-2">
              <span className={`w-3.5 h-3.5 rounded-full flex items-center justify-center text-[7px] ${
                (activeStep === "ROUND_2" || activeStep === "TIMEOUT_2" || activeStep === "ROUND_3" || activeStep === "REFEREE" || activeStep === "WINNER") 
                  ? "bg-blue-500 text-white font-black" 
                  : "bg-slate-900 text-slate-650"
              }`}>
                3
              </span>
              <span className={(activeStep === "ROUND_2" || activeStep === "TIMEOUT_2" || activeStep === "ROUND_3" || activeStep === "REFEREE" || activeStep === "WINNER") ? "text-blue-400" : ""}>ROUND 2</span>
            </div>

            <ChevronRight className="w-3 h-3 text-slate-900" />

            <div className="flex items-center gap-2">
              <span className={`w-3.5 h-3.5 rounded-full flex items-center justify-center text-[7px] ${
                (activeStep === "TIMEOUT_2" || activeStep === "ROUND_3" || activeStep === "REFEREE" || activeStep === "WINNER") 
                  ? "bg-blue-500 text-white font-black" 
                  : "bg-slate-900 text-slate-650"
              }`}>
                4
              </span>
              <span className={(activeStep === "TIMEOUT_2" || activeStep === "ROUND_3" || activeStep === "REFEREE" || activeStep === "WINNER") ? "text-blue-400" : ""}>TIMEOUT 2</span>
            </div>

            <ChevronRight className="w-3 h-3 text-slate-900" />

            <div className="flex items-center gap-2">
              <span className={`w-3.5 h-3.5 rounded-full flex items-center justify-center text-[7px] ${
                (activeStep === "ROUND_3" || activeStep === "REFEREE" || activeStep === "WINNER") 
                  ? "bg-blue-500 text-white font-black" 
                  : "bg-slate-900 text-slate-650"
              }`}>
                5
              </span>
              <span className={(activeStep === "ROUND_3" || activeStep === "REFEREE" || activeStep === "WINNER") ? "text-blue-400" : ""}>ROUND 3</span>
            </div>
          </div>
          
          <div className="flex items-center gap-1.5 text-slate-400">
            <Users className="w-3.5 h-3.5 text-slate-500" />
            <span>24,568 WATCHING CROWD</span>
          </div>
        </div>

        {/* Double-sided momentum horizontal stats bar */}
        <div className="w-full grid grid-cols-12 items-center bg-slate-950/80 border border-slate-900 rounded-lg p-3 relative overflow-hidden">
          
          {/* User Side Momentum */}
          <div className="col-span-5 flex items-center gap-3">
            <AvatarIcon type={sideId} size={7} />
            <div className="flex-1">
              <div className="flex justify-between text-[8px] text-slate-500 font-display font-bold uppercase mb-1">
                <span>{data.teamName} SIDE</span>
                <span className="text-blue-400">{userMomentum}%</span>
              </div>
              <div className="h-2 bg-slate-900 rounded-full overflow-hidden flex justify-end">
                <div 
                  className="h-full bg-gradient-to-l from-blue-500 to-cyan-400 transition-all duration-500" 
                  style={{ width: `${userMomentum}%` }}
                />
              </div>
            </div>
          </div>

          {/* Versus indicator */}
          <div className="col-span-2 flex items-center justify-center">
            <span className="text-[10px] font-display font-black text-slate-700">VS</span>
          </div>

          {/* Opponent Side Momentum */}
          <div className="col-span-5 flex items-center gap-3 flex-row-reverse">
            <AvatarIcon type={sideId === "messi" ? "ronaldo" : "messi"} size={7} />
            <div className="flex-1">
              <div className="flex justify-between text-[8px] text-slate-500 font-display font-bold uppercase mb-1">
                <span className="text-red-400">{rivalMomentum}%</span>
                <span>{data.rival.toUpperCase()} SIDE</span>
              </div>
              <div className="h-2 bg-slate-900 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-red-500 to-rose-600 transition-all duration-500" 
                  style={{ width: `${rivalMomentum}%` }}
                />
              </div>
            </div>
          </div>

        </div>

      </footer>

      {/* 4. ARSENAL CHOOSE LOCKER OVERLAY */}
      {activeStep === "ARSENAL" && (
        <div className="absolute inset-0 bg-[#020617]/95 backdrop-blur z-50 flex items-center justify-center p-4">
          <div className="w-full max-w-4xl flex flex-col">
            <div className="text-center mb-8">
              <span className="text-[9px] text-blue-400 font-bold uppercase tracking-widest font-display border border-blue-500/20 px-3 py-1 rounded-full bg-blue-950/20">
                DEPLOYMENT PHASE
              </span>
              <h2 className="text-3xl md:text-4xl font-black font-display text-white uppercase mt-3 tracking-tight">
                YOUR AI <span className="bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">ARSENAL</span>
              </h2>
              <p className="text-slate-400 text-xs mt-2 max-w-lg mx-auto leading-relaxed">
                Arm yourself with stats from our local knowledge base. Select facts to load into your debate arsenal before starting the match.
              </p>
            </div>

            {/* Accolades Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
              {data.stats.map((stat, idx) => (
                <div key={idx} className="glass-panel rounded-xl p-5 border border-slate-900 bg-slate-950/40 relative overflow-hidden">
                  <span className="text-[9px] text-slate-500 font-bold uppercase font-display block mb-1">
                    {stat.label}
                  </span>
                  <span className="text-2xl font-black text-white font-display block mb-1">
                    {stat.value}
                  </span>
                  <span className="text-[10px] text-slate-450 leading-relaxed font-light font-sans block">
                    {stat.description}
                  </span>
                </div>
              ))}
            </div>

            {/* Interactive fact selectors */}
            <div className="glass-panel border-slate-900 rounded-xl p-6 mb-8 bg-slate-950/25">
              <span className="text-xs font-bold font-display text-white uppercase mb-4 flex items-center gap-2">
                <Shield className="w-4 h-4 text-blue-400" />
                TACTICAL FACTS SHELF (SELECT TO ARM)
              </span>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                {data.arsenal.map((item, idx) => {
                  const isSelected = selectedFactIds.includes(idx);
                  return (
                    <div
                      key={idx}
                      onClick={() => {
                        if (isSelected) {
                          setSelectedFactIds(selectedFactIds.filter(id => id !== idx));
                        } else {
                          setSelectedFactIds([...selectedFactIds, idx]);
                        }
                      }}
                      className={`p-3.5 rounded-xl border cursor-pointer transition-all ${
                        isSelected 
                          ? "bg-slate-900 border-blue-500/50" 
                          : "bg-slate-950/40 border-slate-900 hover:border-slate-800"
                      }`}
                    >
                      <div className="flex justify-between items-center mb-1">
                        <span className="text-xs font-bold text-white uppercase font-display flex items-center gap-1.5">
                          <span className={`w-1.5 h-1.5 rounded-full ${isSelected ? "bg-blue-400" : "bg-slate-700"}`} />
                          {item.title}
                        </span>
                        <span className={`text-[9px] font-bold font-display px-2 py-0.5 rounded-full ${
                          isSelected ? "bg-blue-500/10 text-blue-400" : "bg-slate-900 text-slate-500"
                        }`}>
                          {isSelected ? "ARMED" : "ARM"}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-400 font-light leading-relaxed pl-3 font-sans mt-1">
                        {item.fact}
                      </p>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Lock in trigger CTA */}
            <div className="flex justify-center">
              <button
                onClick={() => {
                  setActiveStep("ROUND_1");
                  setTimeLeft(STAGE_CONFIG.ROUND_1.duration);
                  setIsTimerActive(true);
                }}
                className="px-8 py-4 bg-gradient-to-r from-blue-500 to-purple-600 text-white font-bold font-display tracking-widest text-xs rounded-xl hover:scale-105 transition-all flex items-center gap-2"
              >
                LOCK IN ARSENAL & START MATCH
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>

          </div>
        </div>
      )}

      {/* 5. REFEREE SCOREBOARD OVERLAY */}
      {activeStep === "REFEREE" && refereeResult && (
        <div className="absolute inset-0 bg-[#020617]/95 backdrop-blur z-50 flex items-center justify-center p-4">
          <div className="w-full max-w-2xl flex flex-col items-center">
            
            <div className="text-center mb-8">
              <span className="text-[9px] text-amber-500 font-bold uppercase tracking-widest font-display border border-amber-500/20 px-3 py-1 rounded-full bg-amber-950/20 animate-pulse">
                DECISION STAGE
              </span>
              <h2 className="text-3xl font-black font-display text-white uppercase mt-3 tracking-tight">
                REFEREE JUDGMENT
              </h2>
              <p className="text-slate-400 text-xs mt-2 max-w-sm mx-auto leading-relaxed">
                The neutral AI Referee has completed evaluating the 3 rounds of transcripts.
              </p>
            </div>

            {/* Scorecard panel */}
            <div className="w-full glass-panel-heavy rounded-2xl p-6 border border-slate-800 bg-slate-950/80 mb-8">
              
              <div className="flex justify-between items-center border-b border-slate-900 pb-3 mb-6 font-display text-[10px] font-bold text-slate-500">
                <span>EVALUATION DIMENSION</span>
                <span>SCORE (0-100)</span>
              </div>

              {/* Progress bars categories */}
              <div className="flex flex-col gap-5 font-display text-xs">
                {/* Evidence */}
                <div className="grid grid-cols-12 items-center gap-4">
                  <span className="col-span-3 font-bold text-white uppercase">EVIDENCE</span>
                  <div className="col-span-7 h-2 bg-slate-900 rounded-full overflow-hidden">
                    <motion.div initial={{ width: 0 }} animate={{ width: `${refereeResult.evidenceScore}%` }} transition={{ duration: 1.2 }} className="h-full bg-gradient-to-r from-blue-500 to-cyan-400" />
                  </div>
                  <span className="col-span-2 text-right font-black text-blue-400">{refereeResult.evidenceScore}</span>
                </div>

                {/* Logic */}
                <div className="grid grid-cols-12 items-center gap-4">
                  <span className="col-span-3 font-bold text-white uppercase">LOGIC</span>
                  <div className="col-span-7 h-2 bg-slate-900 rounded-full overflow-hidden">
                    <motion.div initial={{ width: 0 }} animate={{ width: `${refereeResult.logicScore}%` }} transition={{ duration: 1.2, delay: 0.1 }} className="h-full bg-gradient-to-r from-purple-500 to-indigo-400" />
                  </div>
                  <span className="col-span-2 text-right font-black text-purple-400">{refereeResult.logicScore}</span>
                </div>

                {/* Persuasion */}
                <div className="grid grid-cols-12 items-center gap-4">
                  <span className="col-span-3 font-bold text-white uppercase">PERSUASION</span>
                  <div className="col-span-7 h-2 bg-slate-900 rounded-full overflow-hidden">
                    <motion.div initial={{ width: 0 }} animate={{ width: `${refereeResult.persuasionScore}%` }} transition={{ duration: 1.2, delay: 0.2 }} className="h-full bg-gradient-to-r from-amber-500 to-yellow-400" />
                  </div>
                  <span className="col-span-2 text-right font-black text-amber-400">{refereeResult.persuasionScore}</span>
                </div>

                {/* Countering */}
                <div className="grid grid-cols-12 items-center gap-4">
                  <span className="col-span-3 font-bold text-white uppercase">COUNTERING</span>
                  <div className="col-span-7 h-2 bg-slate-900 rounded-full overflow-hidden">
                    <motion.div initial={{ width: 0 }} animate={{ width: `${refereeResult.counteringScore}%` }} transition={{ duration: 1.2, delay: 0.3 }} className="h-full bg-gradient-to-r from-rose-500 to-pink-400" />
                  </div>
                  <span className="col-span-2 text-right font-black text-rose-400">{refereeResult.counteringScore}</span>
                </div>

                {/* Overall Score */}
                <div className="grid grid-cols-12 items-center gap-4">
                  <span className="col-span-3 font-bold text-white uppercase">OVERALL SCORE</span>
                  <div className="col-span-7 h-2 bg-slate-900 rounded-full overflow-hidden">
                    <motion.div initial={{ width: 0 }} animate={{ width: `${refereeResult.overallScore}%` }} transition={{ duration: 1.2, delay: 0.4 }} className="h-full bg-gradient-to-r from-teal-500 to-emerald-400" />
                  </div>
                  <span className="col-span-2 text-right font-black text-teal-400">{refereeResult.overallScore}</span>
                </div>
              </div>

              {/* Verdict Verdict */}
              <div className="border-t border-slate-900 pt-5 mt-6 flex justify-between items-center text-xs text-slate-350 leading-relaxed font-sans font-light">
                <div>
                  <span className="text-[8px] text-slate-500 font-bold uppercase font-display block mb-1">
                    VERDICT NOTES
                  </span>
                  &quot;{refereeResult.verdict}&quot;
                </div>
              </div>

            </div>

            <button
              onClick={() => setActiveStep("WINNER")}
              className="px-8 py-4 bg-gradient-to-r from-amber-500 via-orange-500 to-yellow-500 text-slate-950 font-bold font-display tracking-widest text-xs rounded-xl hover:scale-105 transition-all flex items-center gap-2"
            >
              CLAIM FINAL VERDICT
              <Trophy className="w-4 h-4" />
            </button>

          </div>
        </div>
      )}

      {/* 6. WINNER SCREEN CELEBRATION OVERLAY */}
      {activeStep === "WINNER" && refereeResult && (
        <div className="absolute inset-0 bg-[#020617]/95 backdrop-blur z-50 flex items-center justify-center p-4">
          
          {/* Confetti floats */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
            {[...Array(25)].map((_, i) => (
              <motion.div
                key={i}
                className="absolute rounded-full"
                style={{
                  width: Math.random() * 8 + 4,
                  height: Math.random() * 8 + 4,
                  backgroundColor: i % 3 === 0 ? "#f59e0b" : i % 3 === 1 ? "#3b82f6" : "#ef4444",
                  top: `${Math.random() * 100}%`,
                  left: `${Math.random() * 100}%`,
                }}
                animate={{
                  y: [0, -120, 0],
                  x: [0, Math.random() * 40 - 20, 0],
                  opacity: [0.1, 0.9, 0.1],
                  scale: [0.5, 1.2, 0.5]
                }}
                transition={{
                  duration: Math.random() * 4 + 3,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
              />
            ))}
          </div>

          <div className="w-full max-w-md text-center z-10">
            
            {/* Trophy visual */}
            <div className="w-28 h-28 rounded-full bg-slate-950 border border-slate-900 flex items-center justify-center mb-6 shadow-2xl mx-auto">
              <Trophy className="w-12 h-12 text-amber-400 animate-pulse" />
            </div>

            <span className="text-[9px] text-amber-400 font-bold uppercase tracking-widest font-display border border-amber-500/20 px-3 py-1 rounded-full bg-amber-950/20 mb-3 inline-block">
              DEBATE CHAMPION
            </span>

            <h2 className="text-3xl md:text-4xl font-black font-display text-white uppercase tracking-tight mb-2">
              {refereeResult.winner.toUpperCase()} <span className="bg-gradient-to-r from-amber-400 to-yellow-500 bg-clip-text text-transparent">VICTORIOUS</span>
            </h2>

            <p className="text-slate-400 text-xs font-light leading-relaxed max-w-xs mx-auto mb-8 font-sans">
              The on-device QVAC debate analysis has concluded. You have been awarded the status of **Debate Tactician**.
            </p>

            {/* Summary statistics card */}
            <div className="bg-slate-950/80 border border-slate-900 rounded-xl p-5 mb-8 text-left font-display text-[11px] leading-relaxed flex flex-col gap-2">
              <div className="flex justify-between items-center">
                <span className="text-slate-500">WINNER DECLARED:</span>
                <span className="font-black text-amber-400">{refereeResult.winner}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-500">EVIDENCE SCORE:</span>
                <span className="font-bold text-blue-400">{refereeResult.evidenceScore} / 100</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-500">LOGIC SCORE:</span>
                <span className="font-bold text-purple-400">{refereeResult.logicScore} / 100</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-500">PERSUASION SCORE:</span>
                <span className="font-bold text-yellow-400">{refereeResult.persuasionScore} / 100</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-500">OVERALL SCORE:</span>
                <span className="font-bold text-teal-450">{refereeResult.overallScore} / 100</span>
              </div>
            </div>

            {/* Replay choices action */}
            <div className="flex gap-4">
              <button
                onClick={() => {
                  setDebateFeed([]);
                  setCoachChat([{ role: "coach", content: "Locker room prepped. Awaiting strategy, coach finch is ready.", timestamp: "00:00" }]);
                  setCurrentUserInput("");
                  setCurrentCoachInput("");
                  setSelectedFactIds([]);
                  setRefereeResult(null);
                  setUserMomentum(50);
                  setRivalMomentum(50);
                  setActiveStep("ARSENAL");
                }}
                className="flex-1 px-5 py-4 bg-slate-900 border border-slate-800 text-white font-bold font-display text-xs tracking-wider rounded-xl hover:bg-slate-850 transition-all flex items-center justify-center gap-1.5"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                REPLAY MATCH
              </button>

              <Link
                href="/select"
                className="flex-1 px-5 py-4 bg-gradient-to-r from-blue-500 to-purple-600 text-white font-bold font-display text-xs tracking-wider rounded-xl hover:scale-105 transition-all flex items-center justify-center gap-1.5"
              >
                CHOOSE OTHER
                <Swords className="w-3.5 h-3.5 text-slate-100" />
              </Link>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}

export default function ArenaPage() {
  return (
    <Suspense 
      fallback={
        <div className="flex-1 flex flex-col items-center justify-center min-h-[70vh]">
          <Loader2 className="w-12 h-12 text-blue-500 animate-spin mb-4" />
          <p className="font-display text-sm uppercase tracking-widest text-slate-400">
            Preparing Arena HUD...
          </p>
        </div>
      }
    >
      <ArenaContent />
    </Suspense>
  );
}
