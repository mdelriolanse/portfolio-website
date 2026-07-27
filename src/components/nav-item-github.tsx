import { GitHubIcon } from "@/components/icons"
import { SOCIAL } from "@/features/portfolio/data/social-links"

export function NavItemGitHub() {
  return (
    <a
      className="flex items-center text-muted-foreground transition-[color] hover:text-foreground"
      href={SOCIAL.github.href}
      target="_blank"
      rel="noopener"
      aria-label="GitHub Profile"
    >
      <GitHubIcon className="size-4" />
    </a>
  )
}
