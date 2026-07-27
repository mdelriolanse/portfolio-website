import { BookmarkCategory, type Bookmark } from "../types/bookmarks"

// Articles, courses, books and references worth keeping. See ../types/bookmarks
// for the available categories.
export const BOOKMARKS: Bookmark[] = [
  {
    title: "The Techno-Optimist Manifesto",
    url: "https://a16z.com/the-techno-optimist-manifesto/",
    author: "Marc Andreessen",
    category: BookmarkCategory.ARTICLE,
    bookmarkedAt: "2026-07-27",
  },
  {
    title: "The Bitter Lesson",
    url: "http://www.incompleteideas.net/IncIdeas/BitterLesson.html",
    author: "Rich Sutton",
    category: BookmarkCategory.ARTICLE,
    bookmarkedAt: "2026-07-27",
  },
]
