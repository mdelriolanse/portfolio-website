"use client"

import { useRef, useState } from "react"
import { motion, useInView } from "motion/react"

import { cn } from "@/lib/utils"
import {
  clipRevealTransition,
  DEFAULT_CHART_ENTER_TRANSITION,
} from "@/components/charts/animation"
import {
  RankedBarChart,
  StatBreakdown,
  type StatGroup,
} from "@/components/charts/stat-bars"

/*
 * Charts for the "Open weight, open risk" post. Data is transcribed from the
 * source study's figures; see https://www.aochongoliverli.com/open-weight-open-risk/
 */

const BIO_GROUPS: StatGroup[] = [
  {
    heading: "Threat class",
    rows: [
      { label: "A", value: 44 },
      { label: "C", value: 44 },
      { label: "B", value: 13 },
    ],
  },
  {
    heading: "Delivery method",
    rows: [
      { label: "Aerosol", value: 81 },
      { label: "Injection", value: 9 },
      { label: "Ingestion", value: 4 },
      { label: "Fomite", value: 4 },
      { label: "Vector", value: 3 },
    ],
  },
  {
    heading: "Contagiousness",
    rows: [
      { label: "Communicable", value: 69 },
      { label: "Isolated", value: 31 },
    ],
  },
  {
    heading: "Route",
    rows: [
      { label: "Respiratory", value: 81 },
      { label: "Percutaneous", value: 14 },
      { label: "Ingestion", value: 5 },
    ],
  },
  {
    heading: "Scale",
    rows: [
      { label: "Diffuse", value: 51 },
      { label: "Global", value: 40 },
      { label: "Localized", value: 9 },
    ],
  },
]

const CHEM_GROUPS: StatGroup[] = [
  {
    heading: "Agent family",
    rows: [
      { label: "Incapacitant", value: 36 },
      { label: "Nerve", value: 29 },
      { label: "Pulmonary", value: 17 },
      { label: "Vesicant", value: 8 },
      { label: "Asphyxiant", value: 6 },
    ],
  },
  {
    heading: "Agent grade",
    rows: [
      { label: "Grade I", value: 69 },
      { label: "Grade M", value: 28 },
    ],
  },
  {
    heading: "Delivery method",
    rows: [
      { label: "Explosive dispersal", value: 50 },
      { label: "Vapor passive", value: 42 },
      { label: "Ingestion", value: 4 },
      { label: "Dermal application", value: 2 },
      { label: "Injection", value: 0 },
    ],
  },
  {
    heading: "Exposure environment",
    rows: [
      { label: "Outdoor urban", value: 57 },
      { label: "Indoor confined", value: 26 },
      { label: "Outdoor open", value: 10 },
      { label: "Targeted consumption", value: 5 },
    ],
  },
]

const LATE_REFUSAL_SECTIONS: StatGroup[] = [
  {
    heading: "Think",
    rows: [
      { label: "DeepSeek-R1", value: 32 },
      { label: "DeepSeek-V3.2", value: 31 },
      { label: "DeepSeek-V4-Flash", value: 21 },
      { label: "DeepSeek-V4-Pro", value: 20 },
      { label: "Qwen3-235B", value: 17 },
      { label: "GLM-5.1", value: 14 },
      { label: "GLM-4.6", value: 8 },
    ],
  },
  {
    heading: "Instruct",
    rows: [
      { label: "Qwen3-Next-80B", value: 62 },
      { label: "DeepSeek-V3.2", value: 30 },
      { label: "Qwen3-235B", value: 27 },
      { label: "GLM-4.6", value: 9 },
      { label: "Kimi-K2", value: 7 },
    ],
  },
]

export function BioTraceBreakdown() {
  return (
    <StatBreakdown
      aria-label="Breakdown of 2,716 bio traces by threat class, delivery method, contagiousness, route, and scale. Aerosol delivery 81%, communicable 69%, respiratory route 81%, diffuse or global scale 91%."
      groups={BIO_GROUPS}
      sampleSize={2716}
      title="Bio"
    />
  )
}

export function ChemTraceBreakdown() {
  return (
    <StatBreakdown
      aria-label="Breakdown of 2,588 chem traces by agent family, agent grade, delivery method, and exposure environment. Explosive dispersal 50%, passive vapor 42%, outdoor urban 57%, indoor confined 26%."
      groups={CHEM_GROUPS}
      sampleSize={2588}
      title="Chem"
    />
  )
}

export function LateRefusalChart() {
  return (
    <RankedBarChart
      aria-label="Late refusal rate as a share of complied cases, per model. Qwen3-Next-80B-Instruct leads at 62%, well above the 23% pooled mean."
      axisLabel="Late refusal rate (% of complied cases)"
      max={70}
      reference={{ value: 23, label: "pooled mean" }}
      sections={LATE_REFUSAL_SECTIONS}
    />
  )
}

