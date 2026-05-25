import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { BackgroundElements } from "./components/BackgroundElements";
import { CustomCursor } from "./components/CustomCursor";
import { Hero } from "./components/Hero";
import { GameShowcase } from "./components/GameShowcase";
import { GamerProfile } from "./components/GamerProfile";
import { setMuteGlobal, playClickSound, playHoverSound, playSuccessSound } from "./utils/audio";
import { Award, Compass, Heart, Radio, Shield, Sparkles, Star, Terminal, Maximize2 } from "lucide-react";

type UserRecord = {
  username: string;
  password: string;
  avatar: string;
  isAdmin?: boolean;
};

export default function App() {
  const [isMuted, setIsMuted] = useState(false);
  const [scrollPercent, setScrollPercent] = useState(0);
  const [currentTab, setCurrentTab] = useState<"home" | "profile">("home");
  const [currentUser, setCurrentUser] = useState<UserRecord | null>(() => {
    const stored = localStorage.getItem("vortex_current_user");
    if (!stored) return null;
    try {
      return JSON.parse(stored) as UserRecord;
    } catch {
      return null;
    }
  });
  const [customLogo, setCustomLogo] = useState(() => localStorage.getItem("vortex_custom_logo") || "");
  const [isBooted, setIsBooted] = useState(() => sessionStorage.getItem("vortex_sys_booted") === "true");

  // Sync custom logo dynamically
  useEffect(() => {
    const handleLogoUpdate = () => {
      setCustomLogo(localStorage.getItem("vortex_custom_logo") || "");
    };
    window.addEventListener("vortex_logo_changed", handleLogoUpdate);
    window.addEventListener("storage", handleLogoUpdate);
    return () => {
      window.removeEventListener("vortex_logo_changed", handleLogoUpdate);
      window.removeEventListener("storage", handleLogoUpdate);
    };
  }, []);

  const handleInitializeFullscreen = () => {
    playSuccessSound();
    
    // Attempt standard browser fullscreen request
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch((err) => {
        console.warn("Fullscreen permission denied or blocked within iframe container:", err);
      });
    }

    sessionStorage.setItem("vortex_sys_booted", "true");
    setIsBooted(true);
  };

  const handleManualFullscreenToggle = () => {
    playClickSound();
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {});
    } else {
      document.exitFullscreen().catch(() => {});
    }
  };

  // Monitor layout scrolling ratio
  useEffect(() => {
    const handleScroll = () => {
      const windowHeight = window.innerHeight;
      const documentHeight = document.documentElement.scrollHeight;
      const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
      const maxScroll = documentHeight - windowHeight;
      if (maxScroll > 0) {
        setScrollPercent((scrollTop / maxScroll) * 100);
      }
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    const handleUserSync = () => {
      const stored = localStorage.getItem("vortex_current_user");
      if (!stored) {
        setCurrentUser(null);
        return;
      }
      try {
        setCurrentUser(JSON.parse(stored) as UserRecord);
      } catch {
        setCurrentUser(null);
      }
    };

    window.addEventListener("storage", handleUserSync);
    return () => window.removeEventListener("storage", handleUserSync);
  }, []);

  const handleEnsureSignIn = () => {
    playClickSound();
    setCurrentTab("profile");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleToggleMute = () => {
    const nextMute = !isMuted;
    setIsMuted(nextMute);
    setMuteGlobal(nextMute);
  };

  const scrollExplore = () => {
    playClickSound();
    setCurrentTab("home");
    setTimeout(() => {
      const showcaseSection = document.getElementById("gaming-zone-section");
      if (showcaseSection) {
        showcaseSection.scrollIntoView({ behavior: "smooth" });
      }
    }, 100);
  };

  return (
    <div className="min-h-screen relative font-sans text-neutral-200 overflow-x-hidden selection:bg-purple-500/30 selection:text-white bg-[#020205]">
      
      {/* Dynamic colorful blur mesh orbs behind layout as per Frosted Glass theme */}
      <div className="absolute top-[-5%] left-[-10%] w-[50%] h-[50%] bg-purple-600/10 blur-[130px] rounded-full -z-20 pointer-events-none" />
      <div className="absolute top-[25%] right-[-10%] w-[45%] h-[45%] bg-cyan-600/10 blur-[120px] rounded-full -z-20 pointer-events-none" />
      <div className="absolute bottom-[20%] left-[-10%] w-[50%] h-[50%] bg-purple-600/10 blur-[140px] rounded-full -z-20 pointer-events-none" />
      <div className="absolute bottom-[-5%] right-[-10%] w-[45%] h-[45%] bg-cyan-600/10 blur-[130px] rounded-full -z-20 pointer-events-none" />

      {/* Top linear visual scroll indicator bar */}
      <div 
        className="fixed top-0 left-0 h-[3px] bg-gradient-to-r from-cyan-400 via-purple-500 to-rose-500 z-50 transition-all duration-100" 
        style={{ width: `${scrollPercent}%` }}
      />

      {/* Modern custom mouse tracker cursor system */}
      <CustomCursor />

      {/* Core interactive HTML5 Star Canvas background elements */}
      <BackgroundElements />

      {/* Fixed UI Utilities header - Frosted Glass Navigation Bar */}
      <header className="fixed top-0 left-0 right-0 h-20 flex items-center justify-between px-6 md:px-12 border-b border-white/10 backdrop-blur-md z-45 bg-[#020205]/40">
        <div className="flex items-center gap-3 cursor-pointer group" onClick={() => { playClickSound(); setCurrentTab("home"); window.scrollTo({ top: 0, behavior: "smooth" }); }}>
          {customLogo ? (
            <div className="h-11 w-11 rounded-xl overflow-hidden border border-purple-500/35 shadow-[0_0_15px_rgba(168,85,247,0.35)] flex items-center justify-center p-0.5 bg-black/60 transition-all duration-300 group-hover:scale-105 group-hover:rotate-3">
              <img src={customLogo} alt="Logo" className="h-full w-full object-contain" />
            </div>
          ) : (
            <div className="h-10 w-10 bg-gradient-to-tr from-cyan-500 to-purple-600 rounded-lg flex items-center justify-center font-display font-black text-white text-xl transition-all duration-300 group-hover:scale-105 group-hover:rotate-6 shadow-[0_0_20px_rgba(147,51,234,0.3)]">
              V
            </div>
          )}
          <span className="font-display font-black tracking-tighter text-[#ffffff] text-xl uppercase">
            VORTEX<span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-purple-500">_STUDIOS</span>
          </span>
        </div>

        {/* Anchor link anchors navigation */}
        <nav className="hidden md:flex items-center gap-8 font-mono text-[10px] tracking-widest font-medium">
          <button 
            onClick={() => {
              playClickSound();
              setCurrentTab("home");
              window.scrollTo({ top: 0, behavior: "smooth" });
            }}
            onMouseEnter={playHoverSound} 
            className={`hover:text-white transition uppercase bg-transparent border-0 cursor-pointer ${currentTab === "home" ? "text-cyan-400 font-bold" : "text-[#a1a1aa]"}`}
          >
            HOME
          </button>
          <button 
            onClick={() => {
              playClickSound();
              if (currentTab !== "home") {
                setCurrentTab("home");
                setTimeout(() => {
                  const showcaseSection = document.getElementById("gaming-zone-section");
                  if (showcaseSection) {
                    showcaseSection.scrollIntoView({ behavior: "smooth" });
                  }
                }, 100);
              } else {
                const showcaseSection = document.getElementById("gaming-zone-section");
                if (showcaseSection) {
                  showcaseSection.scrollIntoView({ behavior: "smooth" });
                }
              }
            }}
            onMouseEnter={playHoverSound} 
            className="hover:text-white transition uppercase bg-transparent border-0 cursor-pointer text-[#a1a1aa]"
          >
            GAMIN ZONE
          </button>
          <button 
            onClick={() => {
              playClickSound();
              setCurrentTab("profile");
              window.scrollTo({ top: 0, behavior: "smooth" });
            }}
            onMouseEnter={playHoverSound} 
            className={`hover:text-white transition uppercase bg-transparent border-0 cursor-pointer ${currentTab === "profile" ? "text-purple-400 font-bold" : "text-[#a1a1aa]"}`}
          >
            PROFILE & ADMIN
          </button>
          {(currentUser?.isAdmin || currentUser?.username?.trim().toLowerCase() === "omy13456") && (
            <button
              onClick={() => {
                playClickSound();
                setCurrentTab("profile");
                window.scrollTo({ top: 0, behavior: "smooth" });
              }}
              onMouseEnter={playHoverSound}
              className="hover:text-white transition uppercase bg-transparent border-0 cursor-pointer text-amber-300"
            >
              ADMIN PANEL
            </button>
          )}
        </nav>

        {/* Sub-active state indicators & Profile Link */}
        <div className="flex items-center gap-4">
          {/* Real-time Cinematic view toggle badge */}
          <button
            onClick={handleManualFullscreenToggle}
            onMouseEnter={playHoverSound}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-cyan-500/20 bg-cyan-950/20 hover:bg-cyan-950/40 text-cyan-300 font-mono text-[9px] cursor-pointer transition uppercase font-bold shadow-[0_0_12px_rgba(6,182,212,0.1)] hover:shadow-[0_0_18px_rgba(6,182,212,0.25)] animate-pulse"
            title="Toggle Cinematic Widescreen Fullscreen"
          >
            <Maximize2 size={10} />
            <span className="hidden md:inline">CINEMATIC_MODE</span>
          </button>

          <button
            onClick={() => {
              playClickSound();
              setCurrentTab(currentTab === "profile" ? "home" : "profile");
              window.scrollTo({ top: 0, behavior: "smooth" });
            }}
            onMouseEnter={playHoverSound}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border font-mono text-[9px] cursor-pointer transition uppercase ${
              currentTab === "profile" 
                ? "bg-purple-950/40 border-purple-500/40 text-purple-300 font-bold shadow-[0_0_12px_rgba(168,85,247,0.25)]" 
                : "bg-white/5 border-white/10 hover:bg-white/10 text-neutral-400"
            }`}
          >
            👤 <span className="hidden sm:inline">MY_PROFILE</span>
          </button>

          {!currentUser ? (
            <button
              onClick={handleEnsureSignIn}
              onMouseEnter={playHoverSound}
              className="px-3 py-1.5 rounded-xl bg-purple-600 text-white text-[9px] uppercase font-bold tracking-widest hover:bg-purple-500 transition"
            >
              SIGN IN
            </button>
          ) : (
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white/5 border border-white/10 text-[9px] uppercase tracking-widest font-bold text-cyan-300">
              <span className="hidden sm:inline">SIGNED_IN_AS:</span>
              <span className="truncate max-w-[90px] text-white">{currentUser.username}</span>
            </div>
          )}

          <div className="flex items-center gap-2">
            <div className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse shadow-[0_0_10px_rgba(52,211,153,0.5)]" />
            <span className="font-mono text-[9px] text-emerald-400 uppercase hidden lg:inline tracking-wider font-bold">
              SYSTEM_ONLINE
            </span>
          </div>
        </div>
      </header>

      {/* MAIN MODULES RENDER GATES */}
      <main className="relative z-10 pt-20">
        <AnimatePresence mode="wait">
          {currentTab === "home" ? (
            <motion.div
              key="home"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.25 }}
            >
              {/* 1. Hero Title & live engine configs */}
              <Hero 
                isMuted={isMuted} 
                toggleMute={handleToggleMute} 
                onExploreGames={scrollExplore} 
                onSignIn={handleEnsureSignIn}
              />

              {/* 2. Gamin Zone, Game info profiles & arcade-cabin emulators */}
              <GameShowcase />
            </motion.div>
          ) : (
            <motion.div
              key="profile"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.25 }}
            >
              <GamerProfile currentUser={currentUser} onUserChange={setCurrentUser} />
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* FOOTER CANVAS DETAILS */}
      <footer className="relative z-10 border-t border-white/10 bg-[#020205]/60 backdrop-blur-md py-12 px-6 md:px-12 text-center text-neutral-500">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="text-left flex items-center gap-3">
            {customLogo ? (
              <div className="h-10 w-10 shrink-0 rounded-lg overflow-hidden border border-white/10 p-1 bg-black/40">
                <img src={customLogo} alt="" className="h-full w-full object-contain" />
              </div>
            ) : (
              <div className="h-7 w-7 rounded bg-gradient-to-tr from-cyan-500 to-purple-600 flex items-center justify-center font-display font-black text-white text-xs">V</div>
            )}
            <div>
              <h4 className="font-display font-black text-white text-md tracking-tight uppercase flex items-center gap-2">
                VORTEX_STUDIOS
              </h4>
              <p className="text-xs font-sans text-[#71717a] max-w-sm">
                We design and craft hyper-interactive browser playgrounds, physics vectors, and electronic cyber scores.
              </p>
            </div>
          </div>

          <div className="font-mono text-[10px] space-y-1 text-[#71717a] text-center md:text-right">
            <div>LICENSE // VORTEX_STUDIOS_2026_ALL_RIGHTS_RESERVED</div>
            <div className="text-[9px] text-[#52525b]">STABILIZED WITH REACT19 + MOTION12</div>
          </div>
        </div>
      </footer>

      {/* Dynamic Cyber-Ambient welcome boot terminal overlay */}
      <AnimatePresence>
        {!isBooted && (
          <motion.div
            initial={{ opacity: 1 }}
            exit={{ opacity: 0, scale: 1.05 }}
            transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
            className="fixed inset-0 bg-[#020205] z-50 flex flex-col items-center justify-center p-6 text-white overflow-hidden font-sans"
          >
            {/* Animated Sci-Fi Matrix background vectors */}
            <div className="absolute inset-0 opacity-20 pointer-events-none">
              <div className="absolute inset-0 bg-gradient-to-b from-purple-950/20 via-transparent to-black" />
              {/* Dynamic code blocks animation inside loader */}
              <div className="absolute bottom-6 left-6 font-mono text-[8px] text-zinc-500 space-y-1 block max-w-sm select-none">
                <div>&gt;&gt; VORTEX CORE LOADER PROTOCOL v4.2</div>
                <div>&gt;&gt; ESTABLISHING P2P PORT TUNNELS IL-10</div>
                <div>&gt;&gt; REGISTERING INTERACTIVE KINETIC AUDIO MODULES</div>
                <div>&gt;&gt; HOVER TRIGGERS: CONNECTED</div>
                <div>&gt;&gt; REAL-TIME FILE MANAGER PORTAL: ACTIVE</div>
              </div>
              <div className="absolute inset-0 bg-[#020205]/10 bg-[radial-gradient(circle_at_center,rgba(6,182,212,0.1)_0%,transparent_70%)]" />
            </div>

            {/* Glowing Holographic Tech Gate Circle */}
            <div className="relative flex flex-col items-center max-w-lg text-center z-10 px-4">
              <div className="relative mb-8 group">
                <div className="absolute inset-[-15px] bg-gradient-to-tr from-cyan-400 via-purple-600 to-rose-500 rounded-full blur-2xl opacity-40 animate-pulse transition duration-500" />
                <div className="relative h-24 w-24 rounded-full border border-white/20 bg-black/80 flex items-center justify-center overflow-hidden shadow-[0_0_50px_rgba(147,51,234,0.3)]">
                  {customLogo ? (
                    <img src={customLogo} alt="Logo" className="h-[75%] w-[75%] object-contain" />
                  ) : (
                    <span className="font-display font-black text-4xl text-transparent bg-clip-text bg-gradient-to-tr from-cyan-400 to-purple-500">V</span>
                  )}
                </div>
                {/* Crosshair corner guides */}
                <div className="absolute -top-1 -right-1 h-3.5 w-3.5 border-t-2 border-r-2 border-cyan-400 rounded-tr-md" />
                <div className="absolute -bottom-1 -left-1 h-3.5 w-3.5 border-b-2 border-l-2 border-cyan-400 rounded-bl-md" />
              </div>

              {/* Title texts */}
              <span className="font-mono text-[10px] text-cyan-400 tracking-[0.3em] font-black uppercase mb-2 block animate-pulse">
                ❖ SYSTEM_LINK_KINETIC_BOOSTER
              </span>
              <h1 className="text-3xl md:text-5xl font-display font-black tracking-tight italic uppercase text-white mb-3">
                KINETIC <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-purple-500 to-rose-400">CABIN</span>
              </h1>
              <p className="text-xs text-neutral-400 max-w-sm leading-relaxed mb-8 font-sans font-medium">
                To initiate high-fidelity arcade simulators, dynamic sound frequencies, and custom responsive layouts, click authorization to unleash the cinematic layout.
              </p>

              {/* Enter Button */}
              <button
                onClick={handleInitializeFullscreen}
                onMouseEnter={playHoverSound}
                className="group relative h-14 px-10 bg-gradient-to-r from-cyan-400 via-purple-500 to-rose-500 hover:from-cyan-300 hover:via-purple-400 hover:to-rose-400 text-white font-display font-black uppercase tracking-widest text-xs rounded-xl transition duration-300 transform hover:scale-105 active:scale-95 shadow-[0_0_35px_rgba(168,85,247,0.4)] cursor-pointer select-none"
              >
                🚀 AUTHORIZE CINEMATIC FULLSCREEN
              </button>

              <button
                onClick={() => { playClickSound(); setIsBooted(true); }}
                className="mt-4 font-mono text-[9px] text-[#71717a] hover:text-white transition uppercase cursor-pointer"
              >
                PROCEED_WITHOUT_FULLSCREEN
              </button>
            </div>
            
            {/* Ambient Corner specs display */}
            <div className="absolute top-6 right-6 font-mono text-[8px] text-neutral-500 text-right select-none uppercase hidden sm:block">
              <div>HOST // LOCAL_RUN_PORT_3000</div>
              <div>COSMIC SYNTH INGRESS ACTIVE</div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
}
