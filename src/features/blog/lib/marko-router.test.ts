import { readFileSync } from "fs"
import path from "path"
import { describe, expect, it } from "vitest"

import { Grid, route, type Building } from "./marko-router"

const G = JSON.parse(
  readFileSync(
    path.resolve(__dirname, "../../../../public/images/blog/marko/psb.json"),
    "utf8"
  )
) as Building
const grids = Object.fromEntries(G.floors.map((f) => [f.id, new Grid(f.grid)]))
const byId = Object.fromEntries(G.places.map((p) => [p.id, p]))

// Walk lengths from marko's tools/psb/export_routes.py; the port must agree.
const EXPECTED: [string, string, number][] = [
  ["1-psb-start", "2-294f-clark", 82.5],
  ["2-208-clark", "2-270-clark", 31.7],
  ["1-clark-hall-entrance-clark", "1-men-s-restroom-psb", 36.3],
  ["2-291-clark", "2-286-clark", 24.9],
  ["1-153-psb", "2-200ja-clark", 79.3],
]

describe("marko router", () => {
  it.each(EXPECTED)("%s to %s walks %s m", (from, to, metres) => {
    const r = route(G, grids, byId[from], byId[to])
    expect(r).not.toBeNull()
    expect(Math.abs(r!.walkM - metres)).toBeLessThanOrEqual(0.5)
  })
})
