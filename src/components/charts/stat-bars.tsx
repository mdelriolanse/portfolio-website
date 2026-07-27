"use client"

import { motion } from "motion/react"

import { cn } from "@/lib/utils"

import { DEFAULT_CHART_ENTER_TRANSITION } from "./animation"

export interface StatRow {
  label: string
  /** Percentage, 0–100 unless the chart declares a different max. */
  value: number
}

export interface StatGroup {
  heading: string
  rows: StatRow[]
}

const VIEWPORT = { once: true, margin: "-64px" } as const

/** Bars grow from the left; each row trails the one above it. */
function barMotion(index: number) {
  return {
    initial: { scaleX: 0 },
    whileInView: { scaleX: 1 },
    viewport: VIEWPORT,
    transition: {
      ...DEFAULT_CHART_ENTER_TRANSITION,
      delay: index * 0.04,
    },
  }
}

function ChartFrame({ className, ...props }: React.ComponentProps<"figure">) {
  return (
    <figure
      className={cn(
        // not-prose: the surrounding MDX prose otherwise adds margins to dl/dt/dd
        "not-prose my-[1.25em] overflow-hidden rounded-xl bg-surface text-surface-foreground inset-ring-1 inset-ring-border/64",
        className
      )}
      {...props}
    />
  )
}

/** Running row count before each group, so the enter stagger spans the chart. */
function groupOffsets(groups: StatGroup[]) {
  return groups.map((_, i) =>
    groups.slice(0, i).reduce((total, group) => total + group.rows.length, 0)
  )
}

function SectionHeading({ children }: { children: React.ReactNode }) {
  return (
    <h4 className="font-heading text-xs font-medium tracking-wider text-muted-foreground uppercase">
      {children}
    </h4>
  )
}

/**
 * Grouped label / track / percentage rows.
 * Used for categorical breakdowns where every group sums to roughly 100%.
 */
export function StatBreakdown({
  title,
  sampleSize,
  groups,
  className,
  ...props
}: React.ComponentProps<"figure"> & {
  title: string
  sampleSize: number
  groups: StatGroup[]
}) {
  // Stagger index is continuous across groups so the reveal reads as one sweep.
  const offsets = groupOffsets(groups)

  return (
    <ChartFrame className={className} {...props}>
      <figcaption className="flex items-baseline gap-2 border-b border-line px-4 py-2">
        <span className="font-heading text-sm font-medium">{title}</span>
        <span className="font-mono text-xs text-muted-foreground">
          n = {sampleSize.toLocaleString()}
        </span>
      </figcaption>

      <div className="divide-y divide-line">
        {groups.map((group, groupIndex) => (
          <section className="px-4 py-2" key={group.heading}>
            <div className="mb-1">
              <SectionHeading>{group.heading}</SectionHeading>
            </div>

            <dl>
              {group.rows.map((row, index) => (
                <div className="flex items-center gap-3 py-px" key={row.label}>
                  <dt className="w-24 shrink-0 truncate text-sm sm:w-40">
                    {row.label}
                  </dt>

                  <div className="h-1.5 min-w-0 flex-1 bg-chart-5">
                    <motion.div
                      className="h-full origin-left bg-chart-1"
                      style={{ width: `${row.value}%` }}
                      {...barMotion(offsets[groupIndex] + index)}
                    />
                  </div>

                  <dd className="w-9 shrink-0 text-right font-mono text-sm text-muted-foreground">
                    {row.value}%
                  </dd>
                </div>
              ))}
            </dl>
          </section>
        ))}
      </div>
    </ChartFrame>
  )
}

/** Label gutter | plot track | value gutter — shared by rows, overlay and axis. */
const LABEL_GUTTER = "w-(--label-w) shrink-0"
const VALUE_GUTTER = "w-(--value-w) shrink-0"

/**
 * Sectioned horizontal bars sharing one axis, with an optional reference line.
 * Used for ranking models against each other on a single metric.
 */
export function RankedBarChart({
  sections,
  max,
  axisLabel,
  reference,
  className,
  ...props
}: React.ComponentProps<"figure"> & {
  sections: StatGroup[]
  max: number
  axisLabel: string
  reference?: { value: number; label: string }
}) {
  const ticks = Array.from(
    { length: Math.floor(max / 10) + 1 },
    (_, i) => i * 10
  )

  const offsets = groupOffsets(sections)

  return (
    <ChartFrame className={className} {...props}>
      <div className="relative [--label-w:6.5rem] [--value-w:3rem] sm:[--label-w:10rem]">
        {reference && (
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0 flex"
          >
            <div className={LABEL_GUTTER} />
            <div className="relative min-w-0 flex-1">
              <span
                className="absolute top-1 -translate-x-1/2 font-mono text-[10px] whitespace-nowrap text-muted-foreground italic"
                style={{ left: `${(reference.value / max) * 100}%` }}
              >
                {reference.label}
              </span>
              <div
                className="absolute top-6 bottom-8 border-l border-dashed border-chart-3"
                style={{ left: `${(reference.value / max) * 100}%` }}
              />
            </div>
            <div className={VALUE_GUTTER} />
          </div>
        )}

        <div className="h-6" />

        {sections.map((section, sectionIndex) => (
          <section
            className="border-t border-line pt-2 pb-2"
            key={section.heading}
          >
            <div className="px-4 pb-1">
              <SectionHeading>{section.heading}</SectionHeading>
            </div>

            {section.rows.map((row, index) => (
              <div className="flex items-center py-[3px]" key={row.label}>
                <span
                  className={cn(LABEL_GUTTER, "truncate pl-4 text-sm")}
                  title={row.label}
                >
                  {row.label}
                </span>

                <div className="min-w-0 flex-1">
                  <motion.div
                    className="h-3.5 origin-left bg-chart-1"
                    style={{ width: `${(row.value / max) * 100}%` }}
                    {...barMotion(offsets[sectionIndex] + index)}
                  />
                </div>

                <span
                  className={cn(
                    VALUE_GUTTER,
                    "pl-2 font-mono text-xs text-muted-foreground"
                  )}
                >
                  {row.value}%
                </span>
              </div>
            ))}
          </section>
        ))}

        <div className="flex border-t border-line">
          <div className={LABEL_GUTTER} />
          <div className="relative h-8 min-w-0 flex-1">
            {ticks.map((tick) => (
              <span
                className="absolute top-1.5 -translate-x-1/2 font-mono text-[10px] text-muted-foreground"
                key={tick}
                style={{ left: `${(tick / max) * 100}%` }}
              >
                {tick}%
              </span>
            ))}
          </div>
          <div className={VALUE_GUTTER} />
        </div>
      </div>

      <figcaption className="px-4 pb-3 text-center text-xs text-muted-foreground">
        {axisLabel}
      </figcaption>
    </ChartFrame>
  )
}
