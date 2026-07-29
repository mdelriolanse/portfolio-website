import { useTheme } from "next-themes"

import { THEME_MODES, type ThemeMode } from "@/config/themes"

/**
 * `resolvedTheme` can be a palette name (e.g. `catppuccin`), so callers that
 * only care about light vs dark should read the mode instead.
 */
export function useThemeMode(): ThemeMode | undefined {
  const { resolvedTheme } = useTheme()

  return resolvedTheme ? THEME_MODES[resolvedTheme] : undefined
}
