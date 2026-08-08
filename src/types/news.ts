export type Category = string;

export interface Author {
  id?: string;
  name: string;
  avatar: string;
  role: string;
  bio?: string;
  twitter?: string;
  location?: string;
}

export interface Article {
  id: string;
  title: string;
  excerpt: string;
  content?: string;
  category: Category;
  categoryLabel: string;
  categoryColor: string;
  slug: string;
  author: string;
  authorRole?: string;
  authorAvatar?: string;
  reviewedBy?: string;
  reviewedByRole?: string;
  reviewedByAvatar?: string;
  reviewedAt?: string;
  date: string;
  readTime: string;
  image: string;
  imageCaption?: string;
  featured?: boolean;
  breaking?: boolean;
  videoUrl?: string;
  audioUrl?: string;
  factChecked?: boolean;
  editorsPick?: boolean;
  isOpinion?: boolean;
  audioDuration?: string;
  viewCount?: number;
  reactions?: {
    mindBlowing: number;
    insightful: number;
    important: number;
    hotTake: number;
    inspiring: number;
  };
}
