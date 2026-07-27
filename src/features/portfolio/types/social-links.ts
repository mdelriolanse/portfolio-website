/** A profile's identity is its key in the `SOCIAL` registry, not a field here. */
export type SocialProfile = {
  title: string
  /** Omitted for profiles that are not an account (e.g. an on-site page). */
  handle?: string
  href: string
  /** Opt-in: include this profile in JSON-LD `sameAs` (public profile page). */
  sameAs?: boolean
}
