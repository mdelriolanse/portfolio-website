"use client"

import { copyText } from "@/utils/copy"
import { Type } from "lucide-react"
import { toast } from "sonner"

import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuTrigger,
} from "@/components/base/ui/context-menu"

import { getMarkSVG, SiteMark } from "./site-mark"
import { getWordmarkSVG } from "./site-wordmark"

export function BrandContextMenu({ children }: { children: React.ReactNode }) {
  return (
    <ContextMenu>
      <ContextMenuTrigger>{children}</ContextMenuTrigger>

      <ContextMenuContent className="w-fit">
        <ContextMenuItem
          onClick={() => {
            copyText(getMarkSVG())
            toast.success("Mark as SVG copied")
          }}
        >
          <SiteMark />
          Copy Mark as SVG
        </ContextMenuItem>

        <ContextMenuItem
          onClick={() => {
            copyText(getWordmarkSVG())
            toast.success("Logotype as SVG copied")
          }}
        >
          <Type />
          Copy Logotype as SVG
        </ContextMenuItem>
      </ContextMenuContent>
    </ContextMenu>
  )
}

export default BrandContextMenu
