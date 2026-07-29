import * as React from "react"

import { META_THEME_COLORS } from "@/config/site"
import { useThemeMode } from "@/hooks/use-theme-mode"

export function useMetaColor() {
  const mode = useThemeMode()

  const metaColor = React.useMemo(() => {
    return mode !== "dark" ? META_THEME_COLORS.light : META_THEME_COLORS.dark
  }, [mode])

  const setMetaColor = React.useCallback((color: string) => {
    document
      .querySelector('meta[name="theme-color"]')
      ?.setAttribute("content", color)
  }, [])

  return {
    metaColor,
    setMetaColor,
  }
}
