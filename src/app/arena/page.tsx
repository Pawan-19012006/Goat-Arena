"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Swords, Trophy, Zap, Shield, ArrowRight, CornerDownRight, 
  RotateCcw, Sparkles, MessageSquareCode, Award, AlertTriangle, 
  CheckCircle, XCircle, ChevronRight, Loader2 
} from "lucide-react";
import Link from "next/link";

// TypeScript Interfaces for static JSON structure
interface StatItem {
  label: string;
  value: string;
  description: string;
}

interface ArsenalItem {
  title: string;
  fact: string;
}

interface CounterattackItem {
  triggerKeyword: string;
  claim: string;
  defenseUpgrade: string;
}

interface CoachFeedback {
  strengths: string[];
  weaknesses: string[];
  missedOpportunities: string[];
  upgradeSuggestion: string;
}

interface RoundScores {
  evidence: number;
  logic: number;
  persuasion: number;
  comment: string;
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
  counterattacks: CounterattackItem[];
  coachFeedback: CoachFeedback;
  refereeScoring: {
    round1: RoundScores;
    round2: RoundScores;
  };
}

type ArenaStep = 
  | "ARSENAL" 
  | "DEBATE_R1" 
  | "COUNTERATTACK" 
  | "COACH" 
  | "DEBATE_R2" 
  | "SCOREBOARD" 
  | "WINNER";

const STEPS_TIMELINE = [
  { id: "ARSENAL", label: "Arsenal" },
  { id: "DEBATE_R1", label: "Round 1" },
  { id: "COUNTERATTACK", label: "Counter" },
  { id: "COACH", label: "Coach" },
  { id: "DEBATE_R2", label: "Round 2" },
  { id: "SCOREBOARD", label: "Scores" },
  { id: "WINNER", label: "Victory" }
];

