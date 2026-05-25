import { useEffect, useState, useRef } from "react";

export function CustomCursor() {
  const [position, setPosition] = useState({ x: -100, y: -100 });
  const [isHovered, setIsHovered] = useState(false);
  const [isHidden, setIsHidden] = useState(true);
  const [isClicking, setIsClicking] = useState(false);
  
  const outerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    // Detect mobile
    const isMobile = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
    if (isMobile) {
      return; // Disable on touch screens
    }

    setIsHidden(false);

    const handleMouseMove = (e: MouseEvent) => {
      setPosition({ x: e.clientX, y: e.clientY });
      
      // Select elements directly under mouse to see if clickable
      const target = e.target as HTMLElement | null;
      if (target) {
        const isClickable = 
          target.tagName === "BUTTON" || 
          target.tagName === "A" || 
          target.closest("button") || 
          target.closest("a") || 
          target.closest(".group") || 
          target.classList.contains("cursor-pointer") ||
          target.id?.includes("interactive");
        setIsHovered(!!isClickable);
      }
    };

    const handleMouseDown = () => setIsClicking(true);
    const handleMouseUp = () => setIsClicking(false);

    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mousedown", handleMouseDown);
    window.addEventListener("mouseup", handleMouseUp);

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mousedown", handleMouseDown);
      window.removeEventListener("mouseup", handleMouseUp);
    };
  }, []);

  if (isHidden) return null;

  return (
    <>
      {/* Outer follow-ring */}
      <div
        ref={outerRef}
        style={{
          transform: `translate3d(${position.x}px, ${position.y}px, 0) translate(-50%, -50%) scale(${isHovered ? 1.6 : isClicking ? 0.8 : 1})`,
          transition: "transform 0.1s cubic-bezier(0.25, 1, 0.5, 1), opacity 0.2s ease",
        }}
        className={`fixed top-0 left-0 w-8 h-8 rounded-full border pointer-events-none z-50 transition-colors duration-300 ${
          isHovered 
            ? "border-purple-400 bg-purple-500/10 shadow-[0_0_12px_rgba(168,85,247,0.4)]" 
            : "border-cyan-400/50 shadow-[0_0_6px_rgba(34,211,238,0.2)]"
        }`}
      />
      {/* Inner precise pointer dot */}
      <div
        style={{
          transform: `translate3d(${position.x}px, ${position.y}px, 0) translate(-50%, -50%)`,
          transition: "transform 0.02s linear",
        }}
        className={`fixed top-0 left-0 w-2 h-2 rounded-full pointer-events-none z-50 transition-colors duration-300 ${
          isHovered ? "bg-purple-400" : "bg-cyan-400"
        }`}
      />
    </>
  );
}
