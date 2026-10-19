"use client"

import { useEffect, useRef, useState } from "react"
import { motion, useInView } from "motion/react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/base/ui/button"
import {
  clipRevealTransition,
  DEFAULT_CHART_ENTER_TRANSITION,
} from "@/components/charts/animation"
import {
  boxOf,
  clamp,
  Grid,
  partial,
  route,
  STAIRS_S,
  WALK_MPS,
  type Box,
  type Building,
  type Place,
  type Pt,
  type RouteResult,
} from "@/features/blog/lib/marko-router"

/*
 * Figures for the "How marko finds you inside a building" post, ported from
 * marko's own write-up (get-marko.vercel.app/blog). They run on the real PSB
 * map exported by marko's tools/psb/export_writeup.py, served from
 * public/images/blog/marko/. Canvases are recoloured from the --chart-*
 * tokens on every theme change, so they follow the site palette.
 */

const BASE = "/images/blog/marko/"

/* -------------------------------------------------------------------------- */
/*  Data, colour, canvas plumbing                                             */
/* -------------------------------------------------------------------------- */

interface WalkLine {
  floor: string
  pts: Pt[]
}

interface ScanCase {
  walker: Pt
  pts: Pt[]
  best: { xy: Pt }
  /** [x, y, score] */
  peaks: [number, number, number][]
  heat: { cols: number; rows: number; v: number[] }
}

interface Data {
  G: Building
  grids: Record<string, Grid>
  boxes: Record<string, Box>
  walks: { lines: WalkLine[] }[]
  scan: Record<"distinct" | "ambiguous", ScanCase>
  floors: Record<string, HTMLImageElement>
}

let dataPromise: Promise<Data> | null = null

function loadData() {
  const json = <T,>(p: string) =>
    fetch(BASE + p).then((r) => r.json() as Promise<T>)
  const img = (p: string) =>
    new Promise<HTMLImageElement>((ok) => {
      const i = new Image()
      i.onload = () => ok(i)
      i.src = BASE + p
    })
  dataPromise ??= Promise.all([
    json<Building>("psb.json"),
    json<Data["walks"]>("walks.json"),
    json<Data["scan"]>("scan.json"),
    img("floor1.png"),
    img("floor2.png"),
  ]).then(([G, walks, scan, f1, f2]) => {
    const grids = Object.fromEntries(
      G.floors.map((f) => [f.id, new Grid(f.grid)])
    )
    const boxes = Object.fromEntries(
      Object.entries(grids).map(([id, g]) => [id, boxOf(g)])
    )
    return { G, grids, boxes, walks, scan, floors: { 1: f1, 2: f2 } }
  })
  return dataPromise
}

interface Colors {
  c1: string
  c2: string
  c3: string
  c4: string
  c5: string
  fg: string
  bg: string
  font: string
}

/** Resolve tokens through a probe, since the raw var can itself be a var(). */
function readColors(root: HTMLElement): Colors {
  const probe = document.createElement("span")
  root.appendChild(probe)
  const get = (token: string) => {
    probe.style.color = `var(${token})`
    return getComputedStyle(probe).color
  }
  const colors = {
    c1: get("--chart-1"),
    c2: get("--chart-2"),
    c3: get("--chart-3"),
    c4: get("--chart-4"),
    c5: get("--chart-5"),
    fg: get("--foreground"),
    bg: get("--surface"),
    font: getComputedStyle(root).fontFamily,
  }
  probe.remove()
  return colors
}

/** The floor plates are alpha masks; recolour them so walls follow the theme. */
const tintCache = new Map<string, HTMLCanvasElement>()
function tinted(img: HTMLImageElement, color: string) {
  const key = `${img.src}|${color}`
  let cv = tintCache.get(key)
  if (!cv) {
    cv = document.createElement("canvas")
    cv.width = img.naturalWidth
    cv.height = img.naturalHeight
    const ctx = cv.getContext("2d")!
    ctx.drawImage(img, 0, 0)
    ctx.globalCompositeOperation = "source-in"
    ctx.fillStyle = color
    ctx.fillRect(0, 0, cv.width, cv.height)
    tintCache.set(key, cv)
  }
  return cv
}

/** Floor plates span the whole 43 x 80 m plan. */
const PLATE = { w: 43, h: 80 }

const ease = (t: number) => 1 - Math.pow(1 - clamp(t, 0, 1), 3)
const reduced = () => matchMedia("(prefers-reduced-motion: reduce)").matches

/** A canvas showing a plan box, turned a quarter so the long axis runs across. */
function view(canvas: HTMLCanvasElement, box: Box) {
  const ctx = canvas.getContext("2d")!
  const v = {
    canvas,
    ctx,
    s: 1,
    dpr: 1,
    fit() {
      const w = canvas.clientWidth || canvas.parentElement!.clientWidth
      v.dpr = devicePixelRatio || 1
      v.s = w / (box.y1 - box.y0)
      canvas.width = Math.round(w * v.dpr)
      canvas.height = Math.round(v.s * (box.x1 - box.x0) * v.dpr)
    },
    plan() {
      const k = v.s * v.dpr
      ctx.setTransform(0, -k, k, 0, -box.y0 * k, box.x1 * k)
    },
    screen() {
      ctx.setTransform(v.dpr, 0, 0, v.dpr, 0, 0)
    },
    /** screen px to metres */
    px: (n: number) => n / v.s,
    toScreen: (x: number, y: number): Pt => [
      (y - box.y0) * v.s,
      (box.x1 - x) * v.s,
    ],
    toPlan: (X: number, Y: number): Pt => [box.x1 - Y / v.s, X / v.s + box.y0],
    clear() {
      v.screen()
      ctx.clearRect(0, 0, canvas.width, canvas.height)
    },
  }
  v.fit()
  return v
}

type View = ReturnType<typeof view>

function line(ctx: CanvasRenderingContext2D, pts: Pt[], n = pts.length) {
  ctx.beginPath()
  for (let i = 0; i < n; i++)
    if (i) ctx.lineTo(pts[i][0], pts[i][1])
    else ctx.moveTo(pts[i][0], pts[i][1])
}

function dot(ctx: CanvasRenderingContext2D, x: number, y: number, r: number) {
  ctx.beginPath()
  ctx.arc(x, y, r, 0, 7)
  ctx.fill()
}

