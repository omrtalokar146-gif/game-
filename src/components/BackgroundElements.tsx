import { useEffect, useRef } from "react";

export function BackgroundElements() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animationFrameId: number;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    // Track mouse coordinates
    const mouse = { x: -1000, y: -1000, targetX: -1000, targetY: -1000 };

    const handleMouseMove = (e: MouseEvent) => {
      mouse.targetX = e.clientX;
      mouse.targetY = e.clientY;
    };

    const handleMouseLeave = () => {
      mouse.targetX = -1000;
      mouse.targetY = -1000;
    };

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };

    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseleave", handleMouseLeave);
    window.addEventListener("resize", handleResize);

    // Particle pool setup
    type Particle = {
      x: number;
      y: number;
      size: number;
      speedX: number;
      speedY: number;
      alpha: number;
      hue: number;
    };

    const particles: Particle[] = [];
    const maxParticles = 90;

    for (let i = 0; i < maxParticles; i++) {
      particles.push({
        x: Math.random() * width,
        y: Math.random() * height,
        size: Math.random() * 2.5 + 0.8,
        speedX: (Math.random() - 0.5) * 0.5,
        speedY: (Math.random() - 0.5) * 0.5,
        alpha: Math.random() * 0.6 + 0.3,
        hue: Math.random() > 0.5 ? 280 : 190, // Cyber purple or sky cyan
      });
    }

    // Floating data streams (cyberpunk matrix accents)
    type DataStream = {
      x: number;
      y: number;
      speed: number;
      text: string;
      alpha: number;
    };
    const streams: DataStream[] = [];
    const streamCodes = ["SYS_OK", "VORTEX_CORE_4.2", "KINETIC_LINK", "PORT_3000", "AUDIO_SYNC", "FPS_144", "ZERO_DELAY"];
    for (let i = 0; i < 6; i++) {
      streams.push({
        x: Math.random() * width,
        y: Math.random() * height,
        speed: Math.random() * 0.5 + 0.2,
        text: streamCodes[i % streamCodes.length],
        alpha: Math.random() * 0.2 + 0.1
      });
    }

    // Main animation tick
    let gridOffset = 0;
    let waveTime = 0;
    
    const render = () => {
      waveTime += 0.002;
      
      // Clear with dark blue-black cosmic canvas color
      ctx.fillStyle = "#020206";
      ctx.fillRect(0, 0, width, height);

      // Smooth custom cursor tracking
      if (mouse.x === -1000) {
        mouse.x = mouse.targetX;
        mouse.y = mouse.targetY;
      } else {
        mouse.x += (mouse.targetX - mouse.x) * 0.08;
        mouse.y += (mouse.targetY - mouse.y) * 0.08;
      }

      // Draw beautiful dynamic flowing aurora waves (flowing background gradients)
      const waveX = width * 0.5 + Math.sin(waveTime) * 150;
      const waveY = height * 0.5 + Math.cos(waveTime * 1.5) * 100;
      
      const waveGrad = ctx.createRadialGradient(
        waveX, waveY, 50,
        waveX, waveY, 550
      );
      waveGrad.addColorStop(0, "rgba(88, 28, 135, 0.08)"); // Cyber purple
      waveGrad.addColorStop(0.5, "rgba(6, 182, 212, 0.04)"); // Cyber cyan
      waveGrad.addColorStop(1, "rgba(0,0,0,0)");
      ctx.fillStyle = waveGrad;
      ctx.fillRect(0, 0, width, height);

      // Draw futuristic animated sci-fi Grid behind everything, warping slightly where mouse is
      ctx.strokeStyle = "rgba(168, 85, 247, 0.05)";
      ctx.lineWidth = 1;
      gridOffset = (gridOffset + 0.2) % 60;

      // Vertical lines
      for (let x = gridOffset; x < width; x += 60) {
        ctx.beginPath();
        for (let y = 0; y < height; y += 20) {
          let currX = x;
          // Warp vertical lines near the mouse for high-performance feel
          if (mouse.x !== -1000) {
            const dx = mouse.x - x;
            const dy = mouse.y - y;
            const dist = Math.sqrt(dx * dx + dy * dy);
            if (dist < 180) {
              const pull = (180 - dist) * 0.08;
              currX += (dx / dist) * pull;
            }
          }
          if (y === 0) ctx.moveTo(currX, y);
          else ctx.lineTo(currX, y);
        }
        ctx.stroke();
      }

      // Horizontal lines
      for (let y = gridOffset; y < height; y += 60) {
        ctx.beginPath();
        for (let x = 0; x < width; x += 20) {
          let currY = y;
          if (mouse.x !== -1000) {
            const dx = mouse.x - x;
            const dy = mouse.y - y;
            const dist = Math.sqrt(dx * dx + dy * dy);
            if (dist < 180) {
              const pull = (180 - dist) * 0.08;
              currY += (dy / dist) * pull;
            }
          }
          if (x === 0) ctx.moveTo(x, currY);
          else ctx.lineTo(x, currY);
        }
        ctx.stroke();
      }

      // Draw static/ambient soft blurs at corners
      const gradientLeft = ctx.createRadialGradient(0, 0, 0, 0, 0, 700);
      gradientLeft.addColorStop(0, "rgba(124, 58, 237, 0.12)");
      gradientLeft.addColorStop(1, "rgba(0,0,0,0)");
      ctx.fillStyle = gradientLeft;
      ctx.fillRect(0, 0, width, height);

      const gradientRight = ctx.createRadialGradient(width, height, 0, width, height, 700);
      gradientRight.addColorStop(0, "rgba(6, 182, 212, 0.1)");
      gradientRight.addColorStop(1, "rgba(0,0,0,0)");
      ctx.fillStyle = gradientRight;
      ctx.fillRect(0, 0, width, height);

      // Mouse interactive radial glow
      if (mouse.x !== -1000) {
        const mouseGlow = ctx.createRadialGradient(
          mouse.x, mouse.y, 0,
          mouse.x, mouse.y, 250
        );
        mouseGlow.addColorStop(0, "rgba(139, 92, 246, 0.14)");
        mouseGlow.addColorStop(0.5, "rgba(6, 182, 212, 0.05)");
        mouseGlow.addColorStop(1, "rgba(0,0,0,0)");
        ctx.fillStyle = mouseGlow;
        ctx.fillRect(0, 0, width, height);
      }

      // Draw floating digital cyber text streams
      ctx.font = "8px 'Fira Code', 'JetBrains Mono', monospace";
      streams.forEach((s) => {
        s.y -= s.speed;
        if (s.y < -20) {
          s.y = height + 20;
          s.x = Math.random() * width;
        }
        ctx.fillStyle = `rgba(34, 211, 238, ${s.alpha})`;
        ctx.fillText(s.text, s.x, s.y);
      });

      // Render connected network constellation lines first (Plexus Effect)
      ctx.lineWidth = 0.7;
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const dx = particles[i].x - particles[j].x;
          const dy = particles[i].y - particles[j].y;
          const dist = Math.sqrt(dx * dx + dy * dy);

          // Connect points if they are close enough
          if (dist < 110) {
            const alpha = (110 - dist) / 110 * 0.16;
            ctx.strokeStyle = `rgba(168, 85, 247, ${alpha})`;
            ctx.beginPath();
            ctx.moveTo(particles[i].x, particles[i].y);
            ctx.lineTo(particles[j].x, particles[j].y);
            ctx.stroke();
          }
        }
      }

      // Update and render star particles
      particles.forEach((p) => {
        p.x += p.speedX;
        p.y += p.speedY;

        // Interactive subtle gravitational attraction to mouse
        if (mouse.x !== -1000) {
          const dx = mouse.x - p.x;
          const dy = mouse.y - p.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < 250) {
            const force = (250 - dist) / 2500;
            p.x += (dx / dist) * force * 1.8;
            p.y += (dy / dist) * force * 1.8;
          }
        }

        // Star wrapping bounds
        if (p.x < 0) p.x = width;
        if (p.x > width) p.x = 0;
        if (p.y < 0) p.y = height;
        if (p.y > height) p.y = 0;

        // Render solid particle shape
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fillStyle = `hsla(${p.hue}, 90%, 75%, ${p.alpha})`;
        ctx.fill();

        // Glowing corona for active large nodes
        if (p.size > 2.0) {
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.size * 3.5, 0, Math.PI * 2);
          ctx.fillStyle = `hsla(${p.hue}, 90%, 75%, ${p.alpha * 0.2})`;
          ctx.fill();
        }
      });

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseleave", handleMouseLeave);
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none -z-40 h-full w-full bg-[#030308]"
      id="cosmic-canvas"
    />
  );
}
