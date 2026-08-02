import { Author } from '@/types/news';

export const mockAuthors: Author[] = [
  {
    id: 'auth-1',
    name: 'Amara Koffi',
    role: 'Senior Political Correspondent',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=250',
    bio: 'Award-winning investigative journalist covering West African policy, governance, and diplomatic affairs for over 12 years.',
    twitter: '@amarakoffi_nvm',
    location: 'Accra, Ghana',
  },
  {
    id: 'auth-2',
    name: 'David Osei-Mensah',
    role: 'Chief Technology & Markets Editor',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=250',
    bio: 'Tech analyst and venture columnist exploring artificial intelligence, fintech disruption, and African startup ecosystems.',
    twitter: '@d_oseimensah',
    location: 'Lagos & Accra',
  },
  {
    id: 'auth-3',
    name: 'Elena Rostova',
    role: 'Global Affairs & Energy Analyst',
    avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=250',
    bio: 'Specializing in renewable energy transitions, global climate policy, and international trade treaties.',
    twitter: '@elena_rostova',
    location: 'Geneva / London',
  },
  {
    id: 'auth-4',
    name: 'Kwaku Boateng',
    role: 'Senior Sports Columnist',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=250',
    bio: 'Former athlete turned sports journalist with a focus on African football leagues, athletics, and grassroots sports funding.',
    twitter: '@kboateng_sports',
    location: 'Kumasi, Ghana',
  },
  {
    id: 'auth-5',
    name: 'Nhyiraba Viglio',
    role: 'Editor-in-Chief & Founder',
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&q=80&w=250',
    bio: 'Media innovator and founder of Nhyiraba Viglio Media. Dedicated to courageous journalism and digital truth.',
    twitter: '@viglio_nvm',
    location: 'Accra, Ghana',
  },
];

export const getAuthorByName = (name: string): Author => {
  return mockAuthors.find(a => a.name.toLowerCase() === name.toLowerCase()) || {
    name,
    role: 'Staff Writer & Reporter',
    avatar: `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(name)}`,
    bio: 'Editorial writer contributing analysis and breaking updates to NVM News.',
    location: 'Accra, Ghana',
  };
};
