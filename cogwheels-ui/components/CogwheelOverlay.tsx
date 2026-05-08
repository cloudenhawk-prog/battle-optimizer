mport { useEffect, useState } from "react";
import {
  Cog,
  TacetDiamond,
  TacetCross,
  TacetSpire,
  TacetTriquetra,
  CornerBracket,
} from "./Cog";

/* -------------------------------------------------------------------- */
/*  Mock data — purely for layout. Real values are wired in elsewhere.  */
/* -------------------------------------------------------------------- */

const ROTATION = [
  { i: 1, name: "Resonance Skill", tag: "E", cd: "1.2s" },
  { i: 2, name: "Basic ×3 → Heavy", tag: "BA", cd: "—" },
  { i: 3, name: "Echo: Jué", tag: "Q", cd: "18s" },
  { i: 4, name: "Liberation", tag: "R", cd: "20s" },
  { i: 5, name: "Outro · Swap", tag: "↔", cd: "—" },
];

const STAT_POOL = [
  { key: "CRIT Rate", val: "72.6%", w: 0.92 },
  { key: "CRIT DMG", val: "248%", w: 0.88 },
  { key: "ATK%", val: "84%", w: 0.71 },
  { key: "Spectro DMG", val: "62%", w: 0.66 },
  { key: "Energy Regen", val: "138%", w: 0.34 },
];

const RESULTS = [
  { rank: 1, name: "Build · Sierra-7", dps: 184_220, delta: "+0.0%", crit: 71, dmg: 246, atk: 82 },
  { rank: 2, name: "Build · Sierra-3", dps: 181_904, delta: "−1.3%", crit: 68, dmg: 252, atk: 79 },
  { rank: 3, name: "Build · Echo-12", dps: 178_641, delta: "−3.0%", crit: 74, dmg: 228, atk: 86 },
  { rank: 4, name: "Build · Echo-09", dps: 174_530, delta: "−5.3%", crit: 65, dmg: 244, atk: 88 },
  { rank: 5, name: "Build · Tacet-2", dps: 169_812, delta: "−7.8%", crit: 70, dmg: 218, atk: 84 },
];

const TOP = RESULTS[0];

/* -------------------------------------------------------------------- */

