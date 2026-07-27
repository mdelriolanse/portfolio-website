import type { Metadata } from "next"

import { jsonLdBreadcrumbList, JsonLdScript } from "@/lib/json-ld"
import { Tag } from "@/components/ui/tag"
import { Markdown } from "@/components/markdown"
import {
  PageHeading,
  PageHeadingTagline,
  PageHeadingTitle,
} from "@/components/page-heading"
import { RevealEncodedTextScript } from "@/features/portfolio/components/overview/reveal-encoded-text"
import { AWARDS } from "@/features/portfolio/data/awards"
import { EDUCATION } from "@/features/portfolio/data/education"
import { EXPERIENCES } from "@/features/portfolio/data/experiences"
import { PROJECTS } from "@/features/portfolio/data/projects"
import { SOCIAL } from "@/features/portfolio/data/social-links"
import { TECH_STACK } from "@/features/portfolio/data/tech-stack"
import { USER } from "@/features/portfolio/data/user"

const title = "Résumé"
const description = `Experience, education, projects, and awards for ${USER.displayName}.`

const ogImage = `/og/simple?title=${encodeURIComponent(title)}&description=${encodeURIComponent(description)}`

export const metadata: Metadata = {
  title,
  description,
  alternates: {
    canonical: "/resume",
  },
  openGraph: {
    url: "/resume",
    type: "website",
    images: {
      url: ogImage,
      width: 1200,
      height: 630,
      alt: title,
    },
  },
  twitter: {
    card: "summary_large_image",
    images: [ogImage],
  },
}

const EMAIL_ID = "resume-email"

export default function Page() {
  return (
    <>
      <JsonLdScript
        data={jsonLdBreadcrumbList([
          { name: "Home", href: "/" },
          { name: title, href: "/resume" },
        ])}
      />

      <div className="min-h-svh">
        <PageHeading>
          <PageHeadingTagline>Résumé</PageHeadingTagline>
          <PageHeadingTitle>{USER.displayName}</PageHeadingTitle>
        </PageHeading>

        <div className="screen-line-bottom flex flex-wrap gap-x-2 gap-y-1 p-4 text-sm text-muted-foreground">
          <span>{USER.address}</span>
          <span aria-hidden>·</span>
          {/* Decoded before paint so the address is not plaintext in the HTML. */}
          <span id={EMAIL_ID} />
          <RevealEncodedTextScript id={EMAIL_ID} textB64={USER.emailB64} />
          <span aria-hidden>·</span>
          <a href={SOCIAL.github.href} target="_blank" rel="noopener">
            GitHub
          </a>
          <span aria-hidden>·</span>
          <a href={SOCIAL.linkedin.href} target="_blank" rel="noopener">
            LinkedIn
          </a>
        </div>

        <Section title="Education">
          {EDUCATION.map((item) => (
            <Entry
              key={item.id}
              heading={item.school}
              meta={[item.degree, item.fieldOfStudy].filter(Boolean).join(", ")}
              period={`${item.period.start} — ${item.period.end ?? "Present"}`}
              description={item.description}
            />
          ))}
        </Section>

        <Section title="Experience">
          {EXPERIENCES.flatMap((company) =>
            company.positions.map((position) => (
              <Entry
                key={position.id}
                heading={position.title}
                meta={`${company.companyName} · ${company.location}`}
                period={`${position.employmentPeriod.start} — ${position.employmentPeriod.end ?? "Present"}`}
                description={position.description}
                skills={position.skills}
              />
            ))
          )}
        </Section>

        <Section title="Projects">
          {PROJECTS.map((item) => (
            <Entry
              key={item.id}
              heading={item.title}
              href={item.link}
              period={`${item.period.start} — ${item.period.end ?? "Present"}`}
              description={item.description}
              skills={item.skills}
            />
          ))}
        </Section>

        <Section title="Awards">
          {AWARDS.map((item) => (
            <Entry
              key={item.id}
              heading={item.title}
              href={item.referenceLink}
              meta={`${item.prize} · ${item.grade}`}
              period={item.date}
              description={item.description}
            />
          ))}
        </Section>

        <Section title="Skills">
          <div className="space-y-3 p-4">
            {SKILL_GROUPS.map(({ category, items }) => (
              <div key={category} className="flex flex-wrap gap-1.5">
                <span className="mr-1 text-sm font-medium">{category}</span>
                {items.map((item) => (
                  <Tag key={item.key}>{item.title}</Tag>
                ))}
              </div>
            ))}
          </div>
        </Section>
      </div>
    </>
  )
}

const SKILL_GROUPS = Array.from(
  TECH_STACK.reduce((groups, item) => {
    for (const category of item.categories) {
      groups.set(category, [...(groups.get(category) ?? []), item])
    }
    return groups
  }, new Map<string, (typeof TECH_STACK)[number][]>())
).map(([category, items]) => ({ category, items }))

function Section({
  title,
  children,
}: {
  title: string
  children: React.ReactNode
}) {
  return (
    <section className="screen-line-bottom">
      <h2 className="screen-line-bottom px-4 py-2 font-heading text-sm font-medium tracking-wider text-muted-foreground uppercase">
        {title}
      </h2>
      {children}
    </section>
  )
}

function Entry({
  heading,
  href,
  meta,
  period,
  description,
  skills,
}: {
  heading: string
  href?: string
  meta?: string
  period: string
  description?: string
  skills?: string[]
}) {
  return (
    <div className="screen-line-bottom p-4">
      <div className="flex flex-wrap items-baseline justify-between gap-x-2">
        <h3 className="font-medium">
          {href ? (
            <a href={href} target="_blank" rel="noopener">
              {heading}
            </a>
          ) : (
            heading
          )}
        </h3>
        <span className="text-sm text-muted-foreground tabular-nums">
          {period}
        </span>
      </div>

      {meta && <p className="text-sm text-muted-foreground">{meta}</p>}

      {description && (
        <div className="typeset typeset-description pt-2">
          <Markdown>{description}</Markdown>
        </div>
      )}

      {skills && skills.length > 0 && (
        <ul className="flex flex-wrap gap-1.5 pt-3">
          {skills.map((skill) => (
            <li key={skill} className="flex">
              <Tag>{skill}</Tag>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