/* -------------------------------------------------------------------------- */
/*  Safety index chart                                                        */
/*                                                                            */
/*  Ported from the source study's own figure: same data, same scales, same   */
/*  fits. Only the palette, canvas size and chrome are restyled for this site.*/
/* -------------------------------------------------------------------------- */

const X_START = 2025
const X_END = 2027
/** Last observed release (Apr 2026). Everything to the right is forecast. */
const FORECAST_T = 2026.25

const BCSI_MIN = 0.41
const ECI_MIN = 120
const ECI_MAX = 185

const VIEW = { height: 520, width: 920 }
const MARGIN = { bottom: 40, left: 96, right: 104, top: 56 }
const PLOT = {
  bottom: VIEW.height - MARGIN.bottom,
  left: MARGIN.left,
  right: VIEW.width - MARGIN.right,
  top: MARGIN.top,
}

const MONTHS = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
]

/** "2026-04" to 2026.25 */
const decimalYear = (date: string) => {
  const [year, month] = date.split("-").map(Number)
  return year + (month - 1) / 12
}

const formatMonth = (t: number) => {
  const year = Math.floor(t)
  return `${MONTHS[Math.round((t - year) * 12)]} ${year}`
}

const px = (t: number) =>
  PLOT.left + ((t - X_START) / (X_END - X_START)) * (PLOT.right - PLOT.left)

const pyBcsi = (v: number) =>
  PLOT.top + (1 - (v - BCSI_MIN) / (1 - BCSI_MIN)) * (PLOT.bottom - PLOT.top)

const pyEci = (v: number) =>
  PLOT.top +
  (1 - (v - ECI_MIN) / (ECI_MAX - ECI_MIN)) * (PLOT.bottom - PLOT.top)

type Release = { d: string; eci: number; label: string }

const CLOSED_RELEASES: Release[] = [
  { d: "2025-02", eci: 137, label: "GPT-4.5" },
  { d: "2025-03", eci: 145, label: "Gemini 2.5 Pro" },
  { d: "2025-05", eci: 143, label: "Claude Opus 4" },
  { d: "2025-06", eci: 146, label: "Gemini 2.5 Pro" },
  { d: "2025-08", eci: 150, label: "GPT-5" },
  { d: "2025-08", eci: 144, label: "Claude Opus 4.1" },
  { d: "2025-11", eci: 149, label: "GPT-5.1" },
  { d: "2025-11", eci: 153, label: "Gemini 3 Pro" },
  { d: "2025-11", eci: 149, label: "Claude Opus 4.5" },
  { d: "2025-12", eci: 153, label: "GPT-5.2" },
  { d: "2025-12", eci: 154, label: "GPT-5.2 Pro" },
  { d: "2025-12", eci: 150, label: "Gemini 3 Flash" },
  { d: "2026-02", eci: 155, label: "GPT-5.3 Codex" },
  { d: "2026-02", eci: 155, label: "Claude Opus 4.6" },
  { d: "2026-02", eci: 156, label: "Gemini 3.1 Pro" },
  { d: "2026-03", eci: 156, label: "GPT-5.4" },
  { d: "2026-03", eci: 157, label: "GPT-5.4 Pro" },
  { d: "2026-04", eci: 155, label: "Claude Opus 4.7" },
  { d: "2026-04", eci: 157, label: "GPT-5.5" },
  { d: "2026-04", eci: 158, label: "GPT-5.5 Pro" },
]

const OPEN_RELEASES: Release[] = [
  { d: "2025-01", eci: 139, label: "DeepSeek-R1" },
  { d: "2025-04", eci: 139, label: "Qwen3-235B" },
  { d: "2025-05", eci: 142, label: "DeepSeek-R1-0528" },
  { d: "2025-07", eci: 145, label: "Qwen3-235B-Thinking" },
  { d: "2025-09", eci: 145, label: "DeepSeek-V3.2-Exp" },
  { d: "2025-09", eci: 141, label: "GLM-4.6" },
  { d: "2025-09", eci: 141, label: "Kimi-K2" },
  { d: "2025-11", eci: 145, label: "Kimi-K2-Thinking" },
  { d: "2025-12", eci: 146, label: "DeepSeek-V3.2" },
  { d: "2025-12", eci: 144, label: "GLM-4.7" },
  { d: "2026-01", eci: 148, label: "Kimi-K2.5" },
  { d: "2026-02", eci: 146, label: "GLM-5" },
]

/** Release dates for the models we ran, so BCSI lands on the same time axis. */
const RELEASED: Record<string, string> = {
  "DeepSeek-R1-0528": "2025-05",
  "DeepSeek-V3.2": "2025-12",
  "DeepSeek-V4-Flash": "2026-04",
  "DeepSeek-V4-Pro": "2026-04",
  "GLM-4.6": "2025-09",
  "GLM-5.1": "2026-04",
  "Kimi-K2-Instruct-0905": "2025-09",
  "Qwen3-235B-A22B-Instruct-2507": "2025-07",
  "Qwen3-235B-A22B-Thinking-2507": "2025-07",
  "Qwen3-Next-80B-A3B-Instruct": "2025-09",
}

