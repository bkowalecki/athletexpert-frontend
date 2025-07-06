// types/blogs.ts

export type BlogCardVariant = "latest" | "list" | "profile" | "related" | "horizontal";

export interface BlogPost {
  id: number;
  slug: string;
  title: string;
  author: string;
  imageUrl: string;
  summary: string;
  content: string;
  sport: string;
  tags: string[];
  publishedDate: string;
}

// For form/draft (no id, no slug required)
export type BlogPostForm = {
  title: string;
  author: string;
  imageUrl: string;
  summary: string;
  content: string;
  sport: string;
  tags: string[];
  publishedDate: string;
};



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
