import type { Route } from "next"
import Link from "next/link"

import { cn } from "@/lib/utils"
import { Panel } from "@/features/portfolio/components/panel"

const ID = "hello"

type Work = {
  category: string
  title: string
  description: string
  links: { label: string; href: string }[]
}

const WORK: Work[] = [
  {
    category: "Infrastructure",
    title: "PrivateMind",
    description:
      "OpenAI-compatible batch inference, GPU load management, and production text-to-image on B200/B300s.",
    links: [{ label: "View", href: "https://www.privatemind.com/" }],
  },
  {
    category: "Research",
    title: "Open Weight, Open Risk",
    description:
      "A training-free jailbreak that steers a target model’s chain-of-thought to expose shallow alignment.",
    links: [
      {
        label: "View",
        href: "https://www.aochongoliverli.com/open-weight-open-risk/",
      },
    ],
  },
  {
    category: "Builder",
    title: "Dispatch",
    description:
      "Agentic pentesting platform—and Best Developer Tool at the 2026 Cornell AI Hackathon.",
    links: [{ label: "View", href: "https://dispatch-eosin.vercel.app/" }],
  },
  {
    category: "Edge AI",
    title: "Groundwork",
    description:
      "An always-on maintenance agent that runs entirely on one GB10 and proves its own air gap.",
    links: [
      { label: "Post", href: "/blog/groundwork" },
      { label: "Site", href: "https://get-groundwork.vercel.app" },
    ],
  },
  {
    category: "Builder",
    title: "marko",
    description:
      "Indoor navigation from one phone: no beacons, just a trail drawn on the real floor.",
    links: [
      { label: "Post", href: "/blog/marko" },
      { label: "Site", href: "https://get-marko.vercel.app" },
    ],
  },
]

const ROW =
  "grid min-h-28 grid-cols-[2.5rem_1fr] gap-x-3 border-b border-line py-5 sm:-mx-3 sm:grid-cols-[3rem_9rem_1fr_auto] sm:items-start sm:gap-x-4 sm:px-3"

const ACTION =
  "w-fit border-b border-transparent font-mono text-xs text-muted-foreground transition-colors duration-200"

function WorkLink({
  href,
  className,
  children,
}: {
  href: string
  className?: string
  children: React.ReactNode
}) {
  const external = href.startsWith("http")
  return external ? (
    <a className={className} href={href} rel="noreferrer" target="_blank">
      {children}
    </a>
  ) : (
    <Link className={className} href={href as Route}>
      {children}
    </Link>
  )
}

function RowBody({ work, index }: { work: Work; index: number }) {
  return (
    <>
      <span className="font-mono text-xs text-muted-foreground">
        {String(index + 1).padStart(2, "0")}
      </span>
      <span className="font-mono text-[0.6875rem] font-medium tracking-[0.14em] text-muted-foreground uppercase sm:pt-0.5">
        {work.category}
      </span>
      <div className="col-start-2 mt-3 sm:col-start-3 sm:mt-0">
        <h3 className="font-heading text-base font-semibold tracking-tight">
          {work.title}
        </h3>
        <p className="mt-1 max-w-xl text-sm leading-relaxed text-muted-foreground">
          {work.description}
        </p>
      </div>
    </>
  )
}

export function Hello() {
  return (
    <Panel id={ID}>
      <div data-slot="panel-body" className="p-0">
        <div className="px-4 py-7 sm:px-6 sm:py-9">
          <p className="max-w-3xl font-heading text-base leading-relaxed font-medium tracking-tight text-balance sm:text-lg">
            I’m Mateo, an Electrical &amp; Computer Engineering student at
            Cornell building the infrastructure that serves large models—and the
            research that stress-tests them.
          </p>

          <div className="mt-8 border-t border-line">
            {WORK.map((work, index) =>
              work.links.length === 1 ? (
                // One destination: the whole row is the link.
                <WorkLink
                  className={cn(
                    ROW,
                    "group transition-colors duration-200 hover:bg-muted/40 focus-visible:bg-muted/40 focus-visible:outline-none"
                  )}
                  href={work.links[0].href}
                  key={work.title}
                >
                  <RowBody index={index} work={work} />
                  <span
                    className={cn(
                      ACTION,
                      "col-start-2 mt-3 group-hover:border-foreground group-hover:text-foreground sm:col-start-4 sm:mt-0 sm:pt-0.5"
                    )}
                  >
                    {work.links[0].label} ↗
                  </span>
                </WorkLink>
              ) : (
                // Several destinations: each gets its own link.
                <div className={ROW} key={work.title}>
                  <RowBody index={index} work={work} />
                  <div className="col-start-2 mt-3 flex gap-4 sm:col-start-4 sm:mt-0 sm:flex-col sm:items-end sm:gap-1.5 sm:pt-0.5">
                    {work.links.map((link) => (
                      <WorkLink
                        className={cn(
                          ACTION,
                          "hover:border-foreground hover:text-foreground focus-visible:border-foreground focus-visible:text-foreground focus-visible:outline-none"
                        )}
                        href={link.href}
                        key={link.label}
                      >
                        {link.label} {link.href.startsWith("http") ? "↗" : "→"}
                      </WorkLink>
                    ))}
                  </div>
                </div>
              )
            )}
          </div>
        </div>
      </div>
    </Panel>
  )
}
