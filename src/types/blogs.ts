// src/types/blogs.ts

export type BlogCardVariant =
  | "latest"
  | "list"
  | "profile"
  | "related"
  | "horizontal";

/**
 * BlogPost represents the canonical blog shape used across the app.
 * Some endpoints return "list" views that omit heavy fields like `content`,
 * so those are optional.
 */
export interface BlogPost {
  id: number;
  slug: string;
  title: string;

  author?: string;
  imageUrl?: string;
  summary?: string;

  content?: string;

  /** Primary sport/category for the post */
  sport?: string;

  tags?: string[];

  /** ISO string */
  publishedDate: string;
}

/**
 * Used by BlogCard (and other list UI components).
 * Keep this light and tolerant of partial data.
 */
export interface BlogCardProps {
  id: number;
  slug: string;
  title: string;

  author?: string;
  imageUrl?: string;
  summary?: string;
  publishedDate?: string;

  variant?: BlogCardVariant;

  // optional actions
  isSaved?: boolean;
  isPinned?: boolean;
  onSave?: () => void;
  onUnsave?: () => void;
  onPin?: () => void;
}

/**
 * Used by admin create/edit.
 * Backend may generate slug or allow overriding; keep slug optional.
 */
export interface BlogPostForm {
  title: string;
  author: string;
  summary: string;
  content: string;
  sport: string;
  tags: string[];
  imageUrl: string;

  /** HTML date input uses YYYY-MM-DD */
  publishedDate: string;

  /** Backend may generate slug or allow overriding; keep optional. */
  slug?: string;
}
