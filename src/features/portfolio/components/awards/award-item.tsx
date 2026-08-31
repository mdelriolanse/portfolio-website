import { format } from "date-fns"
import { Crown, LinkIcon } from "lucide-react"

import { cn } from "@/lib/utils"
import { Separator } from "@/components/base/ui/separator"
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/base/ui/tooltip"
import { CollapsibleDetails } from "@/components/collapsible-details"
import { Markdown } from "@/components/markdown"
import { ChevronsUpDownIcon } from "@/registry/components/chevrons-up-down-icon"
import type { Award } from "@/features/portfolio/types/awards"

import { RowActionLink } from "../row-action-link"

export function AwardItem({
  className,
  award,
}: {
  className?: string
  award: Award
}) {
  const canExpand = !!award.description

  return (
    <div className={className}>
      <div className="flex items-center hover:bg-accent-muted">
        <div
          className={cn(
            "mx-4 flex size-6 shrink-0 items-center justify-center rounded-md border border-muted-foreground/15 bg-muted ring-1 ring-line ring-offset-1 ring-offset-background",
            "[&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg]:text-muted-foreground [&_svg:not([class*='size-'])]:size-4"
          )}
        >
          {award.icon ?? <Crown />}
        </div>

        <CollapsibleDetails
          className="min-w-0 flex-1 border-l border-dashed border-line"
          defaultOpen={canExpand}
          disabled={!canExpand}
          summaryClassName="flex w-full items-center"
          summary={
            <>
              <div className="min-w-0 flex-1 p-4 pr-2 text-left">
                <h3 className="mb-1 leading-snug font-medium text-balance">
                  {award.title}
                </h3>

                <dl className="flex flex-wrap items-center gap-x-2 text-sm text-muted-foreground">
                  <div>
                    <dt className="sr-only">Prize</dt>
                    <dd>{award.prize}</dd>
                  </div>

                  <Separator
                    className="data-vertical:h-4 data-vertical:self-center"
                    orientation="vertical"
                    aria-hidden
                  />

                  <div>
                    <dt className="sr-only">Awarded in</dt>
                    <dd>
                      <time dateTime={new Date(award.date).toISOString()}>
                        {format(new Date(award.date), "MM.yyyy")}
                      </time>
                    </dd>
                  </div>

                  <Separator
                    className="data-vertical:h-4 data-vertical:self-center"
                    orientation="vertical"
                    aria-hidden
                  />

                  <div>
                    <dt className="sr-only">Received in Grade</dt>
                    <dd>{award.grade}</dd>
                  </div>
                </dl>
              </div>

              {award.referenceLink && (
                <Tooltip>
                  <TooltipTrigger
                    render={
                      <RowActionLink
                        href={award.referenceLink}
                        aria-label="Open reference"
                      >
                        <LinkIcon />
                      </RowActionLink>
                    }
                  />
                  <TooltipContent>
                    <p>Open reference</p>
                  </TooltipContent>
                </Tooltip>
              )}

              {canExpand && (
                <span className="p-4 pl-2 text-muted-foreground [&_svg]:pointer-events-none [&_svg]:size-4">
                  <ChevronsUpDownIcon duration={0.15} />
                </span>
              )}
            </>
          }
        >
          <div className="typeset typeset-description border-t border-line p-4">
            <Markdown>{award.description}</Markdown>
          </div>
        </CollapsibleDetails>
      </div>
    </div>
  )
}