/** A text label on a surface-coloured pill, in screen space. */
function pill(
  v: View,
  C: Colors,
  text: string,
  X: number,
  Y: number,
  color = C.fg
) {
  const ctx = v.ctx
  ctx.font = `500 12px ${C.font}`
  const w = ctx.measureText(text).width
  const x = clamp(X - w / 2, 4, v.canvas.clientWidth - w - 4)
  ctx.globalAlpha = 0.85
  ctx.fillStyle = C.bg
  ctx.fillRect(x - 5, Y - 13, w + 10, 18)
  ctx.globalAlpha = 1
  ctx.fillStyle = color
  ctx.fillText(text, x, Y)
}

function drawFloor(v: View, C: Colors, img: HTMLImageElement, color: string) {
  v.ctx.drawImage(tinted(img, color), 0, 0, PLATE.w, PLATE.h)
}

interface Figure {
  redraw: () => void
  refit: () => void
  dispose: () => void
}

type Start = (
  q: <T extends Element = HTMLElement>(k: string) => T,
  d: Data,
  C: Colors,
  signal: AbortSignal
) => Omit<Figure, "dispose"> & { dispose?: () => void }

/** Loads the data once, starts the figure, and keeps it in step with size and theme. */
function useFigure(start: Start) {
  const ref = useRef<HTMLElement>(null)
  useEffect(() => {
    const root = ref.current!
    const q = <T extends Element = HTMLElement>(k: string) =>
      root.querySelector<T>(`[data-k="${k}"]`)!
    const ac = new AbortController()
    const C = readColors(root)
    let fig: ReturnType<Start> | null = null

    loadData().then((d) => {
      if (!ac.signal.aborted) fig = start(q, d, C, ac.signal)
    })

    let lastW = 0
    const ro = new ResizeObserver(([e]) => {
      const w = Math.round(e.contentRect.width)
      if (w !== lastW) {
        lastW = w
        fig?.refit()
      }
    })
    ro.observe(root)
    const mo = new MutationObserver(() => {
      Object.assign(C, readColors(root))
      fig?.redraw()
    })
    mo.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["class", "data-theme"],
    })

    return () => {
      ac.abort()
      ro.disconnect()
      mo.disconnect()
      fig?.dispose?.()
    }
  }, [start])
  return ref
}

function whenVisible(el: Element, fn: () => void, signal: AbortSignal) {
  const io = new IntersectionObserver(
    (es, o) => {
      if (es[0].isIntersecting) {
        o.disconnect()
        fn()
      }
    },
    { threshold: 0.35 }
  )
  io.observe(el)
  signal.addEventListener("abort", () => io.disconnect())
}

/* -------------------------------------------------------------------------- */
/*  Chrome                                                                    */
/* -------------------------------------------------------------------------- */

const Frame = ({ className, ...props }: React.ComponentProps<"figure">) => (
  <figure
    className={cn(
      "not-prose my-[1.25em] overflow-hidden rounded-xl bg-surface text-surface-foreground inset-ring-1 inset-ring-border/64",
      className
    )}
    {...props}
  />
)

const Bar = ({ className, ...props }: React.ComponentProps<"div">) => (
  <div
    className={cn(
      "flex flex-wrap items-center gap-2 border-b border-line px-3 py-2",
      className
    )}
    {...props}
  />
)

const Chip = ({ className, ...props }: React.ComponentProps<typeof Button>) => (
  <Button
    className={cn(
      "aria-pressed:bg-muted aria-pressed:text-foreground",
      className
    )}
    size="xs"
    variant="outline"
    {...props}
  />
)

const Heading = ({ className, ...props }: React.ComponentProps<"p">) => (
  <p
    className={cn(
      "font-heading text-xs font-medium tracking-wider text-muted-foreground uppercase",
      className
    )}
    {...props}
  />
)

const Caption = ({
  lead,
  children,
}: {
  lead: string
  children: React.ReactNode
}) => (
  <figcaption className="border-t border-line px-4 py-2 text-sm text-muted-foreground">
    <span className="font-medium text-foreground">{lead}</span> {children}
  </figcaption>
)

const Legend = ({ items }: { items: [React.ReactNode, string][] }) => (
  <div className="flex flex-wrap gap-x-4 gap-y-1 border-t border-line px-4 py-2">
    {items.map(([swatch, label]) => (
      <span className="flex items-center gap-1.5" key={label}>
        {swatch}
        <span className="text-xs text-muted-foreground">{label}</span>
      </span>
    ))}
  </div>
)

const Swatch = ({ className }: { className: string }) => (
  <i aria-hidden className={cn("inline-block size-2.5 shrink-0", className)} />
)

const Stroke = ({ className }: { className: string }) => (
  <i
    aria-hidden
    className={cn("inline-block w-4 shrink-0 border-t-2", className)}
  />
)

/* -------------------------------------------------------------------------- */
/*  Hero and screenshots                                                      */
/* -------------------------------------------------------------------------- */

export function MarkoHeroVideo() {
  return (
    <Frame>
      <video
        aria-label="A render of the atrium of Cornell's Physical Sciences Building dissolving into a 3D model of the building, made from the Capture Walk scans."
        autoPlay
        preload="metadata"
        className="block aspect-video w-full object-cover"
        loop
        muted
        playsInline
        poster={`${BASE}hero_poster.jpg`}
      >
        <source src={`${BASE}hero.mp4`} type="video/mp4" />
      </video>
      <Caption lead="The atrium, rebuilt from our walks.">
        Cornell&apos;s Physical Sciences Building atrium dissolving into a 3D
        model of the building made from the Capture Walk scans.
      </Caption>
    </Frame>
  )
}

const PHONE_VIEWS = [
  {
    src: "follow.webp",
    label: "Phone up · Route Ribbon",
    alt: "Route Ribbon view: a green trail on the corridor floor, 35 m, turn right at 294 Clark",
    text: "Held up, the camera sees the corridor, so marko draws the Route into it, from your feet to the next turn.",
  },
  {
    src: "down.webp",
    label: "Phone down · Guidance Arrow",
    alt: "Guidance Arrow view: the camera sees the floor, a ring arrow points ahead, 23 m, bear left at 120 PSB Seminar Room",
    text: "With the camera on your shoes there is nothing to draw on, so marko shows a Find My-style arrow, the distance, and one line of instruction.",
  },
]

