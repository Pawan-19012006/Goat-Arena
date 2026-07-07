"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Swords, Trophy, Zap, ChevronRight } from "lucide-react";

export default function LandingPage() {
  return (
    <div className="flex flex-col items-center justify-between min-h-screen py-10 px-4 relative">
      {/* Top Header / Esports Bar */}
      <header className="w-full max-w-6xl flex justify-between items-center z-20 border-b border-slate-800 pb-4">
        <div className="flex items-center gap-2">
          <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center shadow-lg shadow-blue-500/20">
            <Swords className="w-6 h-6 text-white" />
          </div>
          <span className="font-display text-xl font-bold tracking-widest bg-gradient-to-r from-blue-400 via-purple-400 to-amber-400 bg-clip-text text-transparent">
            GOAT ARENA
          </span>
        </div>
        <div className="flex items-center gap-4 text-xs font-semibold tracking-wider font-display">
          <span className="text-slate-400 border border-slate-800 px-3 py-1.5 rounded-full bg-slate-900/60">
            PHASE 1 ACTIVE
          </span>
          <span className="text-amber-400 border border-amber-900/30 px-3 py-1.5 rounded-full bg-amber-950/20 shadow-inner">
            🏆 LIVE STAGE
          </span>
        </div>
      </header>

      {/* Main Hero & Matchup Container */}
      <main className="flex-1 flex flex-col items-center justify-center w-full max-w-5xl z-20 py-12">
        
        {/* Animated Tagline Section */}
        <div className="text-center mb-6">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="inline-block px-4 py-1.5 rounded-full border border-blue-500/20 bg-blue-950/20 text-blue-400 text-sm font-semibold tracking-widest font-display mb-4 uppercase"
          >
            The Ultimate Football Debate Stage
          </motion.div>
          
          <motion.h1
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.1 }}
            className="text-6xl md:text-8xl font-black tracking-tighter font-display text-white mb-6 uppercase"
          >
            GOAT <span className="bg-gradient-to-r from-blue-500 to-purple-600 bg-clip-text text-transparent">ARENA</span>
          </motion.h1>

          {/* Slogan */}
          <div className="flex justify-center items-center gap-4 text-2xl md:text-3xl font-display font-semibold tracking-widest text-slate-300 uppercase">
            <motion.span
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3, duration: 0.5 }}
              className="hover:text-blue-400 transition-colors"
            >
              Debate.
            </motion.span>
            <motion.span
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5, duration: 0.5 }}
              className="text-purple-500"
            >
              •
            </motion.span>
            <motion.span
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6, duration: 0.5 }}
              className="hover:text-purple-400 transition-colors"
            >
              Improve.
            </motion.span>
            <motion.span
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.8, duration: 0.5 }}
              className="text-amber-500"
            >
              •
            </motion.span>
            <motion.span
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.9, duration: 0.5 }}
              className="hover:text-amber-400 transition-colors"
            >
              Dominate.
            </motion.span>
          </div>
        </div>

        {/* Large Rivalry Hero Banner / Matchup Card */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.4 }}
          className="w-full max-w-3xl glass-panel glow-blue rounded-2xl p-8 relative overflow-hidden mb-12"
        >
          {/* Shimmer overlay */}
          <div className="absolute inset-0 shimmer-bg opacity-30 pointer-events-none" />
          
          {/* Matchup background visual */}
          <div className="absolute inset-0 bg-radial from-slate-900/0 via-slate-950/70 to-slate-950 pointer-events-none" />
          
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-slate-800/20 font-black font-display text-[12rem] tracking-tight pointer-events-none select-none">
            VS
          </div>

          {/* Featured Battle Banner */}
          <div className="absolute top-4 left-1/2 -translate-x-1/2 bg-amber-500 text-slate-950 text-[10px] font-bold tracking-widest px-3 py-1 rounded-full uppercase z-10 shadow-lg shadow-amber-500/20">
            FEATURED BATTLE
          </div>

          <div className="grid grid-cols-5 items-center relative z-10 pt-4">
            {/* Left Side: Messi */}
            <div className="col-span-2 text-right pr-4 md:pr-8">
              <div className="text-[10px] text-sky-400 font-bold uppercase tracking-widest font-display mb-1">
                La Pulga
              </div>
              <h3 className="text-2xl md:text-4xl font-black font-display text-white uppercase tracking-tight">
                MESSI
              </h3>
              <p className="text-slate-400 text-xs mt-2 hidden md:block">
                Playmaking Wizard • 8x Ballon d&apos;Or Winner • World Champion
              </p>
            </div>

            {/* Versus Indicator */}
            <div className="col-span-1 flex flex-col items-center justify-center">
              <div className="w-12 h-12 rounded-full bg-slate-950 border-2 border-blue-500/50 flex items-center justify-center text-blue-400 font-bold font-display shadow-lg shadow-blue-500/20 animate-pulse">
                VS
              </div>
            </div>

            {/* Right Side: Ronaldo */}
            <div className="col-span-2 text-left pl-4 md:pl-8">
              <div className="text-[10px] text-rose-500 font-bold uppercase tracking-widest font-display mb-1">
                CR7
              </div>
              <h3 className="text-2xl md:text-4xl font-black font-display text-white uppercase tracking-tight">
                RONALDO
              </h3>
              <p className="text-slate-400 text-xs mt-2 hidden md:block">
                Athletic Titan • 5x Ballon d&apos;Or Winner • UCL Top Goalscorer
              </p>
            </div>
          </div>
          
          {/* Animated football lines in the background */}
          <div className="h-0.5 w-full bg-slate-800/50 my-6 relative">
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-8 h-8 rounded-full border border-slate-700 bg-slate-900" />
          </div>

          {/* Stats Preview */}
          <div className="grid grid-cols-3 text-center text-xs text-slate-400 font-display">
            <div>
              <span className="block text-white text-base md:text-xl font-bold">8 vs 5</span>
              Ballon d&apos;Ors
            </div>
            <div>
              <span className="block text-white text-base md:text-xl font-bold">850+ vs 900+</span>
              Goals
            </div>
            <div>
              <span className="block text-white text-base md:text-xl font-bold">44 vs 35</span>
              Trophies
            </div>
          </div>
        </motion.div>

        {/* Enter Arena CTA Button */}
        <motion.div
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.7 }}
        >
          <Link href="/select" className="group relative inline-flex items-center justify-center p-0.5 mb-2 overflow-hidden text-sm font-semibold tracking-wider font-display rounded-lg group bg-gradient-to-br from-amber-400 via-orange-500 to-yellow-400 group-hover:from-amber-400 group-hover:to-yellow-400 hover:text-slate-950 text-white focus:ring-4 focus:outline-none focus:ring-amber-800 transition-all duration-300">
            <span className="relative px-8 py-4 transition-all ease-in duration-75 bg-slate-950 rounded-md group-hover:bg-opacity-0 font-bold text-lg flex items-center gap-3">
              ENTER THE ARENA
              <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </span>
            {/* Pulsing button shadow */}
            <div className="absolute -inset-1 rounded-lg bg-gradient-to-r from-amber-500 to-yellow-500 opacity-30 blur-md group-hover:opacity-60 transition-opacity duration-300" />
          </Link>
        </motion.div>
      </main>

      {/* Feature Grid / How it works */}
      <section className="w-full max-w-5xl z-20 grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
        <motion.div
          initial={{ opacity: 0, x: -30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, delay: 0.8 }}
          className="glass-panel-interactive rounded-xl p-5"
        >
          <div className="w-10 h-10 rounded-lg bg-blue-500/10 border border-blue-500/30 flex items-center justify-center mb-4">
            <Zap className="w-5 h-5 text-blue-400" />
          </div>
          <h4 className="font-display font-bold text-white mb-2 uppercase">1. Arm with Stats</h4>
          <p className="text-slate-400 text-sm leading-relaxed">
            Unlock your AI Arsenal. Equip yourself with real historical facts, key metrics, and trophy tallies to back your claim.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.9 }}
          className="glass-panel-interactive rounded-xl p-5"
        >
          <div className="w-10 h-10 rounded-lg bg-purple-500/10 border border-purple-500/30 flex items-center justify-center mb-4">
            <Swords className="w-5 h-5 text-purple-400" />
          </div>
          <h4 className="font-display font-bold text-white mb-2 uppercase">2. Face Counterattacks</h4>
          <p className="text-slate-400 text-sm leading-relaxed">
            Submit your best arguments and instantly face calculated counterattacks. Refine and upgrade your argument to counter.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, delay: 1.0 }}
          className="glass-panel-interactive rounded-xl p-5"
        >
          <div className="w-10 h-10 rounded-lg bg-amber-500/10 border border-amber-500/30 flex items-center justify-center mb-4">
            <Trophy className="w-5 h-5 text-amber-400" />
          </div>
          <h4 className="font-display font-bold text-white mb-2 uppercase">3. Referee Judgment</h4>
          <p className="text-slate-400 text-sm leading-relaxed">
            Receive full tactical feedback from the AI Coach. Watch the AI Referee score your Evidence, Logic, and Persuasion.
          </p>
        </motion.div>
      </section>

      {/* Footer */}
      <footer className="w-full max-w-6xl text-center text-[10px] text-slate-500 z-20 border-t border-slate-900 pt-6 mt-12 flex flex-col md:flex-row justify-between items-center gap-4">
        <p>© 2026 GOAT ARENA. Built for the Ultimate Football Fans. Phase 1 Mock Demo.</p>
        <div className="flex gap-4">
          <span className="hover:text-slate-300 cursor-pointer">CHAMPIONS STAGE</span>
          <span className="text-slate-700">•</span>
          <span className="hover:text-slate-300 cursor-pointer">COACHING LAB</span>
          <span className="text-slate-700">•</span>
          <span className="hover:text-slate-300 cursor-pointer">TERMS OF CLASH</span>
        </div>
      </footer>
    </div>
  );
}
