"use client"

import { useRef } from "react"
import { motion, useInView } from "motion/react"

import { cn } from "@/lib/utils"
import {
  clipRevealTransition,
  DEFAULT_CHART_ENTER_TRANSITION,
} from "@/components/charts/animation"

/*
 * Charts for the "How we built Groundwork" post. Numbers come from the
 * Groundwork repo: web/prototype/feed.json (RMS per hop), the tape manifest,
 * and the GB10 setup notes. See https://github.com/mdelriolanse/groundwork
 */

const VIEWPORT = { once: true, margin: "-64px" } as const
const REVEAL_TRANSITION = clipRevealTransition(DEFAULT_CHART_ENTER_TRANSITION)

function Frame({ className, ...props }: React.ComponentProps<"figure">) {
  return (
    <figure
      className={cn(
        "not-prose my-[1.25em] overflow-hidden rounded-xl bg-surface text-surface-foreground inset-ring-1 inset-ring-border/64",
        className
      )}
      {...props}
    />
  )
}

function Caption({ title, meta }: { title: string; meta?: string }) {
  return (
    <figcaption className="flex flex-wrap items-baseline gap-x-2 border-b border-line px-4 py-2">
      <span className="font-heading text-sm font-medium">{title}</span>
      {meta && (
        <span className="font-mono text-xs text-muted-foreground">{meta}</span>
      )}
    </figcaption>
  )
}

/* -------------------------------------------------------------------------- */
/*  Pipeline                                                                  */
/* -------------------------------------------------------------------------- */

const STAGES = [
  {
    tag: "L0",
    name: "Capture",
    detail: "2 s window of recorded vibration",
    rate: "1 / s",
    runs: "disk",
  },
  {
    tag: "L1",
    name: "Features",
    detail: "RMS, defect-frequency check, rpm",
    rate: "1 row / s",
    runs: "CPU",
  },
  {
    tag: "Flag",
    name: "Fault flip",
    detail: "Raised only when the fault class changes",
    rate: "event",
    runs: "CPU",
  },
  {
    tag: "Watch",
    name: "Dispatch",
    detail: "Server polls for pending flags; no flag, no run",
    rate: "1 / s",
    runs: "CPU",
  },
  {
    tag: "LLM",
    name: "Work order",
    detail: "Calls PMMCP over MCP, drafts the repair",
    rate: "~73 tok/s",
    runs: "GB10 GPU",
    model: true,
  },
  {
    tag: "Gate",
    name: "Citations",
    detail: "Server pins every cite; each must open on disk",
    rate: "pass / reject",
    runs: "CPU",
  },
  {
    tag: "Board",
    name: "Technician view",
    detail: "Polls a read-only projection of SQLite",
    rate: "1 Hz",
    runs: "browser",
  },
]

export function GroundworkPipeline() {
  return (
    <Frame aria-label="Groundwork's loop from raw vibration to a cited work order, in seven stages. Six run on the CPU or in the browser; only one, the work-order draft, runs the model on the GPU, and only after a flag.">
      <Caption meta="1 of 7 stages calls the model" title="The loop" />

      <ol className="divide-y divide-line">
        {STAGES.map((stage, index) => (
          <li
            className={cn(
              "relative grid grid-cols-[3.25rem_1fr] items-baseline gap-x-3 px-4 py-2 sm:grid-cols-[3.25rem_7rem_1fr_7rem_5rem]",
              stage.model && "bg-chart-5/40"
            )}
            key={stage.tag}
          >
            <motion.span
              aria-hidden
              className={cn(
                "absolute inset-y-0 left-0 w-1 origin-top",
                stage.model ? "bg-chart-1" : "bg-chart-4"
              )}
              initial={{ scaleY: 0 }}
              transition={{
                ...DEFAULT_CHART_ENTER_TRANSITION,
                delay: index * 0.04,
              }}
              viewport={VIEWPORT}
              whileInView={{ scaleY: 1 }}
            />
            <span className="font-mono text-xs text-muted-foreground">
              {stage.tag}
            </span>
            <span className={cn("text-sm", stage.model && "font-medium")}>
              {stage.name}
            </span>
            <span className="col-start-2 text-sm text-muted-foreground sm:col-start-auto">
              {stage.detail}
            </span>
            <span className="col-start-2 font-mono text-xs text-muted-foreground sm:col-start-auto sm:text-right">
              {stage.rate}
              <span className="sm:hidden"> · {stage.runs}</span>
            </span>
            <span className="hidden font-mono text-xs text-muted-foreground sm:block sm:text-right">
              {stage.runs}
            </span>
          </li>
        ))}
      </ol>
    </Frame>
  )
}

/* -------------------------------------------------------------------------- */
/*  RMS tape                                                                  */
/* -------------------------------------------------------------------------- */

