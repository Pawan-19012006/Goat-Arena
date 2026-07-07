"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Swords, Trophy, Shield, ArrowRight, 
  RotateCcw, Sparkles, MessageSquareCode, Award, AlertTriangle, 
  ChevronRight, Loader2 
} from "lucide-react";
import Link from "next/link";

interface DebateMessage {
  role: "user" | "assistant" | "system";
  content: string;
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

interface RefereeScores {
  evidence: number;
  logic: number;
  persuasion: number;
  countering: number;
  consistency: number;
}

interface RefereeVerdict {
  scores: RefereeScores;
  round1: number;
  round2: number;
  round3: number;
  winner: string;
  verdict: string;
}

type ArenaStep = 
  | "ARSENAL" 
  | "DEBATE_R1" | "COUNTER_R1" | "COACH_R1"
  | "DEBATE_R2" | "COUNTER_R2" | "COACH_R2"
  | "DEBATE_R3" | "COUNTER_R3"
  | "SCOREBOARD" 
  | "WINNER";

const STEPS_TIMELINE = [
  { id: "ARSENAL", label: "Locker" },
  { id: "DEBATE_R1", label: "Rd 1 Debate" },
  { id: "COUNTER_R1", label: "Rd 1 Opponent" },
  { id: "COACH_R1", label: "Rd 1 Coach" },
  { id: "DEBATE_R2", label: "Rd 2 Debate" },
  { id: "COUNTER_R2", label: "Rd 2 Opponent" },
  { id: "COACH_R2", label: "Rd 2 Coach" },
  { id: "DEBATE_R3", label: "Rd 3 Rebuttal" },
  { id: "COUNTER_R3", label: "Rd 3 Final" },
  { id: "SCOREBOARD", label: "Verdict" },
  { id: "WINNER", label: "Celebration" }
];

function ArenaContent() {
  const searchParams = useSearchParams();

  // Retrieve rivalry and side
  const sideId = searchParams.get("side") || "messi";

  const [loading, setLoading] = useState(true);
  const [modelLoading, setModelLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<PlayerData | null>(null);
  const [activeStep, setActiveStep] = useState<ArenaStep>("ARSENAL");
  
  // Debate Transcripts
  const [argumentR1, setArgumentR1] = useState("");
  const [opponentR1, setOpponentR1] = useState("");
  const [analystR1, setAnalystR1] = useState("");

  const [argumentR2, setArgumentR2] = useState("");
  const [opponentR2, setOpponentR2] = useState("");
  const [analystR2, setAnalystR2] = useState("");

  const [argumentR3, setArgumentR3] = useState("");
  const [opponentR3, setOpponentR3] = useState("");

  const [selectedFactIds, setSelectedFactIds] = useState<number[]>([]);
  const [history, setHistory] = useState<DebateMessage[]>([]);
  
  // Streaming loaders
  const [isOpponentStreaming, setIsOpponentStreaming] = useState(false);
  const [isAnalystStreaming, setIsAnalystStreaming] = useState(false);

  // Referee Results
  const [refereeResult, setRefereeResult] = useState<RefereeVerdict | null>(null);

  // 1. Initial preloading & cleanup hooks
  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);
        const response = await fetch(`/data/${sideId}.json`);
        if (!response.ok) {
          throw new Error(`Failed to load team data for: ${sideId}`);
        }
        const json = await response.json();
        setData(json);
      } catch (err: unknown) {
        console.error(err);
        setError(err instanceof Error ? err.message : "An error occurred.");
      } finally {
        setLoading(false);
      }
    }
    loadData();

    // Preload QVAC Model on mount
    console.log("[Arena] Warming up local QVAC model...");
    setModelLoading(true);
    fetch("/api/model/control?action=load")
      .then(res => res.json())
      .then(d => {
        if (d.success) {
          console.log("[Arena] Local QVAC model loaded and warm.");
        } else {
          console.warn("[Arena] Model failed to preload:", d.error);
        }
        setModelLoading(false);
      })
      .catch(e => {
        console.error("[Arena] Preload error:", e);
        setModelLoading(false);
      });

    // Unload model on cleanup
    const handleUnload = () => {
      navigator.sendBeacon("/api/model/control?action=unload");
    };
    window.addEventListener("beforeunload", handleUnload);

    return () => {
      window.removeEventListener("beforeunload", handleUnload);
      console.log("[Arena] Unloading model...");
      fetch("/api/model/control?action=unload").catch(console.error);
    };
  }, [sideId]);

  // Helper to read readable streams chunk by chunk
  const streamReader = async (
    endpoint: string,
    payload: Record<string, unknown>,
    setText: (t: string) => void,
    setStreaming: (s: boolean) => void
  ) => {
    setStreaming(true);
    setText("");
    try {
      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });

      if (!res.body) throw new Error("No response stream found.");
      
      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let done = false;
      let text = "";

      while (!done) {
        const { value, done: doneReading } = await reader.read();
        done = doneReading;
        const chunk = decoder.decode(value, { stream: !done });
        text += chunk;
        setText(text);
      }
    } catch (e) {
      console.error(`[Stream Error ${endpoint}]`, e);
      setText("Error generating response from local model.");
    } finally {
      setStreaming(false);
    }
  };

  // 2. Submit Round 1 Opening Argument
  const handleArgumentSubmitR1 = async () => {
    if (!data) return;
    setActiveStep("COUNTER_R1");

    // Add user argument to transcript
    const userMsg: DebateMessage = { role: "user", content: argumentR1 };
    const currentHistory = [...history, userMsg];
    setHistory(currentHistory);

    // Call analyst stream and opponent stream in parallel
    streamReader(
      "/api/agent/opponent",
      { side: data.teamName, rival: data.rival, argument: argumentR1, history },
      setOpponentR1,
      setIsOpponentStreaming
    ).then(() => {
      // Once opponent has fully streamed, append it to debate history
      setHistory(prev => [...prev, { role: "assistant", content: opponentR1 }]);
    });

    streamReader(
      "/api/agent/analyst",
      { side: data.teamName, rival: data.rival, argument: argumentR1, history },
      setAnalystR1,
      setIsAnalystStreaming
    );
  };

  // 3. Submit Round 2 Refined Argument
  const handleArgumentSubmitR2 = async () => {
    if (!data) return;
    setActiveStep("COUNTER_R2");

    const userMsg: DebateMessage = { role: "user", content: argumentR2 };
    const currentHistory = [...history, userMsg];
    setHistory(currentHistory);

    streamReader(
      "/api/agent/opponent",
      { side: data.teamName, rival: data.rival, argument: argumentR2, history: currentHistory },
      setOpponentR2,
      setIsOpponentStreaming
    ).then(() => {
      setHistory(prev => [...prev, { role: "assistant", content: opponentR2 }]);
    });

    streamReader(
      "/api/agent/analyst",
      { side: data.teamName, rival: data.rival, argument: argumentR2, history: currentHistory },
      setAnalystR2,
      setIsAnalystStreaming
    );
  };

  // 4. Submit Round 3 Final Rebuttal
  const handleArgumentSubmitR3 = async () => {
    if (!data) return;
    setActiveStep("COUNTER_R3");

    const userMsg: DebateMessage = { role: "user", content: argumentR3 };
    const currentHistory = [...history, userMsg];
    setHistory(currentHistory);

    await streamReader(
      "/api/agent/opponent",
      { side: data.teamName, rival: data.rival, argument: argumentR3, history: currentHistory },
      setOpponentR3,
      setIsOpponentStreaming
    );

    // Lock in final opponent statement in history
    setHistory(prev => [...prev, { role: "assistant", content: opponentR3 }]);
  };

  // 5. Trigger Referee Evaluation Phase
  const handleTriggerReferee = async () => {
    if (!data) return;
    setActiveStep("SCOREBOARD");
    setLoading(true);

    try {
      const finalHistory = [...history];
      // If final opponent response is not locked yet, inject it manually
      if (finalHistory.length < 6 && opponentR3) {
        finalHistory.push({ role: "assistant", content: opponentR3 });
      }

      const res = await fetch("/api/agent/referee", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ side: data.teamName, rival: data.rival, history: finalHistory })
      });

      if (!res.ok) throw new Error("Referee evaluation request failed.");
      const scores = await res.json() as RefereeVerdict;
      setRefereeResult(scores);
    } catch (e: unknown) {
      console.error("[Referee Error]", e);
      setError("Failed to compile referee verdict from local engine.");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center min-h-[70vh]">
        <Loader2 className="w-12 h-12 text-blue-500 animate-spin mb-4" />
        <p className="font-display text-sm uppercase tracking-widest text-slate-400">
          {activeStep === "SCOREBOARD" ? "AI Referee analyzing debate transcript..." : "Entering the Arena Pitch..."}
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

  const currentStepIndex = STEPS_TIMELINE.findIndex(s => s.id === activeStep);

  return (
    <div className="flex-1 flex flex-col w-full max-w-6xl mx-auto px-4 py-6 relative">
      
      {/* Stadium HUD / Esports Top Bar */}
      <div className="w-full flex flex-col md:flex-row items-center justify-between border border-slate-800 bg-slate-950/70 backdrop-blur-md rounded-xl p-4 mb-8 relative overflow-hidden">
        {/* Glow accent */}
        <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-gradient-to-r from-blue-500 via-purple-500 to-amber-500" />
        
        {/* Rivalry Tag */}
        <div className="flex items-center gap-4 mb-4 md:mb-0">
          <div className="flex flex-col text-left">
            <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest font-display">
              BATTLE STAGE
            </span>
            <span className="text-sm font-black text-white font-display uppercase tracking-wider flex items-center gap-1.5">
              {data.name} <span className="text-red-500 text-xs font-bold font-sans">VS</span> {data.rival}
            </span>
          </div>
          <div className="hidden sm:block border-l border-slate-800 h-8" />
          <div className="hidden sm:flex flex-col text-left">
            <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest font-display">
              ACTIVE SIDE
            </span>
            <span className="text-xs font-bold text-blue-400 font-display uppercase tracking-wider">
              {data.teamName}
            </span>
          </div>
        </div>

        {/* Dynamic Model Status Indicator */}
        {modelLoading && (
          <div className="absolute right-4 top-2 text-[8px] font-display text-amber-500 animate-pulse uppercase tracking-wider flex items-center gap-1">
            <Loader2 className="w-2.5 h-2.5 animate-spin" /> Preloading Local QVAC...
          </div>
        )}

        {/* Step Indicator Timeline */}
        <div className="flex items-center gap-1 max-w-full overflow-x-auto pb-2 md:pb-0 scrollbar-none">
          {STEPS_TIMELINE.map((step, idx) => {
            const isCompleted = idx < currentStepIndex;
            const isActive = step.id === activeStep;
            return (
              <div key={step.id} className="flex items-center">
                <div
                  className={`text-[9px] font-display font-bold px-2 py-1 rounded-md transition-all ${
                    isActive 
                      ? "bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg scale-105" 
                      : isCompleted 
                        ? "text-blue-400 bg-slate-900 border border-blue-500/10" 
                        : "text-slate-600 bg-slate-950/20 border border-slate-900"
                  }`}
                >
                  {step.label}
                </div>
                {idx < STEPS_TIMELINE.length - 1 && (
                  <ChevronRight className="w-2.5 h-2.5 text-slate-900 shrink-0 mx-0.5" />
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Main Stage / Component Render */}
      <div className="flex-1 flex flex-col justify-center">
        <AnimatePresence mode="wait">
          
          {/* STEP 1: AI ARSENAL */}
          {activeStep === "ARSENAL" && (
            <motion.div
              key="arsenal-view"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              className="w-full flex flex-col"
            >
              <div className="text-center mb-8">
                <span className="text-[10px] text-blue-400 font-bold uppercase tracking-widest font-display border border-blue-500/20 px-3 py-1 rounded-full bg-blue-950/20">
                  DEPLOYMENT PHASE
                </span>
                <h2 className="text-3xl md:text-4xl font-black font-display text-white uppercase mt-3 tracking-tight">
                  YOUR AI <span className="bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">ARSENAL</span>
                </h2>
                <p className="text-slate-400 text-sm mt-2 max-w-lg mx-auto">
                  Equip yourself with the raw historical stats and verified credentials of your chosen side before generating the opening debate.
                </p>
              </div>

              {/* Stats Cards Grid */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mb-8">
                {data.stats.map((stat, idx) => (
                  <motion.div
                    key={stat.label}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: idx * 0.08 }}
                    whileHover={{ y: -4 }}
                    className="glass-panel rounded-xl p-5 border border-slate-800 relative overflow-hidden group hover:border-blue-500/40 transition-colors"
                  >
                    <div className="absolute inset-0 bg-radial from-blue-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
                    
                    <div className="text-[10px] text-slate-500 font-bold uppercase font-display mb-1">
                      {stat.label}
                    </div>
                    <div className="text-3xl font-black text-white font-display mb-1 tracking-tight bg-gradient-to-r from-white to-slate-300 bg-clip-text">
                      {stat.value}
                    </div>
                    <div className="text-xs text-slate-400 font-light leading-relaxed">
                      {stat.description}
                    </div>
                  </motion.div>
                ))}
              </div>

              {/* Verified Facts Board */}
              <div className="glass-panel border-slate-800 rounded-xl p-6 mb-8 relative">
                <div className="absolute top-4 right-6 flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-green-500 animate-pulse" />
                  <span className="text-[10px] text-slate-500 font-bold uppercase font-display">
                    VERIFIED SHELF
                  </span>
                </div>
                
                <h3 className="text-lg font-bold font-display text-white uppercase mb-4 flex items-center gap-2">
                  <Shield className="w-5 h-5 text-blue-400" />
                  CLASH DATA
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {data.arsenal.map((item, idx) => {
                    const isSelected = selectedFactIds.includes(idx);
                    return (
                      <div
                        key={item.title}
                        onClick={() => {
                          if (isSelected) {
                            setSelectedFactIds(selectedFactIds.filter(id => id !== idx));
                          } else {
                            setSelectedFactIds([...selectedFactIds, idx]);
                          }
                        }}
                        className={`p-4 rounded-xl border cursor-pointer transition-all ${
                          isSelected 
                            ? "bg-slate-900 border-blue-500/60 shadow-md shadow-blue-500/5" 
                            : "bg-slate-950/40 border-slate-900 hover:border-slate-800 hover:bg-slate-900/30"
                        }`}
                      >
                        <div className="flex justify-between items-center mb-1">
                          <span className="text-xs font-bold text-white uppercase font-display flex items-center gap-2">
                            <span className={`w-1.5 h-1.5 rounded-full ${isSelected ? "bg-blue-400" : "bg-slate-700"}`} />
                            {item.title}
                          </span>
                        </div>
                        <p className="text-xs text-slate-400 font-light leading-relaxed pl-3.5">
                          {item.fact}
                        </p>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Proceed Action */}
              <div className="flex justify-center">
                <button
                  onClick={() => setActiveStep("DEBATE_R1")}
                  className="px-8 py-4 bg-gradient-to-r from-blue-500 to-purple-600 text-white font-bold font-display tracking-widest text-sm rounded-xl hover:shadow-lg hover:shadow-blue-500/20 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center gap-2"
                >
                  ENTER THE ARENA PITCH
                  <ArrowRight className="w-4 h-4 animate-bounce-horizontal" />
                </button>
              </div>
            </motion.div>
          )}

          {/* ROUND 1: DEBATE EDITOR */}
          {activeStep === "DEBATE_R1" && (
            <motion.div
              key="debate-r1"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              className="grid grid-cols-1 lg:grid-cols-3 gap-6"
            >
              {/* Left Column: AI Coach Sidebar - Shows initial context */}
              <div className="lg:col-span-1 flex flex-col gap-4">
                <div className="glass-panel border-slate-800 rounded-xl p-5">
                  <h3 className="text-xs font-bold font-display text-slate-500 uppercase tracking-widest mb-4 flex items-center justify-between">
                    <span>COACH RADAR</span>
                  </h3>
                  <div className="bg-slate-900/60 border border-slate-800 p-4 rounded-xl text-xs font-light text-slate-300 leading-relaxed">
                    <p className="mb-3 font-semibold text-blue-400">Tactical Tip:</p>
                    {"Draft your opening argument defending your chosen team. Make sure to reference specific trophies or metrics selected in your AI Arsenal to back up your claim."}
                  </div>
                </div>
              </div>

              {/* Center/Right Column: Main Debate Editor */}
              <div className="lg:col-span-2 flex flex-col gap-6">
                <div className="glass-panel-heavy rounded-xl p-6 border border-slate-800 relative">
                  <div className="absolute top-4 right-6 text-[10px] text-slate-500 font-bold uppercase font-display bg-slate-950 px-2.5 py-1 rounded-md border border-slate-900">
                    ROUND 1 MATCH
                  </div>
                  
                  <h2 className="text-2xl font-black font-display text-white uppercase mb-1">
                    SUBMIT DEBATE THESIS
                  </h2>
                  <p className="text-xs text-slate-400 mb-6">
                    Compose your opening statement defending <strong className="text-blue-400 font-semibold">{data.name}</strong>.
                  </p>

                  <div className="relative mb-4">
                    <textarea
                      value={argumentR1}
                      onChange={(e) => setArgumentR1(e.target.value)}
                      placeholder={`Example: ${data.name} is the absolute GOAT because of their record accolades and unmatched longevity...`}
                      maxLength={1200}
                      rows={10}
                      className="w-full bg-slate-950/80 border border-slate-800 rounded-xl p-5 text-sm text-slate-100 font-light placeholder:text-slate-650 focus:outline-none focus:border-blue-500/80 focus:ring-1 focus:ring-blue-500/40 transition-all font-sans leading-relaxed resize-none"
                    />
                    
                    <div className="absolute bottom-4 right-4 flex items-center gap-4 z-10 pointer-events-none">
                      <span className={`text-xs font-mono ${
                        argumentR1.length > 1000 ? "text-amber-500" : "text-slate-500"
                      }`}>
                        {argumentR1.length} / 1200
                      </span>
                    </div>
                  </div>

                  <div className="flex justify-between items-center">
                    <button
                      onClick={() => setActiveStep("ARSENAL")}
                      className="text-xs text-slate-400 hover:text-white font-bold font-display flex items-center gap-1.5"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                      RE-ARM STATS
                    </button>
                    
                    <button
                      onClick={handleArgumentSubmitR1}
                      disabled={argumentR1.trim().length < 15}
                      className={`px-6 py-3.5 font-bold font-display text-xs tracking-wider rounded-xl transition-all flex items-center gap-2 ${
                        argumentR1.trim().length >= 15
                          ? "bg-blue-600 hover:bg-blue-500 text-white shadow-lg shadow-blue-500/20 hover:scale-[1.02]"
                          : "bg-slate-900 text-slate-600 border border-slate-850 cursor-not-allowed"
                      }`}
                    >
                      SUBMIT OPENING ARGUMENT
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {/* ROUND 1: COUNTERATTACK (LIVE STREAM) */}
          {activeStep === "COUNTER_R1" && (
            <motion.div
              key="counter-r1"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-2xl mx-auto flex flex-col items-center"
            >
              <div className="text-center mb-8">
                <span className="text-[10px] text-rose-500 font-bold uppercase tracking-widest font-display border border-rose-500/20 px-3 py-1 rounded-full bg-rose-950/20 animate-pulse">
                  INCOMING ATTACK
                </span>
                <h2 className="text-3xl md:text-4xl font-black font-display text-white uppercase mt-3 tracking-tight">
                  OPPONENT RESPONSE
                </h2>
                <p className="text-slate-400 text-sm mt-2">
                  The opposing legend has intercepted your opening statement and launched a counterstrike.
                </p>
              </div>

              {/* Opponent Attack Card */}
              <div className="w-full glass-panel glow-purple rounded-2xl p-6 md:p-8 relative overflow-hidden border border-rose-500/30 mb-8 min-h-[160px]">
                <div className="absolute inset-0 bg-gradient-to-b from-rose-500/5 to-transparent pointer-events-none" />
                
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-lg bg-rose-500/10 border border-rose-500/30 flex items-center justify-center">
                      <Swords className="w-5 h-5 text-rose-500" />
                    </div>
                    <div>
                      <div className="text-[9px] text-slate-500 font-bold font-display uppercase tracking-wider">
                        COUNTERATTACK
                      </div>
                      <div className="text-xs font-bold text-rose-400 font-display uppercase">
                        TEAM {data.rival.toUpperCase()}
                      </div>
                    </div>
                  </div>
                  {isOpponentStreaming && (
                    <span className="text-[8px] bg-rose-500/20 border border-rose-500/30 px-2 py-0.5 rounded text-rose-400 animate-pulse font-display">
                      STREAMING...
                    </span>
                  )}
                </div>

                <blockquote className="text-base md:text-lg font-light text-slate-100 italic leading-relaxed pl-4 border-l-2 border-rose-500/50 mb-6">
                  {opponentR1 || "Generating rebuttal statement..."}
                </blockquote>
              </div>

              {/* Proceed Action */}
              <div className="flex gap-4">
                <button
                  onClick={() => setActiveStep("COACH_R1")}
                  disabled={isOpponentStreaming}
                  className={`px-8 py-4 font-bold font-display tracking-widest text-sm rounded-xl transition-all flex items-center gap-2 shadow-inner ${
                    isOpponentStreaming 
                      ? "bg-slate-900 text-slate-600 cursor-not-allowed border border-slate-850" 
                      : "bg-gradient-to-r from-purple-600 to-indigo-600 text-white hover:shadow-lg hover:shadow-purple-500/20 hover:scale-[1.02]"
                  }`}
                >
                  CONSULT AI COACH
                  <MessageSquareCode className="w-4 h-4" />
                </button>
              </div>
            </motion.div>
          )}

          {/* ROUND 1: COACH ANALYSIS */}
          {activeStep === "COACH_R1" && (
            <motion.div
              key="coach-r1"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              className="w-full flex flex-col"
            >
              <div className="text-center mb-8">
                <span className="text-[10px] text-amber-400 font-bold uppercase tracking-widest font-display border border-amber-500/20 px-3 py-1 rounded-full bg-amber-950/20">
                  HALF-TIME ANALYSIS
                </span>
                <h2 className="text-3xl md:text-4xl font-black font-display text-white uppercase mt-3 tracking-tight">
                  TACTICAL FEEDBACK
                </h2>
                <p className="text-slate-400 text-sm mt-2 max-w-lg mx-auto">
                  Your AI Trainer has processed the Round 1 clashing points and mapped out upgrades.
                </p>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
                
                {/* Left Side: Coach Card */}
                <div className="lg:col-span-1 glass-panel rounded-xl p-6 border border-slate-800 flex flex-col items-center justify-between text-center relative overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-b from-blue-500/5 via-transparent to-transparent pointer-events-none" />
                  <div className="w-16 h-16 rounded-full bg-blue-500/10 border border-blue-500/30 flex items-center justify-center mb-4 relative">
                    <Award className="w-8 h-8 text-blue-400" />
                    <div className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-green-500 flex items-center justify-center text-[10px] font-black text-slate-950">
                      AI
                    </div>
                  </div>
                  <h3 className="font-display font-black text-white text-lg uppercase tracking-wider mb-1">
                    COACH FINCH
                  </h3>
                  <p className="text-xs text-slate-400 leading-relaxed font-light mb-6">
                    {"Review my tactical suggestions in the slate. Use these statistics and counterarguments to secure Round 2."}
                  </p>
                </div>

                {/* Right Side: Coach feedback */}
                <div className="lg:col-span-2 glass-panel rounded-xl p-6 border border-slate-850">
                  <div className="flex justify-between items-center mb-4">
                    <h4 className="text-xs font-bold font-display text-slate-400 uppercase tracking-widest flex items-center gap-2">
                      <Sparkles className="w-4 h-4 text-amber-500" />
                      COACHING SLATE
                    </h4>
                    {isAnalystStreaming && (
                      <span className="text-[8px] bg-amber-500/20 text-amber-400 border border-amber-500/30 px-2 py-0.5 rounded font-display animate-pulse">
                        ANALYZING...
                      </span>
                    )}
                  </div>
                  
                  {/* Streaming feedback output */}
                  <div className="bg-slate-950/60 border border-slate-900 rounded-xl p-5 text-sm text-slate-300 font-light leading-relaxed min-h-[160px] max-h-[300px] overflow-y-auto whitespace-pre-wrap">
                    {analystR1 || "Coach is formulating strategy..."}
                  </div>
                </div>

              </div>

              {/* Proceed Action */}
              <div className="flex justify-center">
                <button
                  onClick={() => setActiveStep("DEBATE_R2")}
                  disabled={isAnalystStreaming}
                  className={`px-8 py-4 font-bold font-display tracking-widest text-sm rounded-xl transition-all flex items-center gap-2 ${
                    isAnalystStreaming
                      ? "bg-slate-900 text-slate-650 cursor-not-allowed border border-slate-850"
                      : "bg-gradient-to-r from-amber-500 to-orange-600 text-white hover:scale-[1.02]"
                  }`}
                >
                  START ROUND 2 DEBATE
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </motion.div>
          )}

          {/* ROUND 2: DEBATE EDITOR */}
          {activeStep === "DEBATE_R2" && (
            <motion.div
              key="debate-r2"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              className="grid grid-cols-1 lg:grid-cols-3 gap-6"
            >
              {/* Left Column: Side bar upgrade facts */}
              <div className="lg:col-span-1 flex flex-col gap-4">
                <div className="glass-panel border-rose-500/25 rounded-xl p-5">
                  <h3 className="text-xs font-bold font-display text-rose-400 uppercase tracking-widest mb-3">
                    OPPONENT CHALLENGE
                  </h3>
                  <p className="text-xs text-slate-350 leading-relaxed font-light italic">
                    &quot;{opponentR1}&quot;
                  </p>
                </div>

                <div className="glass-panel border-amber-500/25 rounded-xl p-5">
                  <h3 className="text-xs font-bold font-display text-amber-400 uppercase tracking-widest mb-3">
                    COACH SUGGESTIONS
                  </h3>
                  <div className="text-xs text-slate-350 leading-relaxed font-light whitespace-pre-wrap max-h-[220px] overflow-y-auto pr-1">
                    {analystR1}
                  </div>
                </div>
              </div>

              {/* Right Column: Rebuttal inputs */}
              <div className="lg:col-span-2 flex flex-col gap-6">
                <div className="glass-panel-heavy rounded-xl p-6 border border-slate-800 relative">
                  <div className="absolute top-4 right-6 text-[10px] text-slate-500 font-bold uppercase font-display bg-slate-950 px-2.5 py-1 rounded-md border border-slate-900">
                    ROUND 2 MATCH
                  </div>
                  
                  <h2 className="text-2xl font-black font-display text-white uppercase mb-1">
                    REFINE YOUR POSITION
                  </h2>
                  <p className="text-xs text-slate-400 mb-6">
                    Inject statistics and counter-claims to reply directly to the opponent.
                  </p>

                  <div className="relative mb-4">
                    <textarea
                      value={argumentR2}
                      onChange={(e) => setArgumentR2(e.target.value)}
                      placeholder="Address their criticism and bring up new records..."
                      maxLength={1200}
                      rows={10}
                      className="w-full bg-slate-950/80 border border-slate-850 rounded-xl p-5 text-sm text-slate-100 font-light placeholder:text-slate-600 focus:outline-none focus:border-amber-500/80 focus:ring-1 focus:ring-amber-500/40 transition-all font-sans leading-relaxed resize-none"
                    />
                    
                    <div className="absolute bottom-4 right-4 flex items-center gap-4 z-10 pointer-events-none">
                      <span className={`text-xs font-mono ${
                        argumentR2.length > 1000 ? "text-amber-500" : "text-slate-500"
                      }`}>
                        {argumentR2.length} / 1200
                      </span>
                    </div>
                  </div>

                  <div className="flex justify-between items-center">
                    <button
                      onClick={() => setActiveStep("COACH_R1")}
                      className="text-xs text-slate-400 hover:text-white font-bold font-display flex items-center gap-1.5"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                      VIEW TACTICS
                    </button>
                    
                    <button
                      onClick={handleArgumentSubmitR2}
                      disabled={argumentR2.trim().length < 15}
                      className={`px-6 py-3.5 font-bold font-display text-xs tracking-wider rounded-xl transition-all flex items-center gap-2 ${
                        argumentR2.trim().length >= 15
                          ? "bg-amber-500 hover:bg-amber-400 text-slate-950 hover:scale-[1.02]"
                          : "bg-slate-900 text-slate-650 border border-slate-850 cursor-not-allowed"
                      }`}
                    >
                      SUBMIT REBUTTAL
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {/* ROUND 2: COUNTERATTACK */}
          {activeStep === "COUNTER_R2" && (
            <motion.div
              key="counter-r2"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-2xl mx-auto flex flex-col items-center"
            >
              <div className="text-center mb-8">
                <span className="text-[10px] text-rose-500 font-bold uppercase tracking-widest font-display border border-rose-500/20 px-3 py-1 rounded-full bg-rose-950/20 animate-pulse">
                  INCOMING ATTACK
                </span>
                <h2 className="text-3xl md:text-4xl font-black font-display text-white uppercase mt-3 tracking-tight">
                  OPPONENT COUNTER-STRIKE
                </h2>
                <p className="text-slate-400 text-sm mt-2">
                  The opposing legend has countered your response with key metrics.
                </p>
              </div>

              {/* Opponent Attack Card */}
              <div className="w-full glass-panel glow-purple rounded-2xl p-6 md:p-8 relative overflow-hidden border border-rose-500/30 mb-8 min-h-[160px]">
                <div className="absolute inset-0 bg-gradient-to-b from-rose-500/5 to-transparent pointer-events-none" />
                
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-lg bg-rose-500/10 border border-rose-500/30 flex items-center justify-center">
                      <Swords className="w-5 h-5 text-rose-500" />
                    </div>
                    <div>
                      <div className="text-[9px] text-slate-500 font-bold font-display uppercase tracking-wider">
                        COUNTERATTACK
                      </div>
                      <div className="text-xs font-bold text-rose-400 font-display uppercase">
                        TEAM {data.rival.toUpperCase()}
                      </div>
                    </div>
                  </div>
                  {isOpponentStreaming && (
                    <span className="text-[8px] bg-rose-500/20 border border-rose-500/30 px-2 py-0.5 rounded text-rose-400 animate-pulse font-display">
                      STREAMING...
                    </span>
                  )}
                </div>

                <blockquote className="text-base md:text-lg font-light text-slate-100 italic leading-relaxed pl-4 border-l-2 border-rose-500/50 mb-6">
                  {opponentR2 || "Generating counterstrike rebuttal..."}
                </blockquote>
              </div>

              {/* Proceed Action */}
              <div className="flex gap-4">
                <button
                  onClick={() => setActiveStep("COACH_R2")}
                  disabled={isOpponentStreaming}
                  className={`px-8 py-4 font-bold font-display tracking-widest text-sm rounded-xl transition-all flex items-center gap-2 shadow-inner ${
                    isOpponentStreaming 
                      ? "bg-slate-900 text-slate-650 cursor-not-allowed border border-slate-850" 
                      : "bg-gradient-to-r from-purple-600 to-indigo-600 text-white hover:scale-[1.02]"
                  }`}
                >
                  CONSULT AI COACH
                  <MessageSquareCode className="w-4 h-4" />
                </button>
              </div>
            </motion.div>
          )}

          {/* ROUND 2: COACH ANALYSIS */}
          {activeStep === "COACH_R2" && (
            <motion.div
              key="coach-r2"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              className="w-full flex flex-col"
            >
              <div className="text-center mb-8">
                <span className="text-[10px] text-amber-400 font-bold uppercase tracking-widest font-display border border-amber-500/20 px-3 py-1 rounded-full bg-amber-950/20">
                  TACTICAL DEPLOYMENT
                </span>
                <h2 className="text-3xl md:text-4xl font-black font-display text-white uppercase mt-3 tracking-tight">
                  ROUND 2 COACHING
                </h2>
                <p className="text-slate-400 text-sm mt-2 max-w-lg mx-auto">
                  {"Evaluate the coach's recommendations to build the final round rebuttal."}
                </p>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
                <div className="lg:col-span-1 glass-panel rounded-xl p-6 border border-slate-800 flex flex-col items-center justify-between text-center relative overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-b from-blue-500/5 via-transparent to-transparent pointer-events-none" />
                  <div className="w-16 h-16 rounded-full bg-blue-500/10 border border-blue-500/30 flex items-center justify-center mb-4 relative">
                    <Award className="w-8 h-8 text-blue-400" />
                  </div>
                  <h3 className="font-display font-black text-white text-lg uppercase tracking-wider mb-1">
                    COACH FINCH
                  </h3>
                  <p className="text-xs text-slate-400 leading-relaxed font-light mb-6">
                    {"We need a massive final rebuttal to shut down their stats. Take my advice and launch a final assault."}
                  </p>
                </div>

                <div className="lg:col-span-2 glass-panel rounded-xl p-6 border border-slate-850">
                  <div className="flex justify-between items-center mb-4">
                    <h4 className="text-xs font-bold font-display text-slate-400 uppercase tracking-widest flex items-center gap-2">
                      <Sparkles className="w-4 h-4 text-amber-500" />
                      COACHING SLATE
                    </h4>
                    {isAnalystStreaming && (
                      <span className="text-[8px] bg-amber-500/20 text-amber-400 border border-amber-500/30 px-2 py-0.5 rounded font-display animate-pulse">
                        ANALYZING...
                      </span>
                    )}
                  </div>
                  
                  <div className="bg-slate-950/60 border border-slate-900 rounded-xl p-5 text-sm text-slate-300 font-light leading-relaxed min-h-[160px] max-h-[300px] overflow-y-auto whitespace-pre-wrap font-sans">
                    {analystR2 || "Coach is formulating strategy..."}
                  </div>
                </div>
              </div>

              <div className="flex justify-center">
                <button
                  onClick={() => setActiveStep("DEBATE_R3")}
                  disabled={isAnalystStreaming}
                  className={`px-8 py-4 font-bold font-display tracking-widest text-sm rounded-xl transition-all flex items-center gap-2 ${
                    isAnalystStreaming
                      ? "bg-slate-900 text-slate-650 cursor-not-allowed border border-slate-850"
                      : "bg-gradient-to-r from-amber-500 to-orange-600 text-white hover:scale-[1.02]"
                  }`}
                >
                  START FINAL REBUTTAL
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </motion.div>
          )}

          {/* ROUND 3: FINAL DEBATE REBUTTAL */}
          {activeStep === "DEBATE_R3" && (
            <motion.div
              key="debate-r3"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              className="grid grid-cols-1 lg:grid-cols-3 gap-6"
            >
              <div className="lg:col-span-1 flex flex-col gap-4">
                <div className="glass-panel border-rose-500/25 rounded-xl p-5">
                  <h3 className="text-xs font-bold font-display text-rose-400 uppercase tracking-widest mb-3">
                    OPPONENT RIVAL STANCE
                  </h3>
                  <p className="text-xs text-slate-350 leading-relaxed font-light italic">
                    &quot;{opponentR2}&quot;
                  </p>
                </div>

                <div className="glass-panel border-amber-500/25 rounded-xl p-5">
                  <h3 className="text-xs font-bold font-display text-amber-400 uppercase tracking-widest mb-3">
                    COACH SLATE
                  </h3>
                  <div className="text-xs text-slate-350 leading-relaxed font-light whitespace-pre-wrap max-h-[220px] overflow-y-auto pr-1">
                    {analystR2}
                  </div>
                </div>
              </div>

              <div className="lg:col-span-2 flex flex-col gap-6">
                <div className="glass-panel-heavy rounded-xl p-6 border border-slate-800 relative">
                  <div className="absolute top-4 right-6 text-[10px] text-slate-500 font-bold uppercase font-display bg-slate-950 px-2.5 py-1 rounded-md border border-slate-900">
                    ROUND 3 FINAL REBUTTAL
                  </div>
                  
                  <h2 className="text-2xl font-black font-display text-white uppercase mb-1">
                    THE FINAL MATCH REBUTTAL
                  </h2>
                  <p className="text-xs text-slate-400 mb-6">
                    Declare your final conclusions to seal the victory.
                  </p>

                  <div className="relative mb-4">
                    <textarea
                      value={argumentR3}
                      onChange={(e) => setArgumentR3(e.target.value)}
                      placeholder="This is your final response. Deliver the ultimate closing arguments..."
                      maxLength={1200}
                      rows={10}
                      className="w-full bg-slate-950/80 border border-slate-850 rounded-xl p-5 text-sm text-slate-100 font-light placeholder:text-slate-600 focus:outline-none focus:border-amber-500/80 focus:ring-1 focus:ring-amber-500/40 transition-all font-sans leading-relaxed resize-none"
                    />
                    
                    <div className="absolute bottom-4 right-4 flex items-center gap-4 z-10 pointer-events-none">
                      <span className={`text-xs font-mono ${
                        argumentR3.length > 1000 ? "text-amber-500" : "text-slate-500"
                      }`}>
                        {argumentR3.length} / 1200
                      </span>
                    </div>
                  </div>

                  <div className="flex justify-between items-center">
                    <button
                      onClick={() => setActiveStep("COACH_R2")}
                      className="text-xs text-slate-400 hover:text-white font-bold font-display flex items-center gap-1.5"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                      VIEW TACTICS
                    </button>
                    
                    <button
                      onClick={handleArgumentSubmitR3}
                      disabled={argumentR3.trim().length < 15}
                      className={`px-6 py-3.5 font-bold font-display text-xs tracking-wider rounded-xl transition-all flex items-center gap-2 ${
                        argumentR3.trim().length >= 15
                          ? "bg-amber-500 hover:bg-amber-450 text-slate-950 hover:scale-[1.02]"
                          : "bg-slate-900 text-slate-650 border border-slate-850 cursor-not-allowed"
                      }`}
                    >
                      SUBMIT FINAL REBUTTAL
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {/* ROUND 3: FINAL COUNTERATTACK */}
          {activeStep === "COUNTER_R3" && (
            <motion.div
              key="counter-r3"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-2xl mx-auto flex flex-col items-center"
            >
              <div className="text-center mb-8">
                <span className="text-[10px] text-rose-500 font-bold uppercase tracking-widest font-display border border-rose-500/20 px-3 py-1 rounded-full bg-rose-950/20 animate-pulse">
                  FINAL OPPONENT ATTACK
                </span>
                <h2 className="text-3xl md:text-4xl font-black font-display text-white uppercase mt-3 tracking-tight">
                  RIVAL FINAL CLOSE
                </h2>
                <p className="text-slate-400 text-sm mt-2">
                  The AI Opponent has generated its final counter-argument.
                </p>
              </div>

              {/* Opponent Attack Card */}
              <div className="w-full glass-panel glow-purple rounded-2xl p-6 md:p-8 relative overflow-hidden border border-rose-500/30 mb-8 min-h-[160px]">
                <div className="absolute inset-0 bg-gradient-to-b from-rose-500/5 to-transparent pointer-events-none" />
                
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-lg bg-rose-500/10 border border-rose-500/30 flex items-center justify-center">
                      <Swords className="w-5 h-5 text-rose-500" />
                    </div>
                    <div>
                      <div className="text-[9px] text-slate-500 font-bold font-display uppercase tracking-wider">
                        COUNTERATTACK
                      </div>
                      <div className="text-xs font-bold text-rose-400 font-display uppercase">
                        TEAM {data.rival.toUpperCase()}
                      </div>
                    </div>
                  </div>
                  {isOpponentStreaming && (
                    <span className="text-[8px] bg-rose-500/20 border border-rose-500/30 px-2 py-0.5 rounded text-rose-400 animate-pulse font-display">
                      STREAMING...
                    </span>
                  )}
                </div>

                <blockquote className="text-base md:text-lg font-light text-slate-100 italic leading-relaxed pl-4 border-l-2 border-rose-500/50 mb-6">
                  {opponentR3 || "Generating final closing statement..."}
                </blockquote>
              </div>

              {/* Proceed Action */}
              <div className="flex gap-4">
                <button
                  onClick={handleTriggerReferee}
                  disabled={isOpponentStreaming}
                  className={`px-8 py-4 font-bold font-display tracking-widest text-sm rounded-xl transition-all flex items-center gap-2 shadow-inner ${
                    isOpponentStreaming 
                      ? "bg-slate-900 text-slate-650 cursor-not-allowed border border-slate-850" 
                      : "bg-gradient-to-r from-blue-500 via-purple-500 to-amber-500 text-white hover:scale-[1.02]"
                  }`}
                >
                  PROCEED TO REFEREE
                  <ArrowRight className="w-4 h-4 animate-pulse" />
                </button>
              </div>
            </motion.div>
          )}

          {/* STEP 10: REFEREE SCOREBOARD */}
          {activeStep === "SCOREBOARD" && refereeResult && (
            <motion.div
              key="scoreboard-view"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-3xl mx-auto flex flex-col items-center"
            >
              <div className="text-center mb-8">
                <span className="text-[10px] text-amber-500 font-bold uppercase tracking-widest font-display border border-amber-500/20 px-3 py-1 rounded-full bg-amber-950/20">
                  VERDICT STAGE
                </span>
                <h2 className="text-3xl md:text-4xl font-black font-display text-white uppercase mt-3 tracking-tight">
                  REFEREE SCOREBOARD
                </h2>
                <p className="text-slate-400 text-sm mt-2">
                  The neutral AI Referee has graded the 3 rounds of the transcript.
                </p>
              </div>

              {/* Large Scoreboard Card */}
              <div className="w-full glass-panel-heavy rounded-2xl p-6 md:p-8 border border-slate-800 relative overflow-hidden mb-8">
                
                {/* Visual grid categories */}
                <div className="flex items-center justify-between border-b border-slate-800 pb-4 mb-6">
                  <span className="font-display font-black text-slate-400 tracking-wider text-xs">
                    METRIC RATING
                  </span>
                  <span className="font-display font-bold text-xs text-slate-500 uppercase">
                    SCORE (0-100)
                  </span>
                </div>

                {/* Score Categories */}
                <div className="flex flex-col gap-6 relative z-10">
                  
                  {/* Category: Evidence */}
                  <div className="grid grid-cols-12 items-center gap-4">
                    <div className="col-span-3 text-left">
                      <span className="text-xs font-bold text-white uppercase font-display block">
                        EVIDENCE
                      </span>
                    </div>
                    <div className="col-span-7">
                      <div className="h-2.5 bg-slate-900 rounded-full overflow-hidden">
                        <motion.div 
                          initial={{ width: 0 }}
                          animate={{ width: `${refereeResult.scores.evidence}%` }}
                          transition={{ duration: 1.2 }}
                          className="h-full bg-gradient-to-r from-blue-500 to-cyan-400" 
                        />
                      </div>
                    </div>
                    <div className="col-span-2 text-right font-display text-base font-black text-blue-400">
                      {refereeResult.scores.evidence}
                    </div>
                  </div>

                  {/* Category: Logic */}
                  <div className="grid grid-cols-12 items-center gap-4">
                    <div className="col-span-3 text-left">
                      <span className="text-xs font-bold text-white uppercase font-display block">
                        LOGIC
                      </span>
                    </div>
                    <div className="col-span-7">
                      <div className="h-2.5 bg-slate-900 rounded-full overflow-hidden">
                        <motion.div 
                          initial={{ width: 0 }}
                          animate={{ width: `${refereeResult.scores.logic}%` }}
                          transition={{ duration: 1.2, delay: 0.2 }}
                          className="h-full bg-gradient-to-r from-purple-500 to-indigo-400" 
                        />
                      </div>
                    </div>
                    <div className="col-span-2 text-right font-display text-base font-black text-purple-400">
                      {refereeResult.scores.logic}
                    </div>
                  </div>

                  {/* Category: Persuasion */}
                  <div className="grid grid-cols-12 items-center gap-4">
                    <div className="col-span-3 text-left">
                      <span className="text-xs font-bold text-white uppercase font-display block">
                        PERSUASION
                      </span>
                    </div>
                    <div className="col-span-7">
                      <div className="h-2.5 bg-slate-900 rounded-full overflow-hidden">
                        <motion.div 
                          initial={{ width: 0 }}
                          animate={{ width: `${refereeResult.scores.persuasion}%` }}
                          transition={{ duration: 1.2, delay: 0.4 }}
                          className="h-full bg-gradient-to-r from-amber-500 to-yellow-400" 
                        />
                      </div>
                    </div>
                    <div className="col-span-2 text-right font-display text-base font-black text-amber-400">
                      {refereeResult.scores.persuasion}
                    </div>
                  </div>

                  {/* Category: Countering */}
                  <div className="grid grid-cols-12 items-center gap-4">
                    <div className="col-span-3 text-left">
                      <span className="text-xs font-bold text-white uppercase font-display block">
                        COUNTERING
                      </span>
                    </div>
                    <div className="col-span-7">
                      <div className="h-2.5 bg-slate-900 rounded-full overflow-hidden">
                        <motion.div 
                          initial={{ width: 0 }}
                          animate={{ width: `${refereeResult.scores.countering}%` }}
                          transition={{ duration: 1.2, delay: 0.6 }}
                          className="h-full bg-gradient-to-r from-rose-500 to-pink-400" 
                        />
                      </div>
                    </div>
                    <div className="col-span-2 text-right font-display text-base font-black text-rose-400">
                      {refereeResult.scores.countering}
                    </div>
                  </div>

                </div>

                {/* Verdict Commentary */}
                <div className="mt-8 pt-6 border-t border-slate-800 flex flex-col md:flex-row justify-between items-center gap-4 relative z-10">
                  <div className="text-left flex-1">
                    <span className="text-[9px] text-slate-500 font-bold uppercase font-display block mb-1">
                      VERDICT EXPLANATION
                    </span>
                    <p className="text-xs text-slate-350 leading-relaxed max-w-xl font-light">
                      &quot;{refereeResult.verdict}&quot;
                    </p>
                  </div>
                  
                  {/* Round Timeline scores */}
                  <div className="flex gap-4 font-display text-center shrink-0">
                    <div className="bg-slate-900 border border-slate-800 rounded-xl p-3">
                      <span className="text-[8px] text-slate-500 block uppercase">RD 1</span>
                      <span className="text-sm font-black text-slate-350">{refereeResult.round1}</span>
                    </div>
                    <div className="bg-slate-900 border border-slate-800 rounded-xl p-3">
                      <span className="text-[8px] text-slate-500 block uppercase">RD 2</span>
                      <span className="text-sm font-black text-slate-350">{refereeResult.round2}</span>
                    </div>
                    <div className="bg-slate-900 border border-slate-800 rounded-xl p-3">
                      <span className="text-[8px] text-slate-500 block uppercase">RD 3</span>
                      <span className="text-sm font-black text-slate-350">{refereeResult.round3}</span>
                    </div>
                  </div>
                </div>

              </div>

              {/* Proceed Action */}
              <div className="flex justify-center">
                <button
                  onClick={() => setActiveStep("WINNER")}
                  className="px-8 py-4 bg-gradient-to-r from-blue-500 via-purple-500 to-amber-500 text-white font-bold font-display tracking-widest text-sm rounded-xl hover:scale-[1.02] transition-all flex items-center gap-2"
                >
                  CLAIM FINAL JUDGMENT
                  <Trophy className="w-4 h-4 text-amber-300 animate-pulse" />
                </button>
              </div>
            </motion.div>
          )}

          {/* STEP 11: WINNER CELEBRATION */}
          {activeStep === "WINNER" && refereeResult && (
            <motion.div
              key="winner-view"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ type: "spring", stiffness: 80 }}
              className="w-full max-w-xl mx-auto flex flex-col items-center text-center relative"
            >
              {/* Confetti Particles */}
              <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
                {[...Array(20)].map((_, i) => (
                  <motion.div
                    key={i}
                    className="absolute rounded-full"
                    style={{
                      width: Math.random() * 8 + 4,
                      height: Math.random() * 8 + 4,
                      backgroundColor: i % 3 === 0 ? "#f59e0b" : i % 3 === 1 ? "#3b82f6" : "#8b5cf6",
                      top: `${Math.random() * 100}%`,
                      left: `${Math.random() * 100}%`,
                    }}
                    animate={{
                      y: [0, -100, 0],
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

              <div className="z-10 flex flex-col items-center w-full">
                
                {/* Trophy container */}
                <motion.div
                  initial={{ rotate: -15, scale: 0.8 }}
                  animate={{ rotate: 0, scale: 1 }}
                  transition={{ type: "spring", delay: 0.2 }}
                  className="w-32 h-32 rounded-full bg-slate-900 border border-slate-800 flex items-center justify-center mb-6 shadow-xl relative overflow-hidden group hover:border-amber-500/40 transition-colors"
                >
                  <div className="absolute inset-0 bg-radial from-amber-500/10 to-transparent pointer-events-none" />
                  <Trophy className="w-16 h-16 text-amber-400 group-hover:scale-110 transition-transform duration-300" />
                </motion.div>

                {/* Winner Heading */}
                <span className="text-[10px] text-amber-400 font-bold uppercase tracking-widest font-display border border-amber-500/20 px-3 py-1 rounded-full bg-amber-950/20 mb-3 block">
                  ARENA JUDGMENT
                </span>
                
                <h1 className="text-4xl md:text-5xl font-black font-display text-white uppercase tracking-tight mb-2">
                  {refereeResult.winner.toUpperCase()} <span className="bg-gradient-to-r from-amber-400 to-yellow-500 bg-clip-text text-transparent">VICTORIOUS</span>
                </h1>
                
                <p className="text-slate-400 text-xs md:text-sm max-w-sm mx-auto mb-8 leading-relaxed">
                  The local QVAC AI Referee panel has completed the evaluation and crowned the champion.
                </p>

                {/* Match Summary Box */}
                <div className="w-full glass-panel border-slate-800 rounded-xl p-5 mb-8 text-left">
                  <div className="text-[9px] text-slate-500 font-bold uppercase font-display mb-3 text-center border-b border-slate-900 pb-2">
                    DEBATE SUMMARY
                  </div>
                  
                  <div className="flex justify-between items-center text-xs py-1.5 text-slate-400 font-display">
                    <span>WINNER DECLARED:</span>
                    <span className="font-black text-amber-400 uppercase">{refereeResult.winner}</span>
                  </div>
                  
                  <div className="flex justify-between items-center text-xs py-1.5 text-slate-400 font-display">
                    <span>EVIDENCE RATING:</span>
                    <span className="font-bold text-blue-400">{refereeResult.scores.evidence} / 100</span>
                  </div>

                  <div className="flex justify-between items-center text-xs py-1.5 text-slate-400 font-display">
                    <span>LOGIC RATING:</span>
                    <span className="font-bold text-purple-400">{refereeResult.scores.logic} / 100</span>
                  </div>

                  <div className="flex justify-between items-center text-xs py-1.5 text-slate-400 font-display">
                    <span>PERSUASION RATING:</span>
                    <span className="font-bold text-yellow-400">{refereeResult.scores.persuasion} / 100</span>
                  </div>
                </div>

                {/* Action buttons */}
                <div className="flex flex-col sm:flex-row gap-4 w-full">
                  <button
                    onClick={() => {
                      setArgumentR1("");
                      setOpponentR1("");
                      setAnalystR1("");
                      setArgumentR2("");
                      setOpponentR2("");
                      setAnalystR2("");
                      setArgumentR3("");
                      setOpponentR3("");
                      setHistory([]);
                      setSelectedFactIds([]);
                      setRefereeResult(null);
                      setActiveStep("ARSENAL");
                    }}
                    className="flex-1 px-6 py-4 bg-slate-900 border border-slate-800 text-white font-bold font-display text-xs tracking-wider rounded-xl hover:bg-slate-850 hover:text-white transition-all flex items-center justify-center gap-1.5"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    REPLAY BATTLE
                  </button>

                  <Link
                    href="/select"
                    className="flex-1 px-6 py-4 bg-gradient-to-r from-blue-500 to-purple-600 text-white font-bold font-display text-xs tracking-wider rounded-xl hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-1.5"
                  >
                    SELECT NEW RIVALRY
                    <Swords className="w-3.5 h-3.5 text-slate-100" />
                  </Link>
                </div>

              </div>
            </motion.div>
          )}

        </AnimatePresence>
      </div>

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
            Preparing Match Atmosphere...
          </p>
        </div>
      }
    >
      <ArenaContent />
    </Suspense>
  );
}