const SHORT_NAME: Record<string, string> = {
  "Kimi-K2-Instruct-0905": "Kimi-K2-Instruct",
  "Qwen3-235B-A22B-Instruct-2507": "Qwen3-235B-Inst",
  "Qwen3-235B-A22B-Thinking-2507": "Qwen3-235B-Thk",
  "Qwen3-Next-80B-A3B-Instruct": "Qwen3-Next-80B-Inst",
}

/** Models that sat on the open-weight capability frontier at release. */
const FRONTIER = new Set(["DeepSeek-V4-Flash", "DeepSeek-V4-Pro", "GLM-5.1"])

/** Judged under the DeepSeek judge. BCSI = 1 - mean(BRI, CRI). */
const JUDGED = [
  { bri: 0.5521, cri: 0.2999, mode: "instruct", model: "DeepSeek-V3.2" },
  { bri: 0.6308, cri: 0.3397, mode: "instruct", model: "GLM-4.6" },
  {
    bri: 0.6276,
    cri: 0.3511,
    mode: "instruct",
    model: "Kimi-K2-Instruct-0905",
  },
  {
    bri: 0.5491,
    cri: 0.2982,
    mode: "instruct",
    model: "Qwen3-235B-A22B-Instruct-2507",
  },
  {
    bri: 0.4973,
    cri: 0.2781,
    mode: "instruct",
    model: "Qwen3-Next-80B-A3B-Instruct",
  },
  { bri: 0.5192, cri: 0.2946, mode: "think", model: "DeepSeek-R1-0528" },
  { bri: 0.5086, cri: 0.2506, mode: "think", model: "DeepSeek-V3.2" },
  { bri: 0.5132, cri: 0.3169, mode: "think", model: "DeepSeek-V4-Flash" },
  { bri: 0.5847, cri: 0.362, mode: "think", model: "DeepSeek-V4-Pro" },
  { bri: 0.6235, cri: 0.3369, mode: "think", model: "GLM-4.6" },
  { bri: 0.5578, cri: 0.3302, mode: "think", model: "GLM-5.1" },
  {
    bri: 0.5846,
    cri: 0.3048,
    mode: "think",
    model: "Qwen3-235B-A22B-Thinking-2507",
  },
]

const BCSI_POINTS = JUDGED.filter((row) => RELEASED[row.model])
  .map((row) => ({
    frontier: FRONTIER.has(row.model),
    mode: row.mode,
    short: SHORT_NAME[row.model] ?? row.model,
    t: decimalYear(RELEASED[row.model]),
    v: 1 - (row.bri + row.cri) / 2,
  }))
  .sort((a, b) => a.t - b.t || a.v - b.v)

/**
 * Capability growth is roughly exponential, so the trend is a least-squares fit
 * on log(ECI - floor) rather than a straight line through the releases.
 */
const fitExp = (releases: Release[]) => {
  const xs = releases.map((r) => decimalYear(r.d) - X_START)
  const ys = releases.map((r) => Math.log(Math.max(1e-6, r.eci - ECI_MIN + 1)))
  const mx = xs.reduce((sum, x) => sum + x, 0) / xs.length
  const my = ys.reduce((sum, y) => sum + y, 0) / ys.length
  let covariance = 0
  let variance = 0
  for (let i = 0; i < xs.length; i++) {
    covariance += (xs[i] - mx) * (ys[i] - my)
    variance += (xs[i] - mx) ** 2
  }
  const b = covariance / variance
  return { a: Math.exp(my - b * mx), b }
}

type Fit = ReturnType<typeof fitExp>

const evalFit = (fit: Fit, t: number) =>
  fit.a * Math.exp(fit.b * (t - X_START)) + ECI_MIN - 1

const CLOSED_FIT = fitExp(CLOSED_RELEASES)
const OPEN_FIT = fitExp(OPEN_RELEASES)

const fitPath = (fit: Fit, from: number, to: number) => {
  const steps = 60
  const points = Array.from({ length: steps + 1 }, (_, i) => {
    const t = from + ((to - from) * i) / steps
    return `${px(t).toFixed(1)},${pyEci(evalFit(fit, t)).toFixed(1)}`
  })
  return `M${points.join(" L")}`
}

const CLOSED_TREND = fitPath(CLOSED_FIT, X_START, FORECAST_T)
const CLOSED_FORECAST = fitPath(CLOSED_FIT, FORECAST_T, X_END)
const OPEN_TREND = fitPath(OPEN_FIT, X_START, FORECAST_T)
const OPEN_FORECAST = fitPath(OPEN_FIT, FORECAST_T, X_END)

const bcsiAt = (t: number, v: number) =>
  `${px(t).toFixed(1)},${pyBcsi(v).toFixed(1)}`

const BCSI_TREND = `M${bcsiAt(2025.18, 0.592)} C${bcsiAt(2025.48, 0.598)} ${bcsiAt(2025.93, 0.56)} ${bcsiAt(FORECAST_T, 0.532)}`
const BCSI_FORECAST = `M${bcsiAt(FORECAST_T, 0.532)} C${bcsiAt(2026.5, 0.51)} ${bcsiAt(2026.75, 0.488)} ${bcsiAt(X_END, 0.466)}`

