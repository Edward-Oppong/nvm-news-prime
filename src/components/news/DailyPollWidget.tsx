import { useState } from 'react';
import { motion } from 'framer-motion';
import { Vote, CheckCircle2 } from 'lucide-react';

interface PollOption {
  id: string;
  text: string;
  votes: number;
}

const INITIAL_POLL = {
  id: 'poll-2026-08',
  question: 'Should African nations prioritize rapid expansion of municipal electric transit over traditional highway expansion?',
  totalVotes: 1420,
  options: [
    { id: 'opt-1', text: 'Yes, electric transit reduces urban pollution & traffic gridlock', votes: 923 },
    { id: 'opt-2', text: 'No, highway connectivity between cities is more urgent', votes: 381 },
    { id: 'opt-3', text: 'Balanced public-private investment in both', votes: 116 },
  ] as PollOption[],
};

export function DailyPollWidget() {
  const [poll, setPoll] = useState(INITIAL_POLL);
  const [hasVoted, setHasVoted] = useState(false);
  const [selectedOpt, setSelectedOpt] = useState<string | null>(null);

  const handleVote = (optionId: string) => {
    if (hasVoted) return;

    setPoll((prev) => ({
      ...prev,
      totalVotes: prev.totalVotes + 1,
      options: prev.options.map((opt) =>
        opt.id === optionId ? { ...opt, votes: opt.votes + 1 } : opt
      ),
    }));
    setSelectedOpt(optionId);
    setHasVoted(true);
  };

  return (
    <div className="p-5 rounded-xl bg-card border border-border shadow-sm">
      <div className="flex items-center justify-between gap-2 mb-3">
        <div className="flex items-center gap-1.5 text-xs uppercase font-bold text-muted-foreground tracking-wider">
          <Vote className="h-3.5 w-3.5 text-accent" />
          <span>Daily Reader Poll</span>
        </div>
        <span className="text-xs text-muted-foreground">
          {poll.totalVotes.toLocaleString()} votes
        </span>
      </div>

      <h3 className="font-serif text-base font-bold text-headline leading-snug mb-3">
        {poll.question}
      </h3>

      <div className="space-y-2">
        {poll.options.map((option) => {
          const pct = Math.round((option.votes / poll.totalVotes) * 100);
          const isSelected = selectedOpt === option.id;

          return (
            <button
              key={option.id}
              onClick={() => handleVote(option.id)}
              disabled={hasVoted}
              className={`w-full relative overflow-hidden text-left p-3 rounded-lg border text-xs transition-colors ${
                hasVoted
                  ? isSelected
                    ? 'border-primary bg-primary/5 font-semibold text-headline'
                    : 'border-border bg-card text-foreground opacity-80'
                  : 'border-border bg-card hover:bg-muted text-foreground'
              }`}
            >
              {hasVoted && (
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${pct}%` }}
                  transition={{ duration: 0.5 }}
                  className={`absolute top-0 bottom-0 left-0 ${
                    isSelected ? 'bg-primary/15' : 'bg-muted/80'
                  }`}
                />
              )}

              <div className="relative z-10 flex items-center justify-between gap-2">
                <span className="flex-1 font-medium">{option.text}</span>
                {hasVoted ? (
                  <span className="font-bold text-headline text-xs flex items-center gap-1">
                    {pct}%
                    {isSelected && <CheckCircle2 className="h-3.5 w-3.5 text-primary" />}
                  </span>
                ) : (
                  <span className="text-[10px] font-semibold uppercase text-muted-foreground px-1.5 py-0.5 rounded bg-muted">
                    Vote
                  </span>
                )}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
