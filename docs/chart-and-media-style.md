# Chart and media style

How charts, diagrams, and visual media should look on this site. Applies to
blog posts, component docs, and portfolio panels alike. Read this before adding
any new visual — the goal is that every chart on the site reads as one system,
not as a collection of screenshots from different tools.

## The one rule

**If you can type the data out, render it in code.** Pasted chart screenshots
are a last resort. They do not respond to the theme toggle, do not reflow on
mobile, ship as raster, and are invisible to screen readers. A screenshot is
only acceptable when the source is genuinely unreproducible — a photo, a
third-party UI, a diagram with no underlying dataset.

## Palette — monochrome

The site's chart tokens are deliberately achromatic. Use them and nothing else.

| Token       | Role                                                    |
| ----------- | ------------------------------------------------------- |
| `--chart-1` | Primary series — the one the reader should look at      |
| `--chart-2` | Secondary series                                        |
| `--chart-3` | Tertiary series, reference lines, axis rules            |
| `--chart-4` | Low-emphasis series                                     |
| `--chart-5` | Tracks, empty bar remainder, region washes              |

`--chart-1` is the strongest contrast against the background in **both** themes
and `--chart-5` is the faintest — the ordering holds when the theme flips, so
emphasis never inverts.

Supporting tokens: `--chart-grid` (gridlines), `--chart-background` (the plot
surface, used for hollow marker fills), `--muted-foreground` (labels),
`--foreground` (annotations that must be read).

**Never introduce hue for decoration.** Do not colour-code categories. Series
are distinguished by:

- lightness (`--chart-1` vs `--chart-3`)
- fill vs outline (filled dot vs hollow dot on `--chart-background`)
- solid vs dashed stroke (observed vs forecast)
- pattern fills (a 45° hatch for a danger or exclusion region)

Hue is reserved for `--destructive` and `--success`, and only when a value is
genuinely a *state* — a failing check, a breach of a threshold — never when it
is merely a *category*. If a chart needs to say "this region is dangerous", say
it with a hatch and a label, not with red.

## Frame — boxy

Wrap every chart in the site's frame idiom, the same one `FramedImage` uses in
`src/components/embed.tsx`:

```
my-[1.25em] overflow-hidden rounded-xl bg-surface text-surface-foreground
inset-ring-1 inset-ring-border/64
```

Internal dividers are `border-line` (or `divide-line`) hairlines. No drop
shadows. No gradients. No rounded corners inside the frame beyond the outer
`rounded-xl`. Sections are separated by rules, not by whitespace alone.

## Typography

- Group and section headings: `font-heading font-medium text-xs uppercase
  tracking-wider text-muted-foreground`, sentence-case content.
- Row and category labels: `text-sm`, default foreground.
- Every numeric — percentages, axis ticks, sample sizes: `font-mono`. The
  repo sets `--default-mono-font-feature-settings: "ss11" 1, "zero" 1, "tnum" 1`,
  so mono numerals are already tabular and columns align for free.
- Axis captions and legends: `text-xs text-muted-foreground`.
- Sentence-case everywhere. Capitalize only the first word and proper nouns.

## Motion

Charts enter once when scrolled into view, then stay put.

- Use the repo's shared easing: `DEFAULT_CHART_ENTER_TRANSITION` from
  `src/components/charts/animation.ts`. Do not invent a new duration or curve.
- Bars: `motion.div` with `initial={{ scaleX: 0 }}`, `whileInView={{ scaleX: 1 }}`,
  `viewport={{ once: true, margin: "-64px" }}`, and `origin-left` so they grow
  from the axis, not from the centre.
- Stagger rows with `delay: index * 0.04` — one sweep, not a wave.
- Lines and scatter: reveal left-to-right by animating a `<clipPath>` rect's
  width, as `src/components/charts/chart-reveal-clip.tsx` does. Never `scaleX`
  an SVG series — that reveals from the centre and distorts strokes.
- An element inside `<defs>` never intersects the viewport. Drive its animation
  from a `useInView` ref on the visible wrapper instead of `whileInView`.
- Never loop. Never animate only on hover.

## Theming