export function MarkoPhoneViews() {
  return (
    <Frame>
      <div className="grid divide-line max-sm:divide-y sm:grid-cols-2 sm:divide-x">
        {PHONE_VIEWS.map((p) => (
          <div className="flex flex-col gap-3 p-4" key={p.src}>
            <Heading>{p.label}</Heading>
            <img
              alt={p.alt}
              className="mx-auto w-full max-w-56 rounded-2xl inset-ring-1 inset-ring-border"
              loading="lazy"
              src={BASE + p.src}
            />
            <p className="text-sm text-muted-foreground">{p.text}</p>
          </div>
        ))}
      </div>
      <Caption lead="Phone up, phone down.">
        Real screenshots from the demo iPhone in PSB. Which view you get depends
        on how you hold the phone.
      </Caption>
    </Frame>
  )
}

/* -------------------------------------------------------------------------- */
/*  Walk to grid                                                              */
/* -------------------------------------------------------------------------- */

const startWalk: Start = (q, d, C, signal) => {
  const grid = d.grids["2"]
  const v = view(q<HTMLCanvasElement>("canvas"), d.boxes["2"])
  const stage = q("stage")
  const scrub = q<HTMLInputElement>("scrub")

  // Floor-2 walk lines in walk order, with cumulative length
  const lines: [number, number, number][][] = []
  const all: [number, number, number][] = []
  let L = 0
  for (const w of d.walks)
    for (const l of w.lines)
      if (l.floor === "2") {
        const pts: [number, number, number][] = []
        l.pts.forEach((p, i) => {
          if (i) L += Math.hypot(p[0] - l.pts[i - 1][0], p[1] - l.pts[i - 1][1])
          pts.push([p[0], p[1], L])
          all.push([p[0], p[1], L])
        })
        lines.push(pts)
      }

  // each walkable cell appears when the walk first passes within 0.75 m
  const cells: [number, number, number][] = []
  for (let i = 0; i < grid.blocked.length; i++)
    if (!grid.blocked[i]) {
      const [cx, cy] = grid.center(i)
      let first = L
      for (const p of all)
        if (
          p[2] < first &&
          Math.abs(p[0] - cx) < 0.75 &&
          Math.abs(p[1] - cy) < 0.75
        )
          first = p[2]
      cells.push([cx, cy, first])
    }

  let p = 1
  let user = false
  let raf = 0

  const draw = () => {
    const ctx = v.ctx
    const walkP = clamp(p / 0.8, 0, 1)
    const upto = walkP * L
    const settle = clamp((p - 0.8) / 0.2, 0, 1)
    v.clear()
    v.plan()
    drawFloor(v, C, d.floors[2], C.c4)

    ctx.fillStyle = C.c3
    ctx.globalAlpha = 0.55
    const h = grid.m / 2 - v.px(0.5)
    for (const [x, y, first] of cells)
      if (first <= upto || settle > 0) ctx.fillRect(x - h, y - h, 2 * h, 2 * h)

    ctx.strokeStyle = C.c1
    ctx.lineWidth = v.px(1.6)
    ctx.lineJoin = ctx.lineCap = "round"
    ctx.globalAlpha = 1 - 0.6 * settle
    let head: number[] | null = null
    for (const l of lines) {
      if (l[0][2] > upto) break
      let n = l.findIndex((pt) => pt[2] > upto)
      n = n < 0 ? l.length : n
      line(ctx, l as unknown as Pt[], n)
      ctx.stroke()
      head = l[n - 1]
    }
    ctx.globalAlpha = 1
    if (head && walkP < 1) {
      ctx.fillStyle = C.c1
      dot(ctx, head[0], head[1], v.px(5))
      ctx.globalAlpha = 0.18
      dot(ctx, head[0], head[1], v.px(14))
      ctx.globalAlpha = 1
    }
    stage.textContent =
      walkP < 1
        ? `Floor 2 · walking · ${Math.round(upto)} m`
        : "Floor 2 · every cell near the walk is walkable"
    scrub.value = String(Math.round(p * 1000))
  }

  const play = () => {
    cancelAnimationFrame(raf)
    const t0 = performance.now()
    const tick = (now: number) => {
      p = clamp((now - t0) / 7000, 0, 1)
      draw()
      if (p < 1 && !user) raf = requestAnimationFrame(tick)
    }
    user = false
    raf = requestAnimationFrame(tick)
  }

  scrub.addEventListener(
    "input",
    () => {
      user = true
      cancelAnimationFrame(raf)
      p = Number(scrub.value) / 1000
      draw()
    },
    { signal }
  )
  q("play").addEventListener("click", play, { signal })

  draw()
  if (!reduced()) {
    p = 0
    draw()
    whenVisible(v.canvas, play, signal)
  }
  return {
    redraw: draw,
    refit: () => {
      v.fit()
      draw()
    },
    dispose: () => cancelAnimationFrame(raf),
  }
}

export function MarkoWalkFigure() {
  const ref = useFigure(startWalk)
  return (
    <Frame ref={ref}>
      <Bar>
        <Heading className="grow" data-k="stage">
          Floor 2 · the walk
        </Heading>
        <Chip data-k="play">Replay</Chip>
      </Bar>
      <canvas
        aria-label="Floor 2 of PSB and Clark seen from above. A walked trajectory draws itself, and the walkable grid fills in around it."
        className="block w-full"
        data-k="canvas"
        role="img"
      />
      <div className="border-t border-line px-4 py-3">
        <input
          aria-label="Replay the Capture Walk"
          className="block h-1.5 w-full accent-(--chart-1)"
          data-k="scrub"
          defaultValue={1000}
          max={1000}
          min={0}
          type="range"
        />
      </div>
      <Legend
        items={[
          [
            <Stroke className="border-chart-1" key="w" />,
            "Capture Walk trajectory",
          ],
          [<Swatch className="bg-chart-3/55" key="c" />, "Walkable space"],
          [
            <Swatch className="bg-chart-4" key="s" />,
            "Scanned walls and furniture",
          ],
        ]}
      />
      <Caption lead="Walk it, and the map appears.">
        This is floor 2 of PSB and Clark from above. It shows the real Capture
        Walks over the scan they produced. Everywhere someone walked becomes
        walkable. Drag the slider, or press Replay.
      </Caption>
    </Frame>
  )
}

/* -------------------------------------------------------------------------- */
/*  Route it yourself                                                         */
/* -------------------------------------------------------------------------- */

