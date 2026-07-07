import type { Metadata } from "next";
import { Inter, Orbitron } from "next/font/google";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

const orbitron = Orbitron({
  variable: "--font-orbitron",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "GOAT ARENA | Debate. Improve. Dominate.",
  description: "Enter the stadium. Choose your football rivalry, pick your side, deploy arguments, face intense AI counterattacks, and prove who is the absolute GOAT.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark scroll-smooth">
      <body
        className={`${inter.variable} ${orbitron.variable} bg-[#020617] text-slate-100 antialiased font-sans min-h-screen overflow-x-hidden relative`}
      >
        {/* Ambient Stadium Light Effects */}
        <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
          {/* Cyan/Electric Blue floodlight (Top Left) */}
          <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] rounded-full bg-blue-500/10 blur-[120px] animate-pulse duration-[8000ms]" />
          
          {/* Purple/Indigo glow (Bottom Right) */}
          <div className="absolute bottom-[-10%] right-[-10%] w-[60%] h-[60%] rounded-full bg-purple-600/10 blur-[150px] animate-pulse duration-[12000ms]" />
          
          {/* Gold backlight (Center Top) */}
          <div className="absolute top-0 left-[35%] w-[30%] h-[20%] rounded-full bg-amber-500/5 blur-[90px]" />
          
          {/* Stadium Grid Overlay */}
          <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.01)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.01)_1px,transparent_1px)] bg-[size:30px_30px] opacity-20 pointer-events-none" />
        </div>
        
        {/* Main Content */}
        <div className="relative z-10 flex flex-col min-h-screen">
          {children}
        </div>
      </body>
    </html>
  );
}