Every colour comes from a CSS variable, via a Tailwind utility
(`fill-chart-1`, `stroke-chart-grid`, `bg-chart-5`) or `var(--chart-1)` in an
inline SVG attribute. **Never hardcode a hex or a named colour.** Light and dark
then work with no extra code and no `dark:` variants.

Check both themes before calling a chart done. The failure mode is a series that
is perfectly legible in one theme and nearly invisible in the other.

## Responsiveness

The prose column is `md:max-w-3xl` (`src/features/doc/components/doc-layout.tsx`).
Charts must be legible there and must not overflow it.

- **Bar charts**: build from flex or grid so rows reflow. Fixed gutters go in
  CSS variables (`[--label-w:6.5rem] sm:[--label-w:10rem]`) so the label column,
  the plot area, the reference line, and the axis all share one geometry and
  stay aligned at every breakpoint.
- **SVG charts**: `viewBox` plus `className="w-full h-auto"`. Do not set pixel
  width or height.
- A dense SVG chart shrunk to 375px makes its labels unreadable. Wrap it in
  `overflow-x-auto` with a `min-w-[…]` floor and let it scroll horizontally
  inside its frame rather than shrinking into illegibility. The page body must
  never scroll sideways.

## Accessibility

- Put the old alt text on the chart wrapper as `aria-label`. Replacing an image
  with a component must not lose its description.
- Inline SVGs get `role="img"` and a `<title>` as the first child.
- Purely decorative geometry (gridlines, region washes, reference rules) gets
  `aria-hidden`.
- Never encode meaning in colour alone — with a monochrome palette this is
  automatic, but it also means every band, threshold, and region needs a text
  label.

## Where things live

- Reusable, data-agnostic primitives: `src/components/charts/`
  (`stat-bars.tsx` has `StatBreakdown` and `RankedBarChart`).
- Post-specific data and the bespoke one-off charts that consume it: the
  feature folder, e.g.
  `src/features/blog/components/<post-slug>-charts.tsx`.
- Register anything used from MDX in the `components` map in
  `src/components/mdx.tsx`.

Do not try to bend `src/components/charts/line-chart.tsx` into a general chart
engine — it is a date-keyed time series with crosshair and tooltip interaction.
For a one-off chart, a hand-written inline SVG is shorter and clearer than
fighting it.

---

## Prompt

Copy-pasteable brief for handing a chart to an agent:

> Build this as a React component for my portfolio site, not an image.
>
> Style: dark/light theme-aware, boxy, Vercel-like. Frame it with
> `my-[1.25em] overflow-hidden rounded-xl bg-surface text-surface-foreground
> inset-ring-1 inset-ring-border/64` and separate sections with `border-line`
> hairlines. No shadows, no gradients.
>
> Palette: strictly monochrome using the existing `--chart-1` … `--chart-5`
> tokens — `--chart-1` is the primary series, `--chart-5` is tracks and washes.
> No hue for categories. Distinguish series by lightness, fill vs outline, and
> solid vs dashed. If a region means "danger", use a 45° hatch pattern plus a
> text label, not red. Every colour must come from a CSS var so both themes work
> with no `dark:` variants.
>
> Typography: section headings `font-heading text-xs uppercase tracking-wider
> text-muted-foreground`, labels `text-sm`, every number in `font-mono`
> (tabular figures are already on). Sentence-case.
>
> Motion: animate in once on scroll using `DEFAULT_CHART_ENTER_TRANSITION` from
> `src/components/charts/animation.ts` — bars `scaleX` from `origin-left` with a
> `0.04s * index` stagger, SVG series revealed by an animated `<clipPath>` width.
> `viewport={{ once: true }}`. Never loop.
>
> Responsive: must be legible at the `md:max-w-3xl` prose width. SVG uses
> `viewBox` + `w-full h-auto`; if it is too dense for phones, wrap it in
> `overflow-x-auto` with a `min-w-` floor rather than shrinking the text.
>
> Accessibility: `aria-label` on the wrapper describing the finding, `role="img"`
> plus `<title>` on inline SVG, `aria-hidden` on decorative geometry.
>
> Put reusable primitives in `src/components/charts/`, post-specific data in the
> feature folder, and register MDX-facing components in `src/components/mdx.tsx`.
