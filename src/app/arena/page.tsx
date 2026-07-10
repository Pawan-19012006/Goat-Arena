"use client";

import { useState, useEffect, useRef, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import { 
  Swords, Trophy, Shield, ArrowRight, RotateCcw, 
  AlertTriangle, Loader2, Send
} from "lucide-react";
import Link from "next/link";

interface DebateMessage {
  role: "user" | "assistant";
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
  turningPoint: string;
  bestUserArg: { quote: string; category: string; impact: string };
  bestOpponentArg: { quote: string; category: string; impact: string };
  weakestUserArg: { quote: string; reason: string };
  weakestOpponentArg: { quote: string; reason: string };
  categoryBreakdown: {
    evidence: string;
    logic: string;
    relevance: string;
    persuasion: string;
  };
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

function CelebrationConfetti() {
  const colors = ["#fbbf24", "#38bdf8", "#f43f5e", "#10b981", "#a855f7", "#ffffff"];
  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden z-10">
      {Array.from({ length: 80 }).map((_, i) => {
        const size = Math.random() * 8 + 6;
        const color = colors[Math.floor(Math.random() * colors.length)];
        const left = Math.random() * 100;
        const duration = Math.random() * 3 + 2;
        const delay = Math.random() * 2;
        return (
          <motion.div
            key={i}
            className="absolute top-[-20px] rounded-sm"
            style={{
              left: `${left}%`,
              width: size,
              height: size,
              backgroundColor: color,
            }}
            animate={{
              y: ["0vh", "105vh"],
              x: ["0px", `${Math.random() * 80 - 40}px`],
              rotate: [0, 360 * (Math.random() > 0.5 ? 1 : -1)],
            }}
            transition={{
              duration: duration,
              delay: delay,
              repeat: Infinity,
              ease: "linear",
            }}
          />
        );
      })}
    </div>
  );
}

function ArenaContent() {
  const searchParams = useSearchParams();
  const sideId = searchParams.get("side") || "messi";

  const opponentSideId =
    sideId === "messi" ? "ronaldo" :
    sideId === "ronaldo" ? "messi" :
    sideId === "mbappe" ? "haaland" :
    sideId === "haaland" ? "mbappe" :
    sideId === "argentina" ? "brazil" :
    sideId === "brazil" ? "argentina" : "";

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<PlayerData | null>(null);
  const [opponentData, setOpponentData] = useState<PlayerData | null>(null);

  const getStanceDescription = () => {
    if (opponentSideId === "ronaldo") {
      return "Defending Cristiano Ronaldo's record scoring volume, international goal dominance, and physical/athletic longevity.";
    }
    if (opponentSideId === "messi") {
      return "Defending Lionel Messi's all-time playmaking assist statistics, calendar year output, and 2022 World Cup glory.";
    }
    if (opponentSideId === "mbappe") {
      return "Defending Kylian Mbappé's explosive speed, World Cup final hat-trick dominance, and clinical goal scoring threat.";
    }
    if (opponentSideId === "haaland") {
      return "Defending Erling Haaland's cyborg goal-scoring rate, single-season Premier League records, and treble achievement.";
    }
    if (opponentSideId === "argentina") {
      return "Defending Argentina's reigning World Cup champion status, back-to-back Copa América dominance, and FIFA #1 rank.";
    }
    if (opponentSideId === "brazil") {
      return "Defending Brazil's historic 5 World Cups, legacy of legendary superstars, and unmatched football heritage.";
    }
    return "Defending the rival's records and competitive achievements.";
  };
  
  // Game Flow State
  const [activeStep, setActiveStep] = useState<ArenaStep>("ARSENAL");
  const [timeLeft, setTimeLeft] = useState(120);
  const [isTimerActive, setIsTimerActive] = useState(false);

  // Debate Log (Center Column)
  const [debateFeed, setDebateFeed] = useState<DebateMessage[]>([]);
  const [currentUserInput, setCurrentUserInput] = useState("");
  const [isOpponentStreaming, setIsOpponentStreaming] = useState(false);
  const [currentOpponentTokenStream, setCurrentOpponentTokenStream] = useState("");

  // Coach private state (Right Column - Research Assistant)
  const [lastCoachQuestion, setLastCoachQuestion] = useState("");
  const [lastCoachResponse, setLastCoachResponse] = useState("");
  const [currentCoachInput, setCurrentCoachInput] = useState("");
  const [isCoachStreaming, setIsCoachStreaming] = useState(false);
  const [currentCoachTokenStream, setCurrentCoachTokenStream] = useState("");
  // UI-only history of Q&A pairs for the stacked card display
  const [coachHistory, setCoachHistory] = useState<{ question: string; answer: string }[]>([]);

  // Momentum scoring metrics
  const [userMomentum, setUserMomentum] = useState(50);
  const [rivalMomentum, setRivalMomentum] = useState(50);

  // Referee Results
  const [refereeResult, setRefereeResult] = useState<RefereeVerdict | null>(null);
  const [selectedFactIds, setSelectedFactIds] = useState<number[]>([]);
  // Running scores state (evidence, logic, relevance, persuasion) accumulated per exchange
  const [runningScores, setRunningScores] = useState({
    sideA: { evidence: 0, logic: 0, relevance: 0, persuasion: 0 },
    sideB: { evidence: 0, logic: 0, relevance: 0, persuasion: 0 }
  });
  const [roundScores, setRoundScores] = useState<{
    ROUND_1: { sideA: number; sideB: number };
    ROUND_2: { sideA: number; sideB: number };
    ROUND_3: { sideA: number; sideB: number };
  }>({
    ROUND_1: { sideA: 0, sideB: 0 },
    ROUND_2: { sideA: 0, sideB: 0 },
    ROUND_3: { sideA: 0, sideB: 0 }
  });
  const [animatedScoreA, setAnimatedScoreA] = useState(0);
  const [animatedScoreB, setAnimatedScoreB] = useState(0);
  const [userTopics, setUserTopics] = useState<string[]>([]);
  const [opponentTopics, setOpponentTopics] = useState<string[]>([]);

  // Debug mode states
  const [isDebugMode] = useState(process.env.NEXT_PUBLIC_DEBUG_MODE === "true");
  const [debugStats, setDebugStats] = useState<{
    promptLength: number;
    retrievalLength: number;
    latency: number;
    snippets: string;
    detectedIntent: string;
    selectedSection: string;
    selectedFile: string;
    opponentMemory: string;
    coachQueryCategory: string;
  }>({
    promptLength: 0,
    retrievalLength: 0,
    latency: 0,
    snippets: "",
    detectedIntent: "N/A",
    selectedSection: "N/A",
    selectedFile: "N/A",
    opponentMemory: "[]",
    coachQueryCategory: "N/A"
  });

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
        // Load user side data
        const response = await fetch(`/data/${sideId}.json`);
        if (!response.ok) {
          throw new Error(`Failed to load data for: ${sideId}`);
        }
        const json = await response.json();
        setData(json);

        // Load opponent side data
        if (opponentSideId) {
          const oppResponse = await fetch(`/data/${opponentSideId}.json`);
          if (oppResponse.ok) {
            const oppJson = await oppResponse.json();
            setOpponentData(oppJson);
          }
        }
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
  }, [sideId, opponentSideId]);

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
  }, [lastCoachResponse, currentCoachTokenStream]);

  // Count-up animation for the final total score
  useEffect(() => {
    if (activeStep === "WINNER") {
      const finalA = roundScores.ROUND_1.sideA + roundScores.ROUND_2.sideA + roundScores.ROUND_3.sideA;
      const finalB = roundScores.ROUND_1.sideB + roundScores.ROUND_2.sideB + roundScores.ROUND_3.sideB;
      
      setAnimatedScoreA(0);
      setAnimatedScoreB(0);

      let currentA = 0;
      let currentB = 0;
      const duration = 1500; // 1.5 seconds count up
      const steps = 30;
      const stepTime = duration / steps;
      const incrementA = finalA / steps;
      const incrementB = finalB / steps;

      const timer = setInterval(() => {
        currentA += incrementA;
        currentB += incrementB;
        if (currentA >= finalA && currentB >= finalB) {
          setAnimatedScoreA(finalA);
          setAnimatedScoreB(finalB);
          clearInterval(timer);
        } else {
          setAnimatedScoreA(Math.min(finalA, Math.round(currentA)));
          setAnimatedScoreB(Math.min(finalB, Math.round(currentB)));
        }
      }, stepTime);

      return () => clearInterval(timer);
    }
  }, [activeStep, roundScores]);

  // Stage transition logic
  const handleStageTransition = () => {
    if (activeStep === "ROUND_1") {
      setActiveStep("TIMEOUT_1");
      setTimeLeft(STAGE_CONFIG.TIMEOUT_1.duration);
    } else if (activeStep === "TIMEOUT_1") {
      setActiveStep("ROUND_2");
      setTimeLeft(STAGE_CONFIG.ROUND_2.duration);
      setLastCoachQuestion("");
      setLastCoachResponse("");
      setCoachHistory([]);
    } else if (activeStep === "ROUND_2") {
      setActiveStep("TIMEOUT_2");
      setTimeLeft(STAGE_CONFIG.TIMEOUT_2.duration);
    } else if (activeStep === "TIMEOUT_2") {
      setActiveStep("ROUND_3");
      setTimeLeft(STAGE_CONFIG.ROUND_3.duration);
      setLastCoachQuestion("");
      setLastCoachResponse("");
      setCoachHistory([]);
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
  ): Promise<{ text: string; category?: string }> => {
    setStreaming(true);
    setText("");
    let text = "";
    let selFile: string | null = null;
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
      const cIntent = res.headers.get("x-coach-intent");
      const oIntent = res.headers.get("x-opponent-intent");
      selFile = res.headers.get("x-selected-file");
      const selSec = res.headers.get("x-selected-section");

      setDebugStats(prev => ({
        ...prev,
        promptLength: pLen ? parseInt(pLen, 10) : prev.promptLength,
        retrievalLength: rLen ? parseInt(rLen, 10) : prev.retrievalLength,
        snippets: rSnips ? decodeURIComponent(rSnips) : prev.snippets,
        detectedIntent: cIntent || oIntent || prev.detectedIntent,
        selectedSection: selSec || prev.selectedSection,
        selectedFile: selFile || prev.selectedFile,
        coachQueryCategory: cIntent || prev.coachQueryCategory
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

      const duration = Math.round(performance.now() - startTime);
      setDebugStats(prev => ({
        ...prev,
        latency: duration
      }));
    } catch (e) {
      console.error(e);
      text = endpoint.includes("coach") ? "Coach temporarily unavailable." : "Rival Legend temporarily unavailable.";
      setText(text);
    } finally {
      setStreaming(false);
      const elapsed = Math.round(performance.now() - startTime);
      setDebugStats(prev => ({ ...prev, latency: elapsed }));
    }
    return { text, category: selFile || undefined };
  };

  // Helper to identify topic categories from statements
  const detectTopics = (text: string): string[] => {
    const clean = text.toLowerCase();
    const topics: string[] = [];
    if (clean.includes("world cup") || clean.includes("worldcup") || clean.includes("troph")) topics.push("world_cups");
    if (clean.includes("recent") || clean.includes("form") || clean.includes("current") || clean.includes("streak")) topics.push("recent_form");
    if (clean.includes("defen") || clean.includes("backline") || clean.includes("tackle") || clean.includes("solid")) topics.push("defense");
    if (clean.includes("squad") || clean.includes("depth") || clean.includes("bench")) topics.push("squad_depth");
    if (clean.includes("manager") || clean.includes("coach") || clean.includes("tact")) topics.push("manager");
    if (clean.includes("star") || clean.includes("legend") || clean.includes("ballon") || clean.includes("goal") || clean.includes("assist")) topics.push("star_players");
    return topics;
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

    // Detect user topics
    const newUList = detectTopics(userText);
    let currentUTopics = userTopics;
    if (newUList.length > 0) {
      currentUTopics = Array.from(new Set([...userTopics, ...newUList]));
      setUserTopics(currentUTopics);
    }

    // Map transcript history for QVAC format
    const historyPayload = updatedFeed.map(f => ({
      role: f.role === "user" ? "user" as const : "assistant" as const,
      content: f.content
    }));

    // Trigger opponent response stream
    const oppResult = await streamReader(
      "/api/agent/opponent",
      {
        side: data.teamName,
        rival: data.rival,
        argument: userText,
        history: historyPayload,
        userTopics: currentUTopics,
        opponentTopics: opponentTopics
      },
      setCurrentOpponentTokenStream,
      setIsOpponentStreaming
    );
    const finalOpponentText = oppResult.text;
    const selectedCategory = oppResult.category;

    // Lock opponent message in feed
    setDebateFeed(prev => [...prev, {
      role: "assistant",
      content: finalOpponentText,
      timestamp: getMatchTimestamp()
    }]);
    setCurrentOpponentTokenStream("");

    // Push the actual selected category to opponentTopics memory list
    const updatedOpponentTopics = selectedCategory 
      ? [...opponentTopics, selectedCategory] 
      : opponentTopics;
      
    if (selectedCategory) {
      setOpponentTopics(updatedOpponentTopics);
    }

    setDebugStats(prev => ({
      ...prev,
      opponentMemory: JSON.stringify({ userTopics: currentUTopics, opponentTopics: updatedOpponentTopics })
    }));

    // Shift momentum in Opponent's favor
    const rivalShift = Math.floor(Math.random() * 12) + 5;
    setRivalMomentum(prev => Math.min(95, prev + rivalShift));
    setUserMomentum(prev => Math.max(15, prev - Math.floor(rivalShift * 0.7)));

    // Score the current exchange in the background
    handleScoreExchange(userText, finalOpponentText, activeStep);
  };

  // Background scoring fetch per round exchange
  const handleScoreExchange = async (userText: string, opponentText: string, roundName: string) => {
    if (!data) return;
    try {
      const res = await fetch("/api/agent/referee", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "score",
          sideA: data.teamName,
          sideB: data.rival,
          sideAStatement: userText,
          sideBStatement: opponentText
        })
      });
      if (!res.ok) throw new Error("Scoring endpoint failed");
      const scores = await res.json() as {
        sideA: { evidence: number; logic: number; relevance: number; persuasion: number };
        sideB: { evidence: number; logic: number; relevance: number; persuasion: number };
      };
      
      const scoreAVal = (scores.sideA.evidence ?? 0) + (scores.sideA.logic ?? 0) + (scores.sideA.relevance ?? 0) + (scores.sideA.persuasion ?? 0);
      const scoreBVal = (scores.sideB.evidence ?? 0) + (scores.sideB.logic ?? 0) + (scores.sideB.relevance ?? 0) + (scores.sideB.persuasion ?? 0);

      setRunningScores(prev => ({
        sideA: {
          evidence: prev.sideA.evidence + (scores.sideA.evidence ?? 0),
          logic: prev.sideA.logic + (scores.sideA.logic ?? 0),
          relevance: prev.sideA.relevance + (scores.sideA.relevance ?? 0),
          persuasion: prev.sideA.persuasion + (scores.sideA.persuasion ?? 0)
        },
        sideB: {
          evidence: prev.sideB.evidence + (scores.sideB.evidence ?? 0),
          logic: prev.sideB.logic + (scores.sideB.logic ?? 0),
          relevance: prev.sideB.relevance + (scores.sideB.relevance ?? 0),
          persuasion: prev.sideB.persuasion + (scores.sideB.persuasion ?? 0)
        }
      }));

      if (roundName === "ROUND_1" || roundName === "ROUND_2" || roundName === "ROUND_3") {
        setRoundScores(prev => ({
          ...prev,
          [roundName]: {
            sideA: prev[roundName].sideA + scoreAVal,
            sideB: prev[roundName].sideB + scoreBVal
          }
        }));
      }
    } catch (e) {
      console.error("[Background Scoring Error]", e);
    }
  };

  // Custom private user ask to Tactical Coach
  const handleAskCoach = async () => {
    if (!currentCoachInput.trim() || !data || isCoachStreaming) return;
    const questionText = currentCoachInput;
    setCurrentCoachInput("");
    setLastCoachQuestion(questionText);
    setLastCoachResponse("");

    const coachResult = await streamReader(
      "/api/agent/coach",
      { side: data.teamName, question: questionText },
      setCurrentCoachTokenStream,
      setIsCoachStreaming
    );
    const coachReply = coachResult.text;

    setLastCoachResponse(coachReply);
    setCurrentCoachTokenStream("");
    // Push completed pair into display history (UI only)
    if (coachReply.trim()) {
      setCoachHistory(prev => [...prev, { question: questionText, answer: coachReply }]);
    }
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

      // Calculate total points mathematically from roundScores
      const totalA = roundScores.ROUND_1.sideA + roundScores.ROUND_2.sideA + roundScores.ROUND_3.sideA;
      const totalB = roundScores.ROUND_1.sideB + roundScores.ROUND_2.sideB + roundScores.ROUND_3.sideB;

      let winnerName = "Draw";
      let winnerSide = "draw";
      if (totalA > totalB) {
        winnerName = data.teamName;
        winnerSide = "user";
      } else if (totalB > totalA) {
        winnerName = opponentData ? opponentData.teamName : data.rival;
        winnerSide = "opponent";
      }

      // We still ask the referee for match commentary / turning point
      const res = await fetch("/api/agent/referee", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "explain",
          sideA: data.teamName,
          sideB: data.rival,
          winner: winnerName === "Draw" ? data.teamName : winnerName,
          sideAScores: runningScores.sideA,
          sideBScores: runningScores.sideB,
          history: historyPayload
        })
      });

      const explainData = {
        turningPoint: winnerName === "Draw" 
          ? "A highly balanced tactical clash ends with both sides sharing the spoils."
          : `${winnerName} demonstrated superior control and precision during key exchanges to secure victory.`
      };

      if (res.ok) {
        try {
          const rawExplain = await res.json();
          if (rawExplain.turningPoint) {
            explainData.turningPoint = rawExplain.turningPoint;
          }
        } catch (e) {
          console.warn("[Referee] Explanation parse failed, using fallback:", e);
        }
      }

      setRefereeResult({
        winner: winnerName,
        winnerSide: winnerSide,
        evidenceScore: totalA,
        logicScore: totalB,
        persuasionScore: 0,
        counteringScore: 0,
        overallScore: 0,
        verdict: "Outcome compiled.",
        turningPoint: explainData.turningPoint,
        bestUserArg: { quote: "", category: "", impact: "" },
        bestOpponentArg: { quote: "", category: "", impact: "" },
        weakestUserArg: { quote: "", reason: "" },
        weakestOpponentArg: { quote: "", reason: "" },
        categoryBreakdown: { evidence: "", logic: "", relevance: "", persuasion: "" }
      });
      setActiveStep("WINNER");

      const pLen = res.headers.get("x-prompt-length");
      setDebugStats(prev => ({
        ...prev,
        promptLength: pLen ? parseInt(pLen, 10) : 0,
        retrievalLength: 0,
        latency: Math.round(performance.now() - startTime),
        snippets: "N/A (Referee processes debate summary)"
      }));
    } catch (e: unknown) {
      console.error(e);
      const totalA = roundScores.ROUND_1.sideA + roundScores.ROUND_2.sideA + roundScores.ROUND_3.sideA;
      const totalB = roundScores.ROUND_1.sideB + roundScores.ROUND_2.sideB + roundScores.ROUND_3.sideB;
      let winnerName = "Draw";
      let winnerSide = "draw";
      if (totalA > totalB) {
        winnerName = data.teamName;
        winnerSide = "user";
      } else if (totalB > totalA) {
        winnerName = opponentData ? opponentData.teamName : data.rival;
        winnerSide = "opponent";
      }

      setRefereeResult({
        winner: winnerName,
        winnerSide: winnerSide,
        evidenceScore: totalA,
        logicScore: totalB,
        persuasionScore: 0,
        counteringScore: 0,
        overallScore: 0,
        verdict: "Outcome compiled.",
        turningPoint: `The match concluded with a final score of ${totalA} - ${totalB}.`,
        bestUserArg: { quote: "", category: "", impact: "" },
        bestOpponentArg: { quote: "", category: "", impact: "" },
        weakestUserArg: { quote: "", reason: "" },
        weakestOpponentArg: { quote: "", reason: "" },
        categoryBreakdown: { evidence: "", logic: "", relevance: "", persuasion: "" }
      });
      setActiveStep("WINNER");
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

  return (
    <div className="h-screen max-h-screen overflow-hidden flex flex-col w-full px-4 py-4 relative select-none bg-slate-950 text-white">
      
      {/* 1. Redesigned Esports Broadcast HUD Header */}
      <header className="w-full grid grid-cols-12 items-center border border-slate-900 bg-slate-950/95 backdrop-blur rounded-xl p-3 mb-4 relative overflow-hidden shadow-inner shrink-0">
        <div className="absolute bottom-0 left-0 right-0 h-[1.5px] bg-gradient-to-r from-blue-500/40 via-purple-500/20 to-red-500/40" />
        
        {/* Left column: Logo info */}
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

        {/* Center column: Matchup & Progress Timeline */}
        <div className="col-span-6 flex flex-col items-center">
          {/* Matchup names */}
          <div className="flex items-center gap-4 mb-1">
            <span className="font-display text-base font-black tracking-widest text-blue-400 uppercase">
              {data.name}
            </span>
            <span className="text-xs font-semibold text-slate-500 font-display">VS</span>
            <span className="font-display text-base font-black tracking-widest text-red-500 uppercase">
              {data.rival}
            </span>
          </div>

          {/* Moved & Redesigned progression timeline */}
          <div className="flex items-center gap-1.5 md:gap-2.5 text-[9px] md:text-[10px] font-display font-black tracking-wider mt-1.5">
            {[
              { id: "ROUND_1", label: "ROUND 1" },
              { id: "TIMEOUT_1", label: "TIMEOUT 1" },
              { id: "ROUND_2", label: "ROUND 2" },
              { id: "TIMEOUT_2", label: "TIMEOUT 2" },
              { id: "ROUND_3", label: "ROUND 3" }
            ].map((p, idx, arr) => {
              const phases = arr.map(x => x.id);
              const stepIndex = phases.indexOf(activeStep);
              const isCurrent = activeStep === p.id;
              const isCompleted = stepIndex > idx;
              
              return (
                <div key={p.id} className="flex items-center gap-1">
                  {idx > 0 && <span className="text-slate-800 font-bold mx-0.5">➔</span>}
                  <div className={`px-2.5 py-1 rounded-md border transition-all ${
                    isCurrent 
                      ? "bg-purple-950/40 border-purple-500 text-white shadow shadow-purple-500/25 scale-105" 
                      : isCompleted 
                        ? "bg-green-950/20 border-green-900/30 text-green-400" 
                        : "bg-slate-900/40 border-slate-900 text-slate-600 opacity-60"
                  }`}>
                    {isCompleted ? "✓ " : ""}{p.label}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right column: Broadcast clock, crowd stats, and QVAC badge */}
        <div className="col-span-3 flex items-center justify-end gap-3 font-display">

          {/* QVAC badge */}
          <div className="flex items-center gap-1.5 bg-purple-950/20 border border-purple-900/30 px-2.5 py-1 rounded-lg text-purple-400 text-[9px] font-black tracking-wider">
            <span className="w-1 h-1 rounded-full bg-purple-400 animate-pulse" />
            QVAC LOCAL AI
          </div>

          {/* Broadcast Match Clock */}
          {roundConfig ? (
            <div className="flex items-center gap-2.5 bg-slate-900 border border-slate-850 rounded-lg px-2.5 py-1 shadow-inner">
              <div className="flex flex-col items-end leading-none">
                <span className="text-[6.5px] text-slate-500 font-bold uppercase tracking-widest font-display">CLOCK</span>
                <span className="font-display text-sm font-black tracking-widest text-blue-400 mt-0.5">
                  {formatTime(timeLeft)}
                </span>
              </div>
              <button 
                onClick={handleFastForward}
                className="text-[7.5px] font-display font-black text-slate-500 hover:text-white bg-slate-950 border border-slate-850 px-1.5 py-0.5 rounded hover:border-slate-750 transition-all shrink-0"
                title="Demo Skip Timer"
              >
                ⏩ SKIP
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-1.5 bg-slate-900 border border-slate-850 px-2.5 py-1 rounded-lg text-slate-400 text-[9px] font-bold uppercase tracking-wider">
              <span className="w-1 h-1 rounded-full bg-slate-700 animate-pulse" />
              EVALUATING
            </div>
          )}
        </div>
      </header>


      {/* 2. Responsive 3-Column layout dashboard */}
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-4 items-stretch min-h-0 overflow-hidden">
        
        {/* LEFT COLUMN: RIVAL LEGEND CARD (lg:col-span-2) */}
        <div className="lg:col-span-2 flex flex-col gap-4 overflow-y-auto pr-1 min-h-0 scrollbar-thin">
          <div className="flex-1 glass-panel rounded-xl p-5 border border-slate-900 bg-gradient-to-b from-red-950/10 via-slate-950 to-slate-950/70 flex flex-col justify-between relative overflow-hidden shadow-lg shadow-black/40 min-h-0">
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
                <AvatarIcon type={opponentSideId} size={12} />
                <div>
                  <h3 className="text-lg font-black text-white font-display uppercase tracking-wider leading-none">
                    {opponentData?.name || data.rival}
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
                  {getStanceDescription()}
                </p>
              </div>

              {/* Key strengths bullets */}
              <div>
                <span className="text-xs text-slate-500 font-bold uppercase font-display block mb-2">
                  KEY RIVAL ASSETS
                </span>
                <ul className="flex flex-col gap-2">
                  {opponentData?.stats ? (
                    opponentData.stats.slice(0, 3).map((stat, i) => (
                      <li key={i} className="text-base text-slate-300 font-normal flex items-start gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-red-500 shrink-0 mt-2" />
                        <span className="leading-tight">
                          <span className="font-bold text-slate-200">{stat.label}</span>: {stat.value}
                        </span>
                      </li>
                    ))
                  ) : (
                    <li className="text-base text-slate-350 font-normal flex items-center gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-red-500 shrink-0" />
                      Loading stats...
                    </li>
                  )}
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
        <div className="lg:col-span-7 flex flex-col gap-4 min-h-0 overflow-hidden">
          <div className="flex-1 glass-panel-heavy rounded-xl p-5 border border-slate-800 bg-slate-950/50 flex flex-col relative overflow-hidden shadow-inner min-h-0">
            
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
                        <AvatarIcon type={isUser ? sideId : opponentSideId} size={8} />
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
                    <AvatarIcon type={opponentSideId} size={8} />
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
                  <div><span className="text-slate-500 font-bold">DETECTED INTENT:</span> {debugStats.detectedIntent}</div>
                  <div><span className="text-slate-500 font-bold">SELECTED SECTION:</span> {debugStats.selectedSection}</div>
                  <div><span className="text-slate-500 font-bold">SELECTED FILE:</span> {debugStats.selectedFile}</div>
                  <div><span className="text-slate-500 font-bold">COACH CATEGORY:</span> {debugStats.coachQueryCategory}</div>
                  <div className="col-span-2"><span className="text-slate-500 font-bold">OPPONENT TOPICS MEMORY:</span> {debugStats.opponentMemory}</div>
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
        <div className="lg:col-span-3 flex flex-col gap-3 min-h-0 overflow-hidden">
          {activeStep === "TIMEOUT_1" || activeStep === "TIMEOUT_2" ? (
            <div className="flex-1 glass-panel rounded-xl border border-slate-900 bg-gradient-to-b from-blue-950/10 via-slate-950 to-slate-950/70 flex flex-col relative overflow-hidden shadow-lg shadow-black/40 animate-fade-in min-h-0">
              {/* Blue border top highlight */}
              <div className="absolute top-0 left-0 right-0 h-[2px] bg-blue-500/50" />

              {/* ── COACH HEADER ── */}
              <div className="px-4 pt-4 pb-3 flex items-center justify-between border-b border-slate-900 shrink-0">
                <div className="flex items-center gap-3">
                  <AvatarIcon type="coach" size={10} />
                  <div>
                    <h3 className="text-base font-black text-white font-display uppercase tracking-wider leading-none">
                      COACH FINCH
                    </h3>
                    <span className="text-[9px] text-slate-500 font-semibold tracking-wider font-display uppercase block mt-0.5">
                      PRIVATE RESEARCH ASSISTANT
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-1.5 text-[8px] font-bold text-green-400 font-display uppercase bg-green-950/20 border border-green-900/30 px-2 py-0.5 rounded-full">
                  <span className="w-1 h-1 rounded-full bg-green-500 animate-pulse" />
                  ONLINE
                </div>
              </div>

              {/* ── SCROLLABLE Q&A HISTORY ── */}
              <div
                className="flex-1 overflow-y-auto px-4 py-3 flex flex-col gap-3 scrollbar-thin"
                style={{ minHeight: 0 }}
              >
                {/* Empty state — compact status card */}
                {coachHistory.length === 0 && !isCoachStreaming && (
                  <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-pulse" />
                      <span className="text-xs font-bold font-display text-blue-400 uppercase tracking-widest">COACH STATUS</span>
                    </div>
                    <p className="text-sm text-slate-300 font-sans leading-relaxed mb-3">
                      Ready to answer football questions.
                    </p>
                    <div className="border-t border-slate-800 pt-3">
                      <p className="text-[10px] text-slate-500 font-display uppercase tracking-wider mb-2">EXAMPLES</p>
                      <ul className="flex flex-col gap-1.5">
                        {[
                          "Who does Haaland represent?",
                          "Give 3 arguments for Brazil.",
                          "List Messi achievements."
                        ].map((ex, i) => (
                          <li
                            key={i}
                            onClick={() => setCurrentCoachInput(ex)}
                            className="flex items-start gap-2 text-sm text-slate-400 hover:text-blue-300 cursor-pointer transition-colors"
                          >
                            <span className="text-blue-500 shrink-0 mt-0.5">•</span>
                            <span>{ex}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                )}

                {/* Stacked Q&A history cards */}
                {coachHistory.map((item, i) => (
                  <div key={i} className="flex flex-col gap-1.5">
                    {/* Question card */}
                    <div className="bg-blue-950/20 border border-blue-900/30 rounded-xl px-3 py-2.5">
                      <span className="text-[9px] font-bold font-display text-blue-400 uppercase tracking-widest block mb-1">Q</span>
                      <p className="text-base font-semibold text-slate-200 leading-snug">{item.question}</p>
                    </div>
                    {/* Answer card */}
                    <div className="bg-slate-900/60 border border-slate-800 rounded-xl px-3 py-2.5">
                      <span className="text-[9px] font-bold font-display text-green-400 uppercase tracking-widest block mb-1">A</span>
                      <div className="text-base leading-relaxed text-slate-100 whitespace-pre-wrap select-text font-sans">{item.answer}</div>
                    </div>
                  </div>
                ))}

                {/* Live streaming card for in-progress answer */}
                {isCoachStreaming && (
                  <div className="flex flex-col gap-1.5">
                    {lastCoachQuestion && (
                      <div className="bg-blue-950/20 border border-blue-900/30 rounded-xl px-3 py-2.5">
                        <span className="text-[9px] font-bold font-display text-blue-400 uppercase tracking-widest block mb-1">Q</span>
                        <p className="text-base font-semibold text-slate-200 leading-snug">{lastCoachQuestion}</p>
                      </div>
                    )}
                    <div className="bg-slate-900/60 border border-slate-800 rounded-xl px-3 py-2.5">
                      <span className="text-[9px] font-bold font-display text-green-400 uppercase tracking-widest block mb-1">A</span>
                      {currentCoachTokenStream ? (
                        <div className="text-base leading-relaxed text-slate-100 whitespace-pre-wrap select-text font-sans">{currentCoachTokenStream}</div>
                      ) : (
                        <div className="flex items-center gap-2 text-sm text-blue-400 animate-pulse">
                          <Loader2 className="w-3 h-3 animate-spin" />
                          Analyzing...
                        </div>
                      )}
                    </div>
                  </div>
                )}

                <div ref={coachEndRef} />
              </div>

              {/* ── PINNED INPUT ── */}
              <div className="border-t border-slate-900 px-4 py-3 shrink-0">
                <div className="flex items-center gap-2">
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
                    className="flex-1 bg-slate-950 border border-slate-800 rounded-lg px-3 py-2.5 text-sm text-slate-100 placeholder:text-slate-600 focus:outline-none focus:border-blue-500/80 focus:ring-1 focus:ring-blue-500/20 transition-all font-sans"
                  />
                  <button
                    onClick={handleAskCoach}
                    disabled={currentCoachInput.trim().length < 4 || isCoachStreaming || isOpponentStreaming}
                    className={`w-9 h-9 rounded-lg flex items-center justify-center transition-all shrink-0 ${
                      currentCoachInput.trim().length >= 4 && !isCoachStreaming && !isOpponentStreaming
                        ? "bg-blue-600 text-white hover:bg-blue-500 shadow shadow-blue-500/20"
                        : "bg-slate-900 text-slate-600 border border-slate-800 cursor-not-allowed"
                    }`}
                  >
                    <Send className="w-3.5 h-3.5" />
                  </button>
                </div>
                <p className="text-[9px] text-slate-600 font-display uppercase tracking-wider mt-1.5 text-center">
                  PRESS ENTER TO SEND
                </p>
              </div>
            </div>
          ) : (
            <div className="flex-1 glass-panel rounded-xl p-5 border border-slate-900 bg-gradient-to-b from-slate-950 via-slate-950 to-slate-950/70 flex flex-col items-center justify-center text-center opacity-40 select-none shadow-lg shadow-black/40">
              <Shield className="w-12 h-12 text-slate-600 mb-3 animate-pulse" />
              <span className="text-sm font-display font-bold uppercase tracking-widest text-slate-500">
                COACH PANEL LOCKED
              </span>
              <p className="text-sm text-slate-500 font-sans mt-2 max-w-[180px] leading-relaxed">
                Coach Finch is only available during Strategic Timeouts.
              </p>
            </div>
          )}
        </div>

      </div>

      {/* 3. Double momentum stats bar footer */}
      <footer className="w-full mt-4 flex flex-col gap-3">

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
            <AvatarIcon type={opponentSideId} size={7} />
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
              <p className="text-slate-400 text-base mt-2 max-w-lg mx-auto leading-relaxed">
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
                  <span className="text-sm text-slate-400 leading-relaxed font-normal font-sans block">
                    {stat.description}
                  </span>
                </div>
              ))}
            </div>

            {/* Interactive fact selectors */}
            <div className="glass-panel border-slate-900 rounded-xl p-6 mb-8 bg-slate-950/25">
              <span className="text-sm font-bold font-display text-white uppercase mb-4 flex items-center gap-2">
                <Shield className="w-4 h-4 text-blue-400" />
                TACTICAL FACTS SHELF (SELECT TO ARM)
              </span>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mt-4">
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
                      className={`p-4 rounded-xl border cursor-pointer transition-all ${
                        isSelected 
                          ? "bg-slate-900 border-blue-500/50" 
                          : "bg-slate-950/40 border-slate-900 hover:border-slate-800"
                      }`}
                    >
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-sm font-bold text-white uppercase font-display flex items-center gap-1.5">
                          <span className={`w-1.5 h-1.5 rounded-full ${isSelected ? "bg-blue-400" : "bg-slate-700"}`} />
                          {item.title}
                        </span>
                        <span className={`text-[9px] font-bold font-display px-2 py-0.5 rounded-full ${
                          isSelected ? "bg-blue-500/10 text-blue-400" : "bg-slate-900 text-slate-500"
                        }`}>
                          {isSelected ? "ARMED" : "ARM"}
                        </span>
                      </div>
                      <p className="text-sm text-slate-300 font-normal leading-relaxed pl-3 font-sans">
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

      {/* 5. POST-GAME ESPORTS CHAMPIONSHIP VERDICT */}
      {activeStep === "WINNER" && refereeResult && (
        <div className="absolute inset-0 bg-[#030712] z-50 flex flex-col overflow-y-auto h-screen max-h-screen text-slate-100 font-sans select-text relative">
          
          {/* Confetti Celebration */}
          {refereeResult.winnerSide !== "draw" && <CelebrationConfetti />}

          {/* Radial Stadium Lighting Effect */}
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(59,130,246,0.12)_0%,transparent_70%)] pointer-events-none" />

          {/* Main Visual Arena Grid */}
          <div className="flex-1 flex flex-col items-center justify-center p-6 md:p-12 z-20 max-w-4xl mx-auto w-full">
            
            {/* Stadium Title */}
            <motion.span 
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-[11px] text-amber-500 font-black uppercase tracking-[0.3em] font-display mb-1 block"
            >
              ⚽ GOAT Arena Match Verdict ⚽
            </motion.span>

            {/* Winner Announcement & Trophy */}
            <motion.div 
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.2, type: "spring", stiffness: 100 }}
              className="flex flex-col items-center mb-6"
            >
              {refereeResult.winnerSide === "draw" ? (
                <div className="w-24 h-24 rounded-full bg-gradient-to-br from-slate-700 to-slate-900 flex items-center justify-center shadow-2xl mb-4 border border-slate-700">
                  <Swords className="w-10 h-10 text-slate-300" />
                </div>
              ) : (
                <div className="w-24 h-24 rounded-full bg-gradient-to-br from-amber-400 via-yellow-500 to-orange-500 flex items-center justify-center shadow-2xl shadow-amber-500/20 mb-4 relative">
                  <Trophy className="w-12 h-12 text-slate-950" />
                  <motion.div 
                    animate={{ rotate: 360 }}
                    transition={{ repeat: Infinity, duration: 10, ease: "linear" }}
                    className="absolute inset-0 border-2 border-dashed border-amber-300 rounded-full scale-110 opacity-40"
                  />
                </div>
              )}

              <h1 className="text-4xl md:text-5xl font-black font-display tracking-tight text-center uppercase leading-none text-white drop-shadow-md">
                {refereeResult.winnerSide === "draw" 
                  ? "IT'S A DRAW" 
                  : `${refereeResult.winner.toUpperCase()} VICTORIOUS`
                }
              </h1>
              
              {refereeResult.winnerSide !== "draw" && (
                <span className="text-xs text-slate-400 font-sans mt-2 block tracking-wider uppercase">
                  🏆 The debate referee has crowned the champion 🏆
                </span>
              )}
            </motion.div>

            {/* Stadium Large Scoreboard Count-up */}
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
              className="bg-slate-950/60 border border-slate-900 rounded-3xl p-6 px-12 mb-8 flex items-center justify-center gap-10 shadow-3xl backdrop-blur-lg relative min-w-[320px]"
            >
              <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-slate-800 to-transparent" />
              
              {/* User side */}
              <div className="flex flex-col items-center">
                <AvatarIcon type={sideId} size={10} />
                <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider mt-2 max-w-[80px] text-center truncate">
                  {data.name}
                </span>
                <span className="text-4xl md:text-5xl font-black font-display text-blue-400 mt-1">
                  {animatedScoreA}
                </span>
              </div>

              {/* VS Divider */}
              <span className="text-slate-700 font-black text-2xl font-display uppercase tracking-widest">VS</span>

              {/* Opponent side */}
              <div className="flex flex-col items-center">
                <AvatarIcon type={opponentSideId} size={10} />
                <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider mt-2 max-w-[80px] text-center truncate">
                  {opponentData ? opponentData.name : data.rival}
                </span>
                <span className="text-4xl md:text-5xl font-black font-display text-rose-400 mt-1">
                  {animatedScoreB}
                </span>
              </div>
            </motion.div>

            {/* Match Summary Scorecard Card */}
            <motion.div 
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
              className="bg-slate-950/50 border border-slate-900/80 backdrop-blur-md rounded-2xl overflow-hidden p-6 w-full max-w-lg mb-8 shadow-2xl relative"
            >
              <div className="absolute top-0 left-0 bottom-0 w-1 bg-gradient-to-b from-amber-500 to-yellow-600" />
              
              <span className="text-[9px] text-slate-400 font-bold uppercase tracking-widest font-display block mb-4 border-b border-slate-900 pb-2">
                📊 DETAILED MATCH SCORECARD
              </span>

              <div className="flex flex-col gap-4">
                {/* Round 1 */}
                <div className="flex items-center justify-between text-sm">
                  <span className="font-bold text-slate-300 uppercase text-xs tracking-wider">ROUND 1</span>
                  <div className="flex items-center gap-6 font-display">
                    <span className="text-blue-400 font-black">{roundScores.ROUND_1.sideA} pts</span>
                    <span className="text-slate-600 font-black">/</span>
                    <span className="text-rose-400 font-black">{roundScores.ROUND_1.sideB} pts</span>
                  </div>
                </div>

                {/* Round 2 */}
                <div className="flex items-center justify-between text-sm border-t border-slate-900/60 pt-3">
                  <span className="font-bold text-slate-300 uppercase text-xs tracking-wider">ROUND 2</span>
                  <div className="flex items-center gap-6 font-display">
                    <span className="text-blue-400 font-black">{roundScores.ROUND_2.sideA} pts</span>
                    <span className="text-slate-600 font-black">/</span>
                    <span className="text-rose-400 font-black">{roundScores.ROUND_2.sideB} pts</span>
                  </div>
                </div>

                {/* Round 3 */}
                <div className="flex items-center justify-between text-sm border-t border-slate-900/60 pt-3">
                  <span className="font-bold text-slate-300 uppercase text-xs tracking-wider">ROUND 3</span>
                  <div className="flex items-center gap-6 font-display">
                    <span className="text-blue-400 font-black">{roundScores.ROUND_3.sideA} pts</span>
                    <span className="text-slate-600 font-black">/</span>
                    <span className="text-rose-400 font-black">{roundScores.ROUND_3.sideB} pts</span>
                  </div>
                </div>

                {/* Final Total */}
                <div className="flex items-center justify-between text-sm border-t border-amber-900/40 bg-amber-950/5 p-3 rounded-xl mt-1">
                  <span className="font-black text-amber-400 uppercase text-xs tracking-wider">FINAL TOTAL</span>
                  <div className="flex items-center gap-6 font-display text-base font-black">
                    <span className="text-blue-400">{roundScores.ROUND_1.sideA + roundScores.ROUND_2.sideA + roundScores.ROUND_3.sideA}</span>
                    <span className="text-amber-500/30">-</span>
                    <span className="text-rose-400">{roundScores.ROUND_1.sideB + roundScores.ROUND_2.sideB + roundScores.ROUND_3.sideB}</span>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Verdict commentary box */}
            {refereeResult.turningPoint && (
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.8 }}
                className="bg-slate-900/20 border border-slate-900/50 rounded-xl p-4 w-full max-w-lg mb-4 text-center"
              >
                <span className="text-[8px] text-amber-500 font-bold uppercase tracking-wider block mb-1">
                  📢 Referee Verdict Commentary
                </span>
                <p className="text-xs text-slate-300 leading-relaxed font-sans italic">
                  &ldquo;{refereeResult.turningPoint}&rdquo;
                </p>
              </motion.div>
            )}

          </div>

          {/* Footer Actions */}
          <footer className="border-t border-slate-900 bg-slate-950/80 px-6 py-4 flex gap-4 items-center justify-center shrink-0 w-full z-30 mt-auto">
            <button
              onClick={() => {
                setDebateFeed([]);
                setLastCoachQuestion("");
                setLastCoachResponse("");
                setCoachHistory([]);
                setLastCoachResponse("");
                setCurrentUserInput("");
                setCurrentCoachInput("");
                setSelectedFactIds([]);
                setRefereeResult(null);
                setUserMomentum(50);
                setRivalMomentum(50);
                setRunningScores({
                  sideA: { evidence: 0, logic: 0, relevance: 0, persuasion: 0 },
                  sideB: { evidence: 0, logic: 0, relevance: 0, persuasion: 0 }
                });
                setRoundScores({
                  ROUND_1: { sideA: 0, sideB: 0 },
                  ROUND_2: { sideA: 0, sideB: 0 },
                  ROUND_3: { sideA: 0, sideB: 0 }
                });
                setAnimatedScoreA(0);
                setAnimatedScoreB(0);
                setUserTopics([]);
                setOpponentTopics([]);
                setActiveStep("ARSENAL");
              }}
              className="px-6 py-3 bg-slate-900 border border-slate-800 text-white font-bold font-display text-xs tracking-wider rounded-xl hover:bg-slate-800 transition-all flex items-center gap-1.5"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              REPLAY MATCH
            </button>
            <Link
              href="/select"
              className="px-6 py-3 bg-gradient-to-r from-amber-500 to-orange-500 text-slate-950 font-bold font-display text-xs tracking-wider rounded-xl hover:scale-105 transition-all flex items-center gap-1.5"
            >
              <Trophy className="w-3.5 h-3.5" />
              NEW CLASH
            </Link>
            <Link
              href="/select"
              className="px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white font-bold font-display text-xs tracking-wider rounded-xl hover:scale-105 transition-all"
            >
              CHOOSE RIVALRY
            </Link>
          </footer>

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
