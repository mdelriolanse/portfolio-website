"use client"

import * as React from "react"
import { ProgressProvider } from "@bprogress/next/app"
import { Provider as JotaiProvider } from "jotai"
import { ThemeProvider, useTheme } from "next-themes"

import { isPaletteTheme, THEME_CLASSES, THEME_VALUES } from "@/config/themes"
import { Toaster } from "@/components/ui/sonner"
import { TooltipProvider as RadixTooltipProvider } from "@/components/ui/tooltip"
import { TooltipProvider as BaseTooltipProvider } from "@/components/base/ui/tooltip"
import { KeyboardShortcuts } from "@/components/keyboard-shortcuts"

/**
 * next-themes only owns the `light`/`dark` class. The palette lives in a
 * separate `data-theme` attribute so both can change independently.
 */
function PaletteAttribute() {
  const { theme } = useTheme()

  React.useEffect(() => {
    if (isPaletteTheme(theme)) {
      document.documentElement.setAttribute("data-theme", theme as string)
    } else {
      document.documentElement.removeAttribute("data-theme")
    }
  }, [theme])

  return null
}

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <JotaiProvider>
      <ThemeProvider
        enableSystem
        disableTransitionOnChange
        storageKey="theme"
        defaultTheme="system"
        attribute="class"
        themes={THEME_VALUES}
        value={THEME_CLASSES}
      >
        <PaletteAttribute />
        <ProgressProvider
          color="var(--foreground)"
          height="2px"
          delay={500}
          options={{ showSpinner: false }}
        >
          <BaseTooltipProvider>
            <RadixTooltipProvider>{children}</RadixTooltipProvider>
          </BaseTooltipProvider>

          <KeyboardShortcuts />
        </ProgressProvider>

        <Toaster position="top-center" />
      </ThemeProvider>
    </JotaiProvider>
  )
}
