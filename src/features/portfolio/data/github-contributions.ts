import "server-only"

import { unstable_cache } from "next/cache"

import { GITHUB_USERNAME } from "@/config/site"
import type { Activity } from "@/registry/components/contribution-graph"

type GitHubContributionsResponse = {
  contributions: Activity[]
}

export const getGitHubContributions = unstable_cache(
  async () => {
    const res = await fetch(
      `${process.env.GITHUB_CONTRIBUTIONS_API_URL || "https://github-contributions-api.jogruber.de"}/v4/${GITHUB_USERNAME}?y=last`
    )
    if (!res.ok) {
      return []
    }
    const data = (await res.json()) as GitHubContributionsResponse
    return data.contributions ?? []
  },
  // The username is part of the key: without it a cached response outlives a
  // change to GITHUB_USERNAME and keeps serving the previous account's graph.
  ["github-contributions", GITHUB_USERNAME],
  { revalidate: 86400 } // Cache for 1 day (86400 seconds)
)
