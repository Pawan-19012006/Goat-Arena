"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Swords, ArrowLeft, Shield, Trophy, Activity, Sparkles, User, Globe } from "lucide-react";
import Link from "next/link";

interface Rivalry {
  id: string;
  name: string;
  subtitle: string;
  type: "player" | "team";
  sides: {
    id: string;
    name: string;
    badge: string;
    color: string;
    shadowColor: string;
    glowBorder: string;
    description: string;
    icon: React.ComponentType<{ className?: string }>;
  }[];
}

const rivalries: Rivalry[] = [
  {
    id: "messi-vs-ronaldo",
    name: "Messi vs Ronaldo",
    subtitle: "The Decade of Dominance",
    type: "player",
    sides: [
      {
        id: "messi",
        name: "TEAM MESSI",
        badge: "The Playmaker / La Pulga",
        color: "from-sky-400 via-blue-500 to-indigo-700",
        shadowColor: "rgba(56,189,248,0.4)",
        glowBorder: "border-sky-400/50",
        description: "8x Ballon d'Or Winner • 44 Trophies • World Cup Champion",
        icon: Sparkles,
      },
      {
        id: "ronaldo",
        name: "TEAM RONALDO",
        badge: "The Goal Machine / CR7",
        color: "from-rose-500 via-red-600 to-amber-600",
        shadowColor: "rgba(244,63,94,0.4)",
        glowBorder: "border-rose-500/50",
        description: "5x Ballon d'Or Winner • 900+ Career Goals • 5x UCL Champion",
        icon: User,
      },
    ],
  },
  {
    id: "mbappe-vs-haaland",
    name: "Mbappé vs Haaland",
    subtitle: "The New Era Dawns",
    type: "player",
    sides: [
      {
        id: "mbappe",
        name: "TEAM MBAPPÉ",
        badge: "The Speed Demon / Donatello",
        color: "from-teal-400 via-cyan-500 to-indigo-800",
        shadowColor: "rgba(45,212,191,0.4)",
        glowBorder: "border-teal-400/50",
        description: "World Cup Winner • Hat-trick in World Cup Final • Speed Machine",
        icon: Activity,
      },
      {
        id: "haaland",
        name: "TEAM HAALAND",
        badge: "The Terminator / Cyborg",
        color: "from-amber-400 via-yellow-500 to-orange-600",
        shadowColor: "rgba(251,191,36,0.4)",
        glowBorder: "border-amber-400/50",
        description: "Treble Winner • Premier League Goal Record Holder • Pure Goal Scorer",
        icon: Shield,
      },
    ],
  },
  {
    id: "argentina-vs-brazil",
    name: "Argentina vs Brazil",
    subtitle: "The Superclásico de las Américas",
    type: "team",
    sides: [
      {
        id: "argentina",
        name: "ARGENTINA",
        badge: "La Albiceleste",
        color: "from-sky-300 via-sky-500 to-indigo-600",
        shadowColor: "rgba(125,211,252,0.4)",
        glowBorder: "border-sky-300/50",
        description: "3x World Cup Champions • Copa América Reigning Kings",
        icon: Globe,
      },
      {
        id: "brazil",
        name: "BRAZIL",
        badge: "Seleção Canarinho",
        color: "from-green-400 via-yellow-500 to-green-700",
        shadowColor: "rgba(34,197,94,0.4)",
        glowBorder: "border-green-400/50",
        description: "5x World Cup Champions • The Jogo Bonito Legacy",
        icon: Trophy,
      },
    ],
  },
];

