/*
 * Indoor router for the marko post, ported from marko's writeup.js (itself a
 * port of tools/psb/export_routes.py). Plan frame: metres, x right, y down the
 * floor image. marko-router.test.ts pins it to the Python exporter's lengths.
 */

export type Pt = [number, number]

export interface GridData {
  cols: number
  rows: number
  cellM: number
  /** Base64 bitset, one bit per cell, row-major, MSB first. */
  blocked: string
}

export interface Place {
  id: string
  label: string
  floor: string
  target: Pt
  hidden?: boolean
  routable?: boolean
}

export interface Connector {
  id: string
  kind: string
  stops: Record<string, Pt>
}

export interface Building {
  defaultStart: string
  floors: { id: string; grid: GridData }[]
  connectors: Connector[]
  places: Place[]
}

export interface Box {
  x0: number
  x1: number
  y0: number
  y1: number
}

export const WALK_MPS = 1.3
export const STAIRS_S = 15
const WALL_PENALTY = [0, 1.5, 0.6, 0.2]
const NB = [
  [1, 0, 1],
  [-1, 0, 1],
  [0, 1, 1],
  [0, -1, 1],
  [1, 1, Math.SQRT2],
  [1, -1, Math.SQRT2],
  [-1, 1, Math.SQRT2],
  [-1, -1, Math.SQRT2],
] as const

export const clamp = (v: number, a: number, b: number) =>
  Math.max(a, Math.min(b, v))

class Heap {
  private a: [number, number][] = []
  get size() {
    return this.a.length
  }
  push(k: number, v: number) {
    const a = this.a
    a.push([k, v])
    for (let i = a.length - 1; i > 0; ) {
      const p = (i - 1) >> 1
      if (a[p][0] <= a[i][0]) break
      ;[a[p], a[i]] = [a[i], a[p]]
      i = p
    }
  }
  pop() {
    const a = this.a
    const top = a[0]
    const last = a.pop()!
    if (a.length) {
      a[0] = last
      for (let i = 0; ; ) {
        const l = 2 * i + 1
        const r = l + 1
        let m = i
        if (l < a.length && a[l][0] < a[m][0]) m = l
        if (r < a.length && a[r][0] < a[m][0]) m = r
        if (m === i) break
        ;[a[m], a[i]] = [a[i], a[m]]
        i = m
      }
    }
    return top
  }
}

export class Grid {
  cols: number
  rows: number
  m: number
  blocked: Uint8Array
  /** Chebyshev-ish distance to the nearest wall, in cells, capped at 255. */
  clear: Uint8Array

  constructor(g: GridData) {
    this.cols = g.cols
    this.rows = g.rows
    this.m = g.cellM
    const bits = Uint8Array.from(atob(g.blocked), (c) => c.charCodeAt(0))
    const n = this.cols * this.rows
    this.blocked = new Uint8Array(n)
    for (let i = 0; i < n; i++)
      this.blocked[i] = (bits[i >> 3] >> (7 - (i & 7))) & 1
    this.clear = this.clearance()
  }

  private clearance() {
    const { cols, rows } = this
    const out = new Uint8Array(cols * rows).fill(255)
    const q: number[] = []
    for (let i = 0; i < out.length; i++) {
      const r = Math.floor(i / cols)
      const c = i % cols
      if (this.blocked[i]) {
        out[i] = 0
        q.push(i)
      } else if (r === 0 || r === rows - 1 || c === 0 || c === cols - 1) {
        out[i] = 1
        q.push(i)
      }
    }
    for (let k = 0; k < q.length; k++) {
      const i = q[k]
      const r = Math.floor(i / cols)
      const c = i % cols
      for (const [dc, dr] of NB) {
        const nr = r + dr
        const nc = c + dc
        const j = nr * cols + nc
        if (
          nr >= 0 &&
          nr < rows &&
          nc >= 0 &&
          nc < cols &&
          out[j] > out[i] + 1
        ) {
          out[j] = out[i] + 1
          q.push(j)
        }
      }
    }
    return out
  }

