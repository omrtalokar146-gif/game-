import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { GameMetadata } from "../types";
import { getGamesList } from "../utils/gamesStorage";
import { playHoverSound, playClickSound, playSuccessSound, playGlitchSound } from "../utils/audio";
import { Shield, Sparkles, AlertCircle, Coins, Heart, Star, Send } from "lucide-react";
import { ImmersiveGameConsole } from "./ImmersiveGameConsole";

export function GameShowcase() {
  const [gamesList, setGamesList] = useState<GameMetadata[]>([]);
  const [selectedGame, setSelectedGame] = useState<GameMetadata | null>(null);
  const [activeDemoId, setActiveDemoId] = useState<string | null>(null);
  const [activeConsoleGame, setActiveConsoleGame] = useState<GameMetadata | null>(null);

  // Load games on mount and when updated
  useEffect(() => {
    const loadGames = async () => {
      const list = await getGamesList();
      setGamesList(list);
      if (!selectedGame && list.length > 0) {
        setSelectedGame(list[0]);
      }
    };
    loadGames();

    const handleSync = async () => {
      const updated = await getGamesList();
      setGamesList(updated);
      setSelectedGame((prev) => {
        if (!prev) return updated[0] || null;
        // Keep the selected game active if it's still in the list
        const found = updated.find((g) => g.id === prev.id);
        return found || updated[0] || null;
      });
    };
    window.addEventListener("vortex_games_updated", handleSync);
    return () => window.removeEventListener("vortex_games_updated", handleSync);
  }, []);

  // 1. VOID RUNNERS DEMO: Canvas space racer
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [racerScore, setRacerScore] = useState(0);
  const [isRacerGameOver, setIsRacerGameOver] = useState(false);
  const [racerPlaying, setRacerPlaying] = useState(false);
  const racerShipX = useRef(150);
  const racerMouseX = useRef(150);

  // 2. ELDERWOOD DEMO STATE
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

  const triggerHover = () => playHoverSound();
  const triggerClick = () => playClickSound();

  // START DEMO TRIGGER
  const startDemo = (id: string) => {
    triggerClick();
    setActiveDemoId(id);
    if (id === "void-runners") {
      setRacerScore(0);
      setIsRacerGameOver(false);
      setRacerPlaying(true);
      racerShipX.current = 150;
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
    if (activeDemoId !== "void-runners" || !racerPlaying) return;

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
      // Spaceship bounding sphere is about 15px radius
      return Math.sqrt(dx * dx + dy * dy) < as + 12;
    };

    const gameLoop = () => {
      ctx.fillStyle = "#0c0a1c"; // Dark cosmic spacer
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Starfield background trail
      ctx.fillStyle = "rgba(168, 85, 247, 0.2)";
      for (let i = 0; i < 15; i++) {
        const starY = (Date.now() / 3 + i * 40) % canvas.height;
        ctx.fillRect((i * 37) % canvas.width, starY, 2, 2);
      }

      // Smooth move ship towards mouse
      racerShipX.current += (racerMouseX.current - racerShipX.current) * 0.15;
      // Bound
      racerShipX.current = Math.max(15, Math.min(canvas.width - 15, racerShipX.current));

      const shipY = canvas.height - 35;

      // Draw Spaceship (Neon Triangles)
      ctx.shadowBlur = 15;
      ctx.shadowColor = "#a855f7";
      ctx.fillStyle = "#e9d5ff";
      ctx.beginPath();
      ctx.moveTo(racerShipX.current, shipY - 12);
      ctx.lineTo(racerShipX.current - 10, shipY + 10);
      ctx.lineTo(racerShipX.current + 10, shipY + 10);
      ctx.closePath();
      ctx.fill();

      // Wing glow
      ctx.strokeStyle = "#38bdf8";
      ctx.lineWidth = 2;
      ctx.stroke();

      // Exhaust fire
      ctx.shadowColor = "#f43f5e";
      ctx.fillStyle = Math.random() > 0.5 ? "#f43f5e" : "#fb7185";
      ctx.beginPath();
      ctx.moveTo(racerShipX.current - 4, shipY + 12);
      ctx.lineTo(racerShipX.current, shipY + 22 + Math.random() * 6);
      ctx.lineTo(racerShipX.current + 4, shipY + 12);
      ctx.closePath();
      ctx.fill();

      // Reset shadows for obstacles
      ctx.shadowBlur = 0;

      // Generate energy orbs/asteroids
      if (Math.random() < 0.05 * speedMultiplier) {
        asteroids.push({
          x: Math.random() * canvas.width,
          y: -20,
          size: Math.random() * 12 + 6,
          speed: Math.random() * 2 + 2,
        });
      }

      // Render & Update Asteroids
      ctx.fillStyle = "#22d3ee"; // Cyal neon core obstacle
      for (let i = asteroids.length - 1; i >= 0; i--) {
        const ast = asteroids[i];
        ast.y += ast.speed * speedMultiplier;

        ctx.beginPath();
        ctx.arc(ast.x, ast.y, ast.size, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = "#0891b2";
        ctx.lineWidth = 1.5;
        ctx.stroke();

        // Check crash
        if (checkCollision(ast.x, ast.y, ast.size, racerShipX.current, shipY)) {
          playGlitchSound();
          setIsRacerGameOver(true);
          setRacerPlaying(false);
          return;
        }

        // Score add
        if (ast.y > canvas.height + 20) {
          localScore += 100;
          setRacerScore(localScore);
          asteroids.splice(i, 1);
        }
      }

      // Increase speed slightly over time
      speedMultiplier = 1 + localScore / 3000;

      frameId = requestAnimationFrame(gameLoop);
    };

    gameLoop();

    return () => {
      cancelAnimationFrame(frameId);
      canvas.removeEventListener("mousemove", handleMouseMove);
      canvas.removeEventListener("touchmove", handleTouchMove);
    };
  }, [activeDemoId, racerPlaying]);

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
          setRpgLogs(prev => [...prev, "💀 DEFEAT! You were tangled in roots. Restart the simulator!"]);
        }
      }
    } else if (type === "elemental") {
      if (rpgMana < 15) {
        setRpgLogs(prev => [...prev, "⚠️ Not enough Mana to cast elemental fire spell!"]);
        return;
      }
      const dmg = Math.floor(Math.random() * 25) + 20;
      const newMonsterHp = Math.max(0, rpgMonsterHp - dmg);
      const monsterCounter = Math.floor(Math.random() * 10) + 5;

      setRpgMana(prev => prev - 15);
      let logMessage = `🔥 Firestorm! You deal ${dmg} elemental spell DMG to the Root!`;

      if (newMonsterHp <= 0) {
        playSuccessSound();
        setRpgMonsterHp(0);
        setIsRpgCompleted(true);
        setRpgXp(prev => prev + 150);
        setRpgLogs(prev => [...prev, logMessage, "🏆 VICTORY! The Root ashes scatter, revealing elderwoods secrets!"]);
      } else {
        setRpgMonsterHp(newMonsterHp);
        const newHp = Math.max(0, rpgHp - monsterCounter);
        setRpgHp(newHp);
        setRpgLogs(prev => [
          ...prev,
          logMessage,
          `🌵 Root shoots glowing toxic projectiles causing ${monsterCounter} magic damage!`
        ]);
        if (newHp <= 0) {
          playGlitchSound();
          setRpgLogs(prev => [...prev, "💀 DEFEAT! Backtrack to camp!"]);
        }
      }
    } else if (type === "heal") {
      if (rpgMana < 10) {
        setRpgLogs(prev => [...prev, "⚠️ Not enough Mana to heal!"]);
        return;
      }
      setRpgMana(prev => prev - 10);
      const healAmt = Math.floor(Math.random() * 15) + 20;
      setRpgHp(prev => Math.min(100, prev + healAmt));
      setRpgLogs(prev => [...prev, `💚 Celestial Glow! You recovered ${healAmt} HP.`]);
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
      setHackTimer(prev => Math.max(0, prev - 4)); // subtract time penalty
    }
  };

  // Hack countdown timer
  useEffect(() => {
    if (activeDemoId !== "neon-hackers" || isHackWon || isHackLost) return;
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
  }, [activeDemoId, isHackWon, isHackLost]);


  return (
    <section className="relative w-full py-20 px-4 md:px-8 max-w-7xl mx-auto" id="gaming-zone-section">
      <div className="absolute top-0 right-1/4 w-80 h-80 bg-cyan-500/5 rounded-full blur-3xl -z-10 pointer-events-none" />

      {/* Header title */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 mb-16">
        <div>
          <span className="font-mono text-xs text-cyan-400 font-bold uppercase tracking-widest block mb-1">
            GAMIN ZONE
          </span>
          <h2 className="text-4xl md:text-5xl font-display font-black tracking-tight italic text-white uppercase">
            EXPLORE THE <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-purple-500 to-rose-500">GAMIN ZONE</span>
          </h2>
        </div>
        <p className="text-neutral-400 font-sans text-sm max-w-sm">
          Click on any game package below to reveal dynamic specifications and launch instantly inside the simulator cockpit.
        </p>
      </div>

      {/* Interactive horizontal selection container */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
        {gamesList.map((game) => {
          const isActive = selectedGame.id === game.id;
          return (
            <motion.div
              key={game.id}
              onClick={() => {
                setSelectedGame(game);
                setActiveConsoleGame(game);
                triggerClick();
              }}
              onMouseEnter={triggerHover}
              whileHover={{ y: -6, scale: 1.01 }}
              transition={{ type: "spring", stiffness: 300, damping: 20 }}
              className={`relative cursor-pointer rounded-2xl p-5 overflow-hidden border backdrop-blur-md transition-all duration-300 ${
                isActive 
                  ? "bg-white/10 border-white/25 shadow-[0_8px_32px_rgba(34,211,238,0.25)]" 
                  : "bg-white/5 border-white/10 hover:border-white/20 hover:bg-white/8 shadow-[0_8px_32px_rgba(0,0,0,0.18)]"
              }`}
            >
              <div className="aspect-[4/3] w-full rounded-xl overflow-hidden mb-4 relative flex items-center justify-center">
                {game.coverImage && (game.coverImage.startsWith("/") || game.coverImage.startsWith("http")) ? (
                  <img
                    src={game.coverImage}
                    alt={game.title}
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                ) : (
                  <div className={`w-full h-full bg-gradient-to-br ${game.themeColor || "from-slate-700 to-indigo-950"} p-5 flex flex-col justify-between relative overflow-hidden text-left`}>
                    <div className="text-white relative z-10">
                      <span className="text-[10px] uppercase font-mono tracking-widest text-cyan-300 bg-cyan-950/40 border border-cyan-500/10 px-2 py-0.5 rounded-full inline-block mb-2 font-bold select-none">
                        CUSTOM EMBED
                      </span>
                      <h4 className="font-display font-black tracking-tight text-white text-base leading-tight italic uppercase drop-shadow">
                        {game.title}
                      </h4>
                    </div>
                    {/* Glowing circular element inside */}
                    <div className="absolute top-1/2 right-0 w-32 h-32 bg-cyan-500/10 rounded-full blur-xl pointer-events-none" />
                  </div>
                )}
                <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black via-black/40 to-transparent p-3 pt-8">
                  <span className="font-mono text-[9px] bg-white/10 border border-white/15 px-2.5 py-1 rounded-full text-zinc-300 uppercase font-bold">
                    {game.genre}
                  </span>
                </div>
              </div>

              <div className="flex items-center justify-between mb-1.5">
                <h3 className="font-display font-black text-lg text-white tracking-tight italic uppercase">
                  {game.title}
                </h3>
                <span className={`text-[10px] font-mono leading-none flex items-center gap-1.5 ${
                  game.serverStatus === "ONLINE" ? "text-emerald-400" : "text-sky-400"
                }`}>
                  <span className={`h-1.5 w-1.5 rounded-full ${
                    game.serverStatus === "ONLINE" ? "bg-emerald-400" : "bg-sky-400"
                  }`} />
                  {game.serverStatus}
                </span>
              </div>
              <p className="text-xs text-[#a1a1aa] font-sans line-clamp-2 leading-relaxed mb-3">
                {game.tagline}
              </p>

              <div className="flex items-center justify-between border-t border-white/5 pt-3">
                <span className="text-[10px] text-zinc-500 font-mono uppercase">
                  ACTIVE_USERS:
                </span>
                <span className="text-xs text-purple-300 font-mono font-bold">
                  {game.playerCount.toLocaleString()}
                </span>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* DYNAMIC EXPANSION DRAWER & MULTI-PLAYGROUND MINIGAMES CONTAINER */}
      <AnimatePresence mode="wait">
        {selectedGame && (
        <motion.div
          key={selectedGame.id}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.4 }}
          className="relative grid grid-cols-1 lg:grid-cols-12 gap-8 border border-white/10 rounded-3xl p-6 md:p-10 bg-white/5 backdrop-blur-md shadow-[0_8px_32px_rgba(0,0,0,0.37)]"
        >
          {/* LEFT PANEL: Game Details Showcase */}
          <div className="lg:col-span-5 flex flex-col justify-between">
            <div>
              <div className="flex flex-wrap gap-2 mb-4">
                {selectedGame.platforms.map((plat) => (
                  <span key={plat} className="font-mono text-[9px] text-zinc-300 bg-white/5 border border-white/10 px-2.5 py-1 rounded uppercase font-bold tracking-wider">
                    {plat}
                  </span>
                ))}
              </div>

              <h3 className="text-3xl md:text-4xl font-display font-black text-white leading-none mb-3 italic uppercase">
                {selectedGame.title}
              </h3>
              <p className="text-cyan-400 font-mono text-xs uppercase tracking-wider mb-5">
                Release Window: {selectedGame.releaseDate}
              </p>

              <p className="text-[#d4d4d8] text-sm font-sans leading-relaxed mb-6 font-medium">
                {selectedGame.description}
              </p>

              {/* Unique Game Features Checklist */}
              <div className="flex flex-col gap-3 mb-8">
                <span className="text-[10px] font-mono text-neutral-500 uppercase tracking-widest mb-1 block">
                  SYSTEM CORE SPECS:
                </span>
                {selectedGame.features.map((feat) => (
                  <div key={feat} className="flex items-start gap-2.5 text-xs text-neutral-300 font-sans font-medium">
                    <span className="h-5 w-5 rounded-full bg-cyan-500/10 border border-cyan-400/20 text-cyan-400 flex items-center justify-center shrink-0">
                      ★
                    </span>
                    <span>{feat}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Launch Interactive Arcade emulator button */}
            <button
              onClick={() => {
                triggerClick();
                setActiveConsoleGame(selectedGame);
              }}
              onMouseEnter={triggerHover}
              className="group relative cursor-pointer overflow-hidden p-[1px] rounded-xl bg-gradient-to-r from-cyan-400 via-purple-500 to-rose-500 shadow-[0_4px_20px_rgba(6,182,212,0.25)] hover:shadow-[0_4px_30px_rgba(168,85,247,0.4)] transition-all duration-300 transform hover:scale-[1.01] w-full"
            >
              <div className="bg-[#020205] rounded-[11px] p-3.5 text-center transition-all group-hover:bg-[#020205]/40 backdrop-blur-md">
                <span className="font-display font-black text-xs tracking-widest text-white group-hover:text-cyan-300 transition uppercase">
                  🚀 LAUNCH IN IMMERSIVE CONSOLE [FULLSCREEN]
                </span>
              </div>
            </button>
          </div>

          {/* RIGHT PANEL: Embedded Interactive Game Emulators */}
          <div className="lg:col-span-7 flex flex-col justify-center items-center relative min-h-[380px] bg-[#020205]/60 border border-white/10 rounded-2xl overflow-hidden p-6 shadow-inner backdrop-blur-xs">
            
            {/* If demo not active, render high-fidelity static visual mock */}
            <div className="text-center flex flex-col items-center max-w-sm">
              <div className="h-14 w-14 rounded-full bg-white/5 border border-white/10 flex items-center justify-center mb-4 text-cyan-400 animate-pulse shadow-md backdrop-blur-md">
                🕹️
              </div>
              <h4 className="font-display font-black text-lg text-white mb-2 uppercase italic tracking-tight">
                CABIN_READY PROTOCOL
              </h4>
              <p className="text-xs text-neutral-400 leading-relaxed mb-6 font-sans font-medium">
                Unleash the custom demo simulation using our cloud-powered browser server playground. Highly attractive interface with customizable diagnostic controls. No installs required!
              </p>
              <button
                onClick={() => {
                  triggerClick();
                  setActiveConsoleGame(selectedGame);
                }}
                onMouseEnter={triggerHover}
                className="font-mono text-xs font-bold text-cyan-400 hover:text-white border border-white/10 p-2.5 px-5 rounded-full hover:bg-white/10 hover:border-white/20 transition duration-300 tracking-wider uppercase cursor-pointer backdrop-blur-md shadow-sm"
              >
                OPEN_SEPARATE_PLAYGROUND()
              </button>
            </div>
          </div>

        </motion.div>
        )}
      </AnimatePresence>

      {/* Immersive Game Console Fullscreen Separate Page Overlay */}
      <AnimatePresence>
        {activeConsoleGame && (
          <ImmersiveGameConsole
            game={activeConsoleGame}
            onClose={() => setActiveConsoleGame(null)}
          />
        )}
      </AnimatePresence>

    </section>
  );
}
