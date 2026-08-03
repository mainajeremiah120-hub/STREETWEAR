import { useEffect, useRef, useState } from "react";
import blackHoodie from "../assets/black-hoodie.jpg";
import tshirtLoyalty from "../assets/t-shirt-loyalty.jpg";

// Bundled directly into the frontend build (served from Vercel's static CDN)
// instead of fetched from the API — no backend round-trip or cold-start
// delay before these can start rendering. Repeated to tile a full-bleed
// photo grid — a "cabro" paving-block pattern — behind the splash.
const TILE_PHOTOS = [tshirtLoyalty, blackHoodie];
// Cycled per tile for a mosaic of squares, parallelograms, and trapezoids
// instead of a uniform grid.
const TILE_SHAPES = ["sq", "para-r", "trap", "para-l"];
// Generous count so the grid always has enough tiles to reach the bottom
// of tall/wide screens — excess is simply clipped by the grid's overflow.
const GRID_TILES = Array.from({ length: 120 }, (_, i) => ({
  src: TILE_PHOTOS[i % TILE_PHOTOS.length],
  shape: TILE_SHAPES[i % TILE_SHAPES.length],
}));

const CLASH_TEXT = "THE CLASH";

export default function IntroSplash({ onEnter }) {
  const [started, setStarted] = useState(false);
  const [exiting, setExiting] = useState(false);
  const [typed, setTyped] = useState("");
  const audioCtxRef = useRef(null);
  const typeTimerRef = useRef(null);
  const reduceMotion =
    typeof window !== "undefined" &&
    window.matchMedia &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "";
    };
  }, []);

  function startTyping() {
    clearInterval(typeTimerRef.current);
    if (reduceMotion) {
      setTyped(CLASH_TEXT);
      setTimeout(enter, 500);
      return;
    }
    setTyped("");
    let i = 0;
    typeTimerRef.current = setInterval(() => {
      i += 1;
      setTyped(CLASH_TEXT.slice(0, i));
      if (CLASH_TEXT[i - 1] !== " ") playKeySound();
      if (i >= CLASH_TEXT.length) {
        clearInterval(typeTimerRef.current);
        setTimeout(enter, 650);
      }
    }, 150);
  }

  // Typing only begins once the gate is tapped — that tap is also the user
  // gesture that unlocks audio, so the clacks are guaranteed to be heard
  // every single time, not just after browsers decide to allow it.
  useEffect(() => {
    if (!started) return;
    startTyping();
    return () => clearInterval(typeTimerRef.current);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [started, reduceMotion]);

  function handleGateEnter() {
    const ctx = getAudioCtx();
    if (ctx && ctx.state === "suspended") ctx.resume().catch(() => {});
    setStarted(true);
  }

  function getAudioCtx() {
    const Ctx = window.AudioContext || window.webkitAudioContext;
    if (!Ctx) return null;
    if (!audioCtxRef.current) audioCtxRef.current = new Ctx();
    return audioCtxRef.current;
  }

  // A short filtered burst of noise reads as a mechanical key-clack —
  // closer to a real typewriter than a pure tone beep.
  function playKeySound() {
    try {
      const ctx = getAudioCtx();
      if (!ctx) return;
      if (ctx.state === "suspended") ctx.resume().catch(() => {});

      const dur = 0.06;
      const buffer = ctx.createBuffer(1, ctx.sampleRate * dur, ctx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let n = 0; n < data.length; n++) {
        data[n] = (Math.random() * 2 - 1) * (1 - n / data.length);
      }
      const noise = ctx.createBufferSource();
      noise.buffer = buffer;

      const filter = ctx.createBiquadFilter();
      filter.type = "bandpass";
      filter.frequency.value = 2200 + Math.random() * 800;
      filter.Q.value = 1.1;

      const gain = ctx.createGain();
      gain.gain.setValueAtTime(0.0001, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.55, ctx.currentTime + 0.004);
      gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + dur);

      noise.connect(filter).connect(gain).connect(ctx.destination);
      noise.start();
      noise.stop(ctx.currentTime + dur);
    } catch {
      // audio unsupported/blocked — typing still proceeds silently
    }
  }

  function enter() {
    setExiting(true);
    setTimeout(onEnter, reduceMotion ? 0 : 620);
  }

  return (
    <div
      className={`intro${exiting ? " intro-exit" : ""}`}
      role="dialog"
      aria-label="STREETWEAR intro"
    >
      <div className="intro-photo-grid" aria-hidden="true">
        {GRID_TILES.map((t, i) => (
          <div className={`intro-photo-tile tile-${t.shape}`} key={i}>
            <img src={t.src} alt="" loading="eager" />
          </div>
        ))}
      </div>
      <div className="intro-photo-overlay" aria-hidden="true" />
      <div className="intro-grain" aria-hidden="true" />

      {!started ? (
        <div className="intro-gate">
          <p className="intro-eyebrow">
            <span className="intro-brand">STREETWEAR</span>{" "}
            <span className="intro-eyebrow-sub">PRESENTS</span>
          </p>
          <h1 className="intro-gate-title flash-text">WEAR THE CLASH</h1>
          <button className="btn intro-btn intro-gate-btn" onClick={handleGateEnter}>
            Visit our shop →
          </button>
        </div>
      ) : (
        <div className="intro-content">
          <p className="intro-eyebrow">
            <span className="intro-brand">STREETWEAR</span>{" "}
            <span className="intro-eyebrow-sub">PRESENTS</span>
          </p>
          <h1 className="intro-title">
            <span className="flash-text">WEAR</span>
            <br />
            <span className="outline-text">
              {typed}
              <span className="intro-cursor" aria-hidden="true" />
            </span>
          </h1>
          <p className="intro-sub">
            Heavyweight streetwear, drop culture, no restocks. Step in.
          </p>
        </div>
      )}
    </div>
  );
}