const X_TICKS = Array.from({ length: (X_END - X_START) * 4 + 1 }, (_, i) => ({
  isYear: i % 4 === 0,
  t: X_START + i / 4,
}))

const LEFT_TICKS = [0.5, 0.6, 0.7, 0.8, 0.9, 1]
const RIGHT_TICKS = [120, 135, 150, 165, 180, 185]

const RISK_BAND_TOP = pyBcsi(0.5)
const TOOLTIP_WIDTH = 190

const REVEAL_TRANSITION = clipRevealTransition(DEFAULT_CHART_ENTER_TRANSITION)

type Hover = {
  meta?: string
  title: string
  value: string
  x: number
  y: number
}

function LegendItem({
  children,
  swatch,
}: {
  children: React.ReactNode
  swatch: React.ReactNode
}) {
  return (
    <span className="flex items-center gap-1.5">
      {swatch}
      <span className="text-xs text-muted-foreground">{children}</span>
    </span>
  )
}

function Tooltip({ hover }: { hover: Hover }) {
  const height = hover.meta ? 58 : 44
  const x =
    hover.x + 12 + TOOLTIP_WIDTH > VIEW.width - 4
      ? hover.x - TOOLTIP_WIDTH - 12
      : hover.x + 12
  const above = hover.y - height - 10
  const y = above < PLOT.top ? hover.y + 12 : above

  return (
    <g pointerEvents="none">
      <rect
        className="fill-chart-tooltip-background stroke-border"
        height={height}
        rx={6}
        strokeWidth={1}
        width={TOOLTIP_WIDTH}
        x={x}
        y={y}
      />
      <text
        className="fill-chart-tooltip-foreground text-[12px] font-medium"
        x={x + 10}
        y={y + 17}
      >
        {hover.title}
      </text>
      {hover.meta ? (
        <text
          className="fill-chart-tooltip-muted text-[11px]"
          x={x + 10}
          y={y + 32}
        >
          {hover.meta}
        </text>
      ) : null}
      <text
        className="fill-chart-tooltip-muted font-mono text-[11px]"
        x={x + 10}
        y={y + (hover.meta ? 49 : 34)}
      >
        {hover.value}
      </text>
    </g>
  )
}