export function CogwheelOverlay() {
  const [iter, setIter] = useState(8421);
  const [pulse, setPulse] = useState(false);

  useEffect(() => {
    const id = setInterval(() => setIter((n) => n + Math.floor(7 + Math.random() * 18)), 220);
    return () => clearInterval(id);
  }, []);
  useEffect(() => {
    const id = setInterval(() => {
      setPulse(true);
      window.setTimeout(() => setPulse(false), 1400);
    }, 6000);
    return () => clearInterval(id);
  }, []);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-sm p-6">
      {/* Calm corner cog far behind the overlay */}
      <Cog
        size={520}
        teeth={22}
        toothShape="pin"
        innerStyle="rings"
        className="ww-cog-spin pointer-events-none absolute -left-48 -bottom-48 text-ww-gold/[0.06]"
      />

      {/* Overlay panel */}
      <div
        className="ww-overlay-in relative aspect-[5/4] w-[80vw] max-w-[1180px] rounded-[28px] overflow-hidden ww-gold-glow text-ww-ink"
        style={{
          background:
            "radial-gradient(120% 80% at 50% 0%, oklch(0.30 0.018 80) 0%, oklch(0.18 0.012 80) 60%, oklch(0.13 0.012 80) 100%)",
        }}
      >
        {/* Calm decoration layer */}
        <div className="absolute inset-0 ww-grid opacity-30" />
        <div className="absolute inset-0 ww-noise opacity-20 mix-blend-overlay" />
        <Cog
          size={420}
          teeth={36}
          toothShape="pin"
          innerStyle="rings"
          className="pointer-events-none absolute -right-28 -bottom-28 text-ww-gold/[0.05]"
        />

        {/* Corner brackets (asymmetric) */}
        <CornerBracket className="absolute top-3 right-3 rotate-90 text-ww-gold/60" />
        <CornerBracket className="absolute bottom-3 left-3 -rotate-90 text-ww-gold/60" />
        <CornerBracket className="absolute bottom-3 right-3 rotate-180 text-ww-gold/40" />

        {/* Edge orbiter */}
        <EdgeOrbiter />

        {/* ===================== TOP BAR ===================== */}
        <header className="absolute inset-x-0 top-0 h-16 px-8 flex items-center justify-between border-b border-ww-edge/60">
          <div className="flex items-center gap-4">
            <TacetTriquetra size={26} className="text-ww-gold-soft/80" />
            <div className="leading-tight">
              <div className="text-[10px] uppercase tracking-[0.32em] text-ww-ink-dim">
                Tacet Forge · Module 03
              </div>
              <h2 className="font-serif text-[19px] tracking-wide text-ww-ink">
                Rotation <span className="text-ww-gold">Optimizer</span>
              </h2>
            </div>
            <span className="ml-3 hidden sm:inline-flex items-center gap-2 px-2.5 py-1 rounded-full border border-ww-edge bg-ww-bg/40 text-[10px] tracking-[0.25em] uppercase text-ww-gold-soft">
              <span className="h-1.5 w-1.5 rounded-full bg-ww-gold ww-shimmer" />
              Solving
            </span>
          </div>

          <div className="flex items-center gap-5">
            <Stat label="Iteration" value={iter.toLocaleString()} />
            <span className="h-7 w-px bg-ww-edge" />
            <Stat label="Best DPS" value={TOP.dps.toLocaleString()} accent />
            <span className="h-7 w-px bg-ww-edge" />
            <Stat label="ETA" value="00:42" />
            <Cog
              size={36}
              teeth={12}
              toothShape="trapezoid"
              innerStyle="web"
              className="ww-cog-spin-fast text-ww-gold drop-shadow-[0_0_8px_oklch(0.86_0.13_88_/_0.5)]"
            />
          </div>
        </header>

        {/* ===================== BODY ===================== */}
        <div className="absolute inset-x-8 top-20 bottom-24 grid grid-cols-12 gap-5">
          {/* LEFT — Rotation + Target */}
          <section className="col-span-3 flex flex-col gap-4">
            <PanelHeading icon={<TacetSpire size={14} />} title="Skill Rotation" hint="5 steps · 9.4s" />
            <div className="ww-inset rounded-2xl bg-ww-panel/60 p-3 flex-1 flex flex-col gap-2 overflow-hidden">
              {ROTATION.map((s, i) => (
                <div
                  key={s.i}
                  className={`relative flex items-center gap-3 rounded-md px-3 py-2 border border-ww-edge/40 ${
                    i === 0 ? "bg-ww-gold/10" : "bg-ww-panel-2/60"
                  }`}
                >
                  <span className="grid place-items-center h-6 w-6 rounded-sm bg-ww-bg/60 border border-ww-edge text-[10px] text-ww-gold-soft">
                    {s.i}
                  </span>
                  <div className="flex-1 min-w-0">
                    <div className="text-[12.5px] text-ww-ink truncate">{s.name}</div>
                    <div className="text-[10px] text-ww-ink-dim tracking-wider">CD {s.cd}</div>
                  </div>
                  <span className="text-[10px] tracking-widest text-ww-gold-soft border border-ww-edge px-1.5 py-0.5 rounded">
                    {s.tag}
                  </span>
                </div>
              ))}
            </div>

            <PanelHeading icon={<TacetCross size={14} />} title="Target Profile" />
            <div className="ww-inset rounded-2xl bg-ww-panel/60 p-3 grid grid-cols-2 gap-2 text-[11px]">
              <KV k="Lvl" v="90 / 90" />
              <KV k="Res" v="10%" />
              <KV k="Trial" v="60s" />
              <KV k="Buffs" v="Standard" />
            </div>
          </section>

          {/* CENTER — Top Result + Ranking */}
          <section className="col-span-6 flex flex-col gap-4">
            {/* Hero result card */}
            <div className="ww-inset relative rounded-2xl overflow-hidden bg-gradient-to-b from-ww-panel/80 to-ww-panel/40 p-5">
              <div
                className="absolute inset-0 pointer-events-none"
                style={{
                  background:
                    "radial-gradient(60% 50% at 50% 30%, oklch(0.86 0.13 88 / 0.10), transparent 70%)",
                }}
              />
              <Cog
                size={220}
                teeth={48}
                toothShape="pin"
                innerStyle="rings"
                className="absolute -right-10 -top-10 text-ww-gold/[0.08]"
              />
              <div className="relative flex items-start justify-between gap-6">
                <div className="flex items-center gap-4">
                  <div className="relative grid place-items-center h-16 w-16 rounded-xl bg-ww-bg/60 border border-ww-gold/40">
                    <TacetTriquetra size={36} className={`text-ww-gold ${pulse ? "ww-shimmer" : ""}`} />
                    <span className="absolute -top-2 -left-2 h-5 px-1.5 rounded-sm bg-ww-gold text-ww-bg text-[10px] font-bold tracking-widest grid place-items-center">
                      #1
                    </span>
                  </div>
                  <div>
                    <div className="text-[10px] uppercase tracking-[0.3em] text-ww-ink-dim">
                      Leading Configuration
                    </div>
                    <h3 className="font-serif text-[22px] text-ww-ink">{TOP.name}</h3>
                    <div className="text-[11px] text-ww-gold-soft mt-0.5">
                      Spectro · Mainstat ATK% / CRIT DMG · Echo set 4pc
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-[10px] uppercase tracking-[0.3em] text-ww-ink-dim">
                    Average DPS
                  </div>
                  <div className="font-serif text-[34px] leading-none text-ww-gold tabular-nums">
                    {TOP.dps.toLocaleString()}
                  </div>
                  <div className="text-[11px] text-ww-ink-dim tracking-wider mt-1">
                    σ ±1.4% · 200 sims
                  </div>
                </div>
              </div>

              <div className="relative mt-5 grid grid-cols-3 gap-3">
                <Meter label="CRIT Rate" value={TOP.crit} suffix="%" max={100} />
                <Meter label="CRIT DMG" value={TOP.dmg} suffix="%" max={300} />
                <Meter label="ATK%" value={TOP.atk} suffix="%" max={100} />
              </div>
            </div>

            {/* Ranked list */}
            <div className="ww-inset rounded-2xl bg-ww-panel/60 flex-1 overflow-hidden flex flex-col">
              <div className="flex items-center justify-between px-4 py-2.5 border-b border-ww-edge/50">
                <div className="flex items-center gap-2 text-[11px] uppercase tracking-[0.3em] text-ww-ink-dim">
                  <TacetDiamond size={12} className="text-ww-gold-soft" />
                  Leaderboard
                </div>
                <div className="flex items-center gap-3 text-[10px] tracking-widest text-ww-ink-dim">
                  <span>SORT · DPS</span>
                  <span className="h-3 w-px bg-ww-edge" />
                  <span>TOP 5 / 248</span>
                </div>
              </div>
              <div className="flex-1 overflow-hidden">
                {RESULTS.map((r) => (
                  <div
                    key={r.rank}
                    className={`grid grid-cols-12 items-center gap-3 px-4 h-11 border-b border-ww-edge/30 last:border-b-0 ${
                      r.rank === 1 ? "bg-ww-gold/[0.06]" : ""
                    }`}
                  >
                    <span className="col-span-1 font-serif text-ww-gold-soft tabular-nums">
                      {String(r.rank).padStart(2, "0")}
                    </span>
                    <span className="col-span-4 text-[12.5px] text-ww-ink truncate">{r.name}</span>
                    <div className="col-span-4 h-1.5 rounded-full bg-ww-bg/60 overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-ww-gold to-ww-gold-soft/40"
                        style={{ width: `${(r.dps / TOP.dps) * 100}%` }}
                      />
                    </div>
                    <span className="col-span-2 text-right tabular-nums text-[12.5px] text-ww-ink">
                      {r.dps.toLocaleString()}
                    </span>
                    <span
                      className={`col-span-1 text-right text-[11px] tabular-nums ${
                        r.rank === 1 ? "text-ww-gold" : "text-ww-ink-dim"
                      }`}
                    >
                      {r.delta}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* RIGHT — Stat pool + dial */}
          <section className="col-span-3 flex flex-col gap-4">
            <PanelHeading icon={<TacetDiamond size={12} />} title="Stat Pool" hint="weighted" />
            <div className="ww-inset rounded-2xl bg-ww-panel/60 p-3 flex flex-col gap-2">
              {STAT_POOL.map((s) => (
                <div key={s.key} className="flex items-center gap-3">
                  <span className="text-[11px] text-ww-ink-dim w-24 truncate">{s.key}</span>
                  <div className="flex-1 h-1.5 rounded-full bg-ww-bg/60 overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-ww-gold to-ww-gold-soft/40"
                      style={{ width: `${s.w * 100}%` }}
                    />
                  </div>
                  <span className="text-[11px] text-ww-gold-soft tabular-nums w-12 text-right">
                    {s.val}
                  </span>
                </div>
              ))}
            </div>

            <PanelHeading icon={<TacetCross size={12} />} title="Convergence" />
            <div className="ww-inset rounded-2xl bg-ww-panel/60 p-3 flex-1 grid grid-cols-2 gap-3 items-center">
              {/* dial */}
              <div className="relative aspect-square">
                <div className="absolute inset-0 rounded-full border border-ww-edge" />
                <div className="absolute inset-[10%] rounded-full border border-ww-edge/60" />
                {Array.from({ length: 24 }).map((_, i) => (
                  <span
                    key={i}
                    className="absolute left-1/2 top-1/2 -translate-x-1/2 origin-top w-px bg-ww-gold-soft/50"
                    style={{
                      height: i % 6 === 0 ? "12%" : "5%",
                      transform: `translate(-50%, -50%) rotate(${i * 15}deg) translateY(-90%)`,
                    }}
                  />
                ))}
                <span
                  className="absolute left-1/2 top-1/2 origin-bottom h-[40%] w-[2px] bg-gradient-to-t from-ww-gold to-transparent"
                  style={{ transform: "translate(-50%, -100%) rotate(48deg)" }}
                />
                <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 h-2.5 w-2.5 rounded-full bg-ww-gold" />
                <div className="absolute inset-0 grid place-items-center pointer-events-none">
                  <div className="mt-12 text-center">
                    <div className="font-serif text-ww-gold text-lg leading-none tabular-nums">94%</div>
                    <div className="text-[9px] tracking-[0.25em] text-ww-ink-dim mt-0.5">CONF.</div>
                  </div>
                </div>
              </div>
              <div className="flex flex-col gap-2 text-[11px]">
                <KV k="Samples" v="200" />
                <KV k="Variance" v="±1.4%" />
                <KV k="Plateau" v="3 iter" />
                <KV k="Mode" v="Greedy" />
              </div>
            </div>
          </section>
        </div>

        {/* ===================== FOOTER ===================== */}
        <footer className="absolute bottom-0 left-0 right-0 h-20 px-8 flex items-center justify-between border-t border-ww-edge bg-gradient-to-t from-ww-bg/50 to-transparent">
          <div className="flex items-center gap-4 flex-1 max-w-xl">
            <button
              className="group relative h-12 w-12 rounded-full bg-ww-panel-2 ww-inset grid place-items-center hover:bg-ww-panel transition-colors"
              aria-label="Pause"
            >
              <Cog
                size={22}
                teeth={10}
                toothShape="trapezoid"
                innerStyle="web"
                className="text-ww-gold transition-transform group-hover:[animation:cog-spin_2s_linear_infinite]"
              />
            </button>

            <div className="flex-1">
              <div className="flex items-center justify-between text-[10px] uppercase tracking-[0.28em] text-ww-ink-dim mb-1.5">
                <span>Search Progress</span>
                <span className="tabular-nums text-ww-gold-soft">
                  {iter.toLocaleString()} / 12,000
                </span>
              </div>
              <div className="relative h-1.5 rounded-full bg-ww-bg/70 overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-ww-gold to-ww-gold-soft"
                  style={{ width: `${Math.min(100, (iter / 12000) * 100)}%` }}
                />
                <div className="absolute inset-0 ww-shimmer pointer-events-none bg-gradient-to-r from-transparent via-white/10 to-transparent" />
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3 ml-6">
            <button className="h-10 px-4 rounded-md ww-inset bg-ww-panel-2/60 hover:bg-ww-panel text-ww-ink-dim hover:text-ww-ink text-[12px] tracking-[0.18em] uppercase transition flex items-center gap-2">
              <TacetCross size={14} />
              Export
            </button>
            <button
              className="h-12 px-6 rounded-full bg-gradient-to-b from-ww-gold to-ww-gold-soft text-ww-bg ww-gold-glow hover:brightness-110 transition flex items-center gap-3 text-[12px] tracking-[0.2em] uppercase font-semibold"
              aria-label="Apply best build"
            >
              <Cog
                size={18}
                teeth={10}
                toothShape="trapezoid"
                innerStyle="solid"
                className="ww-cog-spin-fast text-ww-bg"
              />
              Apply Build
              <TacetDiamond size={12} className="text-ww-bg/70" />
            </button>
          </div>
        </footer>
      </div>
    </div>
  );
}

/* -------------------------------------------------------------------- */
/*                              Sub-pieces                              */
/* -------------------------------------------------------------------- */

function Stat({ label, value, accent }: { label: string; value: string; accent?: boolean }) {
  return (
    <div className="leading-tight text-right">
      <div className="text-[9px] uppercase tracking-[0.3em] text-ww-ink-dim">{label}</div>
      <div
        className={`font-serif tabular-nums ${
          accent ? "text-ww-gold text-[18px]" : "text-ww-ink text-[15px]"
        }`}
      >
        {value}
      </div>
    </div>
  );
}

function PanelHeading({
  icon,
  title,
  hint,
}: {
  icon: React.ReactNode;
  title: string;
  hint?: string;
}) {
  return (
    <div className="flex items-center justify-between px-1">
      <div className="flex items-center gap-2 text-ww-gold-soft">
        {icon}
        <span className="text-[10px] uppercase tracking-[0.32em] text-ww-ink">{title}</span>
      </div>
      {hint && (
        <span className="text-[10px] tracking-[0.18em] uppercase text-ww-ink-dim">{hint}</span>
      )}
    </div>
  );
}

function KV({ k, v }: { k: string; v: string }) {
  return (
    <div className="flex items-center justify-between rounded-md bg-ww-bg/40 border border-ww-edge/40 px-2.5 py-1.5">
      <span className="text-[10px] uppercase tracking-widest text-ww-ink-dim">{k}</span>
      <span className="text-[11.5px] text-ww-ink tabular-nums">{v}</span>
    </div>
  );
}

function Meter({
  label,
  value,
  suffix,
  max,
}: {
  label: string;
  value: number;
  suffix?: string;
  max: number;
}) {
  const pct = Math.min(100, (value / max) * 100);
  return (
    <div className="rounded-lg bg-ww-bg/40 border border-ww-edge/50 px-3 py-2">
      <div className="flex items-baseline justify-between">
        <span className="text-[10px] uppercase tracking-[0.25em] text-ww-ink-dim">{label}</span>
        <span className="font-serif text-ww-gold text-[15px] tabular-nums">
          {value}
          {suffix}
        </span>
      </div>
      <div className="mt-1.5 h-1 rounded-full bg-ww-bg/70 overflow-hidden">
        <div
          className="h-full bg-gradient-to-r from-ww-gold to-ww-gold-soft/40"
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}

/**
 * A small marker that travels along the inner border of the overlay.
 */
function EdgeOrbiter() {
  return (
    <svg
      className="pointer-events-none absolute inset-0 h-full w-full"
      viewBox="0 0 100 80"
      preserveAspectRatio="none"
    >
      <defs>
        <path
          id="overlay-edge-path"
          d="M 4 2 H 96 A 2 2 0 0 1 98 4 V 76 A 2 2 0 0 1 96 78 H 4 A 2 2 0 0 1 2 76 V 4 A 2 2 0 0 1 4 2 Z"
          fill="none"
        />
      </defs>
      <use
        href="#overlay-edge-path"
        stroke="oklch(0.86 0.13 88 / 0.18)"
        strokeWidth="0.15"
        strokeDasharray="0.6 0.8"
      />
      <g>
        <circle r="0.9" fill="oklch(0.86 0.13 88)">
          <animateMotion dur="22s" repeatCount="indefinite" rotate="auto">
            <mpath href="#overlay-edge-path" />
          </animateMotion>
        </circle>
        <circle r="2.2" fill="oklch(0.86 0.13 88 / 0.25)">
          <animateMotion dur="22s" repeatCount="indefinite" rotate="auto">
            <mpath href="#overlay-edge-path" />
          </animateMotion>
        </circle>
      </g>
    </svg>
  );
}
