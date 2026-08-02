import { useState } from 'react';
import { motion } from 'framer-motion';

interface ReactionsState {
  mindBlowing: number;
  insightful: number;
  important: number;
  hotTake: number;
  inspiring: number;
}

interface ArticleReactionsProps {
  initialReactions?: ReactionsState;
}

const DEFAULT_REACTIONS: ReactionsState = {
  mindBlowing: 142,
  insightful: 289,
  important: 512,
  hotTake: 98,
  inspiring: 174,
};

export function ArticleReactions({ initialReactions = DEFAULT_REACTIONS }: ArticleReactionsProps) {
  const [reactions, setReactions] = useState<ReactionsState>(initialReactions);
  const [userVoted, setUserVoted] = useState<keyof ReactionsState | null>(null);

  const totalVotes = Object.values(reactions).reduce((acc, curr) => acc + curr, 0);

  const handleVote = (key: keyof ReactionsState) => {
    if (userVoted === key) {
      setReactions((prev) => ({ ...prev, [key]: prev[key] - 1 }));
      setUserVoted(null);
    } else {
      setReactions((prev) => {
        const updated = { ...prev };
        if (userVoted) {
          updated[userVoted] = updated[userVoted] - 1;
        }
        updated[key] = updated[key] + 1;
        return updated;
      });
      setUserVoted(key);
    }
  };

  const reactionItems: { key: keyof ReactionsState; label: string; emoji: string }[] = [
    { key: 'insightful', label: 'Insightful', emoji: '💡' },
    { key: 'important', label: 'Important', emoji: '📌' },
    { key: 'mindBlowing', label: 'Mind-Blowing', emoji: '🤯' },
    { key: 'hotTake', label: 'Hot Take', emoji: '🔥' },
    { key: 'inspiring', label: 'Inspiring', emoji: '❤️' },
  ];

  return (
    <div className="py-6 my-8 border-y border-divider">
      <div className="mb-4">
        <h3 className="font-serif text-lg font-bold text-headline">
          Reader Reactions
        </h3>
        <p className="text-xs text-muted-foreground mt-0.5">
          Share your reaction ({totalVotes} votes submitted)
        </p>
      </div>

      {/* Clean low-cognitive-load button grid */}
      <div className="flex flex-wrap items-center gap-2.5">
        {reactionItems.map((item) => {
          const count = reactions[item.key];
          const isSelected = userVoted === item.key;

          return (
            <button
              key={item.key}
              onClick={() => handleVote(item.key)}
              className={`flex items-center gap-2 px-3 py-2 rounded-lg border text-xs transition-colors ${
                isSelected
                  ? 'border-primary bg-primary/10 text-headline font-semibold'
                  : 'border-border bg-card hover:bg-muted text-muted-foreground hover:text-headline'
              }`}
            >
              <span className="text-base">{item.emoji}</span>
              <span className="font-medium">{item.label}</span>
              <span className="font-bold text-foreground bg-muted px-1.5 py-0.5 rounded text-[11px]">
                {count}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