const startRouter: Start = (q, d, C, signal) => {
  const { G, grids } = d
  const byId = Object.fromEntries(G.places.map((p) => [p.id, p]))
  const places = G.places.filter((p) => !p.hidden && p.routable)
  const name = (p: Place) =>
    p.id === G.defaultStart ? "Atrium tables" : p.label
  const opts = [
    byId[G.defaultStart],
    ...places.sort(
      (a, b) =>
        a.floor.localeCompare(b.floor) ||
        a.label.localeCompare(b.label, undefined, { numeric: true })
    ),
  ]

  const fromSel = q<HTMLSelectElement>("from")
  const toSel = q<HTMLSelectElement>("to")
  for (const sel of [fromSel, toSel]) {
    sel.replaceChildren(
      ...["1", "2"].map((f) => {
        const group = document.createElement("optgroup")
        group.label = `Floor ${f}`
        for (const p of opts.filter((o) => o.floor === f))
          group.append(new Option(name(p), p.id))
        return group
      })
    )
  }
  fromSel.value = G.defaultStart
  toSel.value =
    "2-294f-clark" in byId ? "2-294f-clark" : places[places.length - 1].id

  const views: Record<string, View> = {
    1: view(q<HTMLCanvasElement>("r1"), d.boxes["1"]),
    2: view(q<HTMLCanvasElement>("r2"), d.boxes["2"]),
  }
  let R: RouteResult | null = null
  let t0 = 0
  let raw = false
  let raf = 0

  const draw = (now: number) => {
    const k = reduced() ? 9 : (now - t0) / 1000 // seconds since solve
    const from = byId[fromSel.value]
    const to = byId[toSel.value]
    for (const f of ["1", "2"]) {
      const v = views[f]
      const ctx = v.ctx
      const grid = grids[f]
      v.clear()
      v.plan()
      drawFloor(v, C, d.floors[f], C.c4)
      ctx.fillStyle = C.c5
      for (let i = 0; i < grid.blocked.length; i++)
        if (!grid.blocked[i]) {
          const [x, y] = grid.center(i)
          ctx.fillRect(x - 0.25, y - 0.25, 0.5, 0.5)
        }

      if (R) {
        // frontier: legs explore one after the other, 0.9 s each
        ctx.fillStyle = C.c3
        ctx.globalAlpha = 0.45
        R.explored.forEach(([ef, order], li) => {
          if (ef !== f) return
          const n = Math.floor(order.length * ease((k - li * 0.9) / 0.9))
          for (let i = 0; i < n; i++) {
            const [x, y] = grid.center(order[i])
            ctx.fillRect(x - 0.25, y - 0.25, 0.5, 0.5)
          }
        })
        ctx.globalAlpha = 1

        const tDraw = R.explored.length * 0.9
        R.legs.forEach((leg, li) => {
          if (leg.floor !== f) return
          ctx.lineJoin = ctx.lineCap = "round"
          if (raw) {
            ctx.strokeStyle = C.c2
            ctx.lineWidth = v.px(1.5)
            ctx.setLineDash([v.px(3), v.px(3)])
            line(ctx, leg.raw)
            ctx.stroke()
            ctx.setLineDash([])
          }
          const t = clamp((k - tDraw - li * 0.7) / 0.7, 0, 1)
          if (t <= 0) return
          const pts = partial(leg.pts, ease(t))
          ctx.strokeStyle = C.c1
          ctx.globalAlpha = 0.25
          ctx.lineWidth = v.px(9)
          line(ctx, pts)
          ctx.stroke()
          ctx.globalAlpha = 1
          ctx.lineWidth = v.px(3.5)
          line(ctx, pts)
          ctx.stroke()
          ctx.fillStyle = C.c1
          for (const p of pts.slice(1, -1)) dot(ctx, p[0], p[1], v.px(3.5))
          const hd = pts[pts.length - 1]
          dot(ctx, hd[0], hd[1], v.px(6))
        })
      }

      for (const c of G.connectors)
        if (c.stops[f]) {
          const [x, y] = c.stops[f]
          ctx.strokeStyle = C.c2
          ctx.lineWidth = v.px(1.5)
          ctx.strokeRect(x - v.px(7), y - v.px(7), v.px(14), v.px(14))
          v.screen()
          const [X, Y] = v.toScreen(x, y)
          ctx.fillStyle = C.c2
          ctx.font = `500 11px ${C.font}`
          ctx.fillText("stairs", X + 11, Y + 4)
          v.plan()
        }
      for (const p of opts)
        if (p.floor === f) {
          const sel = p === from || p === to
          ctx.fillStyle = sel ? C.c1 : C.c3
          dot(ctx, p.target[0], p.target[1], v.px(sel ? 5.5 : 2.6))
        }
      v.screen()
      for (const [p, tag] of [
        [from, "From"],
        [to, "To"],
      ] as const)
        if (p.floor === f) {
          const [X, Y] = v.toScreen(...p.target)
          pill(v, C, `${tag}: ${name(p)}`, X, Y < 26 ? Y + 22 : Y - 12)
        }
    }
    if (
      !reduced() &&
      R &&
      k < R.explored.length * 0.9 + R.legs.length * 0.7 + 0.1
    )
      raf = requestAnimationFrame(draw)
  }

  const solve = () => {
    const from = byId[fromSel.value]
    const to = byId[toSel.value]
    const a = performance.now()
    R = from === to ? null : route(G, grids, from, to)
    const ms = performance.now() - a
    const s = R ? R.walkM / WALK_MPS + STAIRS_S * R.climbs : 0
    q("walk").textContent = R ? `${R.walkM.toFixed(1)} m` : "–"
    q("time").textContent = R
      ? `${Math.floor(s / 60)}:${String(Math.round(s % 60)).padStart(2, "0")}`
      : "–"
    q("cells").textContent = R
      ? R.explored.reduce((n, e) => n + e[1].length, 0).toLocaleString()
      : "–"
    q("ms").textContent = R
      ? ms < 0.1
        ? "<0.1 ms"
        : `${ms < 10 ? ms.toFixed(1) : Math.round(ms)} ms`
      : "–"
    cancelAnimationFrame(raf)
    t0 = performance.now()
    raf = requestAnimationFrame(draw)
  }
  /** Jump to the last frame, for redraws that should not replay the animation. */
  const settle = () => {
    t0 = performance.now() - 1e5
    draw(performance.now())
  }

  fromSel.addEventListener("change", solve, { signal })
  toSel.addEventListener("change", solve, { signal })
  q("shuffle").addEventListener(
    "click",
    () => {
      const pick = () => opts[Math.floor(Math.random() * opts.length)].id
      const a = pick()
      let b = pick()
      while (b === a) b = pick()
      fromSel.value = a
      toSel.value = b
      solve()
    },
    { signal }
  )
  const rawBtn = q("raw")
  rawBtn.addEventListener(
    "click",
    () => {
      raw = !raw
      rawBtn.setAttribute("aria-pressed", String(raw))
      settle()
    },
    { signal }
  )
  for (const f of ["1", "2"])
    views[f].canvas.addEventListener(
      "click",
      (e) => {
        const r = views[f].canvas.getBoundingClientRect()
        const [x, y] = views[f].toPlan(e.clientX - r.left, e.clientY - r.top)
        let best: Place | null = null
        let bd = 4
        for (const p of opts)
          if (p.floor === f) {
            const dd = Math.hypot(p.target[0] - x, p.target[1] - y)
            if (dd < bd) {
              bd = dd
              best = p
            }
          }
        if (best) {
          toSel.value = best.id
          solve()
        }
      },
      { signal }
    )

  whenVisible(views[2].canvas, solve, signal)
  draw(performance.now())
  return {
    redraw: settle,
    refit: () => {
      views[1].fit()
      views[2].fit()
      settle()
    },
    dispose: () => cancelAnimationFrame(raf),
  }
}

