export type Category = 'politics' | 'business' | 'tech' | 'culture' | 'sports' | 'opinion';

export interface Article {
  id: string;
  title: string;
  excerpt: string;
  content?: string;
  category: Category;
  author: string;
  date: string;
  readTime: string;
  image: string;
  featured?: boolean;
  breaking?: boolean;
  videoUrl?: string;
}

export interface Author {
  name: string;
  avatar: string;
  role: string;
}