// Main Arena Component containing the game logic
function ArenaContent() {
  const searchParams = useSearchParams();

  // Retrieve rivalry and side
  const sideId = searchParams.get("side") || "messi";

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<PlayerData | null>(null);
  const [activeStep, setActiveStep] = useState<ArenaStep>("ARSENAL");
  
  // Game states
  const [argumentR1, setArgumentR1] = useState("");
  const [argumentR2, setArgumentR2] = useState("");
  const [selectedFactIds, setSelectedFactIds] = useState<number[]>([]);
  const [activeCounterattack, setActiveCounterattack] = useState<CounterattackItem | null>(null);

  // Fetch player/team details from static JSON
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
        
        // Pick a default counterattack based on first keyword
        if (json.counterattacks && json.counterattacks.length > 0) {
          setActiveCounterattack(json.counterattacks[0]);
        }
      } catch (err: unknown) {
        console.error(err);
        const errorMessage = err instanceof Error ? err.message : "An error occurred while loading data.";
        setError(errorMessage);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [sideId]);

  // Handle auto-matching counterattack based on argument content
  const handleArgumentSubmitR1 = () => {
    if (!data) return;
    
    // Look for matching counterattack by scanning argument for keywords
    const lowercaseArg = argumentR1.toLowerCase();
    const matched = data.counterattacks.find(item => 
      lowercaseArg.includes(item.triggerKeyword.toLowerCase())
    );

    if (matched) {
      setActiveCounterattack(matched);
    } else if (data.counterattacks.length > 0) {
      // Default to first counterattack if no keyword triggers
      setActiveCounterattack(data.counterattacks[0]);
    }
    
    // Initialize Round 2 argument with Round 1's content as starter
    setArgumentR2(argumentR1);
    setActiveStep("COUNTERATTACK");
  };

  if (loading) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center min-h-[70vh]">
        <Loader2 className="w-12 h-12 text-blue-500 animate-spin mb-4" />
        <p className="font-display text-sm uppercase tracking-widest text-slate-400">
          Entering the Arena Pitch...
        </p>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center text-center p-6">
        <AlertTriangle className="w-16 h-16 text-rose-500 mb-4" />
        <h2 className="text-2xl font-bold text-white font-display mb-2">ARENA DISCONNECTION</h2>
        <p className="text-slate-400 text-sm max-w-md mb-6">{error || "Could not retrieve rivalry details."}</p>
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
              {data.name} <span className="text-red-500 text-xs font-bold">VS</span> {data.rival}
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

        {/* Step Indicator Timeline */}
        <div className="flex items-center gap-2 max-w-full overflow-x-auto pb-2 md:pb-0 scrollbar-none">
          {STEPS_TIMELINE.map((step, idx) => {
            const isCompleted = idx < currentStepIndex;
            const isActive = step.id === activeStep;
            return (
              <div key={step.id} className="flex items-center">
                <button
                  onClick={() => {
                    // Let users click back to previously completed steps to inspect details
                    if (idx < currentStepIndex) {
                      setActiveStep(step.id as ArenaStep);
                    }
                  }}
                  disabled={idx >= currentStepIndex && !isActive}
                  className={`text-[10px] md:text-xs font-display font-bold px-3 py-1.5 rounded-md transition-all ${
                    isActive 
                      ? "bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg shadow-blue-500/20 glow-blue scale-105" 
                      : isCompleted 
                        ? "text-blue-400 bg-slate-900 border border-blue-500/20 hover:bg-slate-850" 
                        : "text-slate-600 bg-slate-950/20 border border-slate-900"
                  }`}
                >
                  {step.label}
                </button>
                {idx < STEPS_TIMELINE.length - 1 && (
                  <ChevronRight className="w-3.5 h-3.5 text-slate-800 shrink-0 mx-0.5" />
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

                    {/* Corner accent line */}
                    <div className="absolute bottom-0 right-0 w-8 h-8 opacity-20 pointer-events-none border-b border-r border-blue-500" />
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
                          <span className={`text-[10px] font-bold font-display px-2 py-0.5 rounded-full ${
                            isSelected 
                              ? "bg-blue-500/10 text-blue-400" 
                              : "bg-slate-900 text-slate-500"
                          }`}>
                            {isSelected ? "ARMED" : "SELECT"}
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

          {/* STEP 2: DEBATE ARENA ROUND 1 */}
          {activeStep === "DEBATE_R1" && (
            <motion.div
              key="debate-r1"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              className="grid grid-cols-1 lg:grid-cols-3 gap-6"
            >
              {/* Left Column: AI Arsenal Sidebar (Sticky Fact Sheet) */}
              <div className="lg:col-span-1 flex flex-col gap-4">
                <div className="glass-panel border-slate-800 rounded-xl p-5 sticky top-4">
                  <h3 className="text-xs font-bold font-display text-slate-500 uppercase tracking-widest mb-4 flex items-center justify-between">
                    <span>AI ARSENAL LOCKER</span>
                    <span className="text-[10px] bg-slate-900 px-2 py-0.5 rounded-md text-blue-400">
                      {selectedFactIds.length} ARMED
                    </span>
                  </h3>
                  
                  <div className="flex flex-col gap-4 max-h-[480px] overflow-y-auto pr-1">
                    {data.arsenal.map((item, idx) => {
                      const isSelected = selectedFactIds.includes(idx);
                      return (
                        <div 
                          key={item.title}
                          className={`p-3 rounded-lg border transition-all ${
                            isSelected 
                              ? "bg-slate-900/60 border-blue-500/40" 
                              : "bg-slate-950/20 border-slate-900 opacity-60"
                          }`}
                        >
                          <h4 className="text-xs font-bold text-white uppercase font-display mb-1.5 flex items-center gap-2">
                            <Zap className={`w-3.5 h-3.5 ${isSelected ? "text-blue-400" : "text-slate-600"}`} />
                            {item.title}
                          </h4>
                          <p className="text-[11px] text-slate-400 leading-relaxed font-light">
                            {item.fact}
                          </p>
                        </div>
                      );
                    })}
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
                    Compose your defense of <strong className="text-blue-400 font-semibold">{data.name}</strong>. Trigger counterattacks by typing keywords like <span className="font-mono text-purple-400">{data.counterattacks.map(c => `'${c.triggerKeyword}'`).join(", ")}</span>.
                  </p>

                  <div className="relative mb-4">
                    <textarea
                      value={argumentR1}
                      onChange={(e) => setArgumentR1(e.target.value)}
                      placeholder={`Example: ${data.name} is the absolute GOAT because of their ${data.counterattacks[0]?.triggerKeyword || "credentials"}...`}
                      maxLength={1200}
                      rows={10}
                      className="w-full bg-slate-950/80 border border-slate-800 rounded-xl p-5 text-sm text-slate-100 font-light placeholder:text-slate-650 focus:outline-none focus:border-blue-500/80 focus:ring-1 focus:ring-blue-500/40 transition-all font-sans leading-relaxed resize-none"
                    />
                    
                    {/* Glowing highlight in background */}
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
                      disabled={argumentR1.trim().length < 20}
                      className={`px-6 py-3.5 font-bold font-display text-xs tracking-wider rounded-xl transition-all flex items-center gap-2 ${
                        argumentR1.trim().length >= 20
                          ? "bg-blue-600 hover:bg-blue-500 text-white shadow-lg shadow-blue-500/20 hover:scale-[1.02]"
                          : "bg-slate-900 text-slate-600 border border-slate-850 cursor-not-allowed"
                      }`}
                    >
                      SUBMIT DEBATE THESIS
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {/* STEP 3: AI COUNTERATTACK */}
          {activeStep === "COUNTERATTACK" && activeCounterattack && (
            <motion.div
              key="counterattack-view"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-2xl mx-auto flex flex-col items-center"
            >
              <div className="text-center mb-8">
                <span className="text-[10px] text-rose-500 font-bold uppercase tracking-widest font-display border border-rose-500/20 px-3 py-1 rounded-full bg-rose-950/20 animate-pulse">
                  INCOMING INVASION
                </span>
                <h2 className="text-3xl md:text-4xl font-black font-display text-white uppercase mt-3 tracking-tight">
                  OPPONENT COUNTERATTACK
                </h2>
                <p className="text-slate-400 text-sm mt-2">
                  The opposing faction has intercepted your arguments and launched a counterstrike.
                </p>
              </div>

              {/* Opponent Attack Card */}
              <motion.div 
                initial={{ x: 50, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ type: "spring", stiffness: 100 }}
                className="w-full glass-panel glow-purple rounded-2xl p-6 md:p-8 relative overflow-hidden border border-rose-500/30 mb-8"
              >
                {/* Shimmer red banner */}
                <div className="absolute inset-0 bg-gradient-to-b from-rose-500/5 to-transparent pointer-events-none" />
                
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-9 h-9 rounded-lg bg-rose-500/10 border border-rose-500/30 flex items-center justify-center">
                    <Swords className="w-5 h-5 text-rose-500" />
                  </div>
                  <div>
                    <div className="text-[9px] text-slate-500 font-bold font-display uppercase tracking-wider">
                      INTERCEPT TRIGGER
                    </div>
                    <div className="text-xs font-bold text-rose-400 font-display uppercase">
                      CRITIQUE OF: &quot;{activeCounterattack.triggerKeyword.toUpperCase()}&quot;
                    </div>
                  </div>
                </div>

                <blockquote className="text-base md:text-lg font-light text-slate-100 italic leading-relaxed pl-4 border-l-2 border-rose-500/50 mb-6">
                  &quot;{activeCounterattack.claim}&quot;
                </blockquote>

                <div className="text-right text-[10px] text-slate-500 font-bold font-display uppercase tracking-widest">
                  — DEPLOYED BY TEAM {data.rival.toUpperCase()}
                </div>
              </motion.div>

              {/* Proceed Action */}
              <div className="flex gap-4">
                <button
                  onClick={() => setActiveStep("COACH")}
                  className="px-8 py-4 bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-bold font-display tracking-widest text-sm rounded-xl hover:shadow-lg hover:shadow-purple-500/20 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center gap-2 shadow-inner"
                >
                  CONSULT AI COACH
                  <MessageSquareCode className="w-4 h-4" />
                </button>
              </div>
            </motion.div>
          )}

          {/* STEP 4: HALF-TIME ANALYSIS (COACH) */}
          {activeStep === "COACH" && (
            <motion.div
              key="coach-view"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              className="w-full flex flex-col"
            >
              <div className="text-center mb-8">
                <span className="text-[10px] text-amber-400 font-bold uppercase tracking-widest font-display border border-amber-500/20 px-3 py-1 rounded-full bg-amber-950/20">
                  HALF-TIME COACHING
                </span>
                <h2 className="text-3xl md:text-4xl font-black font-display text-white uppercase mt-3 tracking-tight">
                  TACTICAL FEEDBACK
                </h2>
                <p className="text-slate-400 text-sm mt-2 max-w-lg mx-auto">
                  Your AI Trainer has processed your Round 1 debate and identified critical improvements.
                </p>
              </div>

              {/* Coach Layout Screen (Esports Tactical Slate) */}
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
                  <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest font-display mb-6">
                    Master Debate Strategist
                  </span>

                  <p className="text-xs text-slate-400 leading-relaxed font-light mb-6">
                    {"You've set up a solid base, but the opposition is testing your flanks. Look at these specific tactical points before editing your final pitch."}
                  </p>

                  <div className="w-full bg-slate-950 border border-slate-900 rounded-lg p-3 text-left">
                    <span className="text-[9px] text-slate-500 font-bold uppercase font-display block mb-1">
                      CURRENT STANCE
                    </span>
                    <span className="text-xs font-semibold text-blue-400 font-display uppercase tracking-wide">
                      COUNTER-DEFENSE READY
                    </span>
                  </div>
                </div>

                {/* Right Side: Strengths, Weaknesses, Missed Opportunities */}
                <div className="lg:col-span-2 flex flex-col gap-6">
                  
                  {/* Strengths / Weaknesses Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    
                    {/* Strengths Panel */}
                    <div className="glass-panel border-green-500/20 bg-green-950/5 rounded-xl p-5 relative">
                      <h4 className="text-xs font-bold font-display text-green-400 uppercase tracking-widest mb-3 flex items-center gap-2">
                        <CheckCircle className="w-4 h-4 text-green-400" />
                        STRENGTHS
                      </h4>
                      <ul className="flex flex-col gap-3">
                        {data.coachFeedback.strengths.map((item, index) => (
                          <li key={index} className="text-xs text-slate-300 font-light flex items-start gap-2">
                            <CornerDownRight className="w-3.5 h-3.5 text-green-500 shrink-0 mt-0.5" />
                            {item}
                          </li>
                        ))}
                      </ul>
                    </div>

                    {/* Weaknesses Panel */}
                    <div className="glass-panel border-rose-500/20 bg-rose-950/5 rounded-xl p-5 relative">
                      <h4 className="text-xs font-bold font-display text-rose-400 uppercase tracking-widest mb-3 flex items-center gap-2">
                        <XCircle className="w-4 h-4 text-rose-400" />
                        WEAKNESSES
                      </h4>
                      <ul className="flex flex-col gap-3">
                        {data.coachFeedback.weaknesses.map((item, index) => (
                          <li key={index} className="text-xs text-slate-300 font-light flex items-start gap-2">
                            <CornerDownRight className="w-3.5 h-3.5 text-rose-500 shrink-0 mt-0.5" />
                            {item}
                          </li>
                        ))}
                      </ul>
                    </div>

                  </div>

                  {/* Missed Opportunities & Upgrades */}
                  <div className="glass-panel rounded-xl p-5 border border-slate-800">
                    <h4 className="text-xs font-bold font-display text-slate-400 uppercase tracking-widest mb-3 flex items-center gap-2">
                      <AlertTriangle className="w-4 h-4 text-amber-500" />
                      MISSED OPPORTUNITIES
                    </h4>
                    <ul className="flex flex-col gap-2.5 mb-5">
                      {data.coachFeedback.missedOpportunities.map((item, index) => (
                        <li key={index} className="text-xs text-slate-300 font-light flex items-start gap-2">
                          <span className="text-amber-500 font-bold">•</span>
                          {item}
                        </li>
                      ))}
                    </ul>

                    {/* Tactical Suggestion / Upgrade Box */}
                    <div className="bg-amber-500/10 border border-amber-500/30 rounded-xl p-4 glow-gold relative overflow-hidden">
                      <div className="absolute top-0 right-0 bg-amber-500 text-slate-950 text-[8px] font-black tracking-widest px-2 py-0.5 rounded-bl uppercase">
                        SUGGESTED UPGRADE
                      </div>
                      <span className="text-xs font-bold text-amber-400 font-display block mb-1 uppercase tracking-wide">
                        {"COACH'S COMBAT DIRECTIVE"}
                      </span>
                      <p className="text-xs text-slate-200 leading-relaxed font-light">
                        {data.coachFeedback.upgradeSuggestion}
                      </p>
                    </div>
                  </div>

                </div>

              </div>

              {/* Proceed Action */}
              <div className="flex justify-center">
                <button
                  onClick={() => setActiveStep("DEBATE_R2")}
                  className="px-8 py-4 bg-gradient-to-r from-amber-500 to-orange-600 text-white font-bold font-display tracking-widest text-sm rounded-xl hover:shadow-lg hover:shadow-amber-500/20 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center gap-2"
                >
                  RE-WRITE FINAL ARGUMENT
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </motion.div>
          )}

          {/* STEP 5: IMPROVED ARGUMENT (ROUND 2) */}
          {activeStep === "DEBATE_R2" && (
            <motion.div
              key="debate-r2"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              className="grid grid-cols-1 lg:grid-cols-3 gap-6"
            >
              {/* Left Column: Coach upgrade and Counterattack info */}
              <div className="lg:col-span-1 flex flex-col gap-4">
                
                {/* Counterattack to reply to */}
                {activeCounterattack && (
                  <div className="glass-panel border-rose-500/20 rounded-xl p-5">
                    <h3 className="text-xs font-bold font-display text-rose-400 uppercase tracking-widest mb-3 flex items-center gap-1.5">
                      <Swords className="w-3.5 h-3.5" />
                      THE COUNTER CLAIM
                    </h3>
                    <p className="text-xs text-slate-300 leading-relaxed font-light italic">
                      &quot;{activeCounterattack.claim}&quot;
                    </p>
                  </div>
                )}

                {/* Upgrade advice card */}
                <div className="glass-panel border-amber-500/20 rounded-xl p-5">
                  <h3 className="text-xs font-bold font-display text-amber-400 uppercase tracking-widest mb-3 flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 animate-pulse" />
                    COACH directive
                  </h3>
                  <p className="text-xs text-slate-350 leading-relaxed font-light mb-4">
                    {data.coachFeedback.upgradeSuggestion}
                  </p>
                  <div className="bg-slate-950 border border-slate-900 rounded-lg p-3">
                    <span className="text-[9px] text-slate-500 font-bold uppercase font-display block mb-1">
                      TACTICAL BONUS
                    </span>
                    <p className="text-[11px] text-blue-400 leading-relaxed font-light">
                      Use: <strong className="font-semibold text-white">&quot;{activeCounterattack?.defenseUpgrade}&quot;</strong>
                    </p>
                  </div>
                </div>
              </div>

              {/* Right Column: Main Argument Rewrite Area */}
              <div className="lg:col-span-2 flex flex-col gap-6">
                <div className="glass-panel-heavy rounded-xl p-6 border border-slate-800 relative">
                  <div className="absolute top-4 right-6 text-[10px] text-slate-500 font-bold uppercase font-display bg-slate-950 px-2.5 py-1 rounded-md border border-slate-900">
                    ROUND 2 FINAL PITCH
                  </div>
                  
                  <h2 className="text-2xl font-black font-display text-white uppercase mb-1">
                    REFINE YOUR THESIS
                  </h2>
                  <p className="text-xs text-slate-400 mb-6">
                    Inject your upgrades and counterarguments to maximize logic and persuasion scores.
                  </p>

                  <div className="relative mb-4">
                    <textarea
                      value={argumentR2}
                      onChange={(e) => setArgumentR2(e.target.value)}
                      placeholder="Write your refined thesis here..."
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
                      onClick={() => setActiveStep("COACH")}
                      className="text-xs text-slate-400 hover:text-white font-bold font-display flex items-center gap-1.5"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                      VIEW TACTICS
                    </button>
                    
                    <button
                      onClick={() => setActiveStep("SCOREBOARD")}
                      disabled={argumentR2.trim().length < 20}
                      className={`px-6 py-3.5 font-bold font-display text-xs tracking-wider rounded-xl transition-all flex items-center gap-2 ${
                        argumentR2.trim().length >= 20
                          ? "bg-amber-500 hover:bg-amber-400 text-slate-950 hover:scale-[1.02] shadow-lg shadow-amber-500/10"
                          : "bg-slate-900 text-slate-600 border border-slate-850 cursor-not-allowed"
                      }`}
                    >
                      SUBMIT TO REFEREE
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {/* STEP 6: AI REFEREE SCOREBOARD */}
          {activeStep === "SCOREBOARD" && (
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
                  The panel of AI Referees has finalized the analysis of both rounds.
                </p>
              </div>

              {/* Large Scoreboard Card */}
              <div className="w-full glass-panel-heavy rounded-2xl p-6 md:p-8 border border-slate-800 relative overflow-hidden mb-8">
                {/* Stadium Spotlight Sweeps */}
                <div className="absolute inset-0 overflow-hidden pointer-events-none">
                  <div className="absolute -top-[10%] left-[20%] w-[3px] h-[150%] bg-blue-500/25 blur-sm rotate-[15deg] origin-top animate-beam-sweep" />
                  <div className="absolute -top-[10%] right-[20%] w-[3px] h-[150%] bg-purple-500/20 blur-sm rotate-[-12deg] origin-top animate-beam-sweep [animation-delay:2s]" />
                </div>

                {/* Score Header */}
                <div className="flex items-center justify-between border-b border-slate-800 pb-4 mb-6 relative z-10">
                  <span className="font-display font-black text-slate-400 tracking-wider text-sm">
                    METRIC RATING
                  </span>
                  <div className="flex gap-16 font-display font-bold text-xs text-slate-500">
                    <span>ROUND 1</span>
                    <span>ROUND 2</span>
                  </div>
                </div>

                {/* Score Categories */}
                <div className="flex flex-col gap-6 relative z-10">
                  {/* Category: Evidence */}
                  <div className="grid grid-cols-12 items-center gap-4">
                    <div className="col-span-3 text-left">
                      <span className="text-xs font-bold text-white uppercase font-display block">
                        EVIDENCE
                      </span>
                      <span className="text-[10px] text-slate-500 font-light leading-none">
                        Factual support
                      </span>
                    </div>
                    <div className="col-span-6 flex flex-col gap-1">
                      {/* Round 1 visual bar */}
                      <div className="h-1.5 bg-slate-900 rounded-full overflow-hidden">
                        <motion.div 
                          initial={{ width: 0 }}
                          animate={{ width: `${data.refereeScoring.round1.evidence}%` }}
                          transition={{ duration: 1 }}
                          className="h-full bg-slate-700" 
                        />
                      </div>
                      {/* Round 2 visual bar */}
                      <div className="h-2.5 bg-slate-900 rounded-full overflow-hidden">
                        <motion.div 
                          initial={{ width: 0 }}
                          animate={{ width: `${data.refereeScoring.round2.evidence}%` }}
                          transition={{ duration: 1.2, delay: 0.2 }}
                          className="h-full bg-gradient-to-r from-blue-500 to-cyan-400" 
                        />
                      </div>
                    </div>
                    <div className="col-span-3 flex justify-end gap-12 font-display text-base font-black">
                      <span className="text-slate-500">{data.refereeScoring.round1.evidence}</span>
                      <span className="text-blue-400">{data.refereeScoring.round2.evidence}</span>
                    </div>
                  </div>

                  {/* Category: Logic */}
                  <div className="grid grid-cols-12 items-center gap-4">
                    <div className="col-span-3 text-left">
                      <span className="text-xs font-bold text-white uppercase font-display block">
                        LOGIC
                      </span>
                      <span className="text-[10px] text-slate-500 font-light leading-none">
                        Structure & rebuttals
                      </span>
                    </div>
                    <div className="col-span-6 flex flex-col gap-1">
                      {/* Round 1 visual bar */}
                      <div className="h-1.5 bg-slate-900 rounded-full overflow-hidden">
                        <motion.div 
                          initial={{ width: 0 }}
                          animate={{ width: `${data.refereeScoring.round1.logic}%` }}
                          transition={{ duration: 1 }}
                          className="h-full bg-slate-700" 
                        />
                      </div>
                      {/* Round 2 visual bar */}
                      <div className="h-2.5 bg-slate-900 rounded-full overflow-hidden">
                        <motion.div 
                          initial={{ width: 0 }}
                          animate={{ width: `${data.refereeScoring.round2.logic}%` }}
                          transition={{ duration: 1.2, delay: 0.4 }}
                          className="h-full bg-gradient-to-r from-purple-500 to-indigo-400" 
                        />
                      </div>
                    </div>
                    <div className="col-span-3 flex justify-end gap-12 font-display text-base font-black">
                      <span className="text-slate-500">{data.refereeScoring.round1.logic}</span>
                      <span className="text-purple-400">{data.refereeScoring.round2.logic}</span>
                    </div>
                  </div>

                  {/* Category: Persuasion */}
                  <div className="grid grid-cols-12 items-center gap-4">
                    <div className="col-span-3 text-left">
                      <span className="text-xs font-bold text-white uppercase font-display block">
                        PERSUASION
                      </span>
                      <span className="text-[10px] text-slate-500 font-light leading-none">
                        Rhetoric & balance
                      </span>
                    </div>
                    <div className="col-span-6 flex flex-col gap-1">
                      {/* Round 1 visual bar */}
                      <div className="h-1.5 bg-slate-900 rounded-full overflow-hidden">
                        <motion.div 
                          initial={{ width: 0 }}
                          animate={{ width: `${data.refereeScoring.round1.persuasion}%` }}
                          transition={{ duration: 1 }}
                          className="h-full bg-slate-700" 
                        />
                      </div>
                      {/* Round 2 visual bar */}
                      <div className="h-2.5 bg-slate-900 rounded-full overflow-hidden">
                        <motion.div 
                          initial={{ width: 0 }}
                          animate={{ width: `${data.refereeScoring.round2.persuasion}%` }}
                          transition={{ duration: 1.2, delay: 0.6 }}
                          className="h-full bg-gradient-to-r from-amber-500 to-yellow-400" 
                        />
                      </div>
                    </div>
                    <div className="col-span-3 flex justify-end gap-12 font-display text-base font-black">
                      <span className="text-slate-500">{data.refereeScoring.round1.persuasion}</span>
                      <span className="text-amber-400">{data.refereeScoring.round2.persuasion}</span>
                    </div>
                  </div>
                </div>

                {/* Score Reveal Banner */}
                <div className="mt-8 pt-6 border-t border-slate-800 flex flex-col md:flex-row justify-between items-center gap-4 relative z-10">
                  <div className="text-left">
                    <span className="text-[9px] text-slate-500 font-bold uppercase font-display block mb-1">
                      VERDICT COMMENT
                    </span>
                    <p className="text-xs text-slate-300 font-light leading-relaxed max-w-md">
                      &quot;{data.refereeScoring.round2.comment}&quot;
                    </p>
                  </div>
                  
                  {/* Improvement Reveal Box */}
                  <motion.div 
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ delay: 0.9, type: "spring" }}
                    className="px-6 py-4 bg-slate-900 border border-slate-800 rounded-xl text-center shadow-lg shadow-black/40 min-w-[150px]"
                  >
                    <span className="text-[9px] text-slate-500 font-bold uppercase font-display block mb-1">
                      IMPROVEMENT
                    </span>
                    <span className="text-2xl font-black font-display text-green-400">
                      +17%
                    </span>
                  </motion.div>
                </div>
              </div>

              {/* Proceed Action */}
              <div className="flex justify-center">
                <button
                  onClick={() => setActiveStep("WINNER")}
                  className="px-8 py-4 bg-gradient-to-r from-blue-500 via-purple-500 to-amber-500 text-white font-bold font-display tracking-widest text-sm rounded-xl hover:shadow-lg hover:shadow-blue-500/20 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center gap-2"
                >
                  CLAIM FINAL JUDGMENT
                  <Trophy className="w-4 h-4 text-amber-300 animate-pulse" />
                </button>
              </div>
            </motion.div>
          )}

          {/* STEP 7: WINNER SCREEN */}
          {activeStep === "WINNER" && (
            <motion.div
              key="winner-view"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ type: "spring", stiffness: 80 }}
              className="w-full max-w-xl mx-auto flex flex-col items-center text-center relative"
            >
              {/* Confetti Floating Particles Effect using absolute divs */}
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

              {/* Giant Winner Shimmer Backdrop */}
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 rounded-full bg-amber-500/10 blur-[100px] pointer-events-none z-0 animate-gold-shimmer" />

              <div className="z-10 flex flex-col items-center w-full">
                
                {/* Trophy visual container */}
                <motion.div
                  initial={{ rotate: -15, scale: 0.8 }}
                  animate={{ rotate: 0, scale: 1 }}
                  transition={{ type: "spring", delay: 0.2 }}
                  className="w-32 h-32 rounded-full bg-slate-900 border border-slate-800 flex items-center justify-center mb-6 shadow-xl relative overflow-hidden group hover:border-amber-500/40 transition-colors"
                >
                  <div className="absolute inset-0 bg-radial from-amber-500/10 to-transparent pointer-events-none" />
                  <Trophy className="w-16 h-16 text-amber-400 group-hover:scale-110 transition-transform duration-300" />
                </motion.div>

                {/* Banner Winner Heading */}
                <span className="text-[10px] text-amber-400 font-bold uppercase tracking-widest font-display border border-amber-500/20 px-3 py-1 rounded-full bg-amber-950/20 mb-3 block">
                  ARENA CHAMPION
                </span>
                
                <h1 className="text-4xl md:text-5xl font-black font-display text-white uppercase tracking-tight mb-2">
                  VICTORY IN <span className="bg-gradient-to-r from-amber-400 to-yellow-500 bg-clip-text text-transparent">THE ARENA</span>
                </h1>
                
                <p className="text-slate-400 text-xs md:text-sm max-w-sm mx-auto mb-8 leading-relaxed">
                  You have successfully defended your football claim. The AI Coach awards you the title of <strong className="text-white font-semibold">Elite Tactician</strong>.
                </p>

                {/* Match Summary Box */}
                <div className="w-full glass-panel border-slate-800 rounded-xl p-5 mb-8 text-left">
                  <div className="text-[9px] text-slate-500 font-bold uppercase font-display mb-3 text-center border-b border-slate-900 pb-2">
                    MATCH CLASH SUMMARY
                  </div>
                  
                  <div className="flex justify-between items-center text-xs py-1.5 text-slate-400 font-display">
                    <span>SELECTED CLAIM:</span>
                    <span className="font-semibold text-white uppercase">{data.name}</span>
                  </div>
                  
                  <div className="flex justify-between items-center text-xs py-1.5 text-slate-400 font-display">
                    <span>FINAL EVIDENCE:</span>
                    <span className="font-bold text-blue-400">{data.refereeScoring.round2.evidence} / 100</span>
                  </div>

                  <div className="flex justify-between items-center text-xs py-1.5 text-slate-400 font-display">
                    <span>FINAL PERSUASION:</span>
                    <span className="font-bold text-amber-400">{data.refereeScoring.round2.persuasion} / 100</span>
                  </div>

                  <div className="flex justify-between items-center text-xs py-1.5 text-slate-400 font-display">
                    <span>CLASH NET RATING:</span>
                    <span className="font-bold text-green-400">95% (CLASS A)</span>
                  </div>
                </div>

                {/* Action buttons */}
                <div className="flex flex-col sm:flex-row gap-4 w-full">
                  <button
                    onClick={() => {
                      setArgumentR1("");
                      setArgumentR2("");
                      setSelectedFactIds([]);
                      setActiveStep("ARSENAL");
                    }}
                    className="flex-1 px-6 py-4 bg-slate-900 border border-slate-800 text-white font-bold font-display text-xs tracking-wider rounded-xl hover:bg-slate-850 hover:text-white transition-all flex items-center justify-center gap-1.5"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    REPLAY BATTLE
                  </button>

                  <Link
                    href="/select"
                    className="flex-1 px-6 py-4 bg-gradient-to-r from-blue-500 to-purple-600 text-white font-bold font-display text-xs tracking-wider rounded-xl hover:shadow-lg hover:shadow-blue-500/20 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-1.5"
                  >
                    CHOOSE OTHER RIVALRY
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

// Next.js entrypoint containing Suspense wrapper
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
