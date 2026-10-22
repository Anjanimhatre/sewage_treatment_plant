"use client";

import {
  useEffect, useRef, useState,
  type FormEvent, type PointerEvent as ReactPointerEvent, type ReactNode,
} from "react";
import {
  Activity, ArrowRight, ArrowUp, ArrowUpRight, Building2, Check, Droplet, Factory,
  Gauge, Home as HomeIcon, Leaf, Menu, Play, Recycle, Settings, Store, Users, Waves, X,
} from "lucide-react";

/* ───────────────────────── data ───────────────────────── */

const nav = ["Technology", "Process", "Solutions", "Impact", "Contact"];

const steps = [
  { t: "Screening", d: "Removes plastics, debris and large solids before wastewater enters the system.", bod: 320, ntu: 480, color: "#6e5b34" },
  { t: "Grit Removal", d: "Separates sand and heavy inorganic particles to protect downstream equipment.", bod: 295, ntu: 420, color: "#645a36" },
  { t: "Biological Treatment", d: "Microorganisms break down organic pollutants and reduce BOD and COD.", bod: 60, ntu: 160, color: "#4a6a3a" },
  { t: "Clarification", d: "Separates biological solids from treated water through controlled settling.", bod: 30, ntu: 45, color: "#2f7d5a" },
  { t: "Filtration", d: "Fine filtration removes remaining suspended particles.", bod: 10, ntu: 3, color: "#1f9c86" },
  { t: "Disinfection", d: "UV and advanced disinfection eliminate harmful microorganisms.", bod: 5, ntu: 0.5, color: "#1ad1c0" },
];

const solutions: { name: string; icon: typeof Activity; desc: string }[] = [
  { name: "Municipal STP", icon: Building2, desc: "City-scale plants built for continuous, high-volume treatment." },
  { name: "Industrial STP", icon: Factory, desc: "Tailored trains for high-load, variable industrial effluent." },
  { name: "Commercial STP", icon: Store, desc: "Compact systems for malls, hotels, hospitals and campuses." },
  { name: "Residential STP", icon: HomeIcon, desc: "Quiet, odour-free plants for apartments and townships." },
  { name: "Water Reuse", icon: Recycle, desc: "Treated water polished for irrigation, cooling and flushing." },
  { name: "Zero Liquid Discharge", icon: Waves, desc: "Closed-loop recovery so nothing leaves the site as liquid waste." },
];

const marks = [
  "Designed for CPCB discharge norms", "WHO-aligned reuse quality", "IoT + SCADA monitoring",
  "Biogas energy recovery", "Zero Liquid Discharge ready", "24/7 remote operations",
];

const bubs = Array.from({ length: 14 }, (_, i) => ({
  l: (i * 37 + 8) % 96, s: 4 + ((i * 5) % 9), d: (i * 0.9) % 7, t: 6 + ((i * 1.3) % 5),
}));

const css = `
html{scroll-behavior:smooth}
section[id]{scroll-margin-top:72px}
@keyframes ap-kenburns{0%{transform:scale(1.05) translate(0,0)}100%{transform:scale(1.18) translate(-2%,-2%)}}
@keyframes ap-scan{0%{top:-12%}100%{top:112%}}
@keyframes ap-rise{0%{transform:translateY(0) scale(.6);opacity:0}15%{opacity:.85}100%{transform:translateY(-420px) scale(1);opacity:0}}
@keyframes ap-float{0%,100%{transform:translateY(0)}50%{transform:translateY(-8px)}}
@keyframes ap-pipe{to{background-position:42px 0}}
@keyframes ap-drop{0%{left:-2%;opacity:0}8%{opacity:1}92%{opacity:1}100%{left:102%;opacity:0}}
@keyframes ap-marquee{to{transform:translateX(-50%)}}
@keyframes ap-wave{to{transform:translateX(-50%)}}
@keyframes ap-shimmer{to{background-position:200% 0}}
@keyframes ap-pulse{0%{box-shadow:0 0 0 0 rgba(166,255,77,.65)}100%{box-shadow:0 0 0 10px rgba(166,255,77,0)}}
@keyframes ap-fill{from{width:0}to{width:100%}}
.ap-kenburns{animation:ap-kenburns 22s ease-in-out infinite alternate}
.ap-scan{animation:ap-scan 6s linear infinite}
.ap-rise{animation:ap-rise 8s ease-in infinite}
.ap-float-a{animation:ap-float 6s ease-in-out infinite}
.ap-float-b{animation:ap-float 7.5s ease-in-out infinite reverse}
.ap-pipe{background:repeating-linear-gradient(90deg,rgba(166,255,77,.85) 0 14px,rgba(166,255,77,.08) 14px 42px);background-size:42px 100%;animation:ap-pipe 1.1s linear infinite}
.ap-drop{animation:ap-drop 5s linear infinite}
.ap-marquee{animation:ap-marquee 38s linear infinite}
.ap-marquee-fast{animation:ap-marquee 26s linear infinite}
.ap-wave{animation:ap-wave 5s linear infinite}
.ap-shimmer{background-size:200% auto;animation:ap-shimmer 6s linear infinite}
.ap-dot{animation:ap-pulse 1.6s ease-out infinite}
.ap-fill{animation:ap-fill 4.5s linear forwards}
@media (prefers-reduced-motion:reduce){*{animation:none!important;transition:none!important}html{scroll-behavior:auto}}
`;

/* ───────────────────────── hooks ───────────────────────── */

function useInView<T extends HTMLElement>(threshold = 0.2) {
  const ref = useRef<T>(null);
  const [seen, setSeen] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(([e]) => {
      if (e.isIntersecting) { setSeen(true); io.disconnect(); }
    }, { threshold });
    io.observe(el);
    return () => io.disconnect();
  }, [threshold]);
  return [ref, seen] as const;
}

function useTween(target: number, dur = 800) {
  const [v, setV] = useState(target);
  const from = useRef(target);
  useEffect(() => {
    const s = from.current;
    const t0 = performance.now();
    let raf = 0;
    const f = (t: number) => {
      const p = Math.min(1, (t - t0) / dur);
      const val = s + (target - s) * (1 - Math.pow(1 - p, 3));
      from.current = val;
      setV(val);
      if (p < 1) raf = requestAnimationFrame(f);
    };
    raf = requestAnimationFrame(f);
    return () => cancelAnimationFrame(raf);
  }, [target, dur]);
  return v;
}

function useLive() {
  const [d, setD] = useState({
    flow: 1284, ph: 7.2, ntu: 0.8, dox: 6.4,
    series: Array.from({ length: 24 }, (_, i) => 50 + Math.sin(i / 2) * 12),
  });
  useEffect(() => {
    const id = setInterval(() => {
      setD((p) => ({
        flow: Math.round(1284 + (Math.random() - 0.5) * 40),
        ph: +(7.2 + (Math.random() - 0.5) * 0.2).toFixed(2),
        ntu: +(0.8 + (Math.random() - 0.5) * 0.3).toFixed(2),
        dox: +(6.4 + (Math.random() - 0.5) * 0.4).toFixed(1),
        series: [...p.series.slice(1), 50 + Math.sin(Date.now() / 3000) * 12 + (Math.random() - 0.5) * 10],
      }));
    }, 1400);
    return () => clearInterval(id);
  }, []);
  return d;
}

/* ───────────────────────── small pieces ───────────────────────── */

