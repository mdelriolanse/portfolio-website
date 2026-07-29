import type { ImageProps } from "next/image"
import Image from "next/image"
import Link from "next/link"
import { format } from "date-fns"

import type { Doc } from "@/features/doc/types/document"

import { SafetyIndexChart } from "./open-weight-open-risk-charts"

type HeadingTypes = "h2" | "h3" | "h4"

/**
 * Posts whose hero is a chart render it live instead of using the baked
 * `metadata.image` screenshot, so the card follows the active theme. The
 * frontmatter image is still what social cards and OG tags use.
 */
const POST_THUMBNAILS: Record<
  string,
  React.ComponentType<{ className?: string }>
> = {
  "open-weight-open-risk": SafetyIndexChart,
}

export function PostItem({
  post,
  headingAs,
  imageLoading = "lazy",
}: {
  post: Doc
  headingAs?: HeadingTypes
  imageLoading?: ImageProps["loading"]
}) {
  const Heading = headingAs ?? "h2"
  const Thumbnail = POST_THUMBNAILS[post.slug]

  return (
    <div className="group/post relative flex h-full flex-col gap-2 p-2 transition-[background-color] ease-out hover:bg-accent-muted">
      {Thumbnail ? (
        // Cropped to the chart's own viewBox ratio, which clips the legend and
        // caption that only belong on the post page.
        <div className="pointer-events-none aspect-920/520 overflow-hidden rounded-xl select-none">
          {/* No grayscale here: the palette has to read correctly at rest, so
              the only motion left is the chart's own reveal on scroll. */}
          <Thumbnail className="my-0 rounded-none [&_svg]:min-w-0" />
        </div>
      ) : (
        post.metadata.image && (
          <div className="relative select-none [--image-radius:var(--radius-xl)]">
            <Image
              className="aspect-1200/630 rounded-(--image-radius) grayscale transition-[filter] duration-300 ease-[cubic-bezier(0.42,0,0.58,1)] group-hover/post:grayscale-0"
              src={post.metadata.image}
              alt={post.metadata.title}
              width={1200}
              height={630}
              quality={100}
              loading={imageLoading}
              unoptimized
            />
            <div className="pointer-events-none absolute inset-0 rounded-(--image-radius) inset-ring-1 inset-ring-black/15 dark:inset-ring-white/15" />
          </div>
        )
      )}

      <div className="flex flex-col gap-1 p-2">
        <Heading className="text-lg leading-snug font-medium text-balance">
          <Link href={`/blog/${post.slug}`}>
            <span className="absolute inset-0" aria-hidden />
            {post.metadata.title}
          </Link>

          {(post.metadata.new || post.metadata.updated) && (
            <span className="pointer-events-none ml-2 inline-block size-2 -translate-y-px rounded-full bg-info">
              <span className="sr-only">
                {post.metadata.new ? "New" : "Updated"}
              </span>
            </span>
          )}
        </Heading>

        <dl>
          <dt className="sr-only">Published on</dt>
          <dd className="text-sm text-muted-foreground">
            <time dateTime={new Date(post.metadata.createdAt).toISOString()}>
              {format(new Date(post.metadata.createdAt), "dd.MM.yyyy")}
            </time>
          </dd>
        </dl>
      </div>
    </div>
  )
}