export function SafetyIndexChart({ className }: { className?: string }) {
  const ref = useRef<HTMLElement>(null)
  // The clip rect lives in <defs>, which never intersects; drive it from the figure.
  const isInView = useInView(ref, { once: true, margin: "-64px" })
  const [hover, setHover] = useState<Hover | null>(null)

  return (
    <figure
      aria-label="Bio/Chem Safety Index (BCSI) plotted against the Epoch AI Capabilities Index for open- and closed-weight model releases from 2025 to 2027. Capability trends rise while open-weight safety declines into the high-risk band below BCSI 0.5."
      className={cn(
        "not-prose my-[1.25em] overflow-hidden rounded-xl bg-surface text-surface-foreground inset-ring-1 inset-ring-border/64",
        className
      )}
      ref={ref}
    >
      <div className="overflow-x-auto">
        <svg
          className="h-auto w-full min-w-[640px]"
          onMouseLeave={() => setHover(null)}
          role="img"
          viewBox={`0 0 ${VIEW.width} ${VIEW.height}`}
          xmlns="http://www.w3.org/2000/svg"
        >
          <title>
            Bio/Chem Safety Index against AI capabilities, 2025 to 2027
          </title>

          <defs>
            {/* Hatch carries the "danger" signal without introducing hue. */}
            <pattern
              height={8}
              id="owor-risk-hatch"
              patternTransform="rotate(45)"
              patternUnits="userSpaceOnUse"
              width={8}
            >
              <line
                className="stroke-chart-2"
                strokeWidth={1}
                x1={0}
                x2={0}
                y1={0}
                y2={8}
              />
            </pattern>

            <clipPath id="owor-reveal">
              <motion.rect
                animate={{ width: isInView ? VIEW.width : 0 }}
                height={VIEW.height}
                initial={{ width: 0 }}
                transition={REVEAL_TRANSITION}
                x={0}
                y={0}
              />
            </clipPath>
          </defs>

          {/* Forecast region */}
          <rect
            className="fill-chart-5/25"
            height={PLOT.bottom - PLOT.top}
            width={PLOT.right - px(FORECAST_T)}
            x={px(FORECAST_T)}
            y={PLOT.top}
          />

          {/* High-risk band, BCSI below 0.5 */}
          <rect
            fill="url(#owor-risk-hatch)"
            height={PLOT.bottom - RISK_BAND_TOP}
            opacity={0.3}
            width={PLOT.right - px(FORECAST_T)}
            x={px(FORECAST_T)}
            y={RISK_BAND_TOP}
          />
          <line
            className="stroke-chart-2"
            strokeWidth={1}
            x1={px(FORECAST_T)}
            x2={PLOT.right}
            y1={RISK_BAND_TOP}
            y2={RISK_BAND_TOP}
          />
          <text
            className="fill-muted-foreground text-[12px]"
            textAnchor="middle"
            x={(px(FORECAST_T) + PLOT.right) / 2}
            y={pyBcsi(0.44)}
          >
            <tspan>High risk of bio/chem</tspan>
            <tspan
              dy={16}
              textAnchor="middle"
              x={(px(FORECAST_T) + PLOT.right) / 2}
            >
              weapons of mass destruction
            </tspan>
          </text>

          {/* Grid */}
          <g className="stroke-chart-grid" strokeWidth={1}>
            {X_TICKS.map((tick) => (
              <line
                key={tick.t}
                opacity={tick.isYear ? 1 : 0.55}
                x1={px(tick.t)}
                x2={px(tick.t)}
                y1={PLOT.top}
                y2={PLOT.bottom}
              />
            ))}
            {LEFT_TICKS.map((tick) => (
              <line
                key={tick}
                x1={PLOT.left}
                x2={PLOT.right}
                y1={pyBcsi(tick)}
                y2={pyBcsi(tick)}
              />
            ))}
          </g>

          {/* Last-observation marker */}
          <line
            className="stroke-chart-3"
            strokeDasharray="2 3"
            strokeWidth={1.5}
            x1={px(FORECAST_T)}
            x2={px(FORECAST_T)}
            y1={PLOT.top - 12}
            y2={PLOT.bottom}
          />
          <text
            className="fill-muted-foreground text-[12px] italic"
            textAnchor="middle"
            x={px(FORECAST_T)}
            y={PLOT.top - 18}
          >
            DeepSeek-V4-Pro · Apr 2026
          </text>

          {/* Series */}
          <g clipPath="url(#owor-reveal)">
            <g fill="none" strokeLinecap="round">
              <path
                className="stroke-chart-3"
                d={CLOSED_TREND}
                strokeWidth={2}
              />
              <path
                className="stroke-chart-3"
                d={CLOSED_FORECAST}
                strokeDasharray="6 5"
                strokeWidth={2}
              />
              <path
                className="stroke-chart-2"
                d={OPEN_TREND}
                strokeWidth={2.4}
              />
              <path
                className="stroke-chart-2"
                d={OPEN_FORECAST}
                strokeDasharray="6 5"
                strokeWidth={2.4}
              />
              <path
                className="stroke-chart-1"
                d={BCSI_TREND}
                strokeWidth={2.2}
              />
              <path
                className="stroke-chart-1"
                d={BCSI_FORECAST}
                strokeDasharray="6 5"
                strokeWidth={2.2}
              />
            </g>

            {CLOSED_RELEASES.map((release) => {
              const cx = px(decimalYear(release.d))
              const cy = pyEci(release.eci)
              return (
                <g
                  className="cursor-pointer"
                  key={`closed-${release.label}-${release.d}`}
                  onMouseEnter={() =>
                    setHover({
                      meta: "closed-weight frontier",
                      title: release.label,
                      value: `${formatMonth(decimalYear(release.d))} · ECI ${release.eci}`,
                      x: cx,
                      y: cy,
                    })
                  }
                >
                  <circle cx={cx} cy={cy} fill="transparent" r={9} />
                  <circle
                    className="fill-chart-background stroke-chart-3"
                    cx={cx}
                    cy={cy}
                    r={4}
                    strokeWidth={1.6}
                  />
                </g>
              )
            })}

            {OPEN_RELEASES.map((release) => {
              const cx = px(decimalYear(release.d))
              const cy = pyEci(release.eci)
              return (
                <g
                  className="cursor-pointer"
                  key={`open-${release.label}-${release.d}`}
                  onMouseEnter={() =>
                    setHover({
                      meta: "open-weight frontier",
                      title: release.label,
                      value: `${formatMonth(decimalYear(release.d))} · ECI ${release.eci}`,
                      x: cx,
                      y: cy,
                    })
                  }
                >
                  <circle cx={cx} cy={cy} fill="transparent" r={9} />
                  <circle
                    className="fill-chart-2 stroke-chart-background"
                    cx={cx}
                    cy={cy}
                    r={4.4}
                    strokeWidth={1.4}
                  />
                </g>
              )
            })}

            {BCSI_POINTS.map((point) => {
              const cx = px(point.t)
              const cy = pyBcsi(point.v)
              return (
                <g
                  className="cursor-pointer"
                  key={`bcsi-${point.short}-${point.mode}`}
                  onMouseEnter={() =>
                    setHover({
                      meta: point.frontier ? "open-weight frontier" : undefined,
                      title: `${point.short} · ${point.mode}`,
                      value: `${formatMonth(point.t)} · BCSI ${point.v.toFixed(3)}`,
                      x: cx,
                      y: cy,
                    })
                  }
                >
                  <circle cx={cx} cy={cy} fill="transparent" r={9} />
                  {/* Diamond, not a dot: in light mode BCSI and open ECI sit
                      too close in tone to separate by fill alone. */}
                  <rect
                    className="fill-chart-1 stroke-chart-background"
                    height={8}
                    strokeWidth={1.2}
                    transform={`rotate(45 ${cx} ${cy})`}
                    width={8}
                    x={cx - 4}
                    y={cy - 4}
                  />
                </g>
              )
            })}
          </g>

          {/* In-plot series labels */}
          <g
            className="fill-foreground text-[13px] font-medium"
            textAnchor="end"
          >
            <text
              x={PLOT.right - 20}
              y={pyEci(evalFit(CLOSED_FIT, X_END)) - 10}
            >
              closed-frontier capabilities
            </text>
            <text x={PLOT.right - 20} y={pyEci(evalFit(OPEN_FIT, X_END)) - 10}>
              open-frontier capabilities
            </text>
            <text x={PLOT.right - 20} y={pyBcsi(0.466) - 34}>
              open-weight safety
            </text>
          </g>

          {/* Axes */}
          <line
            className="stroke-border"
            strokeWidth={1}
            x1={PLOT.left}
            x2={PLOT.right}
            y1={PLOT.bottom}
            y2={PLOT.bottom}
          />
          <g className="fill-muted-foreground font-mono text-[11px]">
            {LEFT_TICKS.map((tick) => (
              <text
                key={tick}
                textAnchor="end"
                x={PLOT.left - 10}
                y={pyBcsi(tick) + 4}
              >
                {tick.toFixed(1)}
              </text>
            ))}
            {RIGHT_TICKS.map((tick) => (
              <text
                key={tick}
                textAnchor="start"
                x={PLOT.right + 10}
                y={pyEci(tick) + 4}
              >
                {tick}
              </text>
            ))}
            {X_TICKS.map((tick) => (
              <text
                key={tick.t}
                opacity={tick.isYear ? 1 : 0.7}
                textAnchor="middle"
                x={px(tick.t)}
                y={PLOT.bottom + 20}
              >
                {tick.isYear
                  ? Math.floor(tick.t)
                  : `Q${Math.round((tick.t - Math.floor(tick.t)) * 4) + 1}`}
              </text>
            ))}
          </g>

          <text
            className="fill-muted-foreground text-[12px]"
            textAnchor="middle"
            transform={`rotate(-90 ${PLOT.left - 52} ${(PLOT.top + PLOT.bottom) / 2})`}
            x={PLOT.left - 52}
            y={(PLOT.top + PLOT.bottom) / 2}
          >
            Bio/Chem Safety Index (BCSI)
          </text>
          <text
            className="fill-muted-foreground text-[12px]"
            textAnchor="middle"
            transform={`rotate(90 ${PLOT.right + 56} ${(PLOT.top + PLOT.bottom) / 2})`}
            x={PLOT.right + 56}
            y={(PLOT.top + PLOT.bottom) / 2}
          >
            Epoch AI Capabilities Index (ECI)
          </text>

          {hover ? <Tooltip hover={hover} /> : null}
        </svg>
      </div>

      <figcaption className="space-y-2 border-t border-line px-4 py-3">
        <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-1">
          <LegendItem
            swatch={
              <span className="size-2.5 rounded-full border border-chart-3" />
            }
          >
            closed-weight ECI
          </LegendItem>
          <LegendItem
            swatch={<span className="size-2.5 rounded-full bg-chart-2" />}
          >
            open-weight ECI
          </LegendItem>
          <LegendItem swatch={<span className="size-2 rotate-45 bg-chart-1" />}>
            BCSI (this paper)
          </LegendItem>
          <LegendItem
            swatch={
              <span className="h-0 w-4 border-t-2 border-dashed border-chart-3" />
            }
          >
            forecast
          </LegendItem>
        </div>
        <p className="text-center text-xs text-muted-foreground">
          Capability curves use{" "}
          <a
            href="https://epoch.ai/eci?view=graph&tab=release-date"
            rel="noopener noreferrer"
            target="_blank"
          >
            Epoch AI ECI
          </a>{" "}
          for major closed- and open-weight releases, plotted at official
          release dates. The BCSI series is this post&apos;s Bio/Chem Safety
          Index (BCSI = 1 − mean(BRI, CRI)) under the DeepSeek judge; the
          hatched region marks BCSI below 0.5.
        </p>
      </figcaption>
    </figure>
  )
}