/** RPP1 drive-end RMS per 1 s hop. Hops 0–9 replay 97.mat, 10–19 replay 105.mat. */
const RMS_HOPS = [
  ...Array<number>(10).fill(0.0737),
  ...Array<number>(10).fill(0.289),
]
const FLAG_HOP = 10
/** B1–B4 bind the four healthy CWRU recordings, 97–100.mat. */
const NORMAL_BAND = { high: 0.0732, low: 0.0645 }

// Same ratio as the 920/520 blog-card crop, so the thumbnail fills its box.
const TAPE = { height: 362, width: 640 }
const TAPE_MARGIN = { bottom: 44, left: 56, right: 24, top: 44 }
const TAPE_PLOT = {
  bottom: TAPE.height - TAPE_MARGIN.bottom,
  left: TAPE_MARGIN.left,
  right: TAPE.width - TAPE_MARGIN.right,
  top: TAPE_MARGIN.top,
}
const RMS_MAX = 0.32
const RMS_TICKS = [0, 0.1, 0.2, 0.3]
const HOP_TICKS = [
  { hop: 0, label: "13:57:50" },
  { hop: 5, label: ":55" },
  { hop: 10, label: "13:58:00" },
  { hop: 15, label: ":05" },
  { hop: 20, label: ":10" },
]

const tx = (hop: number) =>
  TAPE_PLOT.left + (hop / RMS_HOPS.length) * (TAPE_PLOT.right - TAPE_PLOT.left)
const ty = (rms: number) =>
  TAPE_PLOT.bottom - (rms / RMS_MAX) * (TAPE_PLOT.bottom - TAPE_PLOT.top)

/** Step path: each hop holds its value for the full second. */
const RMS_PATH = RMS_HOPS.map(
  (rms, hop) => `${hop === 0 ? `M${tx(0)},` : "V"}${ty(rms)} H${tx(hop + 1)}`
).join(" ")

/** The bare plot; also the blog-card thumbnail, which crops to the plot alone. */
export function RmsTapePlot({ className }: { className?: string }) {
  const ref = useRef<HTMLElement>(null)
  // The clip rect lives in <defs>, which never intersects; drive it from the figure.
  const isInView = useInView(ref, VIEWPORT)

  return (
    <Frame
      aria-label="RMS vibration on RPP1 over 20 one-second hops. It holds at 0.074 g on the healthy 97.mat recording, just above the band of the four healthy belt motors, then steps to 0.289 g, about 3.9 times higher, when the tape switches to the 105.mat inner-race fault. The fault class flips and the flag fires on that first faulty hop at 13:58:00."
      className={className}
      ref={ref}
    >
      <div className="overflow-x-auto">
        <svg
          className="h-auto w-full"
          role="img"
          viewBox={`0 0 ${TAPE.width} ${TAPE.height}`}
        >
          <title>
            RPP1 RMS vibration per hop, healthy tape then inner-race fault
          </title>

          <defs>
            <clipPath id="gw-tape-reveal">
              <motion.rect
                animate={{ width: isInView ? TAPE.width : 0 }}
                height={TAPE.height}
                initial={{ width: 0 }}
                transition={REVEAL_TRANSITION}
                x={0}
                y={0}
              />
            </clipPath>
          </defs>

          <g aria-hidden>
            {RMS_TICKS.map((tick) => (
              <g key={tick}>
                <line
                  className="stroke-chart-grid"
                  x1={TAPE_PLOT.left}
                  x2={TAPE_PLOT.right}
                  y1={ty(tick)}
                  y2={ty(tick)}
                />
                <text
                  className="fill-muted-foreground font-mono text-[11px] max-sm:text-[18px]"
                  dominantBaseline="middle"
                  textAnchor="end"
                  x={TAPE_PLOT.left - 8}
                  y={ty(tick)}
                >
                  {tick ? tick.toFixed(1) : ""}
                </text>
              </g>
            ))}

            {HOP_TICKS.map(({ hop, label }) => (
              <text
                className={cn(
                  "fill-muted-foreground font-mono text-[11px] max-sm:text-[18px]",
                  hop % 10 !== 0 && "max-sm:hidden"
                )}
                key={hop}
                textAnchor="middle"
                x={tx(hop)}
                y={TAPE_PLOT.bottom + 18}
              >
                {label}
              </text>
            ))}

            <text
              className="fill-muted-foreground text-[11px] max-sm:text-[18px]"
              x={TAPE_PLOT.left - 44}
              y={TAPE_PLOT.top - 20}
            >
              RMS (g)
            </text>

            {/* Healthy-motor band */}
            <rect
              className="fill-chart-5"
              height={ty(NORMAL_BAND.low) - ty(NORMAL_BAND.high)}
              width={TAPE_PLOT.right - TAPE_PLOT.left}
              x={TAPE_PLOT.left}
              y={ty(NORMAL_BAND.high)}
            />
            <text
              className="fill-muted-foreground text-[11px] max-sm:text-[18px]"
              textAnchor="end"
              x={TAPE_PLOT.right - 4}
              y={ty(NORMAL_BAND.high) - 6}
            >
              healthy belt motors
            </text>

            {/* Flag */}
            <line
              className="stroke-chart-3"
              strokeDasharray="4 4"
              x1={tx(FLAG_HOP)}
              x2={tx(FLAG_HOP)}
              y1={TAPE_PLOT.top - 12}
              y2={TAPE_PLOT.bottom}
            />
            <text
              className="fill-foreground text-[12px] font-medium max-sm:text-[19px]"
              x={tx(FLAG_HOP) + 6}
              y={TAPE_PLOT.top - 16}
            >
              Flag · fault class → inner race
            </text>
          </g>

          <g clipPath="url(#gw-tape-reveal)">
            <path
              className="stroke-chart-1"
              d={RMS_PATH}
              fill="none"
              strokeLinejoin="round"
              strokeWidth={2.5}
            />
            <text
              className="fill-muted-foreground font-mono text-[11px] max-sm:text-[18px]"
              textAnchor="middle"
              x={tx(FLAG_HOP / 2)}
              y={ty(0.0737) - 22}
            >
              97.mat · 0.074 g
            </text>
            <text
              className="fill-foreground font-mono text-[11px] max-sm:text-[18px]"
              textAnchor="middle"
              x={tx(FLAG_HOP + RMS_HOPS.length / 4)}
              y={ty(0.289) - 10}
            >
              105.mat · 0.289 g
            </text>
          </g>
        </svg>
      </div>
    </Frame>
  )
}