function CountUp({ to, decimals = 0, suffix = "", run }: { to: number; decimals?: number; suffix?: string; run: boolean }) {
  const [v, setV] = useState(0);
  useEffect(() => {
    if (!run) return;
    let raf = 0;
    const t0 = performance.now();
    const dur = 1800;
    const f = (t: number) => {
      const p = Math.min(1, (t - t0) / dur);
      setV(to * (1 - Math.pow(1 - p, 3)));
      if (p < 1) raf = requestAnimationFrame(f);
    };
    raf = requestAnimationFrame(f);
    return () => cancelAnimationFrame(raf);
  }, [run, to]);
  return <>{v.toFixed(decimals)}{suffix}</>;
}

function Reveal({ children, delay = 0, className = "" }: { children: ReactNode; delay?: number; className?: string }) {
  const [ref, seen] = useInView<HTMLDivElement>(0.12);
  return (
    <div
      ref={ref}
      style={{ transitionDelay: `${delay}ms` }}
      className={`transition-all duration-700 ease-out ${seen ? "translate-y-0 opacity-100" : "translate-y-8 opacity-0"} ${className}`}
    >
      {children}
    </div>
  );
}

const Ring = ({ children, size = 56 }: { children: ReactNode; size?: number }) => (
  <div
    style={{ width: size, height: size }}
    className="flex shrink-0 items-center justify-center rounded-full border border-[#a6ff4d]/40 bg-[#a6ff4d]/5 text-[#a6ff4d]"
  >
    {children}
  </div>
);

const Glass = ({ className = "", children }: { className?: string; children: ReactNode }) => (
  <div className={`rounded-2xl border border-[#a6ff4d]/25 bg-[#07170f]/80 backdrop-blur-md ${className}`}>
    {children}
  </div>
);

function Spark({ data }: { data: number[] }) {
  const w = 180, h = 36;
  const mn = Math.min(...data), mx = Math.max(...data), rng = mx - mn || 1;
  const pts = data.map((v, i) => [(i / (data.length - 1)) * w, h - 4 - ((v - mn) / rng) * (h - 8)]);
  const line = pts.map((p, i) => `${i ? "L" : "M"}${p[0].toFixed(1)} ${p[1].toFixed(1)}`).join(" ");
  return (
    <svg viewBox={`0 0 ${w} ${h}`} preserveAspectRatio="none" className="h-9 w-full">
      <defs>
        <linearGradient id="sparkfill" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#a6ff4d" stopOpacity=".35" />
          <stop offset="1" stopColor="#a6ff4d" stopOpacity="0" />
        </linearGradient>
      </defs>
      <path d={`${line} L${w} ${h} L0 ${h}Z`} fill="url(#sparkfill)" />
      <path d={line} fill="none" stroke="#a6ff4d" strokeWidth="1.5" strokeLinejoin="round" />
    </svg>
  );
}

/* ───────────────────────── water cursor trail ───────────────────────── */

function WaterTrail() {
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const cv = ref.current!;
    const ctx = cv.getContext("2d")!;
    const mask = document.createElement("canvas");
    const mctx = mask.getContext("2d")!;
    const img = new Image();
    img.src = "/w1.png";
    let w = 0, h = 0, raf = 0, mx = -1, my = -1, px = -1, py = -1;
    const size = () => {
      w = window.innerWidth; h = window.innerHeight;
      cv.width = mask.width = w; cv.height = mask.height = h;
    };
    const move = (e: PointerEvent) => { mx = e.clientX; my = e.clientY; };
    const blob = (x: number, y: number) => {
      const r = 110;
      const g = mctx.createRadialGradient(x, y, 0, x, y, r);
      g.addColorStop(0, "rgba(0, 0, 0, 0.9)");
      g.addColorStop(1, "rgba(0,0,0,0)");
      mctx.fillStyle = g;
      mctx.beginPath(); mctx.arc(x, y, r, 0, Math.PI * 2); mctx.fill();
    };
    const tick = (t: number) => {
      mctx.globalCompositeOperation = "destination-out";
      mctx.fillStyle = "rgba(0,0,0,0.04)";
      mctx.fillRect(0, 0, w, h);
      mctx.globalCompositeOperation = "source-over";
      if (mx >= 0) {
        if (px < 0) { px = mx; py = my; }
        const d = Math.hypot(mx - px, my - py);
        const n = Math.max(1, Math.ceil(d / 18));
        for (let i = 1; i <= n; i++) blob(px + ((mx - px) * i) / n, py + ((my - py) * i) / n);
        px = mx; py = my;
      }
      ctx.globalCompositeOperation = "source-over";
      ctx.clearRect(0, 0, w, h);
      if (img.complete && img.naturalWidth) {
        const sc = Math.max((w + 80) / img.naturalWidth, (h + 80) / img.naturalHeight) * 1.1;
        const iw = img.naturalWidth * sc, ih = img.naturalHeight * sc;
        const ox = -40 + Math.sin(t / 2200) * 22, oy = -40 + Math.cos(t / 2600) * 18;
        ctx.drawImage(img, ox, oy, iw, ih);
      } else {
        ctx.fillStyle = "#1aa593"; ctx.fillRect(0, 0, w, h);
      }
      ctx.globalCompositeOperation = "destination-in";
      ctx.drawImage(mask, 0, 0);
      raf = requestAnimationFrame(tick);
    };
    size();
    raf = requestAnimationFrame(tick);
    window.addEventListener("resize", size);
    window.addEventListener("pointermove", move);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", size);
      window.removeEventListener("pointermove", move);
    };
  }, []);
  return (
    <canvas
      ref={ref}
      aria-hidden
      style={{ opacity: 0.6 }}
      className="pointer-events-none fixed inset-0 z-0 h-full w-full"
    />
  );
}

/* ───────────────────────── hero visual ───────────────────────── */