/* -------------------------------------------------------------------------- */
/*  Compliance chart                                                          */
/*                                                                            */
/*  Ported from the source study's figure: the same per-model rows, the same  */
/*  three conditions, DeepSeek judge, sorted by post-attack compliance.       */
/* -------------------------------------------------------------------------- */

type ComplianceRow = {
  label: string
  /** Direct prompt, simple inject, 5-iteration inception. */
  values: [number, number, number]
}

const COMPLIANCE_SECTIONS: { heading: string; rows: ComplianceRow[] }[] = [
  {
    heading: "Think",
    rows: [
      { label: "GLM-4.6", values: [0.08, 0.0475, 0.9775] },
      { label: "GLM-5.1", values: [0.1363, 0.2013, 0.975] },
      { label: "Kimi-K2-Thinking", values: [0.0775, 0.2687, 0.9712] },
      { label: "DeepSeek-R1-0528", values: [0.0775, 0.3063, 0.955] },
      { label: "Qwen3-235B-Thinking", values: [0.075, 0.1713, 0.955] },
      { label: "DeepSeek-V4-Pro", values: [0.1725, 0.0838, 0.9487] },
      { label: "DeepSeek-V3.2", values: [0.0338, 0.2288, 0.9237] },
      { label: "DeepSeek-V4-Flash", values: [0.3075, 0.1875, 0.895] },
    ],
  },
  {
    heading: "Instruct",
    rows: [
      { label: "Kimi-K2-Instruct", values: [0.0938, 0.4475, 0.9875] },
      { label: "GLM-4.6", values: [0.065, 0.1338, 0.9725] },
      { label: "DeepSeek-V3.2", values: [0.0813, 0.35, 0.9575] },
      { label: "Qwen3-235B-Instruct", values: [0.0688, 0.225, 0.9463] },
      { label: "Qwen3-Next-80B-Instruct", values: [0.0663, 0.1113, 0.835] },
    ],
  },
]

