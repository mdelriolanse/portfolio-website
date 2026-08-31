"use client"

import { useState } from "react"

import { cn } from "@/lib/utils"

export function CollapsibleDetails({
  defaultOpen,
  disabled,
  className,
  summaryClassName,
  summary,
  children,
}: {
  defaultOpen?: boolean
  disabled?: boolean
  className?: string
  summaryClassName?: string
  summary: React.ReactNode
  children?: React.ReactNode
}) {
  const [open, setOpen] = useState(!!defaultOpen)

  if (disabled || children == null) {
    return <div className={className}>{summary}</div>
  }

  return (
    <details
      className={cn("group/collapsible-details", className)}
      open={open}
      onToggle={(event) => {
        setOpen(event.currentTarget.open)
      }}
    >
      <summary
        className={cn(
          "cursor-pointer list-none [&::-webkit-details-marker]:hidden",
          summaryClassName
        )}
      >
        {summary}
      </summary>
      {children}
    </details>
  )
}
