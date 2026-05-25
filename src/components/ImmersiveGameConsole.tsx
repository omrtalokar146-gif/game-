import React, { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { GameMetadata } from "../types";
import { playClickSound, playHoverSound, playSuccessSound, playGlitchSound } from "../utils/audio";
import { 
  Shield, 
  Sparkles, 
  AlertCircle, 
  Coins, 
  Heart, 
  Star, 
  ArrowLeft, 
  Cpu, 
  Zap, 
  Activity, 
  Volume2, 
  Clock, 
  Maximize2 
} from "lucide-react";

interface ImmersiveGameConsoleProps {
  game: GameMetadata;
  onClose: () => void;
}

export function ImmersiveGameConsole({ game, onClose }: ImmersiveGameConsoleProps) {
  // 1. VOID RUNNERS DEMO: Canvas space racer states
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [racerScore, setRacerScore] = useState(0);
  const [isRacerGameOver, setIsRacerGameOver] = useState(false);
  const [racerPlaying, setRacerPlaying] = useState(false);
  const racerShipX = useRef(150);
  const racerMouseX = useRef(150);

  // 2. ELDERWOOD RPG DEMO STATE
  const [rpgHp, setRpgHp] = useState(100);
  const [rpgMana, setRpgMana] = useState(50);
  const [rpgXp, setRpgXp] = useState(0);
  const [rpgLogs, setRpgLogs] = useState<string[]>(["Welcome to Elderwood. The Forest World Tree needs protection."]);
  const [rpgMonsterHp, setRpgMonsterHp] = useState(80);
  const [isRpgCompleted, setIsRpgCompleted] = useState(false);

  // 3. NEON HACKERS STATE
  const [matrixTarget, setMatrixTarget] = useState("10101");
  const [matrixUser, setMatrixUser] = useState(["0", "0", "0", "0", "0"]);
  const [hackTimer, setHackTimer] = useState(25);
  const [hackLvl, setHackLvl] = useState(1);
  const [isHackWon, setIsHackWon] = useState(false);
  const [isHackLost, setIsHackLost] = useState(false);

  // 4. Cockpit Environment diagnostics
  const [diagnostics, setDiagnostics] = useState({
    ping: 18,
    workload: 42,
    coreTemp: 52
  });
  const [isFullscreen, setIsFullscreen] = useState(false);
  const consoleRef = useRef<HTMLDivElement | null>(null);
  const gameMonitorRef = useRef<HTMLDivElement | null>(null);

  const triggerHover = () => playHoverSound();
  const triggerClick = () => playClickSound();

  const handleToggleFullscreen = async () => {
    try {
      if (!document.fullscreenElement) {
        if (gameMonitorRef.current?.requestFullscreen) {
          await gameMonitorRef.current.requestFullscreen();
        }
      } else {
        await document.exitFullscreen();
      }
    } catch (error) {
      console.warn("Failed to toggle fullscreen:", error);
    }
  };

  useEffect(() => {
    const updateFullscreenState = () => {
      setIsFullscreen(Boolean(document.fullscreenElement));
    };

    document.addEventListener("fullscreenchange", updateFullscreenState);
    return () => document.removeEventListener("fullscreenchange", updateFullscreenState);
  }, []);

  // Load game logic instantly on enter
  useEffect(() => {
    startDemo(game.id);
    
    // Animate cockpit telemetry
    const interval = setInterval(() => {
      setDiagnostics({
        ping: Math.floor(Math.random() * 8) + 14,
        workload: Math.floor(Math.random() * 15) + 35,
        coreTemp: Math.floor(Math.random() * 4) + 50
      });
    }, 2500);

    return () => clearInterval(interval);
  }, [game.id]);

  // START DEMO TRIGGER
  const startDemo = (id: string) => {
    triggerClick();
    if (id === "void-runners") {
      setRacerScore(0);
      setIsRacerGameOver(false);
      setRacerPlaying(true);
      racerShipX.current = 200;
    } else if (id === "echoes-of-elderwood") {
      setRpgHp(100);
      setRpgMana(50);
      setRpgXp(0);
      setRpgMonsterHp(80);
      setIsRpgCompleted(false);
      setRpgLogs(["You enter the mystical Golden Glen. A corrupted Root Elemental approaches."]);
    } else if (id === "neon-hackers") {
      generateMatrixTarget();
      setMatrixUser(["0", "0", "0", "0", "0"]);
      setHackTimer(25);
      setHackLvl(1);
      setIsHackWon(false);
      setIsHackLost(false);
    }
  };

  // -----------------------------------------------------------------
  // PLAYABLE MINI GAME 1: VOID RUNNERS ARCADE (CANVAS)
  // -----------------------------------------------------------------
  useEffect(() => {
    if (game.id !== "void-runners" || !racerPlaying) return;

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let frameId: number;
    let asteroids: Array<{ x: number; y: number; size: number; speed: number }> = [];
    let speedMultiplier = 1;
    let localScore = 0;

    const handleTouchMove = (e: TouchEvent) => {
      if (!canvas) return;
      const rect = canvas.getBoundingClientRect();
      racerMouseX.current = ((e.touches[0].clientX - rect.left) / rect.width) * canvas.width;
    };

    const handleMouseMove = (e: MouseEvent) => {
      if (!canvas) return;
      const rect = canvas.getBoundingClientRect();
      racerMouseX.current = ((e.clientX - rect.left) / rect.width) * canvas.width;
    };

    canvas.addEventListener("mousemove", handleMouseMove);
    canvas.addEventListener("touchmove", handleTouchMove);

    const checkCollision = (ax: number, ay: number, as: number, sx: number, sy: number) => {
      const dx = ax - sx;
      const dy = ay - sy;
      return Math.sqrt(dx * dx + dy * dy) < as + 14;
    };

    const gameLoop = () => {
      ctx.fillStyle = "#0c0a1c"; 
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Starfield background trail
      ctx.fillStyle = "rgba(168, 85, 247, 0.25)";
      for (let i = 0; i < 20; i++) {
        const starY = (Date.now() / 2 + i * 40) % canvas.height;
        ctx.fillRect((i * 41) % canvas.width, starY, 2, 2);
      }

      // Smooth move ship towards mouse
      racerShipX.current += (racerMouseX.current - racerShipX.current) * 0.18;
      racerShipX.current = Math.max(15, Math.min(canvas.width - 15, racerShipX.current));

      const shipY = canvas.height - 45;

      // Draw Spaceship (Neon Triangles with engine trails)
      ctx.shadowBlur = 20;
      ctx.shadowColor = game.accentColor || "#a855f7";
      ctx.fillStyle = "#f3e8ff";
      ctx.beginPath();
      ctx.moveTo(racerShipX.current, shipY - 14);
      ctx.lineTo(racerShipX.current - 12, shipY + 12);
      ctx.lineTo(racerShipX.current + 12, shipY + 12);
      ctx.closePath();
      ctx.fill();

      // Wing glow
      ctx.strokeStyle = "#22d3ee";
      ctx.lineWidth = 2.5;
      ctx.stroke();

      // Exhaust fire
      ctx.shadowColor = "#f43f5e";
      ctx.fillStyle = Math.random() > 0.5 ? "#f43f5e" : "#fb7185";
      ctx.beginPath();
      ctx.moveTo(racerShipX.current - 5, shipY + 14);
      ctx.lineTo(racerShipX.current, shipY + 25 + Math.random() * 8);
      ctx.lineTo(racerShipX.current + 5, shipY + 14);
      ctx.closePath();
      ctx.fill();

      ctx.shadowBlur = 0;

      // Generate energy orbs/asteroids
      if (Math.random() < 0.05 * speedMultiplier) {
        asteroids.push({
          x: Math.random() * canvas.width,
          y: -25,
          size: Math.random() * 14 + 7,
          speed: Math.random() * 2.5 + 2.5,
        });
      }

      // Render & Update Asteroids
      ctx.fillStyle = "#38bdf8"; 
      for (let i = asteroids.length - 1; i >= 0; i--) {
        const ast = asteroids[i];
        ast.y += ast.speed * speedMultiplier;

        ctx.beginPath();
        ctx.arc(ast.x, ast.y, ast.size, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = "#0284c7";
        ctx.lineWidth = 2;
        ctx.stroke();

        // Check crash
        if (checkCollision(ast.x, ast.y, ast.size, racerShipX.current, shipY)) {
          playGlitchSound();
          setIsRacerGameOver(true);
          setRacerPlaying(false);
          return;
        }

        // Score add
        if (ast.y > canvas.height + 25) {
          localScore += 100;
          setRacerScore(localScore);
          asteroids.splice(i, 1);
        }
      }

      speedMultiplier = 1 + localScore / 3000;
      frameId = requestAnimationFrame(gameLoop);
    };

    gameLoop();

    return () => {
      cancelAnimationFrame(frameId);
      canvas.removeEventListener("mousemove", handleMouseMove);
      canvas.removeEventListener("touchmove", handleTouchMove);
    };
  }, [game.id, racerPlaying]);

  // -----------------------------------------------------------------
  // PLAYABLE MINI GAME 2: RPG SIMULATOR ACTIONS
  // -----------------------------------------------------------------
  const handleRpgCombat = (type: "physical" | "elemental" | "heal") => {
    triggerClick();
    if (rpgHp <= 0 || isRpgCompleted) return;

    if (type === "physical") {
      const dmg = Math.floor(Math.random() * 15) + 12;
      const monsterCounter = Math.floor(Math.random() * 12) + 8;
      const newMonsterHp = Math.max(0, rpgMonsterHp - dmg);

      let logMessage = `💥 You strike the Root with your sword for ${dmg} DMG!`;
      if (newMonsterHp <= 0) {
        playSuccessSound();
        setRpgMonsterHp(0);
        setIsRpgCompleted(true);
        setRpgXp(prev => prev + 150);
        setRpgLogs(prev => [...prev, logMessage, "🏆 VICTORY! The Root Elemental dissolves. You harvested ancient elder-seeds!"]);
      } else {
        setRpgMonsterHp(newMonsterHp);
        const newHp = Math.max(0, rpgHp - monsterCounter);
        setRpgHp(newHp);
        setRpgLogs(prev => [
          ...prev, 
          logMessage, 
          `🌲 The Corrupt Root swipes back dealing ${monsterCounter} physical damage!`
        ]);
        if (newHp <= 0) {
          playGlitchSound();
          setRpgLogs(prev => [...prev, "💀 DEFEAT! The wilderness consumes you. Re-synch engine constants."]);
        }
      }
    } else if (type === "elemental") {
      if (rpgMana < 15) {
        setRpgLogs(prev => [...prev, "⚠️ INSIGNIFICANT MANA CAPACITY! RECHARGE REQUIRED!"]);
        playGlitchSound();
        return;
      }
      const dmg = Math.floor(Math.random() * 25) + 20;
      const monsterCounter = Math.floor(Math.random() * 14) + 6;
      const newMonsterHp = Math.max(0, rpgMonsterHp - dmg);
      setRpgMana(prev => prev - 15);

      let logMessage = `🔥 You summon Ancient Firestorms for ${dmg} MAGICAL DMG!`;
      if (newMonsterHp <= 0) {
        playSuccessSound();
        setRpgMonsterHp(0);
        setIsRpgCompleted(true);
        setRpgXp(prev => prev + 150);
        setRpgLogs(prev => [...prev, logMessage, "🏆 VICTORY! Wood fibers ignited! The forest glows tranquil again."]);
      } else {
        setRpgMonsterHp(newMonsterHp);
        const newHp = Math.max(0, rpgHp - monsterCounter);
        setRpgHp(newHp);
        setRpgLogs(prev => [
          ...prev, 
          logMessage, 
          `🌲 The Root swipes blindly through smoke dealing ${monsterCounter} counter attack damage!`
        ]);
        if (newHp <= 0) {
          playGlitchSound();
          setRpgLogs(prev => [...prev, "💀 DEFEAT! Health metrics crashed."]);
        }
      }
    } else if (type === "heal") {
      if (rpgMana < 10) {
        setRpgLogs(prev => [...prev, "⚠️ INSUFFICIENT SEED SPELL RESERVES!"]);
        playGlitchSound();
        return;
      }
      const heal = Math.floor(Math.random() * 25) + 15;
      setRpgMana(prev => prev - 10);
      setRpgHp(prev => Math.min(100, prev + heal));
      setRpgLogs(prev => [...prev, `🌿 Druid Healing spores channeled! Healed: +${heal} HP.`]);
      playSuccessSound();
    }
  };

  // -----------------------------------------------------------------
  // PLAYABLE MINI GAME 3: MATRIX DECKBREAKER
  // -----------------------------------------------------------------
  const generateMatrixTarget = () => {
    let target = "";
    for (let i = 0; i < 5; i++) {
      target += Math.random() > 0.5 ? "1" : "0";
    }
    setMatrixTarget(target);
  };

  const toggleUserBit = (index: number) => {
    triggerHover();
    const copy = [...matrixUser];
    copy[index] = copy[index] === "0" ? "1" : "0";
    setMatrixUser(copy);
  };

  const submitMatrixCrack = () => {
    triggerClick();
    const userString = matrixUser.join("");
    if (userString === matrixTarget) {
      playSuccessSound();
      if (hackLvl < 3) {
        setHackLvl(prev => prev + 1);
        generateMatrixTarget();
        setMatrixUser(["0", "0", "0", "0", "0"]);
        setHackTimer(prev => prev + 8);
        setRpgLogs(prev => ["MATRIX BREAK SUCCESSFUL! Entering next layer security system."]);
      } else {
        setIsHackWon(true);
      }
    } else {
      playGlitchSound();
      setHackTimer(prev => Math.max(0, prev - 4)); 
    }
  };

  // Hack countdown timer
  useEffect(() => {
    if (game.id !== "neon-hackers" || isHackWon || isHackLost) return;
    const interval = setInterval(() => {
      setHackTimer(prev => {
        if (prev <= 1) {
          setIsHackLost(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [game.id, isHackWon, isHackLost]);


  // Floating particle properties inside terminal
  const dustCount = Array.from({ length: 15 });

  return (
    <motion.div
      ref={consoleRef}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-[#04020a] z-50 overflow-y-auto font-sans text-white flex flex-col"
    >
      {/* Dynamic Animated Cosmic Particles background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none -z-10">
        <div className="absolute top-0 inset-x-0 h-[500px] bg-gradient-to-b from-purple-950/20 via-cyan-950/5 to-transparent blur-3xl" />
        {dustCount.map((_, i) => {
          const size = Math.random() * 3 + 1;
          const duration = Math.random() * 12 + 8;
          const delay = Math.random() * 5;
          const left = Math.random() * 100;
          return (
            <div
              key={i}
              className="absolute bg-cyan-400/20 rounded-full animate-pulse"
              style={{
                width: size,
                height: size,
                left: `${left}%`,
                top: `${Math.random() * 100}%`,
                animationDuration: `${duration}s`,
                animationDelay: `${delay}s`
              }}
            />
          );
        })}
        {/* Curved CRT Screen Mask effect */}
        <div className="absolute inset-0 bg-linear-to-b from-transparent via-white/[0.005] to-transparent bg-[size:100%_4px] opacity-60" />
      </div>

      {/* FIXED IMMERSIVE TOP NAVIGATION BAR */}
      <header className="h-20 border-b border-white/10 backdrop-blur-md bg-black/45 px-4 md:px-10 flex items-center justify-between z-10 shrink-0 sticky top-0">
        <button
          onClick={() => {
            triggerClick();
            onClose();
          }}
          onMouseEnter={triggerHover}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-neutral-300 hover:text-white hover:bg-white/10 transition duration-300 font-mono text-xs uppercase tracking-wider cursor-pointer font-bold select-none"
        >
          <ArrowLeft size={14} className="text-pink-400" />
          EXIT_LINK_PROTOCOL
        </button>

<div className="flex items-center gap-3">
          <button
            onClick={() => {
              triggerClick();
              handleToggleFullscreen();
            }}
            onMouseEnter={triggerHover}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-neutral-300 hover:text-white hover:bg-white/10 transition duration-300 font-mono text-xs uppercase tracking-wider cursor-pointer font-bold select-none"
          >
            <Maximize2 size={14} className="text-cyan-300" />
            {isFullscreen ? "EXIT_FULLSCREEN" : "FULLSCREEN_MODE"}
          </button>
          <div className="font-mono text-right hidden sm:block">
            <span className="text-[10px] text-zinc-500 block">SIM_LINK_STATUS</span>
            <span className="text-xs text-emerald-400 font-bold uppercase tracking-widest">● DIRECT_HUD_ACTIVE</span>
          </div>
          <div className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
        </div>
      </header>

      {/* CORE ARCADE PLAYGROUND GRID */}
      <div className="flex-grow w-full max-w-7xl mx-auto px-4 py-6 md:py-10 grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch relative">
        
        {/* LEFT COMPACT STATS HUD PANEL (lg:col-span-3) */}
        <div className="lg:col-span-3 flex flex-col justify-between gap-6">
          
          <div className="bg-white/[0.02] border border-white/10 rounded-3xl p-5 backdrop-blur-md relative overflow-hidden flex flex-col justify-between h-full">
            <div className="absolute top-0 right-0 h-24 w-24 bg-purple-500/5 rounded-full blur-xl pointer-events-none" />
            
            <div>
              <div className="flex justify-between items-center mb-4">
                <span className="px-2.5 py-0.5 rounded-full text-[9px] font-mono bg-purple-950/40 border border-purple-500/20 text-purple-300 uppercase tracking-widest font-bold">
                  {game.genre}
                </span>
                <span className="text-[10px] font-mono text-emerald-400 bg-emerald-950/30 border border-emerald-500/20 px-2 rounded-full py-0.5 font-bold">
                  {game.serverStatus}
                </span>
              </div>

              <h2 className="text-2xl md:text-3xl font-display font-black tracking-tight italic text-white uppercase leading-tight mb-2">
                {game.title}
              </h2>
              <p className="text-zinc-400 text-xs font-serif leading-relaxed line-clamp-4 italic mb-6">
                "{game.tagline}"
              </p>

              {/* Unique Game Features Checklist */}
              <div className="space-y-3 pt-4 border-t border-white/5">
                <span className="block font-mono text-[9px] text-neutral-500 uppercase tracking-widest">
                  SYS_CORE_SPECS:
                </span>
                {game.features.map((feat) => (
                  <div key={feat} className="flex items-start gap-2.5 text-xs text-neutral-300 font-sans font-medium">
                    <span className="h-5 w-5 rounded-full bg-cyan-500/10 border border-cyan-400/20 text-cyan-400 flex items-center justify-center shrink-0 font-bold text-[9px]">
                      ✔
                    </span>
                    <span className="leading-tight">{feat}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-8 pt-4 border-t border-white/5 space-y-3 font-mono text-[10px]">
              <div className="flex justify-between">
                <span className="text-zinc-500">RELEASE:</span>
                <span className="text-zinc-300 font-bold">{game.releaseDate}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-zinc-500">PLATFORM_LINKS:</span>
                <span className="text-zinc-300 font-bold">BROWSER/EMBED</span>
              </div>
              <div className="flex justify-between">
                <span className="text-zinc-500">ACTIVE_PLAYERS:</span>
                <span className="text-purple-300 font-bold animate-pulse">{game.playerCount.toLocaleString()}</span>
              </div>
            </div>
          </div>
        </div>

        {/* CENTER INTERACTIVE LARGE MONITOR (lg:col-span-6) */}
        <div className="lg:col-span-6 flex flex-col justify-between gap-4">
          
          <div ref={gameMonitorRef} className="bg-black/80 border border-white/10 rounded-3xl backdrop-blur-md p-2 flex flex-col relative aspect-[4/3] w-full flex-grow overflow-hidden shadow-[0_0_50px_rgba(168,85,247,0.15)] group min-h-[360px] md:min-h-[460px]">
            {/* Hologram glowing frame vectors */}
            <div className="absolute top-2 left-2 text-[8px] font-mono text-cyan-500/40 select-none">
              CABIN_SENS_SYS_01_X
            </div>
            <div className="absolute top-2 right-2 text-[8px] font-mono text-cyan-500/40 select-none">
              MONITOR_MODE: WIDESCREEN
            </div>

            {/* Curving glow behind simulator */}
            <div className={`absolute inset-0 bg-radial-gradient ${
              game.themeColor?.includes("cyan") ? "from-cyan-500/5" :
              game.themeColor?.includes("emerald") ? "from-emerald-500/5" :
              game.themeColor?.includes("orange") ? "from-orange-500/5" : "from-purple-500/5"
            } to-transparent opacity-90 blur-3xl pointer-events-none -z-10`} />

            {/* Display container */}
            <div className="w-full h-full rounded-2xl overflow-hidden relative flex flex-col bg-[#03010c]">
              
              {/* -------------------------------------------------------------
                  EMULATOR MODULE 0: CUSTOM IFRAME EMBED GAME
                  ------------------------------------------------------------- */}
              {game.iframeUrl && (
                <div className="w-full h-full flex flex-col bg-black rounded-2xl overflow-hidden relative shadow-2xl">
                  <iframe
                    src={game.iframeUrl}
                    className="w-full h-full border-0 bg-[#03010c]"
                    allow="autoplay; fullscreen; keyboard; gamepad;"
                    allowFullScreen
                    title={game.title}
                    referrerPolicy="no-referrer"
                  />
                </div>
              )}

              {/* -------------------------------------------------------------
                  EMULATOR MODULE 1: VOID RUNNERS RACER (CANVAS)
                  ------------------------------------------------------------- */}
              {game.id === "void-runners" && (
                <div className="flex flex-col justify-center items-center w-full h-full p-4 flex-grow relative">
                  <canvas
                    ref={canvasRef}
                    width={480}
                    height={380}
                    className="bg-[#0c0a1c] border border-cyan-500/10 rounded-xl cursor-none relative shadow-[0_0_25px_rgba(56,189,248,0.1)] w-full h-full max-h-[400px] object-contain flex-grow"
                  />
                  
                  <div className="flex justify-between items-center w-full mt-3 font-mono text-[11px] text-[#22d3ee]">
                    <span className="bg-cyan-950/40 px-2.5 py-1 rounded-full border border-cyan-500/20 font-bold">SCORE: {racerScore}</span>
                    <span className="text-neutral-500 animate-pulse hidden sm:inline">SWIPE/MOVE DEVICE TO PILOT SPACE DEFENDER</span>
                  </div>

                  {/* Start Overlay state */}
                  {!racerPlaying && !isRacerGameOver && (
                    <div className="absolute inset-0 bg-black/80 flex flex-col items-center justify-center p-6 text-center">
                      <Zap size={32} className="text-cyan-400 mb-2 animate-bounce" />
                      <h4 className="font-display font-black tracking-tight text-white uppercase italic text-lg mb-1">VOID RUNNERS RADAR</h4>
                      <p className="text-xs text-neutral-400 font-mono mb-6 max-w-xs">Avoid cosmic asteroid cores and collect dark energy speeds!</p>
                      <button
                        onClick={() => startDemo("void-runners")}
                        className="font-mono text-xs font-bold px-6 py-2.5 bg-cyan-600 hover:bg-cyan-500 text-white rounded-xl transition duration-300"
                      >
                        LAUNCH_ENGINES()
                      </button>
                    </div>
                  )}

                  {/* Game Over screen overlay */}
                  {isRacerGameOver && (
                    <div className="absolute inset-0 bg-neutral-950/95 flex flex-col items-center justify-center p-6 text-center z-10 border border-rose-500/10 rounded-2xl">
                      <AlertCircle className="text-rose-500 mb-3 animate-pulse" size={38} />
                      <span className="font-mono text-sm text-rose-400 font-bold mb-1 uppercase tracking-widest">STARSHIP_HULL_CRITICAL</span>
                      <p className="text-xs text-neutral-400 font-mono mb-4">PILOT CRASHED AT DUST SPEEDS. COGNITIVE LEVEL RESOLVED.</p>
                      <span className="text-xs text-cyan-400 font-mono font-bold mb-6">FINAL LOG SCORE: {racerScore}</span>
                      <button
                        onClick={() => startDemo("void-runners")}
                        className="font-mono text-xs font-bold px-6 py-2.5 bg-purple-600 hover:bg-purple-500 text-white rounded-xl transition shadow-[0_0_15px_rgba(168,85,247,0.3)] cursor-pointer"
                      >
                        RESTART_PILOT_SIMULATOR
                      </button>
                    </div>
                  )}
                </div>
              )}

              {/* -------------------------------------------------------------
                  EMULATOR MODULE 2: ECHOES OF ELDERWOOD RPG QUEST
                  ------------------------------------------------------------- */}
              {game.id === "echoes-of-elderwood" && (
                <div className="flex flex-col w-full h-full justify-between p-6 flex-grow">
                  {/* Character & Monster Vitals */}
                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div className="bg-white/5 border border-white/10 rounded-2xl p-4 backdrop-blur-sm shadow-sm relative overflow-hidden">
                      <span className="font-mono text-[9px] text-zinc-400 block pb-1.5 uppercase font-bold">HERO_DRUID VIRTURES</span>
                      <div className="flex justify-between text-xs font-mono mb-2 text-white">
                        <span className="flex items-center gap-1 font-bold text-rose-400"><Heart size={12} className="fill-rose-500/20" /> HP: {rpgHp}/100</span>
                        <span className="flex items-center gap-1 font-bold text-cyan-400"><Sparkles size={12} /> MP: {rpgMana}/50</span>
                      </div>
                      <div className="w-full bg-black/40 h-2 rounded overflow-hidden">
                        <div className="bg-gradient-to-r from-red-600 to-rose-400 h-full transition-all duration-300" style={{ width: `${rpgHp}%` }} />
                      </div>
                    </div>

                    <div className="bg-white/5 border border-white/10 rounded-2xl p-4 backdrop-blur-sm shadow-sm relative overflow-hidden">
                      <span className="font-mono text-[9px] text-zinc-400 block pb-1.5 uppercase font-bold">TARGET_ROOT ELEMENTAL</span>
                      <div className="flex justify-between text-xs font-mono mb-2 text-white">
                        <span className="flex items-center gap-1 font-bold text-emerald-400"><Shield size={12} /> HP: {rpgMonsterHp}/80</span>
                        <span className="text-[10px] text-yellow-500 font-bold">LEVEL 4 BOSS</span>
                      </div>
                      <div className="w-full bg-black/40 h-2 rounded overflow-hidden">
                        <div className="bg-gradient-to-r from-emerald-600 to-teal-400 class-full transition-all duration-300" style={{ width: `${(rpgMonsterHp/80)*100}%` }} />
                      </div>
                    </div>
                  </div>

                  {/* Scrolling Action Event log */}
                  <div className="bg-black/60 rounded-2xl p-4 font-mono text-xs text-emerald-400 border border-white/5 overflow-y-auto h-36 flex-grow flex flex-col gap-2 backdrop-blur-md">
                    {rpgLogs.map((log, idx) => (
                      <div key={idx} className="border-l-2 border-emerald-500/30 pl-3 text-[11px] leading-relaxed">
                        &gt; {log}
                      </div>
                    ))}
                  </div>

                  {/* Combat Command center buttons */}
                  {!isRpgCompleted && rpgHp > 0 ? (
                    <div className="grid grid-cols-3 gap-3 mt-4">
                      <button
                        onClick={() => handleRpgCombat("physical")}
                        className="font-mono text-[10px] font-bold border border-white/10 hover:border-purple-500/30 p-3 text-center rounded-xl bg-white/5 text-purple-300 hover:text-white hover:bg-white/10 transition backdrop-blur-xs cursor-pointer"
                      >
                        SWORD_SLASH()
                      </button>
                      <button
                        onClick={() => handleRpgCombat("elemental")}
                        className="font-mono text-[10px] font-bold border border-orange-500/10 hover:border-orange-500/30 p-3 text-center rounded-xl bg-orange-500/10 text-orange-300 hover:text-white hover:bg-orange-500/20 transition backdrop-blur-xs cursor-pointer"
                      >
                        FIRE_BLAST [-15MP]
                      </button>
                      <button
                        onClick={() => handleRpgCombat("heal")}
                        className="font-mono text-[10px] font-bold border border-emerald-500/10 hover:border-emerald-500/30 p-3 text-center rounded-xl bg-emerald-500/10 text-emerald-300 hover:text-white hover:bg-emerald-500/20 transition backdrop-blur-xs cursor-pointer"
                      >
                        RECOVER_HP()
                      </button>
                    </div>
                  ) : (
                    <div className="mt-4 flex justify-center">
                      <button
                        onClick={() => startDemo("echoes-of-elderwood")}
                        className="font-mono text-xs font-bold bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl px-8 py-3 transition cursor-pointer"
                      >
                        RELOAD_CHARACTER_RECORDS()
                      </button>
                    </div>
                  )}
                </div>
              )}

              {/* -------------------------------------------------------------
                  EMULATOR MODULE 3: NEON HACKERS CYBER DEFER (DECKBREAKER)
                  ------------------------------------------------------------- */}
              {game.id === "neon-hackers" && (
                <div className="flex flex-col w-full h-full justify-between p-6 flex-grow">
                  
                  <div className="text-center mb-2">
                    <span className="font-mono text-[10px] text-zinc-500 block uppercase font-bold tracking-widest mb-1">
                      DEFENSE LAYER CODE REGISTER (LAYER {hackLvl}/3)
                    </span>
                    <div className="text-2xl font-mono text-red-500 tracking-[0.3em] font-black mt-1 animate-pulse drop-shadow-[0_0_8px_rgba(239,68,68,0.5)]">
                      {matrixTarget}
                    </div>
                  </div>

                  <p className="text-[10px] text-zinc-400 text-center font-sans mb-4 max-w-sm mx-auto">
                    Directly toggle the logical binary bits below to map target key, then commit files upload to crash layers before Sweep Sweep.
                  </p>

                  {/* Nodes Switches grid */}
                  <div className="flex gap-4.5 justify-center my-4">
                    {matrixUser.map((bit, idx) => (
                      <button
                        key={idx}
                        onClick={() => toggleUserBit(idx)}
                        className={`h-12 w-12 rounded-2xl border flex items-center justify-center font-mono text-lg font-black transition-all duration-300 cursor-pointer ${
                          bit === "1" 
                            ? "bg-cyan-400/20 border-cyan-400 text-cyan-300 shadow-[0_0_20px_rgba(34,211,238,0.4)] scale-105"
                            : "bg-black/30 border-white/10 text-neutral-500 hover:text-white"
                        }`}
                      >
                        {bit}
                      </button>
                    ))}
                  </div>

                  {/* Controls & Timer bar */}
                  <div className="bg-white/5 border border-white/10 rounded-2xl p-4 flex justify-between items-center font-mono text-xs my-2 backdrop-blur-sm shadow-md">
                    <span className="text-rose-400 font-bold animate-pulse uppercase">SWEEP TIMERS: {hackTimer}s</span>
                    <button
                      onClick={submitMatrixCrack}
                      disabled={isHackWon || isHackLost}
                      className="bg-cyan-600 hover:bg-cyan-500 font-bold px-6 py-2 rounded-xl text-white disabled:opacity-30 cursor-pointer uppercase text-[10px] tracking-wider transition"
                    >
                      COMMIT_DECONSTRUCT_CRACK()
                    </button>
                  </div>

                  {/* Outcome overlays */}
                  {isHackWon && (
                    <div className="absolute inset-0 bg-neutral-950/95 flex flex-col items-center justify-center p-6 text-center z-10 rounded-2xl border border-cyan-500/25">
                      <Star className="text-yellow-400 mb-3 fill-yellow-400 animate-spin-slow" size={38} />
                      <h4 className="font-mono text-sm text-cyan-400 font-black tracking-widest uppercase">NODE BREACH SUCCESSFUL</h4>
                      <p className="text-xs text-neutral-400 font-sans mt-2 mb-6 max-w-xs">
                        All active security layers bypassed. Server core codes have been exposed!
                      </p>
                      <button
                        onClick={() => startDemo("neon-hackers")}
                        className="font-mono text-xs font-bold bg-cyan-600 hover:bg-cyan-500 text-white rounded-xl px-6 py-2.5 transition"
                      >
                        RE-ENTER_SYSTEM()
                      </button>
                    </div>
                  )}

                  {isHackLost && (
                    <div className="absolute inset-0 bg-neutral-950/95 flex flex-col items-center justify-center p-6 text-center z-10 rounded-2xl border border-red-500/25">
                      <AlertCircle className="text-red-500 mb-3 animate-pulse" size={38} />
                      <h4 className="font-mono text-sm text-red-500 font-black tracking-widest uppercase">DISCONNECTED_BY_SWEEP</h4>
                      <p className="text-xs text-neutral-400 font-sans mt-2 mb-6 max-w-xs">
                        Proxy network IP resolved. Command grid kicked you from host files.
                      </p>
                      <button
                        onClick={() => startDemo("neon-hackers")}
                        className="font-mono text-xs font-bold bg-red-600 hover:bg-red-500 text-white rounded-xl px-6 py-2.5 transition"
                      >
                        RE-BOOT_TRACE()
                      </button>
                    </div>
                  )}

                </div>
              )}

            </div>
          </div>

          {/* FULLSCREEN BUTTON BELOW GAME DISPLAY */}
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => {
              triggerClick();
              handleToggleFullscreen();
            }}
            onMouseEnter={triggerHover}
            className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-cyan-600 to-cyan-500 hover:from-cyan-500 hover:to-cyan-400 text-white font-mono font-bold text-sm uppercase tracking-wider transition duration-300 shadow-[0_0_20px_rgba(34,211,238,0.3)] hover:shadow-[0_0_30px_rgba(34,211,238,0.5)] flex items-center justify-center gap-2 border border-cyan-400/50 cursor-pointer"
          >
            <Maximize2 size={16} className="text-white" />
            {isFullscreen ? "EXIT_FULLSCREEN_MODE" : "LAUNCH_FULLSCREEN_PLAY"}
          </motion.button>
        </div>

        {/* RIGHT METRICS DIAGNOSTICS CONTROL PANEL (lg:col-span-3) */}
        <div className="lg:col-span-3 flex flex-col justify-between gap-6">
          
          <div className="bg-white/[0.02] border border-white/10 rounded-3xl p-5 backdrop-blur-md relative overflow-hidden flex flex-col justify-between h-full">
            <div className="absolute top-0 left-0 h-24 w-24 bg-cyan-500/5 rounded-full blur-xl pointer-events-none" />
            
            {/* System details */}
            <div>
              <div className="flex items-center gap-2 mb-4 text-[#06b6d4]">
                <Cpu size={14} />
                <span className="font-mono text-[9px] uppercase tracking-widest font-bold">ARCADE_SYS_LORE</span>
              </div>
              
              <div className="p-4 rounded-2xl bg-black/40 border border-white/5 space-y-4">
                <p className="text-neutral-400 font-mono text-[10px] leading-relaxed">
                  We render this interactive simulation fully decoupled from other frameworks using secure sandboxing protocols. Directly maps frame commands.
                </p>
                <div className="h-[2px] bg-white/5 w-full" />
                <p className="text-neutral-400 font-mono text-[10px] leading-relaxed">
                  [CONTROLS]: Mouse click, touch triggers, key nodes toggles mapped in real-time. Full keys routing listening.
                </p>
              </div>
            </div>

            {/* Dynamic Diagnostics sliders / charts / signals */}
            <div className="space-y-4 pt-4 border-t border-white/5">
              <span className="block font-mono text-[9px] text-zinc-500 uppercase tracking-widest mb-1.5">
                ACTIVE_TELEMETRY:
              </span>
              
              <div className="space-y-3">
                <div className="space-y-1">
                  <div className="flex justify-between font-mono text-[9px] text-neutral-400">
                    <span>GRID LATENCY:</span>
                    <span className="text-cyan-400 font-bold">{diagnostics.ping} MS</span>
                  </div>
                  <div className="w-full bg-black/40 h-1.5 rounded-full overflow-hidden">
                    <div className="bg-cyan-500 h-full transition-all duration-1000" style={{ width: `${(diagnostics.ping/30)*100}%` }} />
                  </div>
                </div>

                <div className="space-y-1">
                  <div className="flex justify-between font-mono text-[9px] text-neutral-400">
                    <span>CORES LOAD:</span>
                    <span className="text-purple-400 font-bold">{diagnostics.workload}%</span>
                  </div>
                  <div className="w-full bg-black/40 h-1.5 rounded-full overflow-hidden">
                    <div className="bg-purple-500 h-full transition-all duration-1000" style={{ width: `${diagnostics.workload}%` }} />
                  </div>
                </div>

                <div className="space-y-1">
                  <div className="flex justify-between font-mono text-[9px] text-neutral-400">
                    <span>CORE TEMP:</span>
                    <span className="text-rose-400 font-bold">{diagnostics.coreTemp}°C</span>
                  </div>
                  <div className="w-full bg-black/40 h-1.5 rounded-full overflow-hidden">
                    <div className="bg-rose-500 h-full transition-all duration-1000" style={{ width: `${diagnostics.coreTemp}%` }} />
                  </div>
                </div>
              </div>
              
              {/* UTC Dashboard Cockpit Clock */}
              <div className="mt-6 pt-4 border-t border-white/5 flex items-center justify-between text-neutral-500 font-mono text-[9px]">
                <span className="flex items-center gap-1 uppercase"><Clock size={10} /> SYSTEM-UTC:</span>
                <span className="text-neutral-300 font-bold font-mono">04:22:15 UTC</span>
              </div>
            </div>

          </div>
        </div>

      </div>

      {/* FOOTER CANVAS GRID DETAILS */}
      <footer className="h-14 border-t border-white/5 bg-black/50 backdrop-blur-md px-4 md:px-10 flex items-center justify-between z-10 shrink-0 font-mono text-[9px] text-neutral-500 select-none">
        <span>DEVICE CONSOLE INGRESS DIRECT ROUTING // P2P</span>
        <span>GATEWAY_LOADER v1.82.0</span>
      </footer>

    </motion.div>
  );
}
