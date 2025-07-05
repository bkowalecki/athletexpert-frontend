// types/blogs.ts

export type BlogCardVariant = "latest" | "list" | "profile" | "related" | "horizontal";

export interface BlogPost {
  id: number;
  title: string;
  author: string;
  publishedDate: string;
  summary: string;
  imageUrl: string;
  slug: string;
  sport?: string;    // Some places use this, so it's optional
  content?: string;  // Only present on BlogPostPage or admin
  tags?: string[];   // Only on admin or full detail
}


export interface BlogCardProps {
  id: number;
  title: string;
  author: string;
  slug: string;
  imageUrl: string;
  publishedDate?: string;
  summary?: string;
  variant?: BlogCardVariant;
  isSaved?: boolean;
  isPinned?: boolean;
  onSave?: () => void;
  onUnsave?: () => void;
  onPin?: () => void;
}
