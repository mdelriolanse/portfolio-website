import { addQueryParams } from "@/utils/url"
import { BriefcaseBusinessIcon, CodeXmlIcon, LightbulbIcon } from "lucide-react"

import { UTM_PARAMS } from "@/config/site"

import {
  IntroItem,
  IntroItemContent,
  IntroItemIcon,
  IntroItemLink,
} from "./intro-item"

type JobItemProps = {
  title: string
  company: string
  website: string
  experienceId?: string
  span?: 1 | 2
}

export function JobItem({
  title,
  company,
  website,
  experienceId,
  span = 1,
}: JobItemProps) {
  return (
    <IntroItem className={span === 2 ? "sm:col-span-2" : undefined}>
      <IntroItemIcon>{getJobIcon(title)}</IntroItemIcon>

      <IntroItemContent>
        {title} <span aria-label="at">@</span>
        <IntroItemLink
          className="ml-0.5 font-medium"
          {...(experienceId
            ? {
                href: `#experience-${experienceId}`,
                target: "_self",
                rel: "",
              }
            : {
                href: addQueryParams(website, UTM_PARAMS),
              })}
        >
          {company}
        </IntroItemLink>
      </IntroItemContent>
    </IntroItem>
  )
}

function getJobIcon(title: string) {
  if (/(developer|engineer)/i.test(title)) {
    return <CodeXmlIcon />
  }

  if (/(founder|co-founder)/i.test(title)) {
    return <LightbulbIcon />
  }

  return <BriefcaseBusinessIcon />
}