const SELECT =
  "h-6 max-w-[40%] min-w-0 rounded-md border border-border bg-background px-1.5 text-xs dark:border-input dark:bg-input/30"

export function MarkoRouterFigure() {
  const ref = useFigure(startRouter)
  return (
    <Frame ref={ref}>
      <Bar>
        <select aria-label="From" className={SELECT} data-k="from" />
        <select aria-label="To" className={SELECT} data-k="to" />
        <Chip data-k="shuffle">Shuffle</Chip>
        <span className="grow" />
        <Chip aria-pressed="false" data-k="raw">
          Grid path
        </Chip>
        <Chip disabled title="No elevator is mapped in PSB yet">
          Step-free
        </Chip>
      </Bar>
      <dl className="grid grid-cols-2 border-b border-line sm:grid-cols-4">
        {[
          ["walk", "walking"],
          ["time", "at 1.3 m/s"],
          ["cells", "cells explored"],
          ["ms", "to solve, in your browser"],
        ].map(([k, label], i) => (
          <div
            className={cn(
              "flex flex-col-reverse px-4 py-2",
              i % 2 && "border-l border-line",
              i === 2 && "max-sm:border-t sm:border-l",
              i === 3 && "max-sm:border-t"
            )}
            key={k}
          >
            <dt className="text-xs text-muted-foreground">{label}</dt>
            <dd className="font-mono text-sm" data-k={k}>
              –
            </dd>
          </div>
        ))}
      </dl>
      <div className="px-4 pt-2">
        <Heading>Floor 2</Heading>
      </div>
      <canvas
        aria-label="Floor 2 of PSB and Clark, with the solved route drawn on it."
        className="block w-full cursor-pointer"
        data-k="r2"
      />
      <div className="border-t border-line px-4 pt-2">
        <Heading>Floor 1 · the atrium</Heading>
      </div>
      <canvas
        aria-label="Floor 1 of PSB, with the solved route drawn on it."
        className="block w-full cursor-pointer"
        data-k="r1"
      />
      <Legend
        items={[
          [<Stroke className="border-chart-1" key="r" />, "Route"],
          [<Swatch className="bg-chart-3/45" key="s" />, "Space searched"],
          [
            <Swatch className="rounded-full bg-chart-1" key="p" />,
            "Place: tap one to go there",
          ],
          [
            <Swatch className="border-[1.5px] border-chart-2" key="st" />,
            "Stairs between floors",
          ],
        ]}
      />
      <Caption lead="Route it yourself.">
        This runs on PSB&apos;s real map, in your browser. Pick two places or
        tap a dot. The shaded wash is the space searched before reaching the
        goal, and <b className="font-medium text-foreground">Grid path</b>
        {/* SWC trims the space after </b> when the text wraps; keep it in a string */}
        {" shows the raw path under the straightened one. "}
        Step-free is off because PSB&apos;s elevator isn&apos;t mapped yet, and
        a &quot;step-free&quot; route that used stairs would be worse than none.
      </Caption>
    </Frame>
  )
}

/* -------------------------------------------------------------------------- */
/*  Scan fix                                                                  */
/*                                                                            */
/*  Pure SVG: the floor plate and the fit wash are luminance masks filled     */
/*  with chart tokens, so the figure themes itself with no redraw.            */
/* -------------------------------------------------------------------------- */

type ScanKey = keyof Data["scan"]

/** Scan radius in metres, as exported (tools/psb/export_writeup.py). */
const SCAN_CASES: { key: ScanKey; label: string; radius: number }[] = [
  { key: "distinct", label: "Full scan", radius: 6 },
  { key: "ambiguous", label: "Short scan", radius: 2.5 },
]
const PLACINGS = ["Best match", "Runner-up", "Third"]

/** Heat grid to a white-on-transparent PNG, used as a mask. */
function heatMask(h: ScanCase["heat"]) {
  const cv = document.createElement("canvas")
  cv.width = h.cols
  cv.height = h.rows
  const ctx = cv.getContext("2d")!
  const im = ctx.createImageData(h.cols, h.rows)
  h.v.forEach((x, i) =>
    im.data.set([255, 255, 255, Math.round(Math.pow(x / 99, 4) * 255)], i * 4)
  )
  ctx.putImageData(im, 0, 0)
  return cv.toDataURL()
}

