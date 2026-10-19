import { addQueryParams } from "@/utils/url"
import { LinkIcon } from "lucide-react"

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

  return (
    <div className={className}>
      <div className="group/project flex items-center hover:bg-accent-muted">
        <CollapsibleDetails
          className="min-w-0 flex-1"
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
