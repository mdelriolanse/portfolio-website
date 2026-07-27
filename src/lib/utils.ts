import type { ClassValue } from "clsx"
import { clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export const cn = (...inputs: ClassValue[]) => {
  return twMerge(clsx(inputs))
}

export function absoluteUrl(path: string) {
  // Falling back keeps this from producing "undefined/..." when the env var is
  // unset, which is the common case in local dev.
  const base = process.env.NEXT_PUBLIC_APP_URL || "https://mdelriolanse.com"
  return `${base}${path}`
}