function ScanInset({ scan, radius }: { scan: ScanCase; radius: number }) {
  // Same quarter turn as the map: plan (x, y) draws at (y, -x). Points are
  // stored around their centroid; the scan range is centred on the phone.
  const cx = scan.walker[1]
  const cy = -scan.walker[0]
  const r = radius + 0.4
  return (
    <svg
      aria-label={`The scan from above: wall points within ${radius} m of the phone.`}
      className="block aspect-square w-full"
      role="img"
      viewBox={`${cx - r} ${cy - r} ${2 * r} ${2 * r}`}
    >
      <circle
        aria-hidden
        className="fill-chart-5/40 stroke-chart-3"
        cx={cx}
        cy={cy}
        r={radius}
        strokeDasharray={`${radius * 0.04} ${radius * 0.03}`}
        strokeWidth={radius * 0.01}
      />
      <g className="fill-chart-1">
        {scan.pts.map(([x, y], i) => (
          <circle cx={y} cy={-x} key={i} r={radius * 0.012} />
        ))}
      </g>
      <circle
        className="fill-surface stroke-chart-1"
        cx={cx}
        cy={cy}
        r={radius * 0.045}
        strokeWidth={radius * 0.018}
      />
    </svg>
  )
}

export function MarkoScanFigure() {
  const ref = useRef<HTMLElement>(null)
  const [data, setData] = useState<Data | null>(null)
  const [key, setKey] = useState<ScanKey>("distinct")
  const [run, setRun] = useState(0)
  const [masks, setMasks] = useState<Partial<Record<ScanKey, string>>>({})
  const inView = useInView(ref, { once: true, margin: "-64px" })

  useEffect(() => {
    let alive = true
    loadData().then((d) => {
      if (!alive) return
      setData(d)
      setMasks({
        distinct: heatMask(d.scan.distinct.heat),
        ambiguous: heatMask(d.scan.ambiguous.heat),
      })
    })
    return () => {
      alive = false
    }
  }, [])

  const c = SCAN_CASES.find((s) => s.key === key)!
  const scan = data?.scan[key]
  const box = data?.boxes["1"]
  const peaks = scan?.peaks ?? []
  // Accept only when the best spot clearly beats the runner-up.
  const ok = scan ? scan.peaks[0][2] - scan.peaks[1][2] >= 0.1 : false
  const tied = peaks.filter((p) => peaks[0][2] - p[2] < 0.1).length
  const shown = inView && Boolean(scan)
  const T = DEFAULT_CHART_ENTER_TRANSITION
  const replay = `${key}-${run}`

  return (
    <Frame
      aria-label="marko matches a scan of the walls around the phone against the whole floor. A full scan has one spot that fits far better than any other, so the fix is accepted. A short scan fits three spots equally well, so marko rejects it and keeps looking."
      ref={ref}
    >
      <Bar>
        {SCAN_CASES.map((s) => (
          <Chip
            aria-pressed={key === s.key}
            key={s.key}
            onClick={() => {
              setKey(s.key)
              setRun((n) => n + 1)
            }}
          >
            {s.label} · {s.radius} m radius
          </Chip>
        ))}
        <span className="grow" />
        <Chip onClick={() => setRun((n) => n + 1)}>Replay</Chip>
      </Bar>

      <div className="grid grid-cols-[7rem_1fr] border-b border-line sm:grid-cols-[10rem_1fr]">
        <div className="border-r border-line p-3">
          <Heading>Your scan</Heading>
          {scan && <ScanInset radius={c.radius} scan={scan} />}
        </div>

        <div className="flex min-w-0 flex-col">
          <div className="px-4 pt-3">
            <Heading>Where it could be on floor 1</Heading>
          </div>
          <dl className="flex flex-col gap-1.5 px-4 py-3">
            {peaks.map(([, , score], i) => (
              <div className="flex items-center gap-3" key={`${replay}-${i}`}>
                <dt className="flex w-24 shrink-0 items-center gap-2 text-sm sm:w-28">
                  <span
                    className={cn(
                      "flex size-4 items-center justify-center rounded-full font-mono text-[10px]",
                      i === 0 && ok
                        ? "bg-chart-1 text-background"
                        : "border border-chart-3 text-muted-foreground"
                    )}
                  >
                    {i + 1}
                  </span>
                  {PLACINGS[i]}
                </dt>
                <div className="h-1.5 min-w-0 flex-1 bg-chart-5">
                  <motion.div
                    animate={{ scaleX: shown ? 1 : 0 }}
                    className={cn(
                      "h-full origin-left",
                      i === 0 && ok ? "bg-chart-1" : "bg-chart-3"
                    )}
                    initial={{ scaleX: 0 }}
                    style={{ width: `${score * 100}%` }}
                    transition={{ ...T, delay: 0.4 + i * 0.04 }}
                  />
                </div>
              </div>
            ))}
          </dl>
          <motion.p
            animate={{ opacity: shown ? 1 : 0 }}
            className="mt-auto flex items-start gap-2 border-t border-line px-4 py-2.5 text-sm"
            initial={{ opacity: 0 }}
            key={replay}
            transition={{ duration: 0.3, delay: 1.4 }}
          >
            <span
              aria-hidden
              className={cn(
                "mt-1.5 size-2 shrink-0",
                ok ? "bg-success" : "bg-chart-3"
              )}
            />
            <span>
              <span className="font-medium">
                {ok
                  ? "Accepted: one spot clearly fits best."
                  : `Rejected: ${tied} spots fit equally well.`}
              </span>{" "}
              <span className="text-muted-foreground">
                {ok
                  ? "The trail snaps to where you are."
                  : "marko keeps looking instead of guessing."}
              </span>
            </span>
          </motion.p>
        </div>
      </div>

      <div className="overflow-x-auto">
        {scan && box && masks[key] && (
          <svg
            aria-label="Floor 1 from above. A wash shows how well the scan fits each spot; numbered rings mark the best-fitting spots."
            className="block h-auto w-full min-w-[560px]"
            role="img"
            viewBox={`0 0 ${box.y1 - box.y0} ${box.x1 - box.x0}`}
          >
            <defs>
              <mask
                height={PLATE.h}
                id="mk-plate"
                maskUnits="userSpaceOnUse"
                width={PLATE.w}
                x={0}
                y={0}
              >
                <image
                  height={PLATE.h}
                  href={`${BASE}floor1.png`}
                  width={PLATE.w}
                />
              </mask>
              <filter id="mk-soft" x="-5%" y="-5%" width="110%" height="110%">
                <feGaussianBlur stdDeviation={0.5} />
              </filter>
              <mask
                height={scan.heat.rows * 0.5}
                id={`mk-heat-${key}`}
                maskUnits="userSpaceOnUse"
                width={scan.heat.cols * 0.5}
                x={0}
                y={0}
              >
                <image
                  filter="url(#mk-soft)"
                  height={scan.heat.rows * 0.5}
                  href={masks[key]}
                  preserveAspectRatio="none"
                  width={scan.heat.cols * 0.5}
                />
              </mask>
              <clipPath id="mk-reveal">
                <motion.rect
                  animate={{ width: shown ? box.y1 - box.y0 : 0 }}
                  height={box.x1 - box.x0}
                  initial={{ width: 0 }}
                  key={replay}
                  transition={clipRevealTransition(T)}
                  x={0}
                  y={0}
                />
              </clipPath>
            </defs>

            {/* plan (x, y) to screen: a quarter turn so the long axis runs across */}
            <g transform={`matrix(0 -1 1 0 ${-box.y0} ${box.x1})`}>
              <rect
                aria-hidden
                className="fill-chart-4"
                height={PLATE.h}
                mask="url(#mk-plate)"
                width={PLATE.w}
              />
            </g>
            <g clipPath="url(#mk-reveal)">
              <g transform={`matrix(0 -1 1 0 ${-box.y0} ${box.x1})`}>
                <rect
                  aria-hidden
                  className="fill-chart-1"
                  height={scan.heat.rows * 0.5}
                  mask={`url(#mk-heat-${key})`}
                  opacity={0.55}
                  width={scan.heat.cols * 0.5}
                />
              </g>
            </g>

            <g transform={`matrix(0 -1 1 0 ${-box.y0} ${box.x1})`}>
              {/* the scan, laid where marko placed it */}
              <motion.g
                animate={{ opacity: shown ? 1 : 0 }}
                className={ok ? "fill-chart-1" : "fill-chart-2"}
                initial={{ opacity: 0 }}
                key={`pts-${replay}`}
                transition={{ duration: 0.4, delay: 1.2 }}
              >
                {(ok ? peaks.slice(0, 1) : peaks).flatMap(([px, py], j) =>
                  scan.pts.map(([x, y], i) => (
                    <circle
                      cx={px + x}
                      cy={py + y}
                      key={`${j}-${i}`}
                      r={0.07}
                    />
                  ))
                )}
              </motion.g>
            </g>

            {peaks.map(([x, y], i) => {
              const X = y - box.y0
              const Y = box.x1 - x
              const filled = i === 0 && ok
              return (
                <motion.g
                  animate={{ opacity: shown ? 1 : 0 }}
                  initial={{ opacity: 0 }}
                  key={`${replay}-${i}`}
                  transition={{ duration: 0.3, delay: 0.9 + i * 0.08 }}
                >
                  <circle
                    className={cn(
                      filled
                        ? "fill-chart-1 stroke-chart-1"
                        : "fill-surface stroke-chart-3"
                    )}
                    cx={X}
                    cy={Y - 2.6}
                    r={1.05}
                    strokeWidth={0.15}
                  />
                  <text
                    className={cn(
                      "font-mono",
                      filled ? "fill-background" : "fill-muted-foreground"
                    )}
                    dominantBaseline="central"
                    fontSize={1.2}
                    textAnchor="middle"
                    x={X}
                    y={Y - 2.6}
                  >
                    {i + 1}
                  </text>
                  <line
                    className="stroke-chart-3"
                    strokeWidth={0.1}
                    x1={X}
                    x2={X}
                    y1={Y - 1.55}
                    y2={Y - 0.35}
                  />
                  <circle className="fill-chart-3" cx={X} cy={Y} r={0.3} />
                </motion.g>
              )
            })}
          </svg>
        )}
      </div>

      <Legend
        items={[
          [
            <Swatch className="bg-chart-1/55" key="h" />,
            "How well the scan fits there",
          ],
          [
            <Swatch className="rounded-full border border-chart-3" key="b" />,
            "Best-fitting spots, numbered",
          ],
          [
            <Swatch className="rounded-full bg-chart-1" key="a" />,
            "Accepted fix",
          ],
        ]}
      />
      <Caption lead="A full scan and a short one.">
        Both scans are cut from the real floor 1 walls and searched over the
        whole floor. A full scan wins clearly. A short one fits several spots
        equally well, so marko rejects it and keeps looking rather than guess.
      </Caption>
    </Frame>
  )
}

