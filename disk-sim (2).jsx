import { useState, useEffect, useRef, useCallback } from "react";

// ── ALGORITHMS ──────────────────────────────────────────────────────────────
function fcfs(head, reqs) {
  const seq = [head, ...reqs];
  let total = 0;
  for (let i = 1; i < seq.length; i++) total += Math.abs(seq[i] - seq[i - 1]);
  return { sequence: seq, total, avgSeek: reqs.length ? total / reqs.length : 0 };
}

function sstf(head, reqs) {
  const seq = [head];
  let rem = [...reqs], cur = head, total = 0;
  while (rem.length) {
    const n = rem.reduce((a, b) => Math.abs(b - cur) < Math.abs(a - cur) ? b : a);
    total += Math.abs(n - cur); cur = n;
    seq.push(n); rem = rem.filter(r => r !== n);
  }
  return { sequence: seq, total, avgSeek: reqs.length ? total / reqs.length : 0 };
}

function scan(head, reqs, dir, size) {
  const seq = [head]; let total = 0, cur = head;
  const s = [...reqs].sort((a, b) => a - b);
  const R = s.filter(r => r >= head), L = s.filter(r => r < head).reverse();
  if (dir === "right") {
    for (const r of R) { total += Math.abs(r - cur); cur = r; seq.push(r); }
    if (R.length) { total += Math.abs(size - 1 - cur); cur = size - 1; seq.push(size - 1); }
    for (const r of L) { total += Math.abs(r - cur); cur = r; seq.push(r); }
  } else {
    for (const r of L) { total += Math.abs(r - cur); cur = r; seq.push(r); }
    if (L.length) { total += Math.abs(0 - cur); cur = 0; seq.push(0); }
    for (const r of R) { total += Math.abs(r - cur); cur = r; seq.push(r); }
  }
  return { sequence: seq, total, avgSeek: reqs.length ? total / reqs.length : 0 };
}

function getGrade(m, best, worst) {
  const p = worst === best ? 1 : (worst - m) / (worst - best);
  if (p >= 0.85) return { grade: "A+", label: "Excellent", stars: 5 };
  if (p >= 0.65) return { grade: "A", label: "Great", stars: 4 };
  if (p >= 0.45) return { grade: "B", label: "Good", stars: 3 };
  if (p >= 0.25) return { grade: "C", label: "Average", stars: 2 };
  return { grade: "D", label: "Poor", stars: 1 };
}

// ── ICONS (all explicit named components) ───────────────────────────────────
function IcoDisk() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <ellipse cx="12" cy="12" rx="10" ry="4"/>
      <path d="M2 12c0 2.21 4.48 4 10 4s10-1.79 10-4"/>
      <path d="M2 12v6c0 2.21 4.48 4 10 4s10-1.79 10-4v-6"/>
      <circle cx="12" cy="12" r="1" fill="currentColor"/>
    </svg>
  );
}
function IcoCpu() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <rect x="4" y="4" width="16" height="16" rx="2"/>
      <rect x="9" y="9" width="6" height="6"/>
      <path d="M9 2v2M15 2v2M9 20v2M15 20v2M2 9h2M2 15h2M20 9h2M20 15h2"/>
    </svg>
  );
}
function IcoPlay() {
  return <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor"><polygon points="5,3 19,12 5,21"/></svg>;
}
function IcoPause() {
  return <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor"><rect x="6" y="4" width="4" height="16"/><rect x="14" y="4" width="4" height="16"/></svg>;
}
function IcoPrev() {
  return <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="15,18 9,12 15,6"/></svg>;
}
function IcoNext() {
  return <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="9,18 15,12 9,6"/></svg>;
}
function IcoReset() {
  return <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M1 4v6h6"/><path d="M3.51 15a9 9 0 1 0 .49-3.5"/></svg>;
}
function IcoRandom() {
  return <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="16,3 21,3 21,8"/><line x1="4" y1="20" x2="21" y2="3"/><polyline points="21,16 21,21 16,21"/><line x1="15" y1="15" x2="21" y2="21"/></svg>;
}
function IcoCheck() {
  return <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="20,6 9,17 4,12"/></svg>;
}
function IcoZap() {
  return <svg width="11" height="11" viewBox="0 0 24 24" fill="currentColor"><polygon points="13,2 3,14 12,14 11,22 21,10 12,10"/></svg>;
}
function IcoArrowRight() {
  return <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12,5 19,12 12,19"/></svg>;
}
function IcoArrowDir({ dir }) {
  const pts = dir === "right" ? "12,5 19,12 12,19" : "12,5 5,12 12,19";
  return (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <line x1="5" y1="12" x2="19" y2="12"/>
      <polyline points={pts}/>
    </svg>
  );
}
function IcoStar({ filled }) {
  return (
    <svg width="13" height="13" viewBox="0 0 24 24" fill={filled ? "currentColor" : "none"} stroke="currentColor" strokeWidth="1.5">
      <polygon points="12,2 15.09,8.26 22,9.27 17,14.14 18.18,21.02 12,17.77 5.82,21.02 7,14.14 2,9.27 8.91,8.26"/>
    </svg>
  );
}
function IcoInput() {
  return <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>;
}
function IcoVisual() {
  return <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><rect x="2" y="3" width="20" height="14" rx="2"/><line x1="8" y1="21" x2="16" y2="21"/><line x1="12" y1="17" x2="12" y2="21"/></svg>;
}
function IcoChart() {
  return <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg>;
}
function IcoCompare() {
  return <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M9 3H5a2 2 0 0 0-2 2v4m6-6h10a2 2 0 0 1 2 2v4M9 3v18m0 0h10a2 2 0 0 0 2-2V9M9 21H5a2 2 0 0 1-2-2V9m0 0h18"/></svg>;
}
function IcoBook() {
  return <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/></svg>;
}
function IcoReport() {
  return <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14,2 14,8 20,8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg>;
}

// ── HOOKS ───────────────────────────────────────────────────────────────────
function useInView(threshold) {
  const ref = useRef(null);
  const [inView, setInView] = useState(false);
  useEffect(() => {
    const obs = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setInView(true); },
      { threshold: threshold || 0.1 }
    );
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, []);
  return [ref, inView];
}

// ── ANIMATED COUNTER ────────────────────────────────────────────────────────
function AnimCounter({ value }) {
  const [display, setDisplay] = useState(0);
  const rafRef = useRef(null);
  useEffect(() => {
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    const start = performance.now();
    const duration = 900;
    const from = 0;
    function step(ts) {
      const p = Math.min((ts - start) / duration, 1);
      const ease = 1 - Math.pow(1 - p, 4);
      setDisplay(Math.round(from + (value - from) * ease));
      if (p < 1) rafRef.current = requestAnimationFrame(step);
    }
    rafRef.current = requestAnimationFrame(step);
    return () => { if (rafRef.current) cancelAnimationFrame(rafRef.current); };
  }, [value]);
  return <span>{display}</span>;
}

// ── SCROLL STACK TEXT ────────────────────────────────────────────────────────
function ScrollStack({ words }) {
  const [idx, setIdx] = useState(0);
  const [out, setOut] = useState(false);
  useEffect(() => {
    const t = setInterval(() => {
      setOut(true);
      setTimeout(() => {
        setIdx(i => (i + 1) % words.length);
        setOut(false);
      }, 320);
    }, 2200);
    return () => clearInterval(t);
  }, [words.length]);
  return (
    <span style={{
      display: "inline-block", overflow: "hidden", verticalAlign: "bottom",
      minWidth: 240, padding: "0 14px", borderRadius: 8,
      background: "rgba(255,255,255,0.04)",
      border: "1px solid rgba(255,255,255,0.07)",
    }}>
      <span style={{
        display: "inline-block",
        opacity: out ? 0 : 1,
        transform: out ? "translateY(-12px)" : "translateY(0)",
        transition: "opacity 0.3s ease, transform 0.3s cubic-bezier(.4,0,.2,1)",
        background: "linear-gradient(90deg, #fff 0%, rgba(255,255,255,0.55) 100%)",
        WebkitBackgroundClip: "text",
        WebkitTextFillColor: "transparent",
      }}>
        {words[idx]}
      </span>
    </span>
  );
}