export function RmsTapeChart() {
  return (
    <figure className="not-prose my-[1.25em] overflow-hidden rounded-xl bg-surface inset-ring-1 inset-ring-border/64">
      <Caption
        meta="20 × 1 s hops · CWRU 97 → 105.mat"
        title="RPP1 drive-end vibration"
      />
      <RmsTapePlot className="my-0 rounded-none inset-ring-0" />
    </figure>
  )
}

/* -------------------------------------------------------------------------- */
/*  Containment                                                               */
/* -------------------------------------------------------------------------- */

/** One NET:OPEN DENIED line from the OpenShell gateway, as the Board parses it. */
const DENY_FIELDS = [
  { label: "Activity", value: "NET:OPEN" },
  { label: "Process", value: "/usr/bin/curl (114926)" },
  { label: "Destination", value: "example.com:443" },
  { label: "Engine", value: "opa" },
  {
    label: "Reason",
    value: "endpoint example.com:443 is not allowed by any policy",
  },
]

const STATES = [
  {
    name: "Unproven",
    when: "No deny line in the gateway log yet",
    dot: "bg-chart-4",
  },
  {
    name: "Contained",
    when: "The gateway logged a DENIED line for the sandbox",
    dot: "bg-success",
  },
  {
    name: "Unsafe",
    when: "The attempt got through with no deny logged",
    dot: "bg-destructive",
  },
]

export function ContainmentProof() {
  return (
    <Frame aria-label="How the Board decides containment. It parses the OpenShell gateway's NET:OPEN DENIED audit line: curl, destination example.com:443, OPA policy engine, reason not allowed by any policy. The state reads Contained only when the gateway has logged a deny; a failed curl alone stays Unproven.">
      <Caption
        meta="OCSF audit line"
        title="Containment is read, not asserted"
      />

      <dl className="divide-y divide-line">
        {DENY_FIELDS.map((field) => (
          <div
            className="grid grid-cols-[6.5rem_1fr] gap-3 px-4 py-1.5 sm:grid-cols-[9rem_1fr]"
            key={field.label}
          >
            <dt className="text-sm text-muted-foreground">{field.label}</dt>
            <dd className="font-mono text-sm break-words">{field.value}</dd>
          </div>
        ))}
      </dl>

      <div className="grid border-t border-line sm:grid-cols-3 sm:divide-x sm:divide-line">
        {STATES.map((state) => (
          <div
            className="border-b border-line px-4 py-2 last:border-b-0 sm:border-b-0"
            key={state.name}
          >
            <div className="flex items-center gap-2">
              <span aria-hidden className={cn("size-2", state.dot)} />
              <span className="font-heading text-xs font-medium tracking-wider text-muted-foreground uppercase">
                {state.name}
              </span>
            </div>
            <p className="mt-1 text-sm">{state.when}</p>
          </div>
        ))}
      </div>
    </Frame>
  )
}