/* -------------------------------------------------------------------------- */
/*  Drift and snap                                                            */
/* -------------------------------------------------------------------------- */

/** Illustrative error models: [stride scale, heading bias in degrees]. */
const DRIFT_MODELS = { vio: [1.015, 0.8], dr: [1.05, 6] } as const
type Est = keyof typeof DRIFT_MODELS

const startDrift: Start = (q, d, C, signal) => {
  const { G, grids } = d
  // pad the bottom edge (plan x0) so the walker's ring isn't clipped
  const v = view(q<HTMLCanvasElement>("canvas"), {
    ...d.boxes["2"],
    x0: d.boxes["2"].x0 - 1.5,
  })
  const byId = Object.fromEntries(G.places.map((p) => [p.id, p]))
  const start = byId["2-208-clark"] ?? G.places.find((p) => p.floor === "2")!
  const dist = (p: Place) =>
    Math.hypot(p.target[0] - start.target[0], p.target[1] - start.target[1])
  const far = G.places
    .filter((p) => p.floor === "2" && p.routable && !p.hidden)
    .sort((a, b) => dist(b) - dist(a))[0]
  const pts = route(G, grids, start, far)!.legs[0].pts
  const seg = pts
    .slice(1)
    .map((p, i) => Math.hypot(p[0] - pts[i][0], p[1] - pts[i][1]))
  const L = seg.reduce((a, b) => a + b, 0)
  const at = (dd: number): [Pt, number] => {
    for (let i = 0; i < seg.length; i++) {
      if (dd <= seg[i]) {
        const t = dd / seg[i]
        return [
          [
            pts[i][0] + (pts[i + 1][0] - pts[i][0]) * t,
            pts[i][1] + (pts[i + 1][1] - pts[i][1]) * t,
          ],
          Math.atan2(pts[i + 1][1] - pts[i][1], pts[i + 1][0] - pts[i][0]),
        ]
      }
      dd -= seg[i]
    }
    return [pts[pts.length - 1], 0]
  }

  let fixes = true
  let playing = !reduced()
  let dd = 0
  let last = performance.now()
  let sinceFix = 0
  let pulse = -1
  let visible = false
  let hold = 0
  let raf = 0
  let est: Record<Est, Pt> = { vio: [...pts[0]], dr: [...pts[0]] }
  let trails: Record<Est, (Pt | null)[]> = { vio: [], dr: [] }

  const reset = () => {
    dd = 0
    sinceFix = 0
    pulse = -1
    est = { vio: [...pts[0]], dr: [...pts[0]] }
    trails = { vio: [[...pts[0]]], dr: [[...pts[0]]] }
  }
  const step = (ds: number) => {
    const [, hd] = at(dd)
    for (const k of ["vio", "dr"] as Est[]) {
      const [sc, bias] = DRIFT_MODELS[k]
      const h = hd + (bias * Math.PI) / 180
      est[k][0] += Math.cos(h) * ds * sc
      est[k][1] += Math.sin(h) * ds * sc
      trails[k].push([...est[k]])
    }
    dd += ds
    sinceFix += ds
    if (fixes && sinceFix >= 25) {
      sinceFix = 0
      pulse = dd
      const [p] = at(dd)
      for (const k of ["vio", "dr"] as Est[]) {
        est[k] = [...p]
        trails[k].push(null, [...p])
      }
    }
  }

  const draw = () => {
    const ctx = v.ctx
    const [p] = at(dd)
    v.clear()
    v.plan()
    drawFloor(v, C, d.floors[2], C.c4)
    ctx.lineJoin = ctx.lineCap = "round"
    ctx.strokeStyle = C.c4
    ctx.lineWidth = v.px(4)
    line(ctx, pts)
    ctx.stroke()
    ctx.globalAlpha = 1
    for (const [k, col, dash] of [
      ["dr", C.c2, true],
      ["vio", C.c1, false],
    ] as const) {
      ctx.strokeStyle = col
      ctx.lineWidth = v.px(1.5)
      ctx.setLineDash(dash ? [v.px(4), v.px(3)] : [])
      let run: Pt[] = []
      for (const pt of [...trails[k], null]) {
        if (pt) run.push(pt)
        else {
          if (run.length > 1) {
            line(ctx, run)
            ctx.stroke()
          }
          run = []
        }
      }
      ctx.setLineDash([])
      ctx.fillStyle = col
      dot(ctx, est[k][0], est[k][1], v.px(5))
    }
    // the true position is a hollow ring, so it reads apart from the estimates
    ctx.fillStyle = C.bg
    ctx.strokeStyle = C.c1
    ctx.lineWidth = v.px(2)
    ctx.beginPath()
    ctx.arc(p[0], p[1], v.px(6.5), 0, 7)
    ctx.fill()
    ctx.stroke()
    // pulse is cleared on reset, so dd - pulse never goes negative here
    if (pulse >= 0 && dd >= pulse && dd - pulse < 6) {
      const t = (dd - pulse) / 6
      ctx.strokeStyle = C.c1
      ctx.globalAlpha = 1 - t
      ctx.lineWidth = v.px(2)
      ctx.beginPath()
      ctx.arc(p[0], p[1], v.px(8 + 40 * t), 0, 7)
      ctx.stroke()
      ctx.globalAlpha = 1
    }
    const off = (k: Est) =>
      `${Math.hypot(est[k][0] - p[0], est[k][1] - p[1]).toFixed(1)} m`
    q("dr").textContent = off("dr")
    q("vio").textContent = off("vio")
  }

  const tick = (now: number) => {
    const dt = Math.min(0.05, (now - last) / 1000)
    last = now
    if (playing && visible) {
      // 4x real time, in four small steps
      for (let k = 0; k < 4; k++) if (dd < L) step(dt * 1.3)
      if (dd >= L) {
        hold ||= now
        if (now - hold > 1500) {
          hold = 0
          reset()
        }
      }
      draw()
    }
    raf = requestAnimationFrame(tick)
  }

  const io = new IntersectionObserver((es) => {
    visible = es[0].isIntersecting
  })
  io.observe(v.canvas)

  const playBtn = q("play")
  playBtn.addEventListener(
    "click",
    () => {
      playing = !playing
      playBtn.textContent = playing ? "Pause" : "Play"
    },
    { signal }
  )
  const fixBtn = q("fix")
  fixBtn.addEventListener(
    "click",
    () => {
      fixes = !fixes
      fixBtn.setAttribute("aria-pressed", String(fixes))
      reset()
      draw()
    },
    { signal }
  )

  reset()
  if (reduced()) {
    while (dd < L) step(0.2)
    playBtn.textContent = "Play"
  }
  draw()
  raf = requestAnimationFrame(tick)
  return {
    redraw: draw,
    refit: () => {
      v.fit()
      draw()
    },
    dispose: () => {
      cancelAnimationFrame(raf)
      io.disconnect()
    },
  }
}

