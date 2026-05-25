// Retro Arcade Sound Effects Generator using Web Audio API

let audioCtx: AudioContext | null = null;
let isMutedGlobal = false;

function getAudioContext(): AudioContext | null {
  if (typeof window === "undefined") return null;
  if (!audioCtx) {
    audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
  }
  return audioCtx;
}

export function setMuteGlobal(muted: boolean) {
  isMutedGlobal = muted;
}

export function playHoverSound() {
  if (isMutedGlobal) return;
  const ctx = getAudioContext();
  if (!ctx || ctx.state === "suspended") return;

  try {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = "sine";
    osc.frequency.setValueAtTime(440, ctx.currentTime); // A4
    osc.frequency.exponentialRampToValueAtTime(880, ctx.currentTime + 0.08); // Sweet high frequency rise

    gain.gain.setValueAtTime(0.012, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.1);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start();
    osc.stop(ctx.currentTime + 0.1);
  } catch (e) {
    // Ignore context blocked errors
  }
}

export function playClickSound() {
  if (isMutedGlobal) return;
  const ctx = getAudioContext();
  if (!ctx || ctx.state === "suspended") return;

  try {
    const osc = ctx.createOscillator();
    const osc2 = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = "triangle";
    osc.frequency.setValueAtTime(220, ctx.currentTime);
    osc.frequency.setValueAtTime(330, ctx.currentTime + 0.05);
    osc.frequency.exponentialRampToValueAtTime(880, ctx.currentTime + 0.15);

    osc2.type = "sine";
    osc2.frequency.setValueAtTime(110, ctx.currentTime);
    osc2.frequency.exponentialRampToValueAtTime(440, ctx.currentTime + 0.2);

    gain.gain.setValueAtTime(0.04, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.2);

    osc.connect(gain);
    osc2.connect(gain);
    gain.connect(ctx.destination);

    osc.start();
    osc2.start();
    osc.stop(ctx.currentTime + 0.2);
    osc2.stop(ctx.currentTime + 0.2);
  } catch (e) {
    // Ignore
  }
}

export function playSuccessSound() {
  if (isMutedGlobal) return;
  const ctx = getAudioContext();
  if (!ctx || ctx.state === "suspended") return;

  try {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = "sine";
    osc.frequency.setValueAtTime(523.25, ctx.currentTime); // C5
    osc.frequency.setValueAtTime(659.25, ctx.currentTime + 0.08); // E5
    osc.frequency.setValueAtTime(783.99, ctx.currentTime + 0.16); // G5
    osc.frequency.setValueAtTime(1046.50, ctx.currentTime + 0.24); // C6

    gain.gain.setValueAtTime(0.03, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.4);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start();
    osc.stop(ctx.currentTime + 0.4);
  } catch (e) {
    // Ignore
  }
}

export function playGlitchSound() {
  if (isMutedGlobal) return;
  const ctx = getAudioContext();
  if (!ctx || ctx.state === "suspended") return;

  try {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = "sawtooth";
    osc.frequency.setValueAtTime(100, ctx.currentTime);
    osc.frequency.setValueAtTime(120, ctx.currentTime + 0.03);
    osc.frequency.setValueAtTime(80, ctx.currentTime + 0.06);

    gain.gain.setValueAtTime(0.015, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.12);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start();
    osc.stop(ctx.currentTime + 0.12);
  } catch (e) {
    // Ignore
  }
}
