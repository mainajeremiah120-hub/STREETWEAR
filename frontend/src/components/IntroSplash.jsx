import { useEffect, useRef, useState } from "react";
import { api } from "../api/client.js";

// Real product photos as a last-resort fallback if the API is unreachable —
// same loremflickr source the catalog seed itself uses.
const FALLBACK_GARMENTS = [
  { image: "https://loremflickr.com/600/750/hoodie?lock=901", name: "HOODIE / DROP 01", category: "hoodies" },
  { image: "https://loremflickr.com/600/750/cap,streetwear?lock=902", name: "TRUCKER CAP", category: "headwear" },
  { image: "https://loremflickr.com/600/750/sneakers?lock=903", name: "STREET KICKS", category: "footwear" },
];

const SLOTS = ["ga", "gb", "gc"];
const CLASH_TEXT = "THE CLASH";

export default function IntroSplash({ onEnter }) {
  const [started, setStarted] = useState(false);
  const [exiting, setExiting] = useState(false);
  const [tilt, setTilt] = useState({ x: 0, y: 0 });
  const [garments, setGarments] = useState(FALLBACK_GARMENTS);
  const [typed, setTyped] = useState("");
  const stageRef = useRef(null);
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

  useEffect(() => {
    api
      .getProducts("?featured=true")
      .then((data) => {
        if (data && data.length) setGarments(data.slice(0, 3));
      })
      .catch(() => {
        // keep fallback photos
      });
  }, []);

  function handlePointerMove(e) {
    if (reduceMotion || !stageRef.current) return;
    const rect = stageRef.current.getBoundingClientRect();
    const px = (e.clientX - rect.left) / rect.width - 0.5;
    const py = (e.clientY - rect.top) / rect.height - 0.5;
    setTilt({ x: px * 14, y: py * -14 });
  }

  function enter() {
    setExiting(true);
    setTimeout(onEnter, reduceMotion ? 0 : 620);
  }

  return (
    <div
      className={`intro${exiting ? " intro-exit" : ""}`}
      ref={stageRef}
      onPointerMove={handlePointerMove}
      role="dialog"
      aria-label="STREETWEAR intro"
    >
      <div className="intro-smoke" aria-hidden="true">
        <span className="blob blob-a" />
        <span className="blob blob-b" />
        <span className="blob blob-c" />
      </div>
      <div className="intro-grain" aria-hidden="true" />

      <div
        className="intro-garments"
        style={{ "--mx": `${tilt.x}deg`, "--my": `${tilt.y}deg` }}
        aria-hidden="true"
      >
        {garments.map((g, i) => (
          <div className={`intro-garment ${SLOTS[i]}`} key={g._id || g.name}>
            <div className="intro-garment-photo">
              <img src={g.image} alt="" loading="eager" />
            </div>
            <span>{g.name || g.category}</span>
          </div>
        ))}
      </div>

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