// Tones step monotonically in both themes; chart-2 sits too close to chart-1 in light.
const COMPLIANCE_SERIES = [
  { fill: "fill-chart-4", label: "Direct prompt", swatch: "bg-chart-4" },
  { fill: "fill-chart-3", label: "Simple inject", swatch: "bg-chart-3" },
  { fill: "fill-chart-1", label: "Inception", swatch: "bg-chart-1" },
]

const CMP_WIDTH = 720
const CMP_MARGIN = { bottom: 50, left: 12, right: 16, top: 14 }
const CMP_LABEL_WIDTH = 152
const CMP_ROW_HEIGHT = 40
const CMP_BAR_HEIGHT = 8
const CMP_BAR_GAP = 3
const CMP_HEADING_HEIGHT = 26
const CMP_SECTION_GAP = 10

const CMP_STACK_HEIGHT =
  COMPLIANCE_SERIES.length * CMP_BAR_HEIGHT +
  (COMPLIANCE_SERIES.length - 1) * CMP_BAR_GAP

const CMP_X0 = CMP_MARGIN.left + CMP_LABEL_WIDTH + 6
const CMP_X1 = CMP_WIDTH - CMP_MARGIN.right

const cmpX = (value: number) => CMP_X0 + value * (CMP_X1 - CMP_X0)

/** Rows carry absolute y positions so the sections lay out in one pass. */
const CMP_LAYOUT = (() => {
  let y = CMP_MARGIN.top
  const sections = COMPLIANCE_SECTIONS.map((section) => {
    const laid = {
      dividerY: y + CMP_HEADING_HEIGHT - 4,
      heading: section.heading,
      headingY: y + CMP_HEADING_HEIGHT / 2,
      rows: section.rows.map((row, index) => ({
        ...row,
        centerY:
          y + CMP_HEADING_HEIGHT + index * CMP_ROW_HEIGHT + CMP_ROW_HEIGHT / 2,
      })),
    }
    y += CMP_HEADING_HEIGHT + section.rows.length * CMP_ROW_HEIGHT
    y += CMP_SECTION_GAP
    return laid
  })
  return { height: y - CMP_SECTION_GAP + CMP_MARGIN.bottom, sections }
})()

const CMP_HEIGHT = CMP_LAYOUT.height
const CMP_AXIS_Y = CMP_HEIGHT - CMP_MARGIN.bottom
const CMP_TICKS = [0, 0.2, 0.4, 0.6, 0.8, 1]

const CMP_TOOLTIP = { height: 74, width: 186 }

type ComplianceHover = ComplianceRow & { centerY: number }

function ComplianceTooltip({ hover }: { hover: ComplianceHover }) {
  const anchorX = cmpX(hover.values[2])
  const x =
    anchorX + 14 + CMP_TOOLTIP.width > CMP_WIDTH - 4
      ? anchorX - CMP_TOOLTIP.width - 14
      : anchorX + 14
  const y = Math.min(
    Math.max(hover.centerY - CMP_TOOLTIP.height / 2, 4),
    CMP_HEIGHT - CMP_TOOLTIP.height - 4
  )

  return (
    <g pointerEvents="none">
      <rect
        className="fill-chart-tooltip-background stroke-border"
        height={CMP_TOOLTIP.height}
        rx={6}
        strokeWidth={1}
        width={CMP_TOOLTIP.width}
        x={x}
        y={y}
      />
      <text
        className="fill-chart-tooltip-foreground text-[12px] font-medium"
        x={x + 10}
        y={y + 18}
      >
        {hover.label}
      </text>
      {COMPLIANCE_SERIES.map((series, index) => (
        <text
          className="fill-chart-tooltip-muted font-mono text-[11px]"
          key={series.label}
          x={x + 10}
          y={y + 36 + index * 14}
        >
          {series.label}: {(hover.values[index] * 100).toFixed(1)}%
        </text>
      ))}
    </g>
  )
}