  cell([x, y]: Pt) {
    return (
      clamp(Math.floor(y / this.m), 0, this.rows - 1) * this.cols +
      clamp(Math.floor(x / this.m), 0, this.cols - 1)
    )
  }

  center(i: number): Pt {
    return [
      ((i % this.cols) + 0.5) * this.m,
      (Math.floor(i / this.cols) + 0.5) * this.m,
    ]
  }

  /** Dijkstra from src; stops once `goal` is settled. `order` is the settle order. */
  dijkstra(src: number, goal = -1) {
    const { cols, rows } = this
    const n = cols * rows
    const dist = new Float64Array(n).fill(Infinity)
    const prev = new Int32Array(n).fill(-1)
    const done = new Uint8Array(n)
    const order: number[] = []
    const h = new Heap()
    dist[src] = 0
    h.push(0, src)
    while (h.size) {
      const [d, i] = h.pop()
      if (done[i]) continue
      done[i] = 1
      order.push(i)
      if (i === goal) break
      const r = Math.floor(i / cols)
      const c = i % cols
      for (const [dc, dr, ln] of NB) {
        const nr = r + dr
        const nc = c + dc
        if (nr < 0 || nr >= rows || nc < 0 || nc >= cols) continue
        const j = nr * cols + nc
        // no corner cutting between two blocked cells
        if (
          this.blocked[j] ||
          (dr &&
            dc &&
            (this.blocked[r * cols + nc] || this.blocked[nr * cols + c]))
        )
          continue
        const cj = this.clear[j]
        const nd =
          d +
          ln * this.m * (1 + (cj < WALL_PENALTY.length ? WALL_PENALTY[cj] : 0))
        if (nd < dist[j]) {
          dist[j] = nd
          prev[j] = i
          h.push(nd, j)
        }
      }
    }
    return { dist, prev, order }
  }

  private los(a: Pt, b: Pt, minClear: number) {
    const steps = Math.max(
      1,
      Math.ceil(Math.hypot(b[0] - a[0], b[1] - a[1]) / (this.m * 0.5))
    )
    for (let k = 0; k <= steps; k++) {
      const p: Pt = [
        a[0] + ((b[0] - a[0]) * k) / steps,
        a[1] + ((b[1] - a[1]) * k) / steps,
      ]
      if (this.clear[this.cell(p)] < minClear) return false
    }
    return true
  }

  /** Straighten a cell path into a few long legs; surviving corners become turns. */
  simplify(cells: number[], from: Pt, to: Pt) {
    const pts = cells.map((c) => this.center(c))
    pts[0] = from
    pts[pts.length - 1] = to
    const out = [pts[0]]
    for (let i = 0; i < pts.length - 1; ) {
      let nxt = i + 1
      for (let k = Math.min(pts.length - 1, i + 160); k > i + 1; k--) {
        const minClear = Math.max(
          1,
          Math.min(2, this.clear[cells[i]], this.clear[cells[k]])
        )
        if (this.los(pts[i], pts[k], minClear)) {
          nxt = k
          break
        }
      }
      out.push(pts[nxt])
      i = nxt
    }
    const keep = [out[0]]
    const ang = (a: Pt, b: Pt) => Math.atan2(b[0] - a[0], -(b[1] - a[1]))
    for (let i = 1; i < out.length - 1; i++) {
      const a = keep[keep.length - 1]
      const b = out[i]
      const c = out[i + 1]
      let d =
        ((Math.abs(ang(a, b) - ang(b, c)) % (2 * Math.PI)) + 2 * Math.PI) %
        (2 * Math.PI)
      d = Math.min(d, 2 * Math.PI - d)
      const straight =
        d <= (8 * Math.PI) / 180 || Math.hypot(b[0] - a[0], b[1] - a[1]) < 0.5
      if (!(straight && this.los(a, c, 1))) keep.push(b)
    }
    return [...keep, out[out.length - 1]]
  }
}

const backtrack = (prev: Int32Array, t: number) => {
  const out: number[] = []
  for (; t !== -1; t = prev[t]) out.push(t)
  return out.reverse()
}

