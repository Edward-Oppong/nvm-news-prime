import { Article } from "@/types/news";
import heroGeneral from "@/assets/hero-general.jpg";
import heroEntertainment from "@/assets/hero-entertainment.jpg";
import heroPolitics from "@/assets/hero-politics.jpg";
import heroSports from "@/assets/hero-sports.jpg";
import heroBusiness from "@/assets/hero-business.jpg";
import { mockAuthors } from "./mockAuthors";

export const mockArticles: Article[] = [
  {
    id: "101",
    title: "Ghana Launches $250M Nationwide Electric Transit Fleet to Revolutionize Mobility",
    excerpt:
      "The Ministry of Transport unveiled a landmark initiative deploying 500 zero-emission electric buses across major urban corridors, setting a new benchmark for clean African public transit.",
    category: "general",
    author: "Amara Koffi",
    authorRole: "Senior Political Correspondent",
    authorAvatar: mockAuthors[0].avatar,
    date: "August 2, 2026",
    readTime: "5 min read",
    image: heroGeneral,
    imageCaption: "Electric rapid transit bus parked at the newly commissioned solar-charging terminal in Accra.",
    featured: true,
    breaking: true,
    factChecked: true,
    editorsPick: true,
    audioDuration: "3:45",
    reactions: { mindBlowing: 320, insightful: 580, important: 840, hotTake: 110, inspiring: 460 },
    content: `
      <p class="text-xl leading-relaxed mb-6 font-medium text-subheadline">
        In what climate policymakers are hailing as a transformative leap for West African infrastructure, the government officially rolled out its inaugural fleet of 500 fully electric, solar-assisted public transport buses in Accra today.
      </p>

      <p>
        The $250 million investment—co-funded by the African Development Bank, green climate funds, and municipal private bonds—aims to slash urban carbon emissions by 40% over the next five years while cutting commuter wait times in half.
      </p>

      <h2>State-of-the-Art Charging Grid & Solar Depots</h2>
      <p>
        Crucial to the initiative is a network of 12 ultra-fast charging hubs powered primarily by dedicated solar arrays built along the Accra-Tema highway. Each depot can recharge a heavy-duty transit bus from 10% to 80% in under 25 minutes during off-peak hours.
      </p>

      <blockquote>
        <p>"This isn't merely about cleaner buses; it's about dignity, safety, and economic accessibility for millions of daily commuters who depend on public transport."</p>
        <cite>— Hon. Transport Minister Kwesi Osei</cite>
      </blockquote>

      <h2>Economic Ripple Effects and Local Assembly</h2>
      <p>
        Beyond cleaner air, the program establishes a regional assembly facility in Kumasi in partnership with local engineering firms, creating over 3,200 direct technician jobs and apprenticeships. Transport unions have overwhelmingly welcomed the transition, citing reduced operational fuel overheads and improved vehicle safety standards.
      </p>
    `,
  },
  {
    id: "102",
    title: "Pan-African Tariff Treaty Enters Full Enforcement across 15 Nations",
    excerpt:
      "Economic ministers finalized landmark customs harmonization agreements, eliminating tariffs on 90% of regionally produced manufactured goods and agricultural yields.",
    category: "business",
    author: "David Osei-Mensah",
    authorRole: "Chief Technology & Markets Editor",
    authorAvatar: mockAuthors[1].avatar,
    date: "August 2, 2026",
    readTime: "4 min read",
    image: heroBusiness,
    imageCaption: "Delegates applaud at the economic summit following the ceremonial signing of customs protocols.",
    featured: true,
    factChecked: true,
    editorsPick: true,
    audioDuration: "4:10",
    reactions: { mindBlowing: 210, insightful: 670, important: 910, hotTake: 85, inspiring: 340 },
    content: `
      <p class="text-xl leading-relaxed mb-6 text-subheadline">
        Cross-border commerce across West Africa entered a historic new era today as regional trade tariffs were officially abolished for verified domestic goods under the expanded trade protocol.
      </p>

      <p>
        Financial analysts project an immediate 28% surge in intra-regional manufacturing trade over the next 18 months, with logistics hubs in Lagos, Accra, Abidjan, and Lomé leading the expansion.
      </p>

      <h2>Digitized Border Checkpoints</h2>
      <p>
        To prevent bottlenecks, customs authorities deployed a unified digital clearance portal that allows haulers to pre-verify manifests electronically using smart QR permits, reducing average border dwell times from 48 hours to under 45 minutes.
      </p>
    `,
  },
  {
    id: "103",
    title: "Parliament Debates Landmark Renewable Energy Tax Incentive Bill",
    excerpt:
      "Lawmakers take up legislation granting 10-year tax holidays and zero-tariff imports for solar grid component manufacturers and off-grid rural power providers.",
    category: "politics",
    author: "Amara Koffi",
    authorRole: "Senior Political Correspondent",
    authorAvatar: mockAuthors[0].avatar,
    date: "August 1, 2026",
    readTime: "6 min read",
    image: heroPolitics,
    imageCaption: "Parliamentary chamber during intense debate over the bipartisan clean energy bill.",
    isOpinion: true,
    factChecked: true,
    audioDuration: "5:20",
    reactions: { mindBlowing: 140, insightful: 490, important: 720, hotTake: 310, inspiring: 280 },
    content: `
      <p class="text-xl leading-relaxed mb-6 text-subheadline">
        Bipartisan momentum reached a crescendo in parliament today as lawmakers advanced a groundbreaking energy reform package designed to turn West Africa into a clean energy powerhouse.
      </p>
      <p>
        The bill guarantees long-term feed-in tariffs for independent solar producers and creates a $100M innovation fund for battery storage technologies.
      </p>
    `,
  },
  {
    id: "104",
    title: "Historic Women's Football Championship Shatters Stadium Attendance Records",
    excerpt:
      "Over 65,000 passionate fans packed the national stadium in a thrilling final that saw tactical brilliance, record broadcast viewership, and grassroots momentum.",
    category: "sports",
    author: "Kwaku Boateng",
    authorRole: "Senior Sports Columnist",
    authorAvatar: mockAuthors[3].avatar,
    date: "August 1, 2026",
    readTime: "4 min read",
    image: heroSports,
    imageCaption: "Fans celebrate wildly following the decisive extra-time winning goal.",
    featured: true,
    factChecked: true,
    audioDuration: "3:15",
    reactions: { mindBlowing: 280, insightful: 310, important: 450, hotTake: 90, inspiring: 980 },
  },
  {
    id: "105",
    title: "Pan-African VR Cinema Project Captivates Audiences at Venice Film Festival",
    excerpt:
      "Acclaimed director's immersive virtual reality saga blending folklore and futuristic storytelling wins top jury honor for groundbreaking digital art.",
    category: "entertainment",
    author: "Elena Rostova",
    authorRole: "Global Affairs & Culture Analyst",
    authorAvatar: mockAuthors[2].avatar,
    date: "August 1, 2026",
    readTime: "5 min read",
    image: heroEntertainment,
    imageCaption: "Festival attendees experiencing the 360-degree interactive cinematic exhibition.",
    factChecked: true,
    audioDuration: "4:00",
    reactions: { mindBlowing: 610, insightful: 420, important: 190, hotTake: 140, inspiring: 540 },
  },
  {
    id: "106",
    title: "Accra Biotech Startup Unveils AI Early Diagnostic Tool for Preventive Healthcare",
    excerpt:
      "A home-grown medical AI software platform achieves 98.4% diagnostic accuracy in clinical trials for early cardiovascular and diabetes risk screening.",
    category: "business",
    author: "David Osei-Mensah",
    authorRole: "Chief Technology & Markets Editor",
    authorAvatar: mockAuthors[1].avatar,
    date: "July 31, 2026",
    readTime: "5 min read",
    image: heroBusiness,
    factChecked: true,
    editorsPick: true,
    audioDuration: "4:30",
    reactions: { mindBlowing: 720, insightful: 810, important: 640, hotTake: 60, inspiring: 610 },
  },
  {
    id: "107",
    title: "Metropolis Hosts First Pan-African Autonomous Drone Racing Grand Prix",
    excerpt:
      "Top engineers and flight pilots compete in high-velocity obstacle arenas, showcasing Next-Gen robotics and automated navigation algorithms.",
    category: "general",
    author: "David Osei-Mensah",
    authorRole: "Chief Technology & Markets Editor",
    authorAvatar: mockAuthors[1].avatar,
    date: "July 30, 2026",
    readTime: "3 min read",
    image: heroGeneral,
    factChecked: true,
    reactions: { mindBlowing: 490, insightful: 210, important: 180, hotTake: 290, inspiring: 310 },
  },
  {
    id: "108",
    title: "National Basketball League Achieves Historic Growth and Broadcast Milestone",
    excerpt:
      "Sell-out crowds and new international television rights deals signal a new era for professional basketball development across Africa.",
    category: "sports",
    author: "Kwaku Boateng",
    authorRole: "Senior Sports Columnist",
    authorAvatar: mockAuthors[3].avatar,
    date: "July 30, 2026",
    readTime: "4 min read",
    image: heroSports,
    factChecked: true,
    reactions: { mindBlowing: 190, insightful: 290, important: 380, hotTake: 70, inspiring: 740 },
  },
  {
    id: "109",
    title: "Independent Film Festival Celebrates New Generation of West African Auteurs",
    excerpt:
      "Showcasing bold storytelling, indigenous scoring, and cutting-edge cinematography that resonated with global critics and streaming distributors.",
    category: "entertainment",
    author: "Elena Rostova",
    authorRole: "Global Affairs & Culture Analyst",
    authorAvatar: mockAuthors[2].avatar,
    date: "July 29, 2026",
    readTime: "5 min read",
    image: heroEntertainment,
    factChecked: true,
    reactions: { mindBlowing: 310, insightful: 450, important: 210, hotTake: 50, inspiring: 580 },
  },
  {
    id: "110",
    title: "Parliament Passes Comprehensive Consumer Data Protection & Digital Rights Bill",
    excerpt:
      "Strict data privacy mandates, severe penalties for leaks, and explicit AI transparency requirements establish regional digital sovereignty.",
    category: "politics",
    author: "Amara Koffi",
    authorRole: "Senior Political Correspondent",
    authorAvatar: mockAuthors[0].avatar,
    date: "July 28, 2026",
    readTime: "5 min read",
    image: heroPolitics,
    isOpinion: true,
    factChecked: true,
    editorsPick: true,
    reactions: { mindBlowing: 240, insightful: 780, important: 930, hotTake: 140, inspiring: 390 },
  },
];

export const trendingArticles = mockArticles.slice(0, 5);
export const latestArticles = mockArticles.slice(0);
export const featuredArticle = mockArticles[0];

export const getArticlesByCategory = (category: string) =>
  mockArticles.filter((article) => article.category === category);
