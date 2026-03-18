import { Category } from "@/types/news";
import bannerGeneral from "@/assets/hero-general.jpg";
import bannerEntertainment from "@/assets/hero-entertainment.jpg";
import bannerPolitics from "@/assets/hero-politics.jpg";
import bannerSports from "@/assets/hero-sports.jpg";
import bannerBusiness from "@/assets/hero-business.jpg";

export interface CategoryConfig {
  slug: Category;
  name: string;
  description: string;
  banner: string;
  color: string;
}

export const categoryConfigs: Record<Category, CategoryConfig> = {
  general: {
    slug: "general",
    name: "General News",
    description:
      "Breaking stories, world events, and the headlines shaping our daily lives.",
    banner: bannerGeneral,
    color: "category-general",
  },
  entertainment: {
    slug: "entertainment",
    name: "Entertainment",
    description:
      "Movies, music, celebrity news, and the cultural moments everyone is talking about.",
    banner: bannerEntertainment,
    color: "category-entertainment",
  },
  politics: {
    slug: "politics",
    name: "Politics",
    description:
      "In-depth coverage of government, policy, and the people shaping our political landscape.",
    banner: bannerPolitics,
    color: "category-politics",
  },
  sports: {
    slug: "sports",
    name: "Sports",
    description:
      "Comprehensive coverage of athletics, from breaking scores to in-depth analysis.",
    banner: bannerSports,
    color: "category-sports",
  },
  business: {
    slug: "business",
    name: "Business",
    description:
      "Market insights, economic analysis, and the latest from the world of finance and commerce.",
    banner: bannerBusiness,
    color: "category-business",
  },
};
