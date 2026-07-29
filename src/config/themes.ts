export type ThemeMode = "light" | "dark"

export type ThemeDefinition = {
  value: string
  label: string
  mode: ThemeMode
  /** Counterpart in the opposite mode, used when toggling with the D hotkey. */
  pair?: string
}

/** Base modes handled natively by next-themes, without a `data-theme` palette. */
export const BASE_THEMES: ThemeDefinition[] = [
  { value: "light", label: "Light", mode: "light", pair: "dark" },
  { value: "dark", label: "Dark", mode: "dark", pair: "light" },
]

/**
 * Palettes defined as `[data-theme="…"]` blocks in globals.css. Kept to five
 * widely recognised palettes that read differently from each other: pastel
 * purple, saturated purple, arctic blue, warm retro, and a light one.
 */
export const PALETTE_THEMES: ThemeDefinition[] = [
  { value: "catppuccin", label: "Catppuccin", mode: "dark" },
  { value: "dracula", label: "Dracula", mode: "dark" },
  { value: "nord", label: "Nord", mode: "dark" },
  { value: "gruvbox", label: "Gruvbox", mode: "dark" },
  { value: "solarized-light", label: "Solarized Light", mode: "light" },
]

export const THEMES = [...BASE_THEMES, ...PALETTE_THEMES]

/** next-themes `themes` prop: every selectable value plus `system`. */
export const THEME_VALUES = ["system", ...THEMES.map((theme) => theme.value)]

/**
 * next-themes `value` prop. Every theme resolves to a `light` or `dark` class so
 * the `dark:` variant and every existing `.dark` selector keep working; the
 * palette itself is applied through the `data-theme` attribute.
 */
export const THEME_CLASSES: Record<string, string> = Object.fromEntries(
  THEMES.map((theme) => [theme.value, theme.mode])
)

export const THEME_MODES: Record<string, ThemeMode> = Object.fromEntries(
  THEMES.map((theme) => [theme.value, theme.mode])
)

export function getTheme(value: string | undefined) {
  return THEMES.find((theme) => theme.value === value)
}

export function isPaletteTheme(value: string | undefined) {
  return PALETTE_THEMES.some((theme) => theme.value === value)
}