export default function SelectionPage() {
  const router = useRouter();
  const [selectedRivalry, setSelectedRivalry] = useState<Rivalry | null>(null);
  const [hoveredSide, setHoveredSide] = useState<string | null>(null);

  const handleSelectSide = (sideId: string) => {
    if (!selectedRivalry) return;
    router.push(`/arena?rivalry=${selectedRivalry.id}&side=${sideId}`);
  };

  return (
    <div className="flex flex-col min-h-screen relative z-10">
      
      {/* Header bar */}
      <header className="w-full max-w-6xl mx-auto flex items-center justify-between py-6 px-4">
        <div className="flex items-center gap-3">
          {selectedRivalry ? (
            <button
              onClick={() => setSelectedRivalry(null)}
              className="p-2 rounded-lg border border-slate-800 bg-slate-900/60 text-slate-300 hover:text-white hover:border-slate-700 transition-all flex items-center gap-2 group text-xs font-display font-semibold"
            >
              <ArrowLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
              BACK TO RIVALRIES
            </button>
          ) : (
            <Link
              href="/"
              className="p-2 rounded-lg border border-slate-800 bg-slate-900/60 text-slate-300 hover:text-white hover:border-slate-700 transition-all flex items-center gap-2 group text-xs font-display font-semibold"
            >
              <ArrowLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
              LEAVE ARENA
            </Link>
          )}
        </div>
        
        <span className="font-display text-lg font-bold tracking-widest text-slate-400">
          STAGE 01: <span className="text-white">DRAFT ROOM</span>
        </span>
      </header>

      {/* Main Container */}
      <div className="flex-1 flex flex-col justify-center items-center w-full max-w-6xl mx-auto px-4 py-8">
        
        <AnimatePresence mode="wait">
          {!selectedRivalry ? (
            /* STEP 1: RIVALRY SELECTION */
            <motion.div
              key="rivalry-select"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.5 }}
              className="w-full flex flex-col items-center"
            >
              <div className="text-center mb-12">
                <h1 className="text-4xl md:text-5xl font-black font-display text-white uppercase tracking-tight mb-2">
                  CHOOSE YOUR <span className="bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">RIVALRY</span>
                </h1>
                <p className="text-slate-400 text-sm md:text-base max-w-md mx-auto">
                  Select a historic conflict to enter the debate stage.
                </p>
              </div>

              {/* Rivalry Cards Deck */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8 w-full max-w-5xl">
                {rivalries.map((rivalry, idx) => {
                  const sideA = rivalry.sides[0];
                  const sideB = rivalry.sides[1];

                  return (
                    <motion.div
                      key={rivalry.id}
                      initial={{ opacity: 0, y: 30 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: idx * 0.1, duration: 0.5 }}
                      whileHover={{ scale: 1.03, y: -5 }}
                      onClick={() => setSelectedRivalry(rivalry)}
                      className="group cursor-pointer glass-panel-interactive rounded-2xl p-6 flex flex-col justify-between min-h-[300px] relative overflow-hidden border border-slate-800 hover:border-blue-500/40"
                    >
                      {/* Background match beam */}
                      <div className="absolute inset-0 bg-gradient-to-br from-slate-900/10 via-slate-950/80 to-slate-950 pointer-events-none" />
                      
                      {/* Category Label */}
                      <div className="flex justify-between items-center relative z-10 mb-4">
                        <span className="text-[10px] text-blue-400 font-bold uppercase tracking-widest font-display border border-blue-500/20 px-2 py-0.5 rounded-full bg-blue-950/20">
                          {rivalry.type === "player" ? "INDIVIDUAL GLORY" : "NATIONAL PRIDE"}
                        </span>
                        <Swords className="w-4 h-4 text-slate-600 group-hover:text-blue-400 transition-colors" />
                      </div>

                      {/* Duel Header */}
                      <div className="relative z-10 mb-8">
                        <h3 className="text-2xl font-black font-display text-white uppercase leading-tight tracking-tight group-hover:text-blue-300 transition-colors">
                          {sideA.name.split(" ")[1] || sideA.name}
                        </h3>
                        <div className="text-xs text-slate-500 font-bold font-display my-1">VS</div>
                        <h3 className="text-2xl font-black font-display text-white uppercase leading-tight tracking-tight group-hover:text-purple-300 transition-colors">
                          {sideB.name.split(" ")[1] || sideB.name}
                        </h3>
                      </div>

                      {/* Footer Match Title */}
                      <div className="relative z-10 border-t border-slate-900 pt-4 mt-auto">
                        <div className="text-xs text-slate-400 font-semibold font-display uppercase tracking-wider mb-1">
                          {rivalry.subtitle}
                        </div>
                        <div className="text-[10px] text-slate-600">
                          Select to pick side
                        </div>
                      </div>

                      {/* Hover overlay border glow */}
                      <div className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 border border-gradient-to-r from-blue-500 to-purple-500 pointer-events-none" />
                    </motion.div>
                  );
                })}
              </div>
            </motion.div>
          ) : (
            /* STEP 2: SIDE SELECTION (SPLIT SCREEN) */
            <motion.div
              key="side-select"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.5 }}
              className="w-full flex flex-col items-center"
            >
              <div className="text-center mb-8">
                <div className="text-xs text-amber-400 font-bold tracking-widest font-display mb-2 uppercase">
                  Rivalry: {selectedRivalry.name}
                </div>
                <h1 className="text-4xl md:text-5xl font-black font-display text-white uppercase tracking-tight">
                  CHOOSE YOUR <span className="bg-gradient-to-r from-amber-400 to-orange-500 bg-clip-text text-transparent">TEAM</span>
                </h1>
                <p className="text-slate-400 text-sm max-w-md mx-auto">
                  Pick the champion whose stats and glory you will defend.
                </p>
              </div>

              {/* Split Screen Container */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full max-w-4xl min-h-[420px] relative">
                
                {/* Visual VS divider in the middle */}
                <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-slate-950 border border-slate-800 items-center justify-center hidden md:flex z-20 text-slate-400 font-bold font-display shadow-xl">
                  VS
                </div>

                {selectedRivalry.sides.map((side) => {
                  const SideIcon = side.icon;
                  const isHovered = hoveredSide === side.id;
                  const isOtherHovered = hoveredSide !== null && hoveredSide !== side.id;

                  return (
                    <motion.div
                      key={side.id}
                      onMouseEnter={() => setHoveredSide(side.id)}
                      onMouseLeave={() => setHoveredSide(null)}
                      onClick={() => handleSelectSide(side.id)}
                      whileTap={{ scale: 0.98 }}
                      className={`cursor-pointer rounded-2xl overflow-hidden relative flex flex-col justify-between p-8 border glass-panel transition-all duration-500 ${
                        isHovered 
                          ? `${side.glowBorder} scale-[1.02] shadow-2xl` 
                          : isOtherHovered 
                            ? "opacity-40 border-slate-900" 
                            : "border-slate-800"
                      }`}
                    >
                      {/* Energetic Background Gradient (visible on hover) */}
                      <div
                        className={`absolute inset-0 bg-gradient-to-b ${side.color} opacity-0 transition-opacity duration-500 pointer-events-none`}
                        style={{
                          opacity: isHovered ? 0.08 : 0.02,
                        }}
                      />

                      {/* Glowing spotlight behind card */}
                      {isHovered && (
                        <div
                          className="absolute inset-0 blur-[50px] rounded-full opacity-35 pointer-events-none"
                          style={{
                            background: `radial-gradient(circle, ${side.shadowColor} 0%, transparent 70%)`,
                          }}
                        />
                      )}

                      {/* Header Badge */}
                      <div className="relative z-10 flex justify-between items-start">
                        <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest font-display border border-slate-800 px-3 py-1 rounded-full bg-slate-900/90">
                          {side.badge}
                        </span>
                        
                        <div 
                          className="w-10 h-10 rounded-lg flex items-center justify-center transition-all duration-300"
                          style={{
                            backgroundColor: isHovered ? side.shadowColor : "rgba(30, 41, 59, 0.3)",
                            border: `1px solid ${isHovered ? side.glowBorder.split(" ")[0] : "rgba(255,255,255,0.05)"}`
                          }}
                        >
                          <SideIcon className={`w-5 h-5 transition-colors ${isHovered ? "text-white" : "text-slate-400"}`} />
                        </div>
                      </div>

                      {/* Middle Selection Text */}
                      <div className="relative z-10 my-8">
                        <h2 
                          className="text-3xl md:text-4xl font-black font-display tracking-tight text-white transition-all duration-300"
                          style={{
                            textShadow: isHovered ? `0 0 15px ${side.shadowColor}` : "none",
                          }}
                        >
                          {side.name}
                        </h2>
                        <p className="text-slate-400 text-sm mt-3 leading-relaxed">
                          {side.description}
                        </p>
                      </div>

                      {/* Footer Interactive Trigger */}
                      <div className="relative z-10">
                        <div
                          className={`w-full py-3.5 rounded-xl font-bold font-display text-center text-sm tracking-wider uppercase transition-all duration-300 border ${
                            isHovered
                              ? `bg-white text-slate-950 border-white shadow-lg`
                              : `bg-slate-900/80 text-slate-300 border-slate-800 hover:text-white`
                          }`}
                        >
                          {isHovered ? "LOCK IN TEAM" : "SELECT TEAM"}
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Decorative stadium line helper */}
      <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-500 via-purple-500 to-amber-500 opacity-20 pointer-events-none" />
    </div>
  );
}
