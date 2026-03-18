import { Article } from "@/types/news";
import heroGeneral from "@/assets/hero-general.jpg";
import heroEntertainment from "@/assets/hero-entertainment.jpg";
import heroPolitics from "@/assets/hero-politics.jpg";
import heroSports from "@/assets/hero-sports.jpg";
import heroBusiness from "@/assets/hero-business.jpg";

export const mockArticles: Article[] = [
  {
    id: "101",
    title: "Ghana Launches Nationwide Electric Bus Program",
    excerpt:
      "The government unveiled a plan to replace diesel buses with electric models to reduce urban pollution and improve public transport.",
    category: "general",
    author: "Viglio Emmanuel",
    date: "March 18, 2026",
    readTime: "5 min read",
    image: heroGeneral,
  },
  {
    id: "102",
    title: "New Trade Pact Signed Between West African Nations",
    excerpt:
      "Economic ministers signed an agreement to ease cross-border trade and strengthen regional manufacturing and logistics.",
    category: "business",
    author: "Viglio Emmanuel",
    date: "March 18, 2026",
    readTime: "4 min read",
    image: heroBusiness,
  },
  {
    id: "103",
    title: "Parliament Debates Renewable Energy Incentives",
    excerpt:
      "Lawmakers discuss tax breaks and funding programs for solar and wind energy projects across the country.",
    category: "politics",
    author: "Viglio Emmanuel",
    date: "March 18, 2026",
    readTime: "5 min read",
    image: heroPolitics,
  },
  {
    id: "104",
    title: "Historic Women’s Football Match Draws Record Attendance",
    excerpt:
      "The national women’s teams faced off in a thrilling match, setting new stadium attendance records.",
    category: "sports",
    author: "Viglio Emmanuel",
    date: "March 18, 2026",
    readTime: "3 min read",
    image: heroSports,
  },
  {
    id: "105",
    title: "Award-Winning Director Announces Virtual Reality Film Project",
    excerpt:
      "The filmmaker plans an immersive experience combining VR technology and cinematic storytelling.",
    category: "entertainment",
    author: "Viglio Emmanuel",
    date: "March 18, 2026",
    readTime: "4 min read",
    image: heroEntertainment,
  },
  {
    id: "106",
    title: "Breakthrough in Local AI Healthcare Tools",
    excerpt:
      "A Ghanaian startup develops AI software that analyzes patient data to predict early signs of chronic diseases.",
    category: "business",
    author: "Viglio Emmanuel",
    date: "March 18, 2026",
    readTime: "5 min read",
    image: heroBusiness,
  },
  {
    id: "107",
    title: "City Hosts First International Drone Racing Championship",
    excerpt:
      "Pilots from around the world compete in a high-speed, obstacle-filled drone race in the urban skyline.",
    category: "general",
    author: "Viglio Emmanuel",
    date: "March 18, 2026",
    readTime: "3 min read",
    image: heroGeneral,
  },
  // New articles added
  {
    id: "108",
    title: "National Basketball League Sees Record-Breaking Attendance",
    excerpt:
      "Fans fill arenas across the country as the league experiences unprecedented growth in popularity and ticket sales.",
    category: "sports",
    author: "Viglio Emmanuel",
    date: "March 18, 2026",
    readTime: "4 min read",
    image: heroSports,
  },
  {
    id: "109",
    title: "International Film Festival Highlights Emerging African Directors",
    excerpt:
      "A spotlight on fresh storytelling and innovative filmmaking techniques captivates audiences and critics alike.",
    category: "entertainment",
    author: "Viglio Emmanuel",
    date: "March 18, 2026",
    readTime: "5 min read",
    image: heroEntertainment,
  },
  {
    id: "110",
    title: "Parliament Passes Landmark Data Privacy Law",
    excerpt:
      "The new legislation strengthens digital rights and sets strict regulations for companies handling personal data.",
    category: "politics",
    author: "Viglio Emmanuel",
    date: "March 18, 2026",
    readTime: "5 min read",
    image: heroPolitics,
  },
];

export const trendingArticles = mockArticles.slice(0, 5);
export const latestArticles = mockArticles.slice(0);
export const featuredArticle = mockArticles[0];

export const getArticlesByCategory = (category: string) =>
  mockArticles.filter((article) => article.category === category);