export interface Leg {
  floor: string
  raw: Pt[]
  pts: Pt[]
}

export interface RouteResult {
  legs: Leg[]
  walkM: number
  explored: [string, number[]][]
  climbs: number
}

export function route(
  G: Building,
  grids: Record<string, Grid>,
  start: Place,
  place: Place
): RouteResult | null {
  const sf = start.floor
  const sg = grids[sf]
  const tf = place.floor
  const tg = grids[tf]
  const t = tg.cell(place.target)
  const explored: [string, number[]][] = []
  let cells: [string, number[], Pt, Pt][]

  if (sf === tf) {
    const s = sg.dijkstra(sg.cell(start.target), t)
    explored.push([sf, s.order])
    cells = [[sf, backtrack(s.prev, t), start.target, place.target]]
  } else {
    const ids = G.floors.map((f) => f.id)
    const gap = Math.abs(ids.indexOf(tf) - ids.indexOf(sf))
    let best: {
      cost: number
      c: Connector
      a: ReturnType<Grid["dijkstra"]>
      b: ReturnType<Grid["dijkstra"]>
    } | null = null
    for (const c of G.connectors) {
      if (!(sf in c.stops) || !(tf in c.stops)) continue
      const vt = c.kind === "stairs" ? STAIRS_S * gap : 45 + 5 * gap
      const a = sg.dijkstra(sg.cell(start.target), sg.cell(c.stops[sf]))
      const b = tg.dijkstra(tg.cell(c.stops[tf]), t)
      const cost = a.dist[sg.cell(c.stops[sf])] + vt * WALK_MPS + b.dist[t]
      if (!best || cost < best.cost) best = { cost, c, a, b }
    }
    if (!best) return null
    const { c, a, b } = best
    explored.push([sf, a.order], [tf, b.order])
    cells = [
      [sf, backtrack(a.prev, sg.cell(c.stops[sf])), start.target, c.stops[sf]],
      [tf, backtrack(b.prev, t), c.stops[tf], place.target],
    ]
  }

  const legs = cells.map(([f, cs, a, b]) => ({
    floor: f,
    raw: cs.map((i) => grids[f].center(i)),
    pts: grids[f].simplify(cs, a, b),
  }))
  const walkM = legs.reduce((s, l) => s + pathLength(l.pts), 0)
  return { legs, walkM, explored, climbs: legs.length - 1 }
}

export function pathLength(pts: Pt[]) {
  return pts
    .slice(1)
    .reduce((t, p, i) => t + Math.hypot(p[0] - pts[i][0], p[1] - pts[i][1]), 0)
}

/** The first q (0–1) of a polyline, by length. */
export function partial(pts: Pt[], q: number) {
  const seg = pts
    .slice(1)
    .map((p, i) => Math.hypot(p[0] - pts[i][0], p[1] - pts[i][1]))
  let left = q * seg.reduce((a, b) => a + b, 0)
  const out = [pts[0]]
  for (let i = 0; i < seg.length; i++) {
    if (left >= seg[i]) {
      out.push(pts[i + 1])
      left -= seg[i]
      continue
    }
    const t = seg[i] ? left / seg[i] : 0
    out.push([
      pts[i][0] + (pts[i + 1][0] - pts[i][0]) * t,
      pts[i][1] + (pts[i + 1][1] - pts[i][1]) * t,
    ])
    break
  }
  return out
}

/** Walkable cells' bounds plus a margin. */
export function boxOf(g: Grid, pad = 2): Box {
  let x0 = 1e9
  let x1 = -1e9
  let y0 = 1e9
  let y1 = -1e9
  g.blocked.forEach((b, i) => {
    if (b) return
    const [x, y] = g.center(i)
    x0 = Math.min(x0, x)
    x1 = Math.max(x1, x)
    y0 = Math.min(y0, y)
    y1 = Math.max(y1, y)
  })
  return { x0: x0 - pad, x1: x1 + pad, y0: y0 - pad, y1: y1 + pad }
}
