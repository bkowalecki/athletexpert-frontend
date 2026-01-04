export type ForumPost = {
  id: string;
  author: string;
  createdAt: string;
  content: string;
};

export type ForumThread = {
  id: string;
  sportSlug: string;
  title: string;
  author: string;
  createdAt: string;
  body: string;
  replies: ForumPost[];
  lastActivityAt: string;
};
