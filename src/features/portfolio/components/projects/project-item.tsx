import Image from "next/image"
import { addQueryParams } from "@/utils/url"
import { BoxIcon, LinkIcon } from "lucide-react"

import { UTM_PARAMS } from "@/config/site"
import { Tag } from "@/components/ui/tag"
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/base/ui/tooltip"
import { CollapsibleDetails } from "@/components/collapsible-details"
import { Markdown } from "@/components/markdown"
import { ChevronsUpDownIcon } from "@/registry/components/chevrons-up-down-icon"

import type { Project } from "../../types/projects"
import { RowActionLink } from "../row-action-link"

export function ProjectItem({
  className,
  project,
}: {
  className?: string
  project: Project
}) {
  const { start, end } = project.period
  const isOngoing = !end
  const isSinglePeriod = end === start
  const Icon = project.icon ?? BoxIcon

  return (
    <div className={className}>
      <div className="group/project flex items-center hover:bg-accent-muted">
        {project.logo ? (
          <Image
            src={project.logo}
            alt={project.title}
            width={32}
            height={32}
            quality={100}
            className="mx-4 flex size-6 shrink-0 grayscale select-none group-hover/project:grayscale-0"
            unoptimized
            aria-hidden
          />
        ) : (
          <div className="mx-4 flex size-6 shrink-0 items-center justify-center rounded-lg border border-muted-foreground/15 bg-muted text-muted-foreground ring-1 ring-line ring-offset-1 ring-offset-background select-none">
            <Icon className="size-4" />
          </div>
        )}

        <CollapsibleDetails
          className="min-w-0 flex-1 border-l border-dashed border-line"
          defaultOpen={project.isExpanded}
          summaryClassName="flex w-full items-center"
          summary={
            <>
              <div className="min-w-0 flex-1 p-4 pr-2 text-left">
                <h3 className="mb-1 leading-snug font-medium text-balance">
                  {project.title}
                </h3>

                <dl className="text-sm text-muted-foreground">
                  <dt className="sr-only">Period</dt>
                  <dd className="flex items-center gap-0.5">
                    <span>{start}</span>
                    {!isSinglePeriod && (
                      <>
                        <span className="font-mono">—</span>
                        <span>{isOngoing ? "Present" : end}</span>
                      </>
                    )}
                  </dd>
                </dl>
              </div>

              <Tooltip>
                <TooltipTrigger
                  render={
                    <RowActionLink
                      href={addQueryParams(project.link, UTM_PARAMS)}
                      aria-label="Open project"
                    >
                      <LinkIcon />
                    </RowActionLink>
                  }
                />
                <TooltipContent>
                  <p>Open project</p>
                </TooltipContent>
              </Tooltip>

              <span className="p-4 pl-2 text-muted-foreground [&_svg]:pointer-events-none [&_svg]:size-4">
                <ChevronsUpDownIcon duration={0.15} />
              </span>
            </>
          }
        >
          <div className="space-y-4 border-t border-line p-4">
            {project.description && (
              <div className="typeset typeset-description">
                <Markdown>{project.description}</Markdown>
              </div>
            )}

            {project.skills.length > 0 && (
              <ul className="flex flex-wrap gap-1.5">
                {project.skills.map((skill, index) => (
                  <li key={index} className="flex">
                    <Tag>{skill}</Tag>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </CollapsibleDetails>
      </div>
    </div>
  )
}