// ── REVEAL CARD ──────────────────────────────────────────────────────────────
function RevealCard({ children, delay, style }) {
  const [ref, inView] = useInView();
  const d = delay || 0;
  return (
    <div ref={ref} style={{
      ...(style || {}),
      opacity: inView ? 1 : 0,
      transform: inView ? "translateY(0)" : "translateY(24px)",
      transition: "opacity 0.55s ease " + d + "s, transform 0.55s cubic-bezier(.4,0,.2,1) " + d + "s",
    }}>
      {children}
    </div>
  );
}

// ── SKELETON ─────────────────────────────────────────────────────────────────
function Skel({ w, h, br }) {
  return (
    <div style={{
      width: w || "100%", height: h || 16, borderRadius: br || 6,
      background: "linear-gradient(90deg,#111 25%,#1c1c1c 50%,#111 75%)",
      backgroundSize: "600px 100%", animation: "shimmer 1.4s infinite",
    }} />
  );
}

// ── NEXT BUTTON ──────────────────────────────────────────────────────────────
function NextBtn({ label, onClick }) {
  const [hov, setHov] = useState(false);
  return (
    <div style={{ display: "flex", justifyContent: "center", padding: "44px 0 10px" }}>
      <button
        onClick={onClick}
        onMouseEnter={() => setHov(true)}
        onMouseLeave={() => setHov(false)}
        style={{
          display: "inline-flex", alignItems: "center", gap: 10,
          padding: hov ? "14px 44px" : "14px 32px",
          borderRadius: 100, border: "none", cursor: "pointer",
          background: hov
            ? "linear-gradient(135deg,#fff,#d8d8d8)"
            : "linear-gradient(135deg,#e8e8e8,#fff)",
          color: "#000",
          fontFamily: "'Outfit', sans-serif", fontSize: 14, fontWeight: 600,
          letterSpacing: 0.3,
          boxShadow: hov
            ? "0 8px 40px rgba(255,255,255,0.22), 0 2px 8px rgba(0,0,0,0.5)"
            : "0 4px 20px rgba(255,255,255,0.1)",
          transform: hov ? "scale(1.05) translateY(-2px)" : "scale(1) translateY(0)",
          transition: "all 0.3s cubic-bezier(.34,1.56,.64,1)",
        }}
      >
        <IcoArrowRight />
        {label}
      </button>
    </div>
  );
}

// ── GLOBAL STYLES ────────────────────────────────────────────────────────────
const CSS = `
@import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=DM+Mono:wght@300;400;500&family=Outfit:wght@300;400;500;600;700&display=swap');

*{box-sizing:border-box;margin:0;padding:0;}
:root{
  --bg:#050505;--s1:#0b0b0b;--s2:#111111;--s3:#181818;--s4:#202020;
  --b1:rgba(255,255,255,0.05);--b2:rgba(255,255,255,0.1);--b3:rgba(255,255,255,0.18);
  --w1:#ffffff;--w2:#e0e0e0;--w3:#aaaaaa;--w4:#666666;--w5:#333333;
}
html{scroll-behavior:smooth;}
body{background:var(--bg);color:var(--w2);font-family:'Outfit',sans-serif;-webkit-font-smoothing:antialiased;overflow-x:hidden;}
::-webkit-scrollbar{width:3px;}
::-webkit-scrollbar-track{background:transparent;}
::-webkit-scrollbar-thumb{background:var(--w5);border-radius:2px;}

@keyframes shimmer{0%{background-position:-600px 0}100%{background-position:600px 0}}
@keyframes pulse{0%,100%{opacity:1}50%{opacity:.25}}
@keyframes floatY{0%,100%{transform:translateY(0)}50%{transform:translateY(-5px)}}
@keyframes spinCw{to{transform:rotate(360deg)}}
@keyframes popIn{0%{transform:scale(0.82);opacity:0}65%{transform:scale(1.04)}100%{transform:scale(1);opacity:1}}
@keyframes slideL{from{opacity:0;transform:translateX(-18px)}to{opacity:1;transform:translateX(0)}}
@keyframes glowPulse{0%,100%{filter:brightness(1)}50%{filter:brightness(1.12)}}
@keyframes ringPulse{0%,100%{box-shadow:0 0 0 0 rgba(255,255,255,0.1)}60%{box-shadow:0 0 0 8px rgba(255,255,255,0)}}

.card{
  background:var(--s1);border:1px solid var(--b1);border-radius:18px;
  position:relative;overflow:hidden;
  transition:border-color .3s,box-shadow .3s,transform .25s;
}
.card::before{
  content:'';position:absolute;inset:0;border-radius:18px;pointer-events:none;
  background:linear-gradient(135deg,rgba(255,255,255,0.03) 0%,transparent 60%);
}
.card:hover{border-color:var(--b2);box-shadow:0 12px 48px rgba(0,0,0,0.55),inset 0 1px 0 rgba(255,255,255,0.04);}

.btn{
  display:inline-flex;align-items:center;gap:7px;padding:9px 18px;border-radius:10px;
  font-size:13px;font-family:'Outfit',sans-serif;font-weight:500;cursor:pointer;
  border:none;transition:all .2s;user-select:none;letter-spacing:.2px;white-space:nowrap;
}
.btn:active{transform:scale(0.95)!important;}
.bpri{background:white;color:black;}
.bpri:hover{background:#e8e8e8;box-shadow:0 0 28px rgba(255,255,255,0.14);}
.bgho{background:transparent;color:var(--w3);border:1px solid var(--b1);}
.bgho:hover{border-color:var(--b2);color:white;background:var(--s2);}
.bgho.act{border-color:var(--b3);color:white;background:var(--s2);}

input,textarea{
  width:100%;background:var(--s2);border:1px solid var(--b1);border-radius:11px;
  padding:12px 16px;color:var(--w2);font-family:'DM Mono',monospace;font-size:13px;
  outline:none;transition:all .25s;
}
input:focus,textarea:focus{border-color:var(--b3);background:var(--s3);box-shadow:0 0 0 3px rgba(255,255,255,0.04);}
input::placeholder{color:var(--w5);}

.stitle{
  font-family:'DM Mono',monospace;font-size:10px;letter-spacing:2px;color:var(--w4);
  text-transform:uppercase;display:flex;align-items:center;gap:10px;
}
.stitle::after{content:'';flex:1;height:1px;background:linear-gradient(90deg,var(--b2),transparent);}

.tab{
  display:flex;align-items:center;gap:6px;padding:8px 14px;border-radius:9px;
  font-size:13px;font-weight:500;cursor:pointer;transition:all .2s;
  color:var(--w4);white-space:nowrap;border:none;background:transparent;
  font-family:'Outfit',sans-serif;
}
.tab:hover{color:var(--w3);background:var(--s2);}
.tab.act{background:var(--s2);color:white;border:1px solid var(--b2);}

.chip{
  padding:7px 12px;border-radius:9px;font-family:'DM Mono',monospace;
  font-size:12px;border:1px solid;cursor:default;
  transition:all .35s cubic-bezier(.34,1.56,.64,1);
}

.noise-overlay{
  position:fixed;top:0;left:0;width:100%;height:100%;pointer-events:none;z-index:0;opacity:0.018;
  background-image:url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E");
}
`;

// ── PARALLAX BG ──────────────────────────────────────────────────────────────
function ParallaxBg() {
  const ref = useRef(null);
  useEffect(() => {
    function onMove(e) {
      if (!ref.current) return;
      const x = (e.clientX / window.innerWidth - 0.5) * 18;
      const y = (e.clientY / window.innerHeight - 0.5) * 18;
      ref.current.style.transform = "translate(" + x + "px," + y + "px)";
    }
    window.addEventListener("mousemove", onMove);
    return () => window.removeEventListener("mousemove", onMove);
  }, []);
  return (
    <div style={{ position: "fixed", top: 0, left: 0, width: "100%", height: "100%", pointerEvents: "none", zIndex: 0 }}>
      <div ref={ref} style={{ width: "100%", height: "100%", transition: "transform 0.9s cubic-bezier(.4,0,.2,1)" }}>
        <div style={{ position: "absolute", top: "8%", left: "4%", width: 420, height: 420, borderRadius: "50%", background: "radial-gradient(circle,rgba(255,255,255,0.022) 0%,transparent 70%)", filter: "blur(50px)" }} />
        <div style={{ position: "absolute", bottom: "12%", right: "6%", width: 320, height: 320, borderRadius: "50%", background: "radial-gradient(circle,rgba(255,255,255,0.016) 0%,transparent 70%)", filter: "blur(40px)" }} />
      </div>
    </div>
  );
}

