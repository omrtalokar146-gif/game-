import { motion } from "motion/react";
import { Play, ShieldAlert, Cpu, Users, Volume2, VolumeX, Terminal, Sparkles, Layers, Activity, Flame } from "lucide-react";
import { playHoverSound, playClickSound, playGlitchSound, playSuccessSound } from "../utils/audio";
import { useState, useEffect, useRef } from "react";

interface HeroProps {
  isMuted: boolean;
  toggleMute: () => void;
  onExploreGames: () => void;
  onSignIn: () => void;
}

export function Hero({ isMuted, toggleMute, onExploreGames, onSignIn }: HeroProps) {
  const [ping, setPing] = useState(24);
  const [fps, setFps] = useState(144);
  const [activeUsers, setActiveUsers] = useState(140982);

  // Live gaming indicators simulations
  useEffect(() => {
    const interval = setInterval(() => {
      setPing(prev => Math.max(12, Math.min(45, prev + Math.floor(Math.random() * 5) - 2)));
      setFps(prev => Math.max(138, Math.min(144, prev + Math.floor(Math.random() * 3) - 1)));
      setActiveUsers(prev => prev + Math.floor(Math.random() * 11) - 5);
    }, 2500);
    return () => clearInterval(interval);
  }, []);

  const triggerClick = () => {
    playClickSound();
  };

  const triggerHover = () => {
    playHoverSound();
  };

  const triggerGlitch = () => {
    playGlitchSound();
  };

  const heroCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const [simulationPreset, setSimulationPreset] = useState<"QUANTUM" | "WARP" | "NEBULA">("QUANTUM");
  const [speedVal, setSpeedVal] = useState(1.2);
  const [energyLevel, setEnergyLevel] = useState(80);

  // High fidelity canvas generator simulation loops
  useEffect(() => {
    const canvas = heroCanvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let width = (canvas.width = canvas.getBoundingClientRect().width || 640);
    let height = (canvas.height = canvas.getBoundingClientRect().height || 360);

    const resizeObserver = new ResizeObserver((entries) => {
      for (let entry of entries) {
        if (entry.contentRect) {
          width = canvas.width = entry.contentRect.width || 640;
          height = canvas.height = entry.contentRect.height || 360;
        }
      }
    });
    
    // Read parent container dimensions
    if (canvas.parentElement) {
      resizeObserver.observe(canvas.parentElement);
    }

    const mousePos = { x: -1000, y: -1000 };
    const shocks: { x: number; y: number; radius: number; maxRadius: number; alpha: number }[] = [];

    const handleMouseMove = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      mousePos.x = e.clientX - rect.left;
      mousePos.y = e.clientY - rect.top;
    };

    const handleMouseLeave = () => {
      mousePos.x = -1000;
      mousePos.y = -1000;
    };

    const handleCanvasClick = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      const clickX = e.clientX - rect.left;
      const clickY = e.clientY - rect.top;
      // Spawn beautiful cyber shockwave
      shocks.push({
        x: clickX,
        y: clickY,
        radius: 2,
        maxRadius: 180,
        alpha: 1.0
      });
      playClickSound();
    };

    canvas.addEventListener("mousemove", handleMouseMove);
    canvas.addEventListener("mouseleave", handleMouseLeave);
    canvas.addEventListener("click", handleCanvasClick);

    // Initialize 60 custom particles
    type SimParticle = {
      x: number;
      y: number;
      vx: number;
      vy: number;
      radius: number;
      hue: number;
      angle: number;
      speed: number;
      distance: number;
    };

    const simParticles: SimParticle[] = [];
    for (let i = 0; i < 65; i++) {
      simParticles.push({
        x: Math.random() * width,
        y: Math.random() * height,
        vx: (Math.random() - 0.5) * 1.5,
        vy: (Math.random() - 0.5) * 1.5,
        radius: Math.random() * 2.5 + 1,
        hue: i % 2 === 0 ? 280 : 190, // Purple vs Cyan
        angle: Math.random() * Math.PI * 2,
        speed: Math.random() * 0.5 + 0.2,
        distance: Math.random() * 160 + 20
      });
    }

    let frameId: number;
    let time = 0;

    const tick = () => {
      time += 0.01 * speedVal;
      
      // Paint translucent custom cockpit dark space
      ctx.fillStyle = "rgba(4, 3, 11, 0.4)";
      ctx.fillRect(0, 0, width, height);

      // Render cosmic holographic center orb
      const centerX = width / 2;
      const centerY = height / 2;

      // Draw background ambient HUD grids & target rings
      ctx.strokeStyle = "rgba(168, 85, 247, 0.07)";
      ctx.lineWidth = 1;

      // Concentric scanner rings
      for (let r = 80; r <= 240; r += 80) {
        ctx.beginPath();
        ctx.arc(centerX, centerY, r + Math.sin(time * 0.5) * 8, 0, Math.PI * 2);
        ctx.stroke();
      }

      // Scanner crosshair lines
      ctx.strokeStyle = "rgba(6, 182, 212, 0.05)";
      ctx.beginPath();
      ctx.moveTo(centerX - 120, centerY);
      ctx.lineTo(centerX + 120, centerY);
      ctx.moveTo(centerX, centerY - 120);
      ctx.lineTo(centerX, centerY + 120);
      ctx.stroke();

      // Render Active Preset Animations
      if (simulationPreset === "QUANTUM") {
        // Quantum Mode: Draw interconnected neural stars with active plexus
        simParticles.forEach((p, idx) => {
          p.x += p.vx * speedVal;
          p.y += p.vy * speedVal;

          // Bounce off container boundaries
          if (p.x < 0 || p.x > width) p.vx *= -1;
          if (p.y < 0 || p.y > height) p.vy *= -1;

          // Push slightly away from cursor
          if (mousePos.x !== -1000) {
            const dx = p.x - mousePos.x;
            const dy = p.y - mousePos.y;
            const dist = Math.sqrt(dx * dx + dy * dy);
            if (dist < 120) {
              const pushForce = (120 - dist) * 0.04;
              p.x += (dx / dist) * pushForce;
              p.y += (dy / dist) * pushForce;
            }
          }

          // Draw connections
          for (let j = idx + 1; j < simParticles.length; j++) {
            const p2 = simParticles[j];
            const dx = p.x - p2.x;
            const dy = p.y - p2.y;
            const d = Math.sqrt(dx * dx + dy * dy);
            if (d < 90) {
              ctx.strokeStyle = `rgba(147, 51, 234, ${(90 - d) / 90 * 0.2 * (energyLevel / 100)})`;
              ctx.lineWidth = 0.5;
              ctx.beginPath();
              ctx.moveTo(p.x, p.y);
              ctx.lineTo(p2.x, p2.y);
              ctx.stroke();
            }
          }

          // Draw the star index point
          ctx.fillStyle = `hsla(${p.hue}, 90%, 70%, 0.8)`;
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
          ctx.fill();
        });

      } else if (simulationPreset === "WARP") {
        // Warp Mode: Deep space hyperdrive starry tunnel!
        simParticles.forEach((p) => {
          // Adjust position radially outwards from center
          p.angle += 0.002 * speedVal;
          const radSpeed = (p.radius + 1.5) * speedVal * 2.2;
          
          const dx = p.x - centerX;
          const dy = p.y - centerY;
          const distFromCenter = Math.sqrt(dx * dx + dy * dy);

          if (distFromCenter < 5 || distFromCenter > Math.max(width, height) * 0.8) {
            // Respawn close to center to iterate infinity loop
            const randAngle = Math.random() * Math.PI * 2;
            p.x = centerX + Math.cos(randAngle) * (Math.random() * 20 + 5);
            p.y = centerY + Math.sin(randAngle) * (Math.random() * 20 + 5);
          } else {
            // Speed accelerates outwards
            p.x += (dx / distFromCenter) * radSpeed;
            p.y += (dy / distFromCenter) * radSpeed;
          }

          // Draw streak lines
          ctx.strokeStyle = `hsla(${p.hue}, 90%, 75%, ${Math.min(1.0, distFromCenter / 200) * (energyLevel / 100)})`;
          ctx.lineWidth = p.radius * 0.8;
          ctx.beginPath();
          ctx.moveTo(p.x, p.y);
          ctx.lineTo(p.x - (dx / distFromCenter) * (p.radius * 6), p.y - (dy / distFromCenter) * (p.radius * 6));
          ctx.stroke();
        });

      } else if (simulationPreset === "NEBULA") {
        // Nebula mode: Wave lines crossing elegantly with plasma particle orbits
        ctx.lineWidth = 1.5;
        for (let wave = 0; wave < 3; wave++) {
          ctx.strokeStyle = wave === 0 ? "rgba(6, 182, 212, 0.25)" : wave === 1 ? "rgba(168, 85, 247, 0.2)" : "rgba(244, 63, 94, 0.15)";
          ctx.beginPath();
          for (let x = 0; x < width; x += 15) {
            const cycle = time * 1.5 + x * 0.004 + wave * 2;
            const y = centerY + Math.sin(cycle) * 75 + Math.cos(cycle * 0.5) * 20;
            if (x === 0) ctx.moveTo(x, y);
            else ctx.lineTo(x, y);
          }
          ctx.stroke();
        }

        // Draw rotating elements
        simParticles.forEach((p, idx) => {
          p.angle += p.speed * 0.05 * speedVal;
          const orbitDist = p.distance + Math.sin(time + idx) * 15;
          const orbX = centerX + Math.cos(p.angle) * orbitDist;
          const orbY = centerY + Math.sin(p.angle) * orbitDist;

          // Core beam glow connection
          ctx.strokeStyle = `rgba(168, 85, 247, ${0.05 * (energyLevel / 100)})`;
          ctx.lineWidth = 0.5;
          ctx.beginPath();
          ctx.moveTo(centerX, centerY);
          ctx.lineTo(orbX, orbY);
          ctx.stroke();

          ctx.fillStyle = `hsla(${p.hue}, 90%, 75%, 0.85)`;
          ctx.beginPath();
          ctx.arc(orbX, orbY, p.radius * 1.5, 0, Math.PI * 2);
          ctx.fill();
        });
      }

      // Process and render shockwaves recursively
      shocks.forEach((s, idx) => {
        s.radius += 4 * speedVal;
        s.alpha -= 0.02 * speedVal;
        
        ctx.strokeStyle = `rgba(6, 182, 212, ${s.alpha})`;
        ctx.lineWidth = 2.5;
        ctx.beginPath();
        ctx.arc(s.x, s.y, s.radius, 0, Math.PI * 2);
        ctx.stroke();

        ctx.strokeStyle = `rgba(168, 85, 247, ${s.alpha * 0.4})`;
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.arc(s.x, s.y, s.radius * 1.15, 0, Math.PI * 2);
        ctx.stroke();

        // Push nearby particles physically
        simParticles.forEach((p) => {
          const dx = p.x - s.x;
          const dy = p.y - s.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (Math.abs(dist - s.radius) < 25) {
            const impulse = s.alpha * 4;
            p.x += (dx / dist) * impulse;
            p.y += (dy / dist) * impulse;
          }
        });

        if (s.alpha <= 0 || s.radius >= s.maxRadius) {
          shocks.splice(idx, 1);
        }
      });

      // Ambient system info floating readout tag values
      ctx.fillStyle = "rgba(6, 182, 212, 0.75)";
      ctx.font = "bold 9px 'Fira Code', 'JetBrains Mono', monospace";
      ctx.fillText(`ENGINE STATE // SYS_OVERDRIVE: ${(energyLevel * 1.2).toFixed(0)}MHz`, 25, height - 25);
      ctx.fillText(`PRESET IDENTIFIED: ${simulationPreset}`, 25, 30);
      
      const speedPct = (speedVal * 100).toFixed(0);
      ctx.fillText(`CLOCK SPEED // ${speedPct}%`, width - 140, height - 25);

      frameId = requestAnimationFrame(tick);
    };

    tick();

    return () => {
      cancelAnimationFrame(frameId);
      resizeObserver.disconnect();
      canvas.removeEventListener("mousemove", handleMouseMove);
      canvas.removeEventListener("mouseleave", handleMouseLeave);
      canvas.removeEventListener("click", handleCanvasClick);
    };
  }, [simulationPreset, speedVal, energyLevel]);

  return (
    <section className="relative w-full min-h-screen py-24 flex flex-col justify-center items-center px-4 md:px-8 border-b border-white/5" id="hero-section">
      
      {/* Top Console Command Bar */}
      <div className="absolute top-8 left-4 right-4 md:left-8 md:right-8 flex flex-wrap justify-between items-center gap-4 z-20">
        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6 }}
          className="flex items-center gap-3 font-mono text-xs text-cyan-400"
        >
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-cyan-500"></span>
          </span>
          <span className="text-purple-400 font-bold tracking-wider">VORTEX_ENGINE_v4.2</span>
          <span className="opacity-40">|</span>
          <span className="hidden sm:inline">PING: {ping}ms</span>
          <span className="opacity-40 hidden sm:inline">|</span>
          <span className="hidden sm:inline">FPS: {fps}</span>
        </motion.div>

        {/* Action controls */}
        <motion.div 
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6 }}
          className="flex items-center gap-3"
        >
          {/* Audio Master */}
          <button
            onClick={() => {
              toggleMute();
              triggerClick();
            }}
            onMouseEnter={triggerHover}
            className="flex items-center gap-2 p-2 px-3 rounded-md bg-white/5 border border-white/10 text-xs font-mono text-purple-300 hover:bg-white/10 hover:border-white/20 transition cursor-pointer"
            title={isMuted ? "Unmute Studio Sound FX" : "Mute Studio Sound FX"}
          >
            {isMuted ? (
              <>
                <VolumeX size={14} className="text-red-400 animate-pulse" />
                <span className="text-red-400/80 uppercase">AUDIO_MUTED</span>
              </>
            ) : (
              <>
                <Volume2 size={14} className="text-green-400 animate-bounce" />
                <span className="text-green-400 uppercase">SYS_AUDIO_ON</span>
              </>
            )}
          </button>
        </motion.div>
      </div>

      <div className="max-w-4xl text-center flex flex-col items-center gap-6 mt-12 relative">
        <div className="absolute -top-32 w-72 h-72 bg-purple-500/10 rounded-full blur-3xl -z-10 pointer-events-none" />

        {/* Small Game studio badge */}
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.1, duration: 0.5 }}
          onMouseEnter={triggerGlitch}
          className="flex items-center gap-2 px-3 py-1 bg-white/5 border border-white/10 rounded-full cursor-help hover:bg-white/10 transition group"
        >
          <Terminal size={12} className="text-purple-400 group-hover:rotate-12 transition-transform" />
          <span className="font-mono text-[10px] tracking-widest text-purple-300 uppercase">
            NEXT-GEN GAMING STUDIO
          </span>
        </motion.div>

        {/* STAGGERED HEADLINE */}
        <div className="flex flex-col gap-1 items-center">
          <motion.h1
            initial={{ y: 30, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            className="text-6xl md:text-9xl font-display font-black tracking-tighter italic leading-none uppercase bg-clip-text text-transparent bg-gradient-to-r from-white via-zinc-200 to-neutral-400"
          >
            VORTEX
          </motion.h1>
          <motion.h2
            initial={{ y: 30, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.12, duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            className="text-5xl md:text-8xl font-display font-black tracking-tighter italic leading-none uppercase text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-purple-500 to-rose-500 animate-gradient-xy mt-[-10px] md:mt-[-20px]"
          >
            STUDIOS
          </motion.h2>
        </div>

        {/* Description */}
        <motion.p
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.25, duration: 0.6 }}
          className="text-neutral-400 text-sm md:text-base max-w-2xl font-sans leading-relaxed tracking-wide"
        >
          We engineer zero-latency mechanics, cosmic synth scores, and beautiful hand-drawn worlds. We build digital dreams that spark adrenaline and soothe your soul.
        </motion.p>

        {/* Action Grid Buttons */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.35, duration: 0.6 }}
          className="flex flex-col sm:flex-row gap-4 items-center mt-4 w-full justify-center"
        >
          <button
            onClick={() => {
              triggerClick();
              onExploreGames();
            }}
            onMouseEnter={triggerHover}
            className="group relative h-14 px-8 bg-cyan-400 hover:bg-white text-black font-display font-black uppercase tracking-tight text-sm rounded-xl transition-all duration-300 transform hover:scale-105 flex items-center justify-center gap-2 shadow-[0_0_30px_rgba(34,211,238,0.4)] cursor-pointer w-full sm:w-auto"
          >
            <span className="relative flex items-center justify-center gap-2">
              <Play size={16} className="fill-black text-black" />
              ENTER GAMIN ZONE
            </span>
          </button>

          <button
            onClick={() => {
              triggerClick();
              onSignIn();
            }}
            onMouseEnter={triggerHover}
            className="group relative h-14 px-8 bg-purple-600 hover:bg-purple-500 text-white font-display font-black uppercase tracking-tight text-sm rounded-xl transition-all duration-300 transform hover:scale-105 flex items-center justify-center gap-2 shadow-[0_0_30px_rgba(168,85,247,0.4)] cursor-pointer w-full sm:w-auto"
          >
            <span className="relative flex items-center justify-center gap-2">
              <Users size={16} className="text-white" />
              SIGN IN
            </span>
          </button>
        </motion.div>

        {/* Interactive Holographic Simulation & Physics Cockpit Console Panel */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.45, duration: 0.8 }}
          className="relative w-full max-w-3xl rounded-3xl overflow-hidden border border-white/10 bg-[#060410]/90 shadow-[0_0_50px_rgba(168,85,247,0.22)] mt-8 group flex flex-col"
        >
          {/* Top Control Bar of the Interactive Console */}
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4 p-4 border-b border-white/10 bg-black/50 backdrop-blur-md z-10">
            <div className="flex items-center gap-2.5">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
              <span className="font-mono text-[10px] text-zinc-300 tracking-wider">ACTIVE PHYSICS_CORE</span>
              <span className="text-zinc-600 block sm:inline">|</span>
              
              {/* Preset selection tabs */}
              <div className="flex gap-1 bg-white/5 p-1 rounded-xl">
                {(["QUANTUM", "WARP", "NEBULA"] as const).map((mode) => (
                  <button
                    key={mode}
                    onClick={() => {
                      setSimulationPreset(mode);
                      playSuccessSound();
                    }}
                    className={`px-3 py-1 font-mono text-[9px] font-bold rounded-lg transition uppercase select-none ${
                      simulationPreset === mode
                        ? "bg-purple-600 text-white shadow-[0_0_12px_rgba(168,85,247,0.4)]"
                        : "text-zinc-400 hover:text-white hover:bg-white/5"
                    }`}
                  >
                    {mode}
                  </button>
                ))}
              </div>
            </div>

            {/* Interactive physics range controllers */}
            <div className="flex flex-wrap items-center gap-4">
              <div className="flex items-center gap-2">
                <span className="font-mono text-[9px] text-zinc-400 uppercase">Speed:</span>
                <input
                  type="range"
                  min="0.2"
                  max="3.0"
                  step="0.1"
                  value={speedVal}
                  onChange={(e) => setSpeedVal(parseFloat(e.target.value))}
                  className="w-16 sm:w-20 h-1 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-cyan-400 text-cyan-400"
                />
                <span className="font-mono text-[9px] text-cyan-300 w-6 text-left font-bold">{speedVal}x</span>
              </div>

              <div className="flex items-center gap-2">
                <span className="font-mono text-[9px] text-zinc-400 uppercase">Power:</span>
                <input
                  type="range"
                  min="20"
                  max="100"
                  step="5"
                  value={energyLevel}
                  onChange={(e) => setEnergyLevel(parseInt(e.target.value))}
                  className="w-16 sm:w-20 h-1 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-purple-500"
                />
                <span className="font-mono text-[9px] text-purple-300 w-7 text-left font-bold">{energyLevel}%</span>
              </div>
            </div>
          </div>

          {/* Center Main Live interactive Simulation Viewport */}
          <div className="relative w-full aspect-video min-h-[220px] md:min-h-[340px] z-1 overflow-hidden group/canvas cursor-crosshair">
            <canvas
              ref={heroCanvasRef}
              className="absolute inset-0 w-full h-full block bg-transparent"
            />

            {/* Scanning line grids laser overlay */}
            <div className="absolute inset-0 bg-gradient-to-b from-transparent via-purple-500/5 to-transparent bg-[size:100%_4px] pointer-events-none" />

            {/* Interactive guidelines center overlay */}
            <div className="absolute inset-x-0 bottom-6 text-center select-none pointer-events-none animate-bounce duration-1000">
              <span className="font-mono text-[9px] text-zinc-500 tracking-[0.2em] uppercase font-medium bg-black/60 px-3 py-1.5 rounded-full border border-white/5 shadow-md">
                🖱️ CLICK INSIDE THE CANVAS TO TRIGGER KINETIC SHOCKWAVES
              </span>
            </div>

            {/* Live FPS / telemetry indicators */}
            <div className="absolute top-4 right-4 text-right font-mono text-[8px] text-zinc-500 leading-normal space-y-0.5 select-none hidden sm:block">
              <div>// SIMULATION STATS ACTIVE</div>
              <div>PARTICLES COMMITTED: 65</div>
              <div>HOLOGRAPHIC MODE: ACTIVE</div>
            </div>
          </div>

          {/* Left/Right glowing sci-fi bars */}
          <div className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-1/4 bg-cyan-400" />
          <div className="absolute right-0 top-1/2 -translate-y-1/2 w-[3px] h-1/4 bg-purple-500" />
        </motion.div>

        {/* High-fidelity visual statistics dashboard bar */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.7 }}
          className="grid grid-cols-3 gap-4 md:gap-12 mt-16 p-6 border border-white/10 rounded-2xl bg-white/5 backdrop-blur-md w-full max-w-3xl shadow-[0_8px_32px_rgba(0,0,0,0.37)]"
        >
          <div className="flex flex-col items-center">
            <Cpu className="text-cyan-400 mb-1" size={18} />
            <span className="font-mono text-[10px] text-neutral-400 tracking-widest uppercase">ENGINES</span>
            <span className="font-display font-black text-md md:text-lg text-white uppercase tracking-tight">C++ CORE</span>
          </div>
          <div className="flex flex-col items-center border-x border-white/10 px-2 md:px-4">
            <Users className="text-purple-400 mb-1" size={18} />
            <span className="font-mono text-[10px] text-neutral-400 tracking-widest uppercase">PLAYERS</span>
            <span className="font-display font-black text-md md:text-lg text-white tracking-tight">
              {activeUsers.toLocaleString()}
            </span>
          </div>
          <div className="flex flex-col items-center">
            <ShieldAlert className="text-rose-400 mb-1" size={18} />
            <span className="font-mono text-[10px] text-neutral-400 tracking-widest uppercase">STATION</span>
            <span className="font-display font-black text-xs md:text-sm text-emerald-400 animate-pulse uppercase tracking-widest">
              LIVE_S10
            </span>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
