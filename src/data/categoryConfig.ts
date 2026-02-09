import { Category } from '@/types/news';
import bannerPolitics from '@/assets/banner-politics.jpg';
import bannerBusiness from '@/assets/banner-business.jpg';
import bannerTech from '@/assets/banner-tech.jpg';
import bannerCulture from '@/assets/banner-culture.jpg';
import bannerSports from '@/assets/banner-sports.jpg';
import bannerOpinion from '@/assets/banner-opinion.jpg';

export interface CategoryConfig {
  slug: Category;
  name: string;
  description: string;
  banner: string;
  color: string;
}

export const categoryConfigs: Record<Category, CategoryConfig> = {
  politics: {
    slug: 'politics',
    name: 'Politics',
    description: 'In-depth coverage of government, policy, and the people shaping our political landscape.',
    banner: bannerPolitics,
    color: 'category-politics',
  },
  business: {
    slug: 'business',
    name: 'Business',
    description: 'Market insights, economic analysis, and the latest from the world of finance and commerce.',
    banner: bannerBusiness,
    color: 'category-business',
  },
  tech: {
    slug: 'tech',
    name: 'Technology',
    description: 'Breaking innovations, digital trends, and the future of technology that shapes our world.',
    banner: bannerTech,
    color: 'category-tech',
  },
  culture: {
    slug: 'culture',
    name: 'Culture',
    description: 'Arts, entertainment, lifestyle, and the cultural moments defining our times.',
    banner: bannerCulture,
    color: 'category-culture',
  },
  sports: {
    slug: 'sports',
    name: 'Sports',
    description: 'Comprehensive coverage of athletics, from breaking scores to in-depth analysis.',
    banner: bannerSports,
    color: 'category-sports',
  },
  opinion: {
    slug: 'opinion',
    name: 'Opinion',
    description: 'Thoughtful perspectives, analysis, and commentary from our columnists and guest writers.',
    banner: bannerOpinion,
    color: 'category-opinion',
  },
};