function HeroVisual() {
  const tilt = useRef<HTMLDivElement>(null);
  const live = useLive();

  const onMove = (e: ReactPointerEvent<HTMLDivElement>) => {
    const el = tilt.current;
    if (!el || e.pointerType !== "mouse") return;
    const r = el.getBoundingClientRect();
    const x = (e.clientX - r.left) / r.width - 0.5;
    const y = (e.clientY - r.top) / r.height - 0.5;
    el.style.transform = `perspective(1200px) rotateY(${x * 7}deg) rotateX(${-y * 7}deg)`;
  };
  const reset = () => {
    if (tilt.current) tilt.current.style.transform = "perspective(1200px) rotateY(0deg) rotateX(0deg)";
  };

  return (
    <div className="relative mx-auto w-full max-w-[704px] lg:ml-auto" onPointerMove={onMove} onPointerLeave={reset}>
      <div ref={tilt} style={{ transition: "transform .25s ease-out" }} className="relative">
        <div className="relative min-h-[380px] overflow-hidden rounded-[34px] border border-[#356d53]/50 bg-gradient-to-br from-[#0a3a2b] to-[#06140f] shadow-[0_30px_90px_-30px_rgba(166,255,77,.35)] sm:min-h-[480px]">
          {/* Cover image: place your image at public/static/sewage_water.avif */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/static/sewage_water.avif"
            alt="Smart wastewater treatment facility"
            className="ap-kenburns absolute inset-0 h-full w-full object-cover"
            onError={(e) => { e.currentTarget.style.display = "none"; }}
          />
          {/* colour grade + readability */}
          <div className="absolute inset-0 bg-gradient-to-t from-[#06140f]/85 via-[#06140f]/10 to-[#06140f]/55" />
          <div className="absolute inset-0 bg-[#1fd6a0]/10 mix-blend-color" />
          {/* tech grid */}
          <div
            className="absolute inset-0 opacity-30"
            style={{
              backgroundImage:
                "linear-gradient(rgba(166,255,77,.12) 1px,transparent 1px),linear-gradient(90deg,rgba(166,255,77,.12) 1px,transparent 1px)",
              backgroundSize: "44px 44px",
              maskImage: "radial-gradient(ellipse at center, black 30%, transparent 80%)",
              WebkitMaskImage: "radial-gradient(ellipse at center, black 30%, transparent 80%)",
            }}
          />
          {/* scan line */}
          <div className="ap-scan pointer-events-none absolute inset-x-0 h-24 bg-gradient-to-b from-transparent via-[#a6ff4d]/15 to-transparent" />
          {/* bubbles */}
          {bubs.map((b, i) => (
            <span
              key={i}
              className="ap-rise absolute bottom-0 rounded-full border border-[#a6ff4d]/50 bg-[#a6ff4d]/10"
              style={{ left: `${b.l}%`, width: b.s, height: b.s, animationDelay: `${b.d}s`, animationDuration: `${b.t}s` }}
            />
          ))}
          {/* corner brackets */}
          {["left-4 top-4 border-l-2 border-t-2", "right-4 top-4 border-r-2 border-t-2", "left-4 bottom-4 border-b-2 border-l-2", "right-4 bottom-4 border-b-2 border-r-2"].map((c) => (
            <span key={c} className={`pointer-events-none absolute h-5 w-5 border-[#a6ff4d]/70 ${c}`} />
          ))}

          {/* live telemetry */}
          <div className="absolute left-3 top-[68px] z-10 w-[170px] sm:left-4 sm:top-5 sm:w-[250px]">
            <Glass className="p-3 sm:p-4">
              <div className="flex items-center gap-3">
                <Ring size={36}><Activity size={16} /></Ring>
                <div className="min-w-0">
                  <div className="flex items-center gap-1.5 text-[10px] tracking-widest text-white/50">
                    <i className="ap-dot inline-block h-1.5 w-1.5 rounded-full bg-[#a6ff4d]" /> FLOW RATE · LIVE
                  </div>
                  <div className="text-sm font-semibold tabular-nums sm:text-base">{live.flow.toLocaleString()} m³/day</div>
                </div>
              </div>
              <div className="mt-2"><Spark data={live.series} /></div>
              <div className="mt-2 hidden grid-cols-3 gap-2 border-t border-white/10 pt-2 text-center sm:grid">
                {[["pH", live.ph.toFixed(2)], ["NTU", live.ntu.toFixed(2)], ["DO mg/L", live.dox.toFixed(1)]].map(([k, v]) => (
                  <div key={k}>
                    <div className="text-[9px] tracking-widest text-white/40">{k}</div>
                    <div className="text-sm font-semibold tabular-nums text-[#c8ff7a]">{v}</div>
                  </div>
                ))}
              </div>
            </Glass>
          </div>
        </div>

        <Glass className="ap-float-a absolute -top-5 right-0 flex items-center gap-3 p-4 sm:top-0">
          <Ring size={48}><Leaf size={22} /></Ring>
          <div>
            <div className="text-[10px] tracking-widest text-white/50">TREATMENT EFFICIENCY</div>
            <div className="text-2xl font-semibold">98.7%</div>
            <div className="flex items-center gap-1 text-xs text-[#a6ff4d]"><ArrowUp size={12} /> +3.4%</div>
          </div>
        </Glass>

        <div className="absolute -right-2 top-[30%] hidden flex-col gap-3 xl:flex">
          {([[Settings, "AI POWERED\nMONITORING"], [Leaf, "RESOURCE\nRECOVERY"], [Users, "CLEANER\nCOMMUNITIES"]] as [typeof Settings, string][]).map(([I, t], i) => (
            <div key={i} className="flex items-center gap-3">
              <Ring size={50}><I size={20} /></Ring>
              <div className="whitespace-pre-line text-[10px] leading-4 tracking-wider text-white/70">{t}</div>
            </div>
          ))}
        </div>

        <Glass className="ap-float-b absolute -bottom-3 left-0 flex items-center gap-3 p-4 sm:bottom-6">
          <Ring size={44}><Droplet size={20} /></Ring>
          <div>
            <div className="text-[10px] tracking-widest text-white/50">SLUDGE TO BIOGAS</div>
            <div className="font-semibold">120 m³/day</div>
            <div className="text-xs text-[#a6ff4d]">≈ 2,400 kWh</div>
          </div>
        </Glass>

        <Glass className="ap-float-a absolute bottom-4 right-0 hidden items-center gap-3 p-4 sm:flex">
          <Ring size={40}><Droplet size={18} /></Ring>
          <div>
            <div className="text-[10px] tracking-widest text-white/50">REUSED WATER</div>
            <div className="text-sm font-semibold">For irrigation &amp; industry</div>
            <div className="mt-2 h-1 rounded bg-white/10"><div className="h-full w-[74%] rounded bg-[#a6ff4d]" /></div>
          </div>
        </Glass>
      </div>
    </div>
  );
}

/* ───────────────────────── stats: the flowing pipeline ───────────────────────── */

const stats = [
  { icon: Droplet, to: 10, dec: 0, suffix: "M+", label: "Litres / day", pct: 0.82 },
  { icon: Gauge, to: 98.7, dec: 1, suffix: "%", label: "Treatment rate", pct: 0.987 },
  { icon: Building2, to: 42, dec: 0, suffix: "+", label: "Projects", pct: 0.7 },
  { icon: Leaf, to: 100, dec: 0, suffix: "%", label: "Sustainable", pct: 1 },
];

function FlowStats() {
  const [ref, seen] = useInView<HTMLDivElement>(0.3);
  const C = 2 * Math.PI * 40;
  return (
    <div ref={ref} className="relative mx-auto max-w-5xl px-6 pb-16">
      <div className="relative overflow-hidden rounded-[32px] border border-[#a6ff4d]/15 bg-[#07170f]/60 px-4 pb-8 pt-5 backdrop-blur-md sm:px-8">
        <div className="absolute inset-x-10 top-0 h-px bg-gradient-to-r from-transparent via-[#a6ff4d]/70 to-transparent" />
        <div className="mb-7 flex items-center justify-between text-[10px] tracking-[0.3em] text-white/40">
          <span>NETWORK OUTPUT</span>
          <span className="flex items-center gap-2 text-[#a6ff4d]">
            <i className="ap-dot inline-block h-1.5 w-1.5 rounded-full bg-[#a6ff4d]" /> FLOWING
          </span>
        </div>

        <div className="relative grid grid-cols-2 gap-y-10 sm:grid-cols-4">
          {/* the pipe */}
          <div className="pointer-events-none absolute left-0 right-0 top-[44px] hidden h-[12px] -translate-y-1/2 sm:block">
            <div className="absolute inset-0 rounded-full border border-[#a6ff4d]/25 bg-[#030b08]" />
            <div className="ap-pipe absolute inset-[2px] rounded-full opacity-70" />
            {[0, 2.5].map((d) => (
              <span
                key={d}
                style={{ animationDelay: `${d}s` }}
                className="ap-drop absolute top-1/2 h-3 w-3 -translate-y-1/2 rounded-full bg-[#c8ff7a] shadow-[0_0_14px_#a6ff4d]"
              />
            ))}
          </div>

          {stats.map((s, i) => {
            const I = s.icon;
            return (
              <div key={s.label} className="relative z-10 flex flex-col items-center text-center">
                <div className="relative h-[88px] w-[88px]">
                  <svg viewBox="0 0 88 88" className="h-full w-full -rotate-90">
                    <defs>
                      <linearGradient id={`ringg${i}`} x1="0" y1="0" x2="1" y2="1">
                        <stop offset="0" stopColor="#c8ff7a" />
                        <stop offset="1" stopColor="#1fd6a0" />
                      </linearGradient>
                    </defs>
                    <circle cx="44" cy="44" r="40" fill="none" stroke="rgba(255,255,255,.08)" strokeWidth="3" />
                    <circle
                      cx="44" cy="44" r="40" fill="none" stroke={`url(#ringg${i})`} strokeWidth="3" strokeLinecap="round"
                      strokeDasharray={C}
                      strokeDashoffset={seen ? C * (1 - s.pct) : C}
                      style={{ transition: `stroke-dashoffset 1.8s cubic-bezier(.2,.7,.2,1) ${i * 150}ms` }}
                    />
                  </svg>
                  <div className="absolute inset-[9px] flex items-center justify-center rounded-full border border-white/10 bg-[#06140f] text-[#a6ff4d] shadow-[inset_0_0_20px_rgba(166,255,77,.12)]">
                    <I size={22} />
                  </div>
                </div>
                <div className="mt-4 bg-gradient-to-b from-[#c8ff7a] to-[#5be03a] bg-clip-text text-3xl font-bold tabular-nums tracking-tight text-transparent">
                  <CountUp to={s.to} decimals={s.dec} suffix={s.suffix} run={seen} />
                </div>
                <div className="mt-1 text-[10px] uppercase tracking-[0.2em] text-white/50">{s.label}</div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

/* ───────────────────────── marquee ───────────────────────── */

function Marquee() {
  const row = [...marks, ...marks];
  return (
    <div className="relative overflow-hidden border-y border-white/10 bg-[#030b08]/60 py-4 backdrop-blur-sm">
      <div className="ap-marquee flex w-max gap-12 whitespace-nowrap text-xs uppercase tracking-[0.25em] text-white/45">
        {row.map((m, i) => (
          <span key={i} className="flex items-center gap-12">
            {m} <Droplet size={12} className="text-[#a6ff4d]" />
          </span>
        ))}
      </div>
      <div className="pointer-events-none absolute inset-y-0 left-0 w-24 bg-gradient-to-r from-[#030b08] to-transparent" />
      <div className="pointer-events-none absolute inset-y-0 right-0 w-24 bg-gradient-to-l from-[#030b08] to-transparent" />
    </div>
  );
}

/* ───────────────────────── process tank ───────────────────────── */

function Tank({ active }: { active: number }) {
  const s = steps[active];
  const bod = useTween(s.bod);
  const ntu = useTween(s.ntu);
  return (
    <div className="rounded-[28px] border border-[#a6ff4d]/25 bg-[#06140f]/80 p-5 backdrop-blur-md">
      <div className="mb-3 flex items-center justify-between text-[10px] tracking-[0.25em] text-white/45">
        <span>STAGE 0{active + 1} / 06</span>
        <span className="text-[#a6ff4d]">{s.t.toUpperCase()}</span>
      </div>
      <div className="relative h-56 overflow-hidden rounded-2xl border border-white/10 bg-[#030b08]">
        {/* tick marks */}
        {[20, 40, 60, 80].map((p) => (
          <div key={p} className="absolute right-0 h-px w-3 bg-white/20" style={{ bottom: `${p}%` }} />
        ))}
        <div className="absolute inset-x-0 bottom-0 transition-colors duration-1000" style={{ height: "68%", background: s.color }}>
          <div className="absolute bottom-[calc(100%-1px)] left-0 h-6 w-[200%] overflow-hidden">
            <div className="ap-wave h-full w-full transition-colors duration-1000" style={{ color: s.color }}>
              <svg viewBox="0 0 400 24" preserveAspectRatio="none" className="h-full w-full" fill="currentColor">
                <path d="M0 12 Q50 0 100 12 T200 12 T300 12 T400 12 V24 H0Z" />
              </svg>
            </div>
          </div>
          <div className="absolute inset-0 bg-gradient-to-b from-white/15 via-transparent to-black/40" />
          {bubs.slice(0, 9).map((b, i) => (
            <span
              key={i}
              className="ap-rise absolute bottom-0 rounded-full border border-white/50 bg-white/10"
              style={{ left: `${b.l}%`, width: b.s - 1, height: b.s - 1, animationDelay: `${b.d}s`, animationDuration: `${b.t - 2}s` }}
            />
          ))}
        </div>
      </div>
      <div className="mt-4 grid grid-cols-2 gap-3">
        <div className="rounded-xl border border-white/10 bg-white/[0.03] p-3">
          <div className="text-[9px] tracking-widest text-white/40">BOD · mg/L</div>
          <div className="text-2xl font-bold tabular-nums text-[#c8ff7a]">{Math.round(bod)}</div>
        </div>
        <div className="rounded-xl border border-white/10 bg-white/[0.03] p-3">
          <div className="text-[9px] tracking-widest text-white/40">TURBIDITY · NTU</div>
          <div className="text-2xl font-bold tabular-nums text-[#c8ff7a]">{ntu < 10 ? ntu.toFixed(1) : Math.round(ntu)}</div>
        </div>
      </div>
      <div className="mt-3 text-[10px] text-white/30">Illustrative values showing typical reduction across stages.</div>
    </div>
  );
}

/* ───────────────────────── solution card ───────────────────────── */

function SolutionCard({ s, i }: { s: (typeof solutions)[number]; i: number }) {
  const I = s.icon;
  const onMove = (e: ReactPointerEvent<HTMLDivElement>) => {
    const r = e.currentTarget.getBoundingClientRect();
    e.currentTarget.style.setProperty("--mx", `${e.clientX - r.left}px`);
    e.currentTarget.style.setProperty("--my", `${e.clientY - r.top}px`);
  };
  return (
    <div
      onPointerMove={onMove}
      className="group relative h-full overflow-hidden rounded-3xl border border-white/10 bg-[#0a1f16] p-8 transition duration-300 hover:-translate-y-1 hover:border-[#a6ff4d]/40"
    >
      <div
        className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100"
        style={{ background: "radial-gradient(260px circle at var(--mx,50%) var(--my,50%), rgba(166,255,77,.16), transparent 70%)" }}
      />
      <div className="relative">
        <div className="flex items-center justify-between">
          <Ring size={48}><I size={22} /></Ring>
          <span className="text-xs text-[#a6ff4d]">0{i + 1}</span>
        </div>
        <h3 className="mt-10 text-xl font-semibold">{s.name}</h3>
        <p className="mt-2 text-sm leading-6 text-white/45">{s.desc}</p>
        <div className="mt-5 flex items-center gap-2 text-sm text-white/40 transition group-hover:text-[#a6ff4d]">
          Explore solution <ArrowRight size={15} className="transition group-hover:translate-x-1" />
        </div>
      </div>
    </div>
  );
}

/* ───────────────────────── impact stat ───────────────────────── */

const monthly = [38, 46, 52, 49, 60, 66, 72, 70, 81, 88, 94, 100];
const monthNames = ["J", "F", "M", "A", "M", "J", "J", "A", "S", "O", "N", "D"];
const pollutants = [
  { name: "BOD", pct: 42, t: "5.0K", color: "#1fd6a0" },
  { name: "COD", pct: 28, t: "3.4K", color: "#19b394" },
  { name: "TSS", pct: 22, t: "2.6K", color: "#2f8f78" },
  { name: "Nutrients", pct: 8, t: "1.0K", color: "#a6ff4d" },
];

function Panel({
  className = "", bg, children,
}: { className?: string; bg?: (seen: boolean) => ReactNode; children: (seen: boolean) => ReactNode }) {
  const [ref, seen] = useInView<HTMLDivElement>(0.3);
  const onMove = (e: ReactPointerEvent<HTMLDivElement>) => {
    const r = e.currentTarget.getBoundingClientRect();
    e.currentTarget.style.setProperty("--mx", `${e.clientX - r.left}px`);
    e.currentTarget.style.setProperty("--my", `${e.clientY - r.top}px`);
  };
  return (
    <div
      ref={ref}
      onPointerMove={onMove}
      className={`group relative h-full overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-br from-[#0a2118] to-[#06140f] p-8 transition duration-300 hover:border-[#a6ff4d]/30 ${className}`}
    >
      {bg?.(seen)}
      <div
        className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100"
        style={{ background: "radial-gradient(300px circle at var(--mx,50%) var(--my,50%), rgba(166,255,77,.10), transparent 70%)" }}
      />
      <div className="relative z-10 h-full">{children(seen)}</div>
    </div>
  );
}

const PanelLabel = ({ children }: { children: ReactNode }) => (
  <div className="text-xs uppercase tracking-[0.25em] text-white/45">{children}</div>
);

function ImpactDashboard() {
  const C = 2 * Math.PI * 52;
  return (
    <div className="mt-12 grid gap-4 sm:grid-cols-4">
      {/* BIG: litres treated with rising water */}
      <Reveal className="h-full sm:col-span-2 sm:row-span-2">
        <Panel
          className="min-h-[460px] sm:p-10"
          bg={(seen) => (
            <div
              className="pointer-events-none absolute inset-x-0 bottom-0 transition-[height] duration-[2400ms] ease-out"
              style={{ height: seen ? "50%" : "0%", background: "linear-gradient(to bottom, #0f7a63, #06281f)" }}
            >
              <div className="absolute bottom-[calc(100%-1px)] left-0 h-6 w-[200%] overflow-hidden">
                <div className="ap-wave h-full w-full" style={{ color: "#0f7a63" }}>
                  <svg viewBox="0 0 400 24" preserveAspectRatio="none" className="h-full w-full" fill="currentColor">
                    <path d="M0 12 Q50 0 100 12 T200 12 T300 12 T400 12 V24 H0Z" />
                  </svg>
                </div>
              </div>
              <div className="absolute inset-0 bg-gradient-to-b from-white/10 to-transparent" />
              {bubs.slice(0, 10).map((b, i) => (
                <span
                  key={i}
                  className="ap-rise absolute bottom-0 rounded-full border border-white/40 bg-white/10"
                  style={{ left: `${b.l}%`, width: b.s - 1, height: b.s - 1, animationDelay: `${b.d}s`, animationDuration: `${b.t - 2}s` }}
                />
              ))}
            </div>
          )}
        >
          {(seen) => (
            <div className="flex h-full flex-col justify-between">
              <div>
                <PanelLabel>Litres treated</PanelLabel>
                <div className="mt-6 text-7xl font-bold tabular-nums tracking-tight sm:text-8xl">
                  <CountUp to={10} suffix="M+" run={seen} />
                </div>
                <p className="mt-3 max-w-xs text-sm leading-6 text-white/55">
                  Treated every day across municipal, industrial and residential plants.
                </p>
              </div>
              <div>
                <div className="mb-2 flex justify-between text-[10px] tracking-widest text-white/60">
                  <span>MONTHLY VOLUME</span><span>LAST 12 MONTHS</span>
                </div>
                <div className="flex h-28 items-end gap-2">
                  {monthly.map((v, i) => (
                    <div
                      key={i}
                      className="flex-1 rounded-t-md bg-gradient-to-t from-[#1fd6a0]/50 to-[#c8ff7a]"
                      style={{
                        height: `${v}%`,
                        transformOrigin: "bottom",
                        transform: seen ? "scaleY(1)" : "scaleY(0)",
                        transition: `transform .9s cubic-bezier(.2,.7,.2,1) ${700 + i * 70}ms`,
                      }}
                    />
                  ))}
                </div>
                <div className="mt-2 flex gap-2 text-center text-[9px] text-white/50">
                  {monthNames.map((m, i) => <span key={i} className="flex-1">{m}</span>)}
                </div>
              </div>
            </div>
          )}
        </Panel>
      </Reveal>

      {/* recovered gauge */}
      <Reveal delay={80} className="h-full sm:col-span-2">
        <Panel>
          {(seen) => (
            <div className="flex h-full items-center gap-6">
              <div className="relative h-[140px] w-[140px] shrink-0">
                <svg viewBox="0 0 120 120" className="h-full w-full -rotate-90">
                  <defs>
                    <linearGradient id="recg" x1="0" y1="0" x2="1" y2="1">
                      <stop offset="0" stopColor="#c8ff7a" />
                      <stop offset="1" stopColor="#1fd6a0" />
                    </linearGradient>
                  </defs>
                  <circle cx="60" cy="60" r="52" fill="none" stroke="rgba(255,255,255,.08)" strokeWidth="8" />
                  <circle
                    cx="60" cy="60" r="52" fill="none" stroke="url(#recg)" strokeWidth="8" strokeLinecap="round"
                    strokeDasharray={C} strokeDashoffset={seen ? C * (1 - 0.74) : C}
                    style={{ transition: "stroke-dashoffset 2s cubic-bezier(.2,.7,.2,1)" }}
                  />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <div className="text-3xl font-bold tabular-nums"><CountUp to={74} suffix="%" run={seen} /></div>
                  <div className="text-[9px] tracking-widest text-white/50">REUSED</div>
                </div>
              </div>
              <div>
                <PanelLabel>Litres recovered</PanelLabel>
                <div className="mt-3 text-5xl font-bold tabular-nums tracking-tight">
                  <CountUp to={7.4} decimals={1} suffix="M+" run={seen} />
                </div>
                <p className="mt-2 text-sm leading-6 text-white/55">Returned to irrigation, cooling and industrial use.</p>
              </div>
            </div>
          )}
        </Panel>
      </Reveal>

      {/* projects dot grid */}
      <Reveal delay={160} className="h-full sm:col-span-1">
        <Panel>
          {(seen) => (
            <div>
              <PanelLabel>Projects</PanelLabel>
              <div className="mt-3 text-5xl font-bold tabular-nums tracking-tight">
                <CountUp to={42} suffix="+" run={seen} />
              </div>
              <div className="mt-5 grid grid-cols-7 gap-2">
                {Array.from({ length: 42 }).map((_, i) => (
                  <span
                    key={i}
                    className="h-2.5 w-2.5 rounded-full"
                    style={{
                      background: seen ? (i % 6 === 0 ? "#a6ff4d" : "#1fd6a0") : "rgba(255,255,255,.1)",
                      boxShadow: seen ? "0 0 8px rgba(31,214,160,.6)" : "none",
                      transition: `background .5s ease ${i * 40}ms, box-shadow .5s ease ${i * 40}ms`,
                    }}
                  />
                ))}
              </div>
            </div>
          )}
        </Panel>
      </Reveal>

      {/* spacer-free: pollutants breakdown */}
      <Reveal delay={240} className="h-full sm:col-span-1">
        <Panel>
          {(seen) => (
            <div>
              <PanelLabel>Pollutants removed</PanelLabel>
              <div className="mt-3 text-5xl font-bold tabular-nums tracking-tight">
                <CountUp to={12} suffix="K+" run={seen} />
              </div>
              <div className="text-xs text-white/45">tonnes</div>
              <div className="mt-5 flex h-2.5 overflow-hidden rounded-full bg-white/10">
                {pollutants.map((p, i) => (
                  <div
                    key={p.name}
                    style={{
                      width: seen ? `${p.pct}%` : "0%",
                      background: p.color,
                      transition: `width 1.4s cubic-bezier(.2,.7,.2,1) ${i * 200}ms`,
                    }}
                  />
                ))}
              </div>
              <div className="mt-4 space-y-2">
                {pollutants.map((p) => (
                  <div key={p.name} className="flex items-center justify-between text-xs text-white/60">
                    <span className="flex items-center gap-2">
                      <i className="inline-block h-2 w-2 rounded-full" style={{ background: p.color }} /> {p.name}
                    </span>
                    <span className="tabular-nums text-white/80">{p.t}</span>
                  </div>
                ))}
              </div>
              <div className="mt-3 text-[9px] text-white/30">Breakdown illustrative.</div>
            </div>
          )}
        </Panel>
      </Reveal>
    </div>
  );
}

/* ───────────────────────── footer water ───────────────────────── */

function WaterFooter() {
  const wrap = useRef<HTMLElement>(null);
  const cv = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const el = wrap.current!;
    const canvas = cv.current!;
    const ctx = canvas.getContext("2d")!;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    let w = 0, h = 0, raf = 0, visible = true, lastRip = 0;

    type Bubble = { x: number; y: number; r: number; s: number; p: number; a: number };
    let bubbles: Bubble[] = [];
    const ripples: { x: number; t: number; a: number }[] = [];

    const mk = (init: boolean): Bubble => {
      const r = 0.8 + Math.pow(Math.random(), 3) * 6;
      return {
        x: Math.random() * w,
        y: init ? h * (0.35 + Math.random() * 0.65) : h + 10,
        r,
        s: 0.2 + r * 0.1 + Math.random() * 0.3,
        p: Math.random() * Math.PI * 2,
        a: 0.3 + Math.random() * 0.5,
      };
    };

    const size = () => {
      const r = el.getBoundingClientRect();
      w = r.width; h = r.height;
      canvas.width = w * dpr; canvas.height = h * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      bubbles = Array.from({ length: Math.min(120, Math.round(w / 14)) }, () => mk(true));
    };

    const onMove = (e: PointerEvent) => {
      const r = el.getBoundingClientRect();
      if (e.clientY < r.top || e.clientY > r.bottom) return;
      const now = performance.now();
      if (now - lastRip < 140) return;
      lastRip = now;
      ripples.push({ x: e.clientX - r.left, t: now, a: 10 });
      if (ripples.length > 6) ripples.shift();
    };

    const surf = (x: number, t: number, off = 0) => {
      let y =
        h * 0.28 + off +
        Math.sin(x * 0.008 + t / 900 + off) * 14 +
        Math.sin(x * 0.017 - t / 600) * 7 +
        Math.sin(x * 0.003 + t / 1500) * 10;
      for (const rp of ripples) {
        const dt = t - rp.t, d = Math.abs(x - rp.x);
        y += rp.a * Math.exp(-dt / 900) * Math.exp(-d / 140) * Math.sin(d * 0.05 - dt / 120);
      }
      return y;
    };

    const hash = (n: number) => { const s = Math.sin(n * 12.9898) * 43758.5453; return s - Math.floor(s); };

    const body = (t: number, off: number, alpha: number) => {
      ctx.beginPath();
      ctx.moveTo(0, h);
      for (let x = 0; x <= w; x += 6) ctx.lineTo(x, surf(x, t, off));
      ctx.lineTo(w, h);
      ctx.closePath();
      const g = ctx.createLinearGradient(0, h * 0.15, 0, h);
      g.addColorStop(0, `rgba(31,214,160,${0.6 * alpha})`);
      g.addColorStop(0.3, `rgba(12,70,50,${0.85 * alpha})`);
      g.addColorStop(0.7, `rgba(5,24,17,${0.95 * alpha})`);
      g.addColorStop(1, `rgba(3,11,8,${alpha})`);
      ctx.fillStyle = g;
      ctx.fill();
    };

    const tick = (t: number) => {
      raf = requestAnimationFrame(tick);
      if (!visible) return;
      ctx.clearRect(0, 0, w, h);

      body(t, -18, 0.45);
      body(t, 0, 1);

      ctx.globalCompositeOperation = "lighter";
      for (let i = 0; i < 6; i++) {
        const x0 = (i / 5) * w + Math.sin(t / 4000 + i * 2) * 60;
        const y0 = surf(x0, t);
        const g = ctx.createLinearGradient(0, y0, 0, h);
        g.addColorStop(0, "rgba(166,255,77,0.10)");
        g.addColorStop(1, "rgba(166,255,77,0)");
        ctx.fillStyle = g;
        ctx.beginPath();
        ctx.moveTo(x0 - 14, y0);
        ctx.lineTo(x0 + 14, y0);
        ctx.lineTo(x0 + 90 + i * 12, h);
        ctx.lineTo(x0 - 70 + i * 12, h);
        ctx.closePath();
        ctx.fill();
      }
      ctx.globalCompositeOperation = "source-over";

      ctx.beginPath();
      for (let x = 0; x <= w; x += 6) {
        const y = surf(x, t);
        x === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
      }
      for (let x = w; x >= 0; x -= 6) ctx.lineTo(x, surf(x, t) + 16);
      ctx.closePath();
      const mg = ctx.createLinearGradient(0, h * 0.2, 0, h * 0.5);
      mg.addColorStop(0, "rgba(200,255,122,0.35)");
      mg.addColorStop(1, "rgba(200,255,122,0)");
      ctx.fillStyle = mg;
      ctx.fill();

      ctx.beginPath();
      for (let x = 0; x <= w; x += 6) {
        const y = surf(x, t);
        x === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
      }
      ctx.strokeStyle = "rgba(200,255,122,0.9)";
      ctx.lineWidth = 2;
      ctx.shadowColor = "#a6ff4d";
      ctx.shadowBlur = 16;
      ctx.stroke();
      ctx.shadowBlur = 0;

      ctx.beginPath();
      for (let x = 0; x <= w; x += 6) {
        const y = surf(x, t) + 7;
        x === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
      }
      ctx.strokeStyle = "rgba(200,255,122,0.25)";
      ctx.lineWidth = 1;
      ctx.stroke();

      ctx.strokeStyle = "rgba(200,255,122,0.65)";
      ctx.fillStyle = "rgba(200,255,122,0.08)";
      for (let i = 0; i < w / 8; i++) {
        const x = (i * 8.3) % w;
        const r = 0.8 + hash(i) * 2.4;
        const y = surf(x, t) + 3 + hash(i + 99) * 12;
        ctx.beginPath();
        ctx.arc(x, y, r, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
      }

      for (const b of bubbles) {
        b.y -= b.s;
        const x = b.x + Math.sin(t / 700 + b.p) * (3 + b.r);
        if (b.y < surf(x, t) + 8) Object.assign(b, mk(false));
        ctx.beginPath();
        ctx.arc(x, b.y, b.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(166,255,77,${b.a * 0.1})`;
        ctx.strokeStyle = `rgba(166,255,77,${b.a})`;
        ctx.lineWidth = 1;
        ctx.fill();
        ctx.stroke();
        ctx.beginPath();
        ctx.arc(x - b.r * 0.35, b.y - b.r * 0.35, Math.max(0.6, b.r * 0.25), 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255,255,255,${b.a})`;
        ctx.fill();
      }
    };

    size();
    raf = requestAnimationFrame(tick);
    const io = new IntersectionObserver(([e]) => (visible = e.isIntersecting));
    io.observe(el);
    window.addEventListener("resize", size);
    window.addEventListener("pointermove", onMove);
    return () => {
      cancelAnimationFrame(raf);
      io.disconnect();
      window.removeEventListener("resize", size);
      window.removeEventListener("pointermove", onMove);
    };
  }, []);

  return (
    <footer ref={wrap} className="relative flex min-h-[460px] items-end overflow-hidden">
      <canvas ref={cv} aria-hidden className="pointer-events-none absolute inset-0 h-full w-full" />

      <div className="relative z-10 mx-auto w-full max-w-7xl px-6 pb-8 pt-52">
        <div className="flex flex-col justify-between gap-8 md:flex-row md:items-end">
          <div>
            <div className="text-xl font-bold tracking-[0.2em] text-white">AQUAPURE</div>
            <div className="mt-1 text-xs tracking-[0.3em] text-white/70">SMART WATER SYSTEMS</div>
            <p className="mt-4 max-w-xs text-sm leading-6 text-white/60">
              Turning wastewater into a valuable resource for cities, industries and communities.
            </p>
          </div>

          <div className="flex flex-wrap gap-x-8 gap-y-3 text-sm text-white/70">
            {nav.map((n) => (
              <a key={n} href={`#${n.toLowerCase()}`} className="transition hover:text-[#a6ff4d]">
                {n}
              </a>
            ))}
          </div>
        </div>

        <div className="mt-8 flex flex-col justify-between gap-2 border-t border-white/10 pt-5 text-xs text-white/50 md:flex-row">
          <div>© 2026 AquaPure. Engineering a water-positive future.</div>
          <div>info@aquapure.com</div>
        </div>
      </div>
    </footer>
  );
}

/* ───────────────────────── page ───────────────────────── */

export default function Home() {
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(0);
  const [paused, setPaused] = useState(false);
  const [section, setSection] = useState("technology");
  const [scrolled, setScrolled] = useState(false);
  const [sent, setSent] = useState(false);
  const bar = useRef<HTMLDivElement>(null);

  // scroll progress + nav state
  useEffect(() => {
    const onScroll = () => {
      const d = document.documentElement;
      const max = d.scrollHeight - d.clientHeight;
      if (bar.current) bar.current.style.width = `${max > 0 ? (window.scrollY / max) * 100 : 0}%`;
      setScrolled(window.scrollY > 24);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // active nav link
  useEffect(() => {
    const els = nav
      .map((n) => document.getElementById(n.toLowerCase()))
      .filter((e): e is HTMLElement => !!e);
    const io = new IntersectionObserver(
      (es) => es.forEach((e) => e.isIntersecting && setSection(e.target.id)),
      { rootMargin: "-40% 0px -55% 0px" },
    );
    els.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, []);

  // auto-advance process steps
  useEffect(() => {
    if (paused) return;
    const id = setInterval(() => setActive((a) => (a + 1) % steps.length), 4500);
    return () => clearInterval(id);
  }, [paused, active]);

  const onSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSent(true);
  };

  const inputCls =
    "w-full rounded-xl border border-white/10 bg-white/[0.04] px-5 py-4 outline-none transition placeholder:text-white/30 focus:border-[#a6ff4d]/60 focus:bg-white/[0.06]";

  return (
    <main style={{ background: "#030b08", color: "#fff", minHeight: "100vh" }} className="min-h-screen bg-[#030b08] text-white antialiased">
      <style>{css}</style>
      <div ref={bar} className="fixed left-0 top-0 z-[60] h-[2px] bg-gradient-to-r from-[#1fd6a0] to-[#a6ff4d]" style={{ width: 0 }} />
      <WaterTrail />
      <div className="relative z-10">
        {/* NAV */}
        <nav className={`fixed inset-x-0 top-0 z-50 border-b backdrop-blur-xl transition-colors duration-300 ${scrolled ? "border-white/10 bg-[#030b08]/90" : "border-transparent bg-[#030b08]/40"}`}>
          <div className="mx-auto flex h-[72px] max-w-7xl items-center justify-between px-6">
            <a href="#" className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#a6ff4d] text-[#030b08] shadow-[0_0_24px_rgba(166,255,77,.45)]">
                <Droplet size={22} />
              </div>
              <div>
                <div className="text-lg font-bold tracking-[0.22em]">AQUAPURE</div>
                <div className="text-[8px] tracking-[0.35em] text-white/45">SMART WATER SYSTEMS</div>
              </div>
            </a>
            <div className="hidden gap-9 lg:flex">
              {nav.map((n) => {
                const on = section === n.toLowerCase();
                return (
                  <a key={n} href={`#${n.toLowerCase()}`}
                    className={`relative py-2 text-sm transition ${on ? "text-white" : "text-white/60 hover:text-white"}`}>
                    {n}
                    <span className={`absolute -bottom-[1px] left-1/2 h-0.5 -translate-x-1/2 rounded bg-[#a6ff4d] transition-all duration-300 ${on ? "w-8" : "w-0"}`} />
                  </a>
                );
              })}
            </div>
            <a href="#contact" className="hidden items-center gap-2 rounded-full bg-[#a6ff4d] px-6 py-3 text-sm font-semibold text-[#030b08] transition hover:scale-105 hover:shadow-[0_0_30px_rgba(166,255,77,.5)] lg:flex">
              Request Consultation <ArrowRight size={16} />
            </a>
            <button className="lg:hidden" onClick={() => setOpen(!open)} aria-label="Toggle menu">
              {open ? <X /> : <Menu />}
            </button>
          </div>
          {open && (
            <div className="flex flex-col gap-5 border-t border-white/10 bg-[#030b08] px-6 py-6 lg:hidden">
              {nav.map((n) => (
                <a key={n} href={`#${n.toLowerCase()}`} onClick={() => setOpen(false)} className="text-white/70">{n}</a>
              ))}
              <a href="#contact" onClick={() => setOpen(false)} className="rounded-full bg-[#a6ff4d] px-6 py-3 text-center text-sm font-semibold text-[#030b08]">
                Request Consultation
              </a>
            </div>
          )}
        </nav>

        {/* HERO */}
        <section id="technology" className="relative overflow-hidden pt-[72px]">
          <div className="absolute -right-40 top-10 h-[600px] w-[600px] rounded-full bg-[#a6ff4d]/10 blur-[140px]" />
          <div className="absolute -left-40 top-1/3 h-[400px] w-[400px] rounded-full bg-[#1fd6a0]/10 blur-[120px]" />
          <div
            className="pointer-events-none absolute inset-0"
            style={{
              backgroundImage: "radial-gradient(rgba(166,255,77,.14) 1px, transparent 1px)",
              backgroundSize: "28px 28px",
              maskImage: "radial-gradient(ellipse at 70% 30%, black, transparent 70%)",
              WebkitMaskImage: "radial-gradient(ellipse at 70% 30%, black, transparent 70%)",
            }}
          />
          <div className="relative mx-auto grid max-w-7xl items-center gap-14 px-6 pb-12 pt-16 lg:grid-cols-[.9fr_1.1fr]">
            <div>
              <div className="mb-8 inline-flex items-center gap-2 rounded-full border border-[#a6ff4d]/40 bg-[#a6ff4d]/5 px-4 py-2 text-xs font-medium tracking-wide text-[#a6ff4d]">
                <Leaf size={14} /> NEXT-GEN WASTEWATER SOLUTIONS
              </div>
              <h1 className="text-6xl font-extrabold leading-[0.95] tracking-tight sm:text-7xl xl:text-[88px]">
                Clean water.
                <span className="ap-shimmer block bg-gradient-to-r from-[#c8ff7a] via-[#5be03a] to-[#c8ff7a] bg-clip-text text-transparent">
                  Smarter future.
                </span>
              </h1>
              <p className="mt-8 max-w-md text-lg leading-8 text-white/65">
                Advanced, AI-powered sewage treatment systems engineered to transform wastewater into a valuable resource for cities, industries and communities.
              </p>
              <div className="mt-10 flex flex-wrap gap-4">
                <a href="#process" className="flex items-center gap-3 rounded-full bg-[#a6ff4d] px-7 py-4 font-semibold text-[#030b08] transition hover:scale-105 hover:shadow-[0_0_34px_rgba(166,255,77,.5)]">
                  <ArrowUpRight size={18} /> Explore Technology
                </a>
                <a href="#contact" className="flex items-center gap-3 rounded-full border border-white/20 px-7 py-4 font-semibold transition hover:border-[#a6ff4d]/50 hover:bg-white/5">
                  <Play size={16} /> Watch 2 Min Demo
                </a>
              </div>
            </div>

            <HeroVisual />
          </div>

          <FlowStats />
        </section>

        <Marquee />

        {/* PROCESS */}
        <section id="process" className="mx-auto max-w-7xl px-6 py-28">
          <div className="grid gap-14 lg:grid-cols-[.85fr_1.15fr]">
            <div className="lg:sticky lg:top-28 lg:self-start">
              <Reveal>
                <div className="text-xs font-semibold tracking-[0.3em] text-[#a6ff4d]">THE PROCESS</div>
                <h2 className="mt-5 text-4xl font-bold tracking-tight sm:text-5xl">
                  From wastewater to <span className="text-[#a6ff4d]">reusable water.</span>
                </h2>
                <p className="mt-6 max-w-md leading-7 text-white/50">
                  Every drop passes through an engineered sequence of physical, biological and advanced treatment stages. Watch the water clear as it moves through each one.
                </p>
              </Reveal>
              <div className="mt-8 max-w-md">
                <Tank active={active} />
              </div>
            </div>

            <div
              className="relative space-y-3 pl-6"
              onMouseEnter={() => setPaused(true)}
              onMouseLeave={() => setPaused(false)}
            >
              {/* vertical progress line */}
              <div className="absolute bottom-3 left-0 top-3 w-px bg-white/10" />
              <div
                className="absolute left-0 top-3 w-px bg-[#a6ff4d] shadow-[0_0_10px_#a6ff4d] transition-all duration-700"
                style={{ height: `calc(${((active + 1) / steps.length) * 100}% - 12px)` }}
              />
              {steps.map((s, i) => {
                const on = active === i;
                return (
                  <Reveal key={s.t} delay={i * 60}>
                    <button
                      onClick={() => setActive(i)}
                      className={`relative w-full overflow-hidden rounded-2xl border p-6 text-left transition ${on ? "border-[#a6ff4d]/40 bg-[#a6ff4d]/5" : "border-white/10 bg-white/[0.02] hover:bg-white/[0.04]"}`}
                    >
                      <div className="flex items-center gap-5">
                        <span className={`text-sm ${on ? "text-[#a6ff4d]" : i < active ? "text-[#a6ff4d]/50" : "text-white/25"}`}>0{i + 1}</span>
                        <div className="flex-1">
                          <h3 className="text-lg font-semibold">{s.t}</h3>
                          <div className={`grid transition-[grid-template-rows] duration-500 ${on ? "grid-rows-[1fr]" : "grid-rows-[0fr]"}`}>
                            <p className="overflow-hidden max-w-xl text-sm leading-6 text-white/50"><span className="mt-2 block">{s.d}</span></p>
                          </div>
                        </div>
                        <ArrowRight size={18} className={`transition ${on ? "translate-x-1 text-[#a6ff4d]" : "text-white/20"}`} />
                      </div>
                      {on && (
                        <span
                          key={`${active}-${paused}`}
                          className={`absolute bottom-0 left-0 h-[2px] bg-[#a6ff4d] ${paused ? "w-0" : "ap-fill"}`}
                        />
                      )}
                    </button>
                  </Reveal>
                );
              })}
            </div>
          </div>
        </section>

        {/* SOLUTIONS */}
        <section id="solutions" className="bg-[#06150f]/70 py-28">
          <div className="mx-auto max-w-7xl px-6">
            <Reveal>
              <div className="text-xs tracking-[0.3em] text-[#a6ff4d]">ENGINEERED SOLUTIONS</div>
              <h2 className="mt-5 text-4xl font-bold sm:text-5xl">
                One platform. <span className="text-white/40">Every water challenge.</span>
              </h2>
            </Reveal>
            <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {solutions.map((s, i) => (
                <Reveal key={s.name} delay={i * 80}>
                  <SolutionCard s={s} i={i} />
                </Reveal>
              ))}
            </div>
          </div>
        </section>

        {/* IMPACT */}
        <section id="impact" className="mx-auto max-w-7xl px-6 py-28">
          <Reveal>
            <div className="text-xs tracking-[0.3em] text-[#a6ff4d]">OUR IMPACT</div>
            <h2 className="mt-5 text-4xl font-bold sm:text-5xl">
              Measured in litres, <span className="text-white/40">not promises.</span>
            </h2>
          </Reveal>
          <ImpactDashboard />
        </section>

        {/* CONTACT */}
        <section id="contact" className="mx-auto max-w-7xl px-6 py-28">
          <Reveal>
            <div className="relative grid gap-12 overflow-hidden rounded-[40px] border border-[#a6ff4d]/20 bg-gradient-to-br from-[#0a2118] to-[#050f0b] p-8 md:p-14 lg:grid-cols-2">
              <div className="pointer-events-none absolute -left-20 -top-20 h-72 w-72 rounded-full bg-[#a6ff4d]/10 blur-[100px]" />
              <div className="relative">
                <div className="text-xs tracking-[0.3em] text-[#a6ff4d]">START A PROJECT</div>
                <h2 className="mt-5 text-4xl font-bold sm:text-5xl">
                  Let&apos;s build a <span className="text-[#a6ff4d]">cleaner future.</span>
                </h2>
                <p className="mt-6 max-w-md leading-7 text-white/50">
                  Tell us about your wastewater challenge and our engineers will help you find the right solution.
                </p>
                <ul className="mt-8 space-y-3 text-sm text-white/70">
                  {["Free site assessment and capacity sizing", "Transparent CAPEX and OPEX estimate", "Reply from an engineer within 24 hours"].map((t) => (
                    <li key={t} className="flex items-center gap-3">
                      <span className="flex h-6 w-6 items-center justify-center rounded-full bg-[#a6ff4d]/15 text-[#a6ff4d]"><Check size={14} /></span>
                      {t}
                    </li>
                  ))}
                </ul>
              </div>

              {sent ? (
                <div className="relative flex flex-col items-center justify-center rounded-3xl border border-[#a6ff4d]/25 bg-[#a6ff4d]/5 p-10 text-center">
                  <Ring size={72}><Check size={32} /></Ring>
                  <h3 className="mt-6 text-2xl font-semibold">Request received</h3>
                  <p className="mt-2 max-w-xs text-sm leading-6 text-white/55">
                    Thanks, our engineers will get back to you shortly with next steps.
                  </p>
                  <button onClick={() => setSent(false)} className="mt-6 text-sm text-[#a6ff4d] underline-offset-4 hover:underline">
                    Send another request
                  </button>
                </div>
              ) : (
                <form className="relative space-y-4" onSubmit={onSubmit}>
                  <input required aria-label="Your name" placeholder="Your name" type="text" className={inputCls} />
                  <input required aria-label="Work email" placeholder="Work email" type="email" className={inputCls} />
                  <select required defaultValue="" aria-label="Project type" className={`${inputCls} bg-[#0a1f16] text-white/70`}>
                    <option value="" disabled>Project type</option>
                    {solutions.map((s) => <option key={s.name}>{s.name}</option>)}
                  </select>
                  <textarea rows={4} aria-label="Project details" placeholder="Tell us about your project..." className={`${inputCls} resize-none`} />
                  <button type="submit" className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#a6ff4d] px-6 py-4 font-semibold text-[#030b08] transition hover:scale-[1.01] hover:shadow-[0_0_34px_rgba(166,255,77,.45)]">
                    Request Consultation <ArrowRight size={18} />
                  </button>
                </form>
              )}
            </div>
          </Reveal>
        </section>

        {/* FOOTER */}
        <WaterFooter />
      </div>
    </main>
  );
}