// ── APP ──────────────────────────────────────────────────────────────────────
export default function App() {
  const [tab, setTab] = useState("input");
  const [diskSize, setDiskSize] = useState(200);
  const [headPos, setHeadPos] = useState(35);
  const [queueStr, setQueueStr] = useState("110, 118, 167, 23, 193, 161, 75, 95");
  const [scanDir, setScanDir] = useState("right");
  const [results, setResults] = useState(null);
  const [hasRun, setHasRun] = useState(false);
  const [loading, setLoading] = useState(false);
  const [vAlgo, setVAlgo] = useState("FCFS");
  const [vStep, setVStep] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [speed, setSpeed] = useState("med");
  const [cmpQ, setCmpQ] = useState({ head: 80, queue: "55, 120, 45, 180, 30, 90", dir: "left" });
  const [cmpRes, setCmpRes] = useState(null);
  const [loaded, setLoaded] = useState(false);
  const ivRef = useRef(null);
  const speedMap = { slow: 1200, med: 650, fast: 280 };

  const parseQ = useCallback((s) => {
    return s.split(",").map(x => parseInt(x.trim())).filter(n => !isNaN(n) && n >= 0 && n < diskSize);
  }, [diskSize]);

  useEffect(() => { setTimeout(() => setLoaded(true), 100); }, []);

  const runSim = useCallback(() => {
    const reqs = parseQ(queueStr);
    if (!reqs.length) return;
    setLoading(true);
    setTimeout(() => {
      setResults({
        FCFS: fcfs(headPos, reqs),
        SSTF: sstf(headPos, reqs),
        SCAN: scan(headPos, reqs, scanDir, diskSize),
      });
      setHasRun(true);
      setVStep(0);
      setPlaying(false);
      setLoading(false);
      setTab("visualize");
    }, 800);
  }, [headPos, queueStr, scanDir, diskSize, parseQ]);

  const runCmp = () => {
    const reqs = parseQ(cmpQ.queue);
    if (!reqs.length) return;
    setCmpRes({
      FCFS: fcfs(cmpQ.head, reqs),
      SSTF: sstf(cmpQ.head, reqs),
      SCAN: scan(cmpQ.head, reqs, cmpQ.dir, diskSize),
    });
  };

  const randomize = () => {
    setHeadPos(Math.floor(Math.random() * diskSize));
    setQueueStr(Array.from({ length: 7 }, () => Math.floor(Math.random() * diskSize)).join(", "));
  };

  useEffect(() => {
    if (ivRef.current) clearInterval(ivRef.current);
    if (!playing || !results) return;
    const seq = results[vAlgo].sequence;
    ivRef.current = setInterval(() => {
      setVStep(s => {
        if (s >= seq.length - 1) { setPlaying(false); return s; }
        return s + 1;
      });
    }, speedMap[speed]);
    return () => { if (ivRef.current) clearInterval(ivRef.current); };
  }, [playing, vAlgo, speed, results]);

  const curSeq = results ? results[vAlgo].sequence : [];
  const curHead = curSeq[vStep] !== undefined ? curSeq[vStep] : headPos;
  const totalMov = curSeq.slice(0, vStep + 1).reduce((s, v, i, a) => i === 0 ? 0 : s + Math.abs(v - a[i - 1]), 0);

  const TABS = [
    { id: "input", label: "Input", icon: <IcoInput /> },
    { id: "visualize", label: "Visualize", icon: <IcoVisual /> },
    { id: "charts", label: "Charts", icon: <IcoChart /> },
    { id: "compare", label: "Compare", icon: <IcoCompare /> },
    { id: "learn", label: "Learn", icon: <IcoBook /> },
    { id: "report", label: "Report", icon: <IcoReport /> },
  ];

  const noSim = (
    <div className="card" style={{ padding: 60, textAlign: "center" }}>
      <div style={{ fontSize: 11, color: "var(--w5)", fontFamily: "'DM Mono'", letterSpacing: 2, marginBottom: 12 }}>NO DATA</div>
      <p style={{ color: "var(--w4)", fontSize: 13, marginBottom: 24 }}>Run a simulation from the Input tab first</p>
      <button className="btn bpri" onClick={() => setTab("input")}>Go to Input</button>
    </div>
  );

  function getBest(r) { return Math.min(r.FCFS.total, r.SSTF.total, r.SCAN.total); }
  function getWorst(r) { return Math.max(r.FCFS.total, r.SSTF.total, r.SCAN.total); }

  return (
    <>
      <style>{CSS}</style>
      <div className="noise-overlay" />
      <ParallaxBg />

      {/* NAV */}
      <nav style={{
        position: "sticky", top: 0, zIndex: 200,
        background: "rgba(5,5,5,0.88)", backdropFilter: "blur(24px) saturate(180%)",
        borderBottom: "1px solid var(--b1)",
        padding: "0 28px", display: "flex", alignItems: "center",
        justifyContent: "space-between", height: 58, gap: 16,
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, flexShrink: 0 }}>
          <div style={{
            width: 34, height: 34, borderRadius: 10,
            background: "linear-gradient(135deg,#fff,#ccc)",
            display: "flex", alignItems: "center", justifyContent: "center", color: "black",
            boxShadow: "0 4px 12px rgba(255,255,255,0.14)",
            animation: "floatY 4s ease-in-out infinite",
          }}>
            <IcoDisk />
          </div>
          <div>
            <div style={{
              fontFamily: "'Bebas Neue'", fontSize: 15, letterSpacing: 3, lineHeight: 1,
              background: "linear-gradient(135deg,#fff,#888)",
              WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
            }}>DISK SCHEDULING</div>
            <div style={{ fontFamily: "'DM Mono'", fontSize: 8, color: "var(--w4)", letterSpacing: 2 }}>ALGORITHM</div>
          </div>
        </div>

        <div style={{ display: "flex", gap: 2 }}>
          {TABS.map(t => (
            <button key={t.id} className={"tab" + (tab === t.id ? " act" : "")} onClick={() => setTab(t.id)}>
              {t.icon}{t.label}
            </button>
          ))}
        </div>

        <div style={{ flexShrink: 0 }}>
          {hasRun ? (
            <div style={{
              display: "flex", alignItems: "center", gap: 7,
              padding: "5px 12px", background: "var(--s2)", border: "1px solid var(--b1)",
              borderRadius: 8, fontSize: 11, color: "var(--w3)", fontFamily: "'DM Mono'",
              animation: "ringPulse 3s ease-in-out infinite",
            }}>
              <div style={{ width: 5, height: 5, borderRadius: "50%", background: "white", animation: "pulse 2s infinite" }} />
              ACTIVE
            </div>
          ) : (
            <div style={{ padding: "5px 12px", background: "var(--s1)", border: "1px solid var(--b1)", borderRadius: 8, fontSize: 11, color: "var(--w5)", fontFamily: "'DM Mono'" }}>IDLE</div>
          )}
        </div>
      </nav>

      <main style={{ padding: "32px 28px", maxWidth: 1080, margin: "0 auto", position: "relative", zIndex: 1 }}>

        {/* ══════ INPUT ══════ */}
        {tab === "input" && (
          <div>
            {/* Hero */}
            <div style={{
              textAlign: "center", padding: "52px 0 56px",
              opacity: loaded ? 1 : 0,
              transform: loaded ? "translateY(0)" : "translateY(28px)",
              transition: "all 0.75s cubic-bezier(.4,0,.2,1)",
            }}>
              <div style={{
                display: "inline-flex", alignItems: "center", gap: 8,
                padding: "5px 14px", background: "var(--s2)",
                border: "1px solid var(--b1)", borderRadius: 20,
                fontSize: 10, color: "var(--w4)", fontFamily: "'DM Mono'", letterSpacing: 1.5,
                marginBottom: 24, animation: "slideL 0.6s ease 0.2s both",
              }}>
                <IcoCpu /> OS · COMPARATIVE ANALYSIS
              </div>
              <h1 style={{
                fontFamily: "'Bebas Neue'", letterSpacing: 6, lineHeight: 0.9,
                fontSize: "clamp(56px,9vw,104px)", marginBottom: 24,
                animation: "glowPulse 4s ease infinite",
              }}>
                <span style={{
                  background: "linear-gradient(160deg,#fff 20%,#444 100%)",
                  WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
                  display: "block",
                }}>DISK SCHEDULING</span>
                <ScrollStack words={["ALGORITHM", "VISUALIZER", "SIMULATOR", "ANALYZER"]} />
              </h1>
            </div>

            {/* Input Card */}
            <RevealCard>
              <div className="card" style={{ padding: 32, marginBottom: 20 }}>
                <div className="stitle" style={{ marginBottom: 24 }}>Simulation Parameters</div>
                <div style={{ display: "grid", gridTemplateColumns: "160px 160px 1fr", gap: 18, marginBottom: 24 }}>
                  <div>
                    <div style={{ fontSize: 10, color: "var(--w4)", fontFamily: "'DM Mono'", letterSpacing: 1.5, marginBottom: 8 }}>DISK SIZE · Cylinders</div>
                    <input type="number" value={diskSize} onChange={e => setDiskSize(parseInt(e.target.value) || 200)} />
                  </div>
                  <div>
                    <div style={{ fontSize: 10, color: "var(--w4)", fontFamily: "'DM Mono'", letterSpacing: 1.5, marginBottom: 8 }}>HEAD POSITION · Start</div>
                    <input type="number" value={headPos} onChange={e => setHeadPos(parseInt(e.target.value) || 0)} />
                  </div>
                  <div>
                    <div style={{ fontSize: 10, color: "var(--w4)", fontFamily: "'DM Mono'", letterSpacing: 1.5, marginBottom: 8 }}>REQUEST QUEUE · Comma-separated</div>
                    <input type="text" value={queueStr} onChange={e => setQueueStr(e.target.value)} placeholder="e.g. 82, 170, 43, 140..." />
                  </div>
                </div>

                <div style={{ marginBottom: 28 }}>
                  <div style={{ fontSize: 10, color: "var(--w4)", fontFamily: "'DM Mono'", letterSpacing: 1.5, marginBottom: 12 }}>SCAN DIRECTION</div>
                  <div style={{ display: "flex", gap: 8 }}>
                    {["right", "left"].map(d => (
                      <button key={d} className={"btn " + (scanDir === d ? "bpri" : "bgho")} onClick={() => setScanDir(d)}>
                        <IcoArrowDir dir={d} />
                        {d.charAt(0).toUpperCase() + d.slice(1)}
                      </button>
                    ))}
                  </div>
                </div>

                <div style={{ display: "flex", gap: 10, paddingTop: 20, borderTop: "1px solid var(--b1)", flexWrap: "wrap" }}>
                  <button className="btn bpri" onClick={runSim} style={{ padding: "11px 28px", fontSize: 14, fontWeight: 600 }}>
                    {loading ? (
                      <>
                        <div style={{ width: 13, height: 13, border: "2px solid black", borderTopColor: "transparent", borderRadius: "50%", animation: "spinCw 0.7s linear infinite" }} />
                        Processing...
                      </>
                    ) : (
                      <><IcoPlay />Run Simulation</>
                    )}
                  </button>
                  <button className="btn bgho" onClick={randomize}><IcoRandom />Randomize</button>
                  <button className="btn bgho" onClick={() => { setDiskSize(200); setHeadPos(35); setQueueStr("110, 118, 167, 23, 193, 161, 75, 95"); setScanDir("right"); }}>
                    <IcoReset />Reset
                  </button>
                </div>
              </div>
            </RevealCard>

            {/* Algo Preview Cards */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 16 }}>
              {loading ? (
                [0, 1, 2].map(i => (
                  <div key={i} className="card" style={{ padding: 24 }}>
                    <Skel h={32} br={4} w="60%" /><div style={{ height: 8 }} />
                    <Skel h={11} br={3} w="80%" /><div style={{ height: 16 }} />
                    <Skel h={13} br={3} /><div style={{ height: 6 }} />
                    <Skel h={13} br={3} w="85%" />
                  </div>
                ))
              ) : (
                [
                  { name: "FCFS", sub: "First Come First Serve", desc: "Serves requests in arrival order. Simple and fair, but causes high head movement.", badge: "SIMPLE" },
                  { name: "SSTF", sub: "Shortest Seek Time First", desc: "Jumps to the nearest pending request. Efficient but can starve distant tracks.", badge: "EFFICIENT" },
                  { name: "SCAN", sub: "Elevator Algorithm", desc: "Sweeps in one direction then reverses. Balances efficiency with fairness.", badge: "BALANCED" },
                ].map(({ name, sub, desc, badge }, i) => (
                  <RevealCard key={name} delay={0.08 + i * 0.1}>
                    <div className="card" style={{ padding: 24, height: "100%", cursor: "default" }}
                      onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-4px) scale(1.01)"; e.currentTarget.style.borderColor = "var(--b2)"; }}
                      onMouseLeave={e => { e.currentTarget.style.transform = "translateY(0) scale(1)"; e.currentTarget.style.borderColor = "var(--b1)"; }}>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 14 }}>
                        <div style={{
                          fontFamily: "'Bebas Neue'", fontSize: 32, letterSpacing: 4, lineHeight: 1,
                          background: "linear-gradient(135deg,#fff,#888)",
                          WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
                        }}>{name}</div>
                        <span style={{ fontSize: 9, padding: "3px 8px", border: "1px solid var(--b2)", borderRadius: 5, color: "var(--w4)", fontFamily: "'DM Mono'", letterSpacing: 1 }}>{badge}</span>
                      </div>
                      <div style={{ fontSize: 11, color: "var(--w4)", fontFamily: "'DM Mono'", marginBottom: 12 }}>{sub}</div>
                      <p style={{ fontSize: 13, color: "var(--w3)", lineHeight: 1.75 }}>{desc}</p>
                    </div>
                  </RevealCard>
                ))
              )}
            </div>
            <NextBtn label="View Visualize" onClick={() => setTab("visualize")} />
          </div>
        )}

        {/* ══════ VISUALIZE ══════ */}
        {tab === "visualize" && (
          <div>
            {!hasRun ? noSim : (
              <>
                {/* Algo tabs + total */}
                <RevealCard>
                  <div style={{ display: "flex", gap: 8, marginBottom: 22, alignItems: "center" }}>
                    {["FCFS", "SSTF", "SCAN"].map(a => (
                      <button key={a} className={"btn " + (vAlgo === a ? "bpri" : "bgho")}
                        style={{ fontFamily: "'Bebas Neue'", fontSize: 16, letterSpacing: 3, padding: "9px 24px" }}
                        onClick={() => { setVAlgo(a); setVStep(0); setPlaying(false); }}>
                        {a}
                      </button>
                    ))}
                    <div style={{ marginLeft: "auto", fontSize: 11, color: "var(--w4)", fontFamily: "'DM Mono'" }}>
                      Total: <span style={{ color: "white", fontSize: 20, fontFamily: "'Bebas Neue'", letterSpacing: 2, marginLeft: 4 }}>
                        <AnimCounter value={results[vAlgo].total} />
                      </span> <span style={{ marginLeft: 2 }}>tracks</span>
                    </div>
                  </div>
                </RevealCard>

                {/* Track Visualizer */}
                <RevealCard delay={0.08}>
                  <div className="card" style={{ padding: 32, marginBottom: 16 }}>
                    <div className="stitle" style={{ marginBottom: 28 }}>Track Position (0 – {diskSize - 1})</div>

                    <div style={{ position: "relative", margin: "0 12px 52px" }}>
                      {/* Track line */}
                      <div style={{ height: 3, background: "var(--s3)", borderRadius: 2, position: "relative" }}>
                        {/* Fill */}
                        <div style={{
                          position: "absolute", left: 0, top: 0, height: "100%", borderRadius: 2,
                          background: "linear-gradient(90deg,rgba(255,255,255,0.12),white)",
                          width: (curHead / (diskSize - 1) * 100) + "%",
                          transition: "width 0.5s cubic-bezier(.4,0,.2,1)",
                          boxShadow: "0 0 8px rgba(255,255,255,0.18)",
                        }} />
                        {/* Request dots */}
                        {parseQ(queueStr).map((r, i) => {
                          const visited = curSeq.slice(0, vStep + 1).includes(r);
                          return (
                            <div key={i} style={{
                              position: "absolute", top: "50%",
                              left: (r / (diskSize - 1) * 100) + "%",
                              transform: "translate(-50%,-50%)",
                              width: visited ? 11 : 7, height: visited ? 11 : 7,
                              borderRadius: "50%",
                              background: visited ? "white" : "var(--s4)",
                              border: "1px solid rgba(255,255,255,0.25)",
                              boxShadow: visited ? "0 0 10px rgba(255,255,255,0.45)" : "none",
                              transition: "all 0.4s cubic-bezier(.34,1.56,.64,1)",
                              zIndex: 2,
                            }}>
                              <div style={{
                                position: "absolute", bottom: "130%", left: "50%",
                                transform: "translateX(-50%)",
                                fontSize: 9, color: visited ? "var(--w3)" : "var(--w5)",
                                fontFamily: "'DM Mono'", whiteSpace: "nowrap",
                                transition: "color 0.3s",
                              }}>{r}</div>
                            </div>
                          );
                        })}
                        {/* Head marker */}
                        <div style={{
                          position: "absolute", top: "50%",
                          left: (curHead / (diskSize - 1) * 100) + "%",
                          transform: "translate(-50%,-50%)",
                          width: 22, height: 22, borderRadius: "50%",
                          background: "white", border: "2px solid black",
                          boxShadow: "0 0 0 4px rgba(255,255,255,0.14), 0 0 22px rgba(255,255,255,0.22)",
                          transition: "left 0.5s cubic-bezier(.4,0,.2,1)",
                          zIndex: 10,
                          animation: "ringPulse 2s ease-in-out infinite",
                        }} />
                        <div style={{ position: "absolute", top: 14, left: 0, fontSize: 10, color: "var(--w5)", fontFamily: "'DM Mono'" }}>0</div>
                        <div style={{ position: "absolute", top: 14, right: 0, fontSize: 10, color: "var(--w5)", fontFamily: "'DM Mono'" }}>{diskSize - 1}</div>
                      </div>
                    </div>

                    {/* Sequence chips */}
                    <div style={{ display: "flex", gap: 5, flexWrap: "wrap", marginBottom: 24 }}>
                      {curSeq.map((t, i) => (
                        <div key={i} className="chip" style={{
                          background: i === vStep ? "white" : i < vStep ? "rgba(255,255,255,0.06)" : "var(--s2)",
                          color: i === vStep ? "black" : i < vStep ? "var(--w3)" : "var(--w4)",
                          borderColor: i === vStep ? "white" : i < vStep ? "var(--b2)" : "var(--b1)",
                          transform: i === vStep ? "scale(1.1)" : "scale(1)",
                          boxShadow: i === vStep ? "0 0 18px rgba(255,255,255,0.18)" : "none",
                          fontWeight: i === vStep ? 500 : 400,
                        }}>
                          {i === 0 ? "HEAD" : t}
                        </div>
                      ))}
                    </div>

                    {/* Stats */}
                    <div style={{ display: "flex", borderTop: "1px solid var(--b1)" }}>
                      {[
                        ["STEP", vStep + " / " + (curSeq.length - 1)],
                        ["HEAD AT", "Cylinder " + curHead],
                        ["TOTAL MOVEMENT", totalMov + " tracks"],
                        ["REMAINING", Math.max(0, curSeq.length - 1 - vStep) + ""],
                      ].map(([lbl, val], i) => (
                        <div key={lbl} style={{
                          flex: 1, paddingTop: 16,
                          paddingLeft: i > 0 ? 20 : 0,
                          borderRight: i < 3 ? "1px solid var(--b1)" : "none",
                        }}>
                          <div style={{ fontSize: 9, color: "var(--w5)", fontFamily: "'DM Mono'", letterSpacing: 1.5, marginBottom: 5 }}>{lbl}</div>
                          <div style={{ fontSize: 15, color: "white", fontFamily: "'DM Mono'", fontWeight: 500 }}>{val}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                </RevealCard>

                {/* Path SVG */}
                <RevealCard delay={0.14}>
                  <div className="card" style={{ padding: 28, marginBottom: 16 }}>
                    <div className="stitle" style={{ marginBottom: 18 }}>Head Movement Path</div>
                    <svg width="100%" height="130" viewBox="0 0 900 130" preserveAspectRatio="none" style={{ display: "block", overflow: "visible" }}>
                      <defs>
                        <linearGradient id="lg1" x1="0%" y1="0%" x2="100%" y2="0%">
                          <stop offset="0%" stopColor="rgba(255,255,255,0.3)" />
                          <stop offset="100%" stopColor="rgba(255,255,255,0.9)" />
                        </linearGradient>
                      </defs>
                      {[0, 0.25, 0.5, 0.75, 1].map(t => (
                        <line key={t} x1={t * 900} y1="0" x2={t * 900} y2="130" stroke="rgba(255,255,255,0.03)" strokeWidth="1" />
                      ))}
                      {curSeq.slice(0, vStep + 1).map((t, i, arr) => {
                        if (i === 0) return null;
                        const len = Math.max(curSeq.length - 1, 1);
                        const x1 = ((i - 1) / len) * 900;
                        const x2 = (i / len) * 900;
                        const y1 = 120 - (arr[i - 1] / (diskSize - 1)) * 110;
                        const y2 = 120 - (t / (diskSize - 1)) * 110;
                        return <line key={i} x1={x1} y1={y1} x2={x2} y2={y2} stroke="url(#lg1)" strokeWidth="2" strokeOpacity="0.75" />;
                      })}
                      {curSeq.slice(0, vStep + 1).map((t, i) => {
                        const len = Math.max(curSeq.length - 1, 1);
                        const x = (i / len) * 900;
                        const y = 120 - (t / (diskSize - 1)) * 110;
                        return (
                          <circle key={i} cx={x} cy={y} r={i === vStep ? 5.5 : 3}
                            fill={i === vStep ? "white" : "rgba(255,255,255,0.4)"}
                            style={{ filter: i === vStep ? "drop-shadow(0 0 6px rgba(255,255,255,0.6))" : "none", transition: "r 0.25s" }} />
                        );
                      })}
                    </svg>
                  </div>
                </RevealCard>

                {/* Controls */}
                <RevealCard delay={0.2}>
                  <div className="card" style={{ padding: 18, display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
                    <button className="btn bgho" style={{ padding: "8px 14px" }} disabled={vStep === 0}
                      onClick={() => setVStep(s => Math.max(0, s - 1))}>
                      <IcoPrev />
                    </button>
                    <button className="btn bpri" style={{ minWidth: 100 }} onClick={() => setPlaying(p => !p)}>
                      {playing ? <><IcoPause />Pause</> : <><IcoPlay />Play</>}
                    </button>
                    <button className="btn bgho" style={{ padding: "8px 14px" }} disabled={vStep >= curSeq.length - 1}
                      onClick={() => setVStep(s => Math.min(curSeq.length - 1, s + 1))}>
                      <IcoNext />
                    </button>
                    <button className="btn bgho" onClick={() => { setVStep(0); setPlaying(false); }}>
                      <IcoReset />Reset
                    </button>
                    <div style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: 8 }}>
                      <span style={{ fontSize: 10, color: "var(--w4)", fontFamily: "'DM Mono'", letterSpacing: 1.5 }}>SPEED</span>
                      {["slow", "med", "fast"].map(s => (
                        <button key={s} className={"btn " + (speed === s ? "bpri" : "bgho")}
                          style={{ padding: "7px 13px", fontSize: 11 }} onClick={() => setSpeed(s)}>
                          {s.toUpperCase()}
                        </button>
                      ))}
                    </div>
                  </div>
                </RevealCard>
                <NextBtn label="View Charts" onClick={() => setTab("charts")} />
              </>
            )}
          </div>
        )}

        {/* ══════ CHARTS ══════ */}
        {tab === "charts" && (
          <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
            {!hasRun ? noSim : (
              <>
                {/* Bar chart */}
                <RevealCard>
                  <div className="card" style={{ padding: 32 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 28 }}>
                      <div>
                        <div className="stitle" style={{ marginBottom: 5 }}>Total Head Movement</div>
                        <p style={{ fontSize: 11, color: "var(--w5)", fontFamily: "'DM Mono'" }}>Lower is better</p>
                      </div>
                    </div>
                    {["FCFS", "SSTF", "SCAN"].map((a, i) => {
                      const val = results[a].total;
                      const maxV = getWorst(results);
                      const minV = getBest(results);
                      const isBest = val === minV;
                      return (
                        <div key={a} style={{ marginBottom: 22, animation: "slideL 0.5s ease " + (i * 0.12) + "s both" }}>
                          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
                            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                              <span style={{
                                fontFamily: "'Bebas Neue'", fontSize: 20, letterSpacing: 3,
                                background: isBest ? "linear-gradient(135deg,#fff,#aaa)" : "linear-gradient(135deg,#666,#333)",
                                WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
                              }}>{a}</span>
                              {isBest && <span style={{ fontSize: 9, padding: "2px 8px", background: "white", color: "black", borderRadius: 4, fontFamily: "'DM Mono'", fontWeight: 600, letterSpacing: 1 }}>BEST</span>}
                            </div>
                            <span style={{ fontFamily: "'Bebas Neue'", fontSize: 28, letterSpacing: 1 }}>
                              <AnimCounter value={val} />
                            </span>
                          </div>
                          <div style={{ height: 6, background: "var(--s3)", borderRadius: 3, overflow: "hidden" }}>
                            <div style={{
                              height: "100%", borderRadius: 3,
                              background: isBest
                                ? "linear-gradient(90deg,rgba(255,255,255,0.3),white)"
                                : "linear-gradient(90deg,rgba(255,255,255,0.08),rgba(255,255,255,0.22))",
                              width: (val / maxV * 100) + "%",
                              transition: "width 1.2s cubic-bezier(.4,0,.2,1) " + (i * 0.18) + "s",
                              boxShadow: isBest ? "0 0 8px rgba(255,255,255,0.25)" : "none",
                            }} />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </RevealCard>

                {/* Path chart all algos */}
                <RevealCard delay={0.1}>
                  <div className="card" style={{ padding: 32 }}>
                    <div className="stitle" style={{ marginBottom: 24 }}>Head Movement Path · All Algorithms</div>
                    {["FCFS", "SSTF", "SCAN"].map((a, ai) => {
                      const seq = results[a].sequence;
                      const ops = [0.9, 0.55, 0.28];
                      return (
                        <div key={a} style={{ marginBottom: 24 }}>
                          <div style={{ fontSize: 10, color: "var(--w4)", fontFamily: "'DM Mono'", letterSpacing: 1.5, marginBottom: 8 }}>{a}</div>
                          <svg width="100%" height="52" viewBox="0 0 900 52" preserveAspectRatio="none">
                            <line x1="0" y1="26" x2="900" y2="26" stroke="var(--s3)" strokeWidth="1" />
                            {seq.map((t, i) => {
                              if (i === 0) return null;
                              const x1 = ((i - 1) / (seq.length - 1)) * 900;
                              const x2 = (i / (seq.length - 1)) * 900;
                              const y1 = 48 - (seq[i - 1] / (diskSize - 1)) * 44;
                              const y2 = 48 - (t / (diskSize - 1)) * 44;
                              return <line key={i} x1={x1} y1={y1} x2={x2} y2={y2} stroke="white" strokeWidth="1.5" strokeOpacity={ops[ai]} />;
                            })}
                            {seq.map((t, i) => (
                              <circle key={i}
                                cx={(i / (seq.length - 1)) * 900}
                                cy={48 - (t / (diskSize - 1)) * 44}
                                r="2.5" fill="white" fillOpacity={ops[ai]} />
                            ))}
                          </svg>
                        </div>
                      );
                    })}
                  </div>
                </RevealCard>

                {/* Gantt */}
                <RevealCard delay={0.15}>
                  <div className="card" style={{ padding: 32 }}>
                    <div className="stitle" style={{ marginBottom: 22 }}>Gantt Timeline · Execution Order</div>
                    {["FCFS", "SSTF", "SCAN"].map(a => (
                      <div key={a} style={{ marginBottom: 22 }}>
                        <div style={{ fontSize: 10, color: "var(--w4)", fontFamily: "'DM Mono'", letterSpacing: 1.5, marginBottom: 10 }}>{a}</div>
                        <div style={{ display: "flex", gap: 5, flexWrap: "wrap" }}>
                          {results[a].sequence.map((t, i) => (
                            <div key={i} style={{
                              padding: "6px 11px", borderRadius: 8, fontSize: 12,
                              fontFamily: "'DM Mono'",
                              background: i === 0 ? "white" : "var(--s2)",
                              color: i === 0 ? "black" : "var(--w3)",
                              border: "1px solid " + (i === 0 ? "white" : "var(--b1)"),
                              transition: "transform 0.2s, border-color 0.2s",
                              cursor: "default",
                              animation: "popIn 0.3s ease " + (i * 0.025) + "s both",
                            }}
                              onMouseEnter={e => { e.currentTarget.style.transform = "scale(1.1)"; e.currentTarget.style.borderColor = "var(--b2)"; }}
                              onMouseLeave={e => { e.currentTarget.style.transform = "scale(1)"; e.currentTarget.style.borderColor = i === 0 ? "white" : "var(--b1)"; }}>
                              {t}
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </RevealCard>

                {/* Summary table */}
                <RevealCard delay={0.2}>
                  <div className="card" style={{ padding: 32 }}>
                    <div className="stitle" style={{ marginBottom: 20 }}>Summary Table</div>
                    <table style={{ width: "100%", borderCollapse: "collapse" }}>
                      <thead>
                        <tr style={{ borderBottom: "1px solid var(--b1)" }}>
                          {["Algorithm", "Total Movement", "Seek Ops", "Avg Seek", "Efficiency"].map(h => (
                            <th key={h} style={{ padding: "8px 16px", textAlign: "left", fontSize: 9, fontFamily: "'DM Mono'", color: "var(--w5)", letterSpacing: 1.5, fontWeight: 400 }}>
                              {h.toUpperCase()}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {["FCFS", "SSTF", "SCAN"].map((a, ai) => {
                          const r = results[a];
                          const best = getBest(results);
                          const worst = getWorst(results);
                          const eff = worst === best ? 100 : Math.round(((worst - r.total) / (worst - best)) * 100);
                          const isBest = r.total === best;
                          return (
                            <tr key={a} style={{ borderBottom: "1px solid var(--b1)", transition: "background .15s", animation: "slideL 0.4s ease " + (ai * 0.1) + "s both" }}
                              onMouseEnter={e => e.currentTarget.style.background = "var(--s2)"}
                              onMouseLeave={e => e.currentTarget.style.background = "transparent"}>
                              <td style={{ padding: "13px 16px" }}>
                                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                                  <div style={{ width: 5, height: 5, borderRadius: "50%", background: isBest ? "white" : "var(--w5)", boxShadow: isBest ? "0 0 6px rgba(255,255,255,0.5)" : "none" }} />
                                  <span style={{ fontFamily: "'Bebas Neue'", fontSize: 16, letterSpacing: 2 }}>{a}</span>
                                  {isBest && <span style={{ fontSize: 9, padding: "1px 6px", background: "white", color: "black", borderRadius: 3, fontFamily: "'DM Mono'" }}>BEST</span>}
                                </div>
                              </td>
                              <td style={{ padding: "13px 16px", fontFamily: "'DM Mono'", fontSize: 14 }}><AnimCounter value={r.total} /></td>
                              <td style={{ padding: "13px 16px", fontFamily: "'DM Mono'", fontSize: 14, color: "var(--w3)" }}>{r.sequence.length - 1}</td>
                              <td style={{ padding: "13px 16px", fontFamily: "'DM Mono'", fontSize: 14, color: "var(--w3)" }}>{r.avgSeek.toFixed(1)}</td>
                              <td style={{ padding: "13px 16px" }}>
                                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                                  <div style={{ flex: 1, height: 4, background: "var(--s3)", borderRadius: 2, minWidth: 80, overflow: "hidden" }}>
                                    <div style={{
                                      height: "100%", borderRadius: 2,
                                      background: isBest ? "linear-gradient(90deg,rgba(255,255,255,0.4),white)" : "rgba(255,255,255,0.22)",
                                      width: eff + "%", transition: "width 1s ease " + (ai * 0.18) + "s",
                                    }} />
                                  </div>
                                  <span style={{ fontFamily: "'DM Mono'", fontSize: 12, color: "var(--w3)", minWidth: 36 }}>{eff}%</span>
                                </div>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </RevealCard>
                <NextBtn label="View Compare" onClick={() => setTab("compare")} />
              </>
            )}
          </div>
        )}

        {/* ══════ COMPARE ══════ */}
        {tab === "compare" && (
          <div>
            <RevealCard>
              <div className="card" style={{ padding: 28, marginBottom: 20 }}>
                <div className="stitle" style={{ marginBottom: 20 }}>Queue 2 · Different Scenario</div>
                <div style={{ display: "grid", gridTemplateColumns: "150px 1fr", gap: 16, marginBottom: 16 }}>
                  <div>
                    <div style={{ fontSize: 10, color: "var(--w4)", fontFamily: "'DM Mono'", letterSpacing: 1.5, marginBottom: 8 }}>HEAD POSITION</div>
                    <input type="number" value={cmpQ.head} onChange={e => setCmpQ(p => ({ ...p, head: parseInt(e.target.value) || 0 }))} />
                  </div>
                  <div>
                    <div style={{ fontSize: 10, color: "var(--w4)", fontFamily: "'DM Mono'", letterSpacing: 1.5, marginBottom: 8 }}>REQUEST QUEUE</div>
                    <input type="text" value={cmpQ.queue} onChange={e => setCmpQ(p => ({ ...p, queue: e.target.value }))} />
                  </div>
                </div>
                <div style={{ display: "flex", gap: 8 }}>
                  {["right", "left"].map(d => (
                    <button key={d} className={"btn " + (cmpQ.dir === d ? "bpri" : "bgho")} onClick={() => setCmpQ(p => ({ ...p, dir: d }))}>
                      <IcoArrowDir dir={d} />
                    </button>
                  ))}
                  <button className="btn bpri" style={{ marginLeft: 8 }} onClick={runCmp}><IcoPlay />Run Queue 2</button>
                </div>
              </div>
            </RevealCard>

            {!hasRun ? noSim : (
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
                {[
                  { label: "Queue 1 · Original", data: results, q: queueStr },
                  ...(cmpRes ? [{ label: "Queue 2 · New", data: cmpRes, q: cmpQ.queue }] : []),
                ].map(({ label, data, q }, ci) => {
                  const best = getBest(data);
                  return (
                    <RevealCard key={label} delay={ci * 0.1}>
                      <div className="card" style={{ padding: 28, height: "100%" }}>
                        <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 4 }}>{label}</div>
                        <div style={{ fontSize: 11, color: "var(--w4)", fontFamily: "'DM Mono'", marginBottom: 20 }}>
                          {q.length > 44 ? q.substring(0, 44) + "…" : q}
                        </div>
                        {["FCFS", "SSTF", "SCAN"].map((a, i) => {
                          const isBest = data[a].total === best;
                          return (
                            <div key={a} style={{
                              display: "flex", justifyContent: "space-between", alignItems: "center",
                              padding: "12px 16px", borderRadius: 10, marginBottom: 8,
                              background: isBest ? "rgba(255,255,255,0.04)" : "var(--s2)",
                              border: "1px solid " + (isBest ? "var(--b3)" : "var(--b1)"),
                              transition: "transform .2s", cursor: "default",
                              animation: "slideL 0.4s ease " + (i * 0.08) + "s both",
                            }}
                              onMouseEnter={e => e.currentTarget.style.transform = "translateX(3px)"}
                              onMouseLeave={e => e.currentTarget.style.transform = "translateX(0)"}>
                              <span style={{ fontFamily: "'Bebas Neue'", fontSize: 17, letterSpacing: 2 }}>{a}</span>
                              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                                <span style={{ fontFamily: "'DM Mono'", fontSize: 16 }}>
                                  <AnimCounter value={data[a].total} />
                                </span>
                                {isBest && <span style={{ fontSize: 9, padding: "2px 7px", background: "white", color: "black", borderRadius: 4, fontFamily: "'DM Mono'" }}>BEST</span>}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </RevealCard>
                  );
                })}
                {!cmpRes && (
                  <RevealCard delay={0.1}>
                    <div className="card" style={{ padding: 40, display: "flex", alignItems: "center", justifyContent: "center", border: "1px dashed var(--b2)", minHeight: 200 }}>
                      <p style={{ color: "var(--w4)", fontSize: 13 }}>Configure Queue 2 above and click Run</p>
                    </div>
                  </RevealCard>
                )}
              </div>
            )}
            <NextBtn label="View Learn" onClick={() => setTab("learn")} />
          </div>
        )}

        {/* ══════ LEARN ══════ */}
        {tab === "learn" && (
          <div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 18, marginBottom: 20 }}>
              {[
                { name: "FCFS", full: "First Come First Serve", desc: "Serves requests in arrival order. Simple and fair, but causes high head movement.", pros: ["No starvation", "Fair ordering"], cons: ["High seek time", "Poor throughput"] },
                { name: "SSTF", full: "Shortest Seek Time First", desc: "Jumps to the nearest pending request. Efficient but can starve distant tracks.", pros: ["Low seek time", "High throughput"], cons: ["Can starve requests", "Not globally optimal"] },
                { name: "SCAN", full: "Elevator Algorithm", desc: "Sweeps in one direction then reverses. Balances efficiency with fairness.", pros: ["No starvation", "Predictable movement"], cons: ["Longer wait at extremes", "Unnecessary end travel"] },
              ].map(({ name, full, desc, pros, cons }, i) => (
                <RevealCard key={name} delay={i * 0.1}>
                  <div className="card" style={{ padding: 26, height: "100%", cursor: "default", transition: "transform .25s, border-color .25s" }}
                    onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-3px) scale(1.01)"; e.currentTarget.style.borderColor = "var(--b2)"; }}
                    onMouseLeave={e => { e.currentTarget.style.transform = "translateY(0) scale(1)"; e.currentTarget.style.borderColor = "var(--b1)"; }}>
                    <div style={{
                      fontFamily: "'Bebas Neue'", fontSize: 38, letterSpacing: 5, lineHeight: 1, marginBottom: 4,
                      background: "linear-gradient(135deg,#fff,#666)",
                      WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
                    }}>{name}</div>
                    <div style={{ fontSize: 10, color: "var(--w4)", fontFamily: "'DM Mono'", letterSpacing: 1, marginBottom: 16, paddingBottom: 16, borderBottom: "1px solid var(--b1)" }}>{full}</div>
                    <p style={{ fontSize: 13, color: "var(--w3)", lineHeight: 1.7, marginBottom: 20 }}>{desc}</p>
                    <div style={{ marginBottom: 14 }}>
                      <div style={{ fontSize: 9, color: "var(--w4)", fontFamily: "'DM Mono'", letterSpacing: 1.5, marginBottom: 10 }}>ADVANTAGES</div>
                      {pros.map(p => (
                        <div key={p} style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 7, fontSize: 12, color: "var(--w3)" }}>
                          <span style={{ color: "white", flexShrink: 0 }}><IcoCheck /></span>{p}
                        </div>
                      ))}
                    </div>
                    <div>
                      <div style={{ fontSize: 9, color: "var(--w4)", fontFamily: "'DM Mono'", letterSpacing: 1.5, marginBottom: 10 }}>LIMITATIONS</div>
                      {cons.map(c => (
                        <div key={c} style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 7, fontSize: 12, color: "var(--w5)" }}>
                          <span style={{ fontSize: 14, lineHeight: 1 }}>—</span>{c}
                        </div>
                      ))}
                    </div>
                  </div>
                </RevealCard>
              ))}
            </div>

            <RevealCard delay={0.3}>
              <div className="card" style={{ padding: 28 }}>
                <div className="stitle" style={{ marginBottom: 20 }}>Key Concepts</div>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 14 }}>
                  {[
                    { term: "Seek Time", def: "Time to move the head to the target cylinder." },
                    { term: "Rotational Latency", def: "Wait time for the disk to rotate to sector." },
                    { term: "Throughput", def: "I/O requests completed per unit of time." },
                    { term: "Starvation", def: "Request delayed indefinitely by closer ones." },
                  ].map(({ term, def }, i) => (
                    <div key={term} style={{
                      padding: 18, background: "var(--s2)", borderRadius: 12,
                      border: "1px solid var(--b1)", transition: "all .25s", cursor: "default",
                      animation: "popIn 0.4s ease " + (0.3 + i * 0.07) + "s both",
                    }}
                      onMouseEnter={e => { e.currentTarget.style.borderColor = "var(--b2)"; e.currentTarget.style.transform = "translateY(-3px)"; e.currentTarget.style.background = "var(--s3)"; }}
                      onMouseLeave={e => { e.currentTarget.style.borderColor = "var(--b1)"; e.currentTarget.style.transform = "translateY(0)"; e.currentTarget.style.background = "var(--s2)"; }}>
                      <div style={{ fontSize: 13, fontWeight: 600, color: "white", marginBottom: 8 }}>{term}</div>
                      <div style={{ fontSize: 12, color: "var(--w4)", lineHeight: 1.6 }}>{def}</div>
                    </div>
                  ))}
                </div>
              </div>
            </RevealCard>
            <NextBtn label="View Report" onClick={() => setTab("report")} />
          </div>
        )}

        {/* ══════ REPORT ══════ */}
        {tab === "report" && (
          <div>
            {!hasRun ? noSim : (
              <>
                {(() => {
                  const best = getBest(results);
                  const worst = getWorst(results);
                  const grades = {
                    FCFS: getGrade(results.FCFS.total, best, worst),
                    SSTF: getGrade(results.SSTF.total, best, worst),
                    SCAN: getGrade(results.SCAN.total, best, worst),
                  };
                  const bestAlgo = ["FCFS", "SSTF", "SCAN"].sort((a, b) => results[a].total - results[b].total)[0];
                  const reqs = parseQ(queueStr);
                  const spread = reqs.length ? Math.max(...reqs) - Math.min(...reqs) : 0;
                  const recAlgo = spread > diskSize * 0.6 ? "SCAN" : "SSTF";

                  return (
                    <>
                      {/* Grade cards */}
                      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 18, marginBottom: 20 }}>
                        {["FCFS", "SSTF", "SCAN"].map((a, i) => {
                          const g = grades[a];
                          const isBest = a === bestAlgo;
                          return (
                            <RevealCard key={a} delay={i * 0.12}>
                              <div className="card" style={{
                                padding: "32px 28px", textAlign: "center",
                                border: isBest ? "1px solid rgba(255,255,255,0.2)" : "1px solid var(--b1)",
                                transform: isBest ? "scale(1.025)" : "scale(1)",
                                background: isBest ? "linear-gradient(135deg,rgba(255,255,255,0.055),rgba(255,255,255,0.01))" : "var(--s1)",
                                boxShadow: isBest ? "0 12px 48px rgba(0,0,0,0.5)" : "none",
                              }}>
                                <div style={{ fontFamily: "'Bebas Neue'", fontSize: 13, letterSpacing: 4, color: "var(--w4)", marginBottom: 16 }}>{a}</div>
                                <div style={{
                                  fontFamily: "'Bebas Neue'", fontSize: 88, letterSpacing: 2, lineHeight: 0.9, marginBottom: 12,
                                  background: isBest ? "linear-gradient(150deg,#fff,#888)" : "linear-gradient(150deg,#555,#222)",
                                  WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
                                  filter: isBest ? "drop-shadow(0 0 18px rgba(255,255,255,0.08))" : "none",
                                }}>{g.grade}</div>
                                <div style={{ fontSize: 12, color: "var(--w4)", marginBottom: 18, fontFamily: "'DM Mono'" }}>{g.label}</div>
                                <div style={{ display: "flex", justifyContent: "center", gap: 3, marginBottom: 18 }}>
                                  {[1, 2, 3, 4, 5].map(s => (
                                    <span key={s} style={{ color: s <= g.stars ? "white" : "var(--w5)", transition: "transform 0.2s", display: "inline-block", cursor: "default" }}
                                      onMouseEnter={e => e.currentTarget.style.transform = "scale(1.35)"}
                                      onMouseLeave={e => e.currentTarget.style.transform = "scale(1)"}>
                                      <IcoStar filled={s <= g.stars} />
                                    </span>
                                  ))}
                                </div>
                                <div style={{ fontFamily: "'Bebas Neue'", fontSize: 30, letterSpacing: 1 }}>
                                  <AnimCounter value={results[a].total} />
                                </div>
                                <div style={{ fontSize: 10, color: "var(--w5)", fontFamily: "'DM Mono'", letterSpacing: 1 }}>TRACKS</div>
                                {isBest && (
                                  <div style={{
                                    marginTop: 18, display: "inline-flex", alignItems: "center", gap: 6,
                                    padding: "5px 14px", background: "white", color: "black", borderRadius: 20,
                                    fontSize: 11, fontWeight: 600, fontFamily: "'DM Mono'",
                                    boxShadow: "0 4px 16px rgba(255,255,255,0.18)",
                                    animation: "popIn 0.4s ease 0.3s both",
                                  }}>
                                    <IcoZap />BEST
                                  </div>
                                )}
                              </div>
                            </RevealCard>
                          );
                        })}
                      </div>

                      {/* Recommendation */}
                      <RevealCard delay={0.3}>
                        <div className="card" style={{ padding: 28, marginBottom: 18 }}>
                          <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 16 }}>
                            <div style={{ width: 34, height: 34, background: "var(--s2)", border: "1px solid var(--b2)", borderRadius: 10, display: "flex", alignItems: "center", justifyContent: "center", color: "var(--w3)" }}>
                              <IcoReport />
                            </div>
                            <div>
                              <div style={{ fontSize: 14, fontWeight: 600 }}>Smart Recommendation</div>
                              <div style={{ fontSize: 11, color: "var(--w4)", fontFamily: "'DM Mono'" }}>Based on your queue pattern</div>
                            </div>
                          </div>
                          <div style={{ padding: "18px 20px", background: "var(--s3)", borderRadius: 12, border: "1px solid var(--b1)", fontSize: 14, color: "var(--w3)", lineHeight: 1.9 }}>
                            For your queue with{" "}
                            <span style={{ color: "white", fontWeight: 600 }}>{reqs.length} requests</span> and a spread of{" "}
                            <span style={{ color: "white", fontWeight: 600 }}>{spread} cylinders</span>, we recommend{" "}
                            <span style={{ color: "white", fontFamily: "'Bebas Neue'", fontSize: 18, letterSpacing: 2 }}>{recAlgo}</span>
                            {" "}— best balance of efficiency and fairness.
                          </div>
                        </div>
                      </RevealCard>

                      {/* Breakdown */}
                      <RevealCard delay={0.4}>
                        <div className="card" style={{ padding: 28 }}>
                          <div className="stitle" style={{ marginBottom: 20 }}>Detailed Breakdown</div>
                          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 0 }}>
                            {[
                              ["Disk Size", diskSize + " cylinders"],
                              ["Initial Head", "Cylinder " + headPos],
                              ["Total Requests", reqs.length + ""],
                              ["Queue Spread", spread + " cylinders"],
                              ["SCAN Direction", scanDir.toUpperCase()],
                              ["Best Algorithm", bestAlgo],
                              ["Movement Saved", (results.FCFS.total - best) + " tracks"],
                              ["Efficiency Gain", Math.round(((results.FCFS.total - best) / Math.max(results.FCFS.total, 1)) * 100) + "%"],
                            ].map(([label, val], i) => (
                              <div key={label} style={{
                                display: "flex", justifyContent: "space-between",
                                padding: "13px 0", borderBottom: "1px solid var(--b1)",
                                paddingRight: i % 2 === 0 ? 32 : 0,
                                paddingLeft: i % 2 === 1 ? 32 : 0,
                                borderRight: i % 2 === 0 ? "1px solid var(--b1)" : "none",
                                transition: "background .2s",
                              }}
                                onMouseEnter={e => e.currentTarget.style.background = "rgba(255,255,255,0.02)"}
                                onMouseLeave={e => e.currentTarget.style.background = "transparent"}>
                                <span style={{ fontSize: 12, color: "var(--w4)", fontFamily: "'DM Mono'" }}>{label}</span>
                                <span style={{ fontSize: 13, fontFamily: "'DM Mono'", color: "var(--w2)" }}>{val}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      </RevealCard>
                    </>
                  );
                })()}
                <NextBtn label="Back to Input" onClick={() => setTab("input")} />
              </>
            )}
          </div>
        )}

      </main>

      {/* FOOTER */}
      <footer style={{
        marginTop: 64, borderTop: "1px solid var(--b1)",
        padding: "22px 28px", display: "flex",
        justifyContent: "space-between", alignItems: "center",
        position: "relative", zIndex: 1,
      }}>
        <div style={{ fontFamily: "'DM Mono'", fontSize: 10, color: "var(--w5)", letterSpacing: 1.5 }}>
          DISK SCHEDULING ALGORITHM · OS PROJECT
        </div>
        <div style={{ display: "flex", gap: 20 }}>
          {["Sai Rishitha", "Vedha Sri", "Poojitha", "Sanjana", "Vedha Thota"].map(name => (
            <span key={name} style={{ fontFamily: "'DM Mono'", fontSize: 10, color: "var(--w5)", transition: "color .2s", cursor: "default" }}
              onMouseEnter={e => e.currentTarget.style.color = "var(--w3)"}
              onMouseLeave={e => e.currentTarget.style.color = "var(--w5)"}>
              {name}
            </span>
          ))}
        </div>
      </footer>
    </>
  );
}