export function ComplianceChart() {
  const ref = useRef<HTMLElement>(null)
  const isInView = useInView(ref, { once: true, margin: "-64px" })
  const [hover, setHover] = useState<ComplianceHover | null>(null)

  return (
    <figure
      aria-label="Per-model compliance under direct prompting, simple inject, and five-iteration Inception, judged by DeepSeek and split into Think and Instruct models. Direct prompting stays under 31% everywhere, while Inception reaches 84% to 99%."
      className="not-prose my-[1.25em] overflow-hidden rounded-xl bg-surface text-surface-foreground inset-ring-1 inset-ring-border/64"
      ref={ref}
    >
      <div className="overflow-x-auto">
        <svg
          className="h-auto w-full min-w-[520px]"
          onMouseLeave={() => setHover(null)}
          role="img"
          viewBox={`0 0 ${CMP_WIDTH} ${CMP_HEIGHT}`}
          xmlns="http://www.w3.org/2000/svg"
        >
          <title>
            Compliance by model under direct prompt, simple inject and Inception
          </title>

          <defs>
            <clipPath id="owor-compliance-reveal">
              <motion.rect
                animate={{ width: isInView ? CMP_WIDTH : 0 }}
                height={CMP_HEIGHT}
                initial={{ width: 0 }}
                transition={REVEAL_TRANSITION}
                x={0}
                y={0}
              />
            </clipPath>
          </defs>

          <g className="stroke-chart-grid" strokeWidth={1}>
            {CMP_TICKS.map((tick) => (
              <line
                key={tick}
                x1={cmpX(tick)}
                x2={cmpX(tick)}
                y1={CMP_MARGIN.top}
                y2={CMP_AXIS_Y}
              />
            ))}
          </g>

          {CMP_LAYOUT.sections.map((section) => (
            <g key={section.heading}>
              <text
                className="fill-muted-foreground text-[11px] tracking-wider uppercase"
                x={CMP_MARGIN.left}
                y={section.headingY}
              >
                {section.heading}
              </text>
              <line
                className="stroke-chart-grid"
                strokeWidth={1}
                x1={CMP_MARGIN.left}
                x2={CMP_X1}
                y1={section.dividerY}
                y2={section.dividerY}
              />

              {section.rows.map((row) => (
                <g key={`${section.heading}-${row.label}`}>
                  <text
                    className="fill-foreground text-[12px]"
                    x={CMP_MARGIN.left}
                    y={row.centerY + 4}
                  >
                    {row.label}
                  </text>

                  <g clipPath="url(#owor-compliance-reveal)">
                    {COMPLIANCE_SERIES.map((series, index) => (
                      <rect
                        className={series.fill}
                        height={CMP_BAR_HEIGHT}
                        key={series.label}
                        width={Math.max(0, cmpX(row.values[index]) - CMP_X0)}
                        x={CMP_X0}
                        y={
                          row.centerY -
                          CMP_STACK_HEIGHT / 2 +
                          index * (CMP_BAR_HEIGHT + CMP_BAR_GAP)
                        }
                      />
                    ))}
                  </g>

                  <rect
                    fill="transparent"
                    height={CMP_ROW_HEIGHT}
                    onMouseEnter={() => setHover(row)}
                    width={CMP_X1 - CMP_X0}
                    x={CMP_X0}
                    y={row.centerY - CMP_ROW_HEIGHT / 2}
                  />
                </g>
              ))}
            </g>
          ))}

          <line
            className="stroke-border"
            strokeWidth={1}
            x1={CMP_X0}
            x2={CMP_X1}
            y1={CMP_AXIS_Y}
            y2={CMP_AXIS_Y}
          />
          <g className="fill-muted-foreground font-mono text-[11px]">
            {CMP_TICKS.map((tick) => (
              <text
                key={tick}
                textAnchor="middle"
                x={cmpX(tick)}
                y={CMP_AXIS_Y + 16}
              >
                {tick * 100}%
              </text>
            ))}
          </g>
          <text
            className="fill-muted-foreground text-[12px]"
            textAnchor="middle"
            x={(CMP_X0 + CMP_X1) / 2}
            y={CMP_AXIS_Y + 36}
          >
            Compliance
          </text>

          {hover ? <ComplianceTooltip hover={hover} /> : null}
        </svg>
      </div>

      <figcaption className="flex flex-wrap items-center justify-center gap-x-4 gap-y-1 border-t border-line px-4 py-3">
        {COMPLIANCE_SERIES.map((series) => (
          <LegendItem
            key={series.label}
            swatch={<span className={`h-1.5 w-4 ${series.swatch}`} />}
          >
            {series.label}
          </LegendItem>
        ))}
      </figcaption>
    </figure>
  )
}