export function MarkoDriftFigure() {
  const ref = useFigure(startDrift)
  return (
    <Frame ref={ref}>
      <Bar>
        <Chip data-k="play">Pause</Chip>
        <Chip aria-pressed="true" data-k="fix">
          Fix every 25 m
        </Chip>
        <span className="grow" />
        <dl className="flex gap-4 text-right">
          <div className="flex flex-col-reverse">
            <dt className="text-xs text-muted-foreground">
              step counting off by
            </dt>
            <dd className="font-mono text-sm" data-k="dr">
              0.0 m
            </dd>
          </div>
          <div className="flex flex-col-reverse">
            <dt className="text-xs text-muted-foreground">marko off by</dt>
            <dd className="font-mono text-sm" data-k="vio">
              0.0 m
            </dd>
          </div>
        </dl>
      </Bar>
      <canvas
        aria-label="A walker follows a route; two estimates of their position drift away and snap back at each fix."
        className="block w-full"
        data-k="canvas"
        role="img"
      />
      <Legend
        items={[
          [
            <Swatch className="rounded-full border-2 border-chart-1" key="t" />,
            "Where you really are",
          ],
          [<Stroke className="border-chart-4" key="r" />, "Route"],
          [<Stroke className="border-chart-1" key="m" />, "marko's tracking"],
          [
            <Stroke className="border-dashed border-chart-2" key="d" />,
            "Step counting + compass",
          ],
        ]}
      />
      <Caption lead="Drift, and the snap back.">
        One walker on a real floor 2 Route, with two estimates of where they
        are. The drift rates are illustrative. Each fix snaps both estimates
        back. Turn fixes off to watch them wander.
      </Caption>
    </Frame>
  )
}
