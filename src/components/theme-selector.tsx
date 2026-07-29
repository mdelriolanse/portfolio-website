"use client"

import * as React from "react"
import { MonitorIcon } from "lucide-react"
import { useTheme } from "next-themes"
import { useHotkeys } from "react-hotkeys-hook"

import { META_THEME_COLORS } from "@/config/site"
import { BASE_THEMES, getTheme, PALETTE_THEMES } from "@/config/themes"
import { useMetaColor } from "@/hooks/use-meta-color"
import { useThemeMode } from "@/hooks/use-theme-mode"

import { MoonIcon } from "./animated-icons/moon-icon"
import { SunMediumIcon } from "./animated-icons/sun-medium-icon"
import { Tooltip, TooltipContent, TooltipTrigger } from "./base/ui/tooltip"
import { Button } from "./ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu"
import { Kbd } from "./ui/kbd"

const MODE_ICONS = {
  system: MonitorIcon,
  light: SunMediumIcon,
  dark: MoonIcon,
}

/** Five stripes rendered with the palette's own variables. */
export function ThemeSwatch({ theme }: { theme: string }) {
  return (
    <span
      data-theme={theme}
      className="flex h-4 shrink-0 overflow-hidden rounded-full ring-1 ring-foreground/15"
      aria-hidden
    >
      <span className="w-1.5 bg-background" />
      <span className="w-1.5 bg-primary" />
      <span className="w-1.5 bg-info" />
      <span className="w-1.5 bg-success" />
      <span className="w-1.5 bg-destructive" />
    </span>
  )
}

export function ThemeSelector() {
  const { theme, setTheme } = useTheme()
  const mode = useThemeMode()
  const { setMetaColor } = useMetaColor()

  const selectTheme = React.useCallback(
    (next: string) => {
      setTheme(next)
      setMetaColor(
        getTheme(next)?.mode === "dark"
          ? META_THEME_COLORS.dark
          : META_THEME_COLORS.light
      )
    },
    [setTheme, setMetaColor]
  )

  // Flip to the opposite mode, using the current theme's counterpart when it
  // has one, otherwise falling back to the plain light/dark pair.
  const switchMode = React.useCallback(() => {
    const current = getTheme(theme === "system" ? mode : theme)
    const next = current?.pair ?? (mode === "dark" ? "light" : "dark")

    selectTheme(next)
  }, [theme, mode, selectTheme])

  useHotkeys("d", () => switchMode())

  return (
    <DropdownMenu>
      <Tooltip>
        <DropdownMenuTrigger asChild>
          <TooltipTrigger
            render={
              <Button
                className="relative touch-manipulation border-none"
                variant="ghost"
                size="icon-sm"
                aria-label="Select theme"
              >
                <span
                  className="absolute size-12 pointer-fine:hidden"
                  aria-hidden
                />
                <MoonIcon className="hidden [html.dark_&]:block" aria-hidden />
                <SunMediumIcon
                  className="hidden [html.light_&]:block"
                  aria-hidden
                />
              </Button>
            }
          />
        </DropdownMenuTrigger>
        <TooltipContent className="pr-2 pl-3">
          <div className="flex items-center gap-3">
            Select theme
            <Kbd>D</Kbd>
          </div>
        </TooltipContent>
      </Tooltip>

      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuRadioGroup value={theme} onValueChange={selectTheme}>
          <DropdownMenuLabel className="text-muted-foreground">
            Mode
          </DropdownMenuLabel>

          <DropdownMenuRadioItem value="system">
            <MODE_ICONS.system />
            System
          </DropdownMenuRadioItem>

          {BASE_THEMES.map((baseTheme) => {
            const Icon = MODE_ICONS[baseTheme.mode]

            return (
              <DropdownMenuRadioItem
                key={baseTheme.value}
                value={baseTheme.value}
              >
                <Icon />
                {baseTheme.label}
              </DropdownMenuRadioItem>
            )
          })}

          <DropdownMenuSeparator />

          <DropdownMenuLabel className="text-muted-foreground">
            Palettes
          </DropdownMenuLabel>

          {PALETTE_THEMES.map((paletteTheme) => (
            <DropdownMenuRadioItem
              key={paletteTheme.value}
              value={paletteTheme.value}
            >
              <ThemeSwatch theme={paletteTheme.value} />
              {paletteTheme.label}
            </DropdownMenuRadioItem>
          ))}
        </DropdownMenuRadioGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
