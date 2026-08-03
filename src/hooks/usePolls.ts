import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface PollOption {
    id: string;
    text: string;
    votes: number;
}

export interface Poll {
    id: string;
    question: string;
    totalVotes: number;
    options: PollOption[];
}

interface DBPollOption {
    id: string;
    text: string;
    votes: number;
    position: number;
}

interface DBPoll {
    id: string;
    question: string;
    poll_options: DBPollOption[];
}

function transformPoll(db: DBPoll): Poll {
    const sorted = [...db.poll_options].sort((a, b) => a.position - b.position);
    return {
        id: db.id,
        question: db.question,
        totalVotes: sorted.reduce((sum, o) => sum + o.votes, 0),
        options: sorted.map((o) => ({ id: o.id, text: o.text, votes: o.votes })),
    };
}

// Fetch the currently active poll (shown on the homepage)
export function useActivePoll() {
    return useQuery({
        queryKey: ['active-poll'],
        queryFn: async () => {
            const { data, error } = await supabase
                .from('polls')
                .select('id, question, poll_options (id, text, votes, position)')
                .eq('active', true)
                .order('created_at', { ascending: false })
                .limit(1)
                .maybeSingle();

            if (error) throw error;
            if (!data) return null;
            return transformPoll(data as DBPoll);
        },
    });
}

// Cast a vote for a poll option
export function useVoteOnPoll() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (optionId: string) => {
            const { error } = await supabase.rpc('increment_poll_vote', { option_id: optionId });
            if (error) throw error;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['active-poll'] });
        },
    });
}