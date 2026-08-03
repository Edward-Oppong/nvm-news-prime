import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Plus, Edit, Trash2, Loader2, Save, X as XIcon, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { supabase } from '@/integrations/supabase/client';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { toast } from 'sonner';

interface PollOptionRow {
    id: string;
    text: string;
    votes: number;
    position: number;
}

interface Poll {
    id: string;
    question: string;
    active: boolean;
    created_at: string;
    poll_options: PollOptionRow[];
}

interface FormOption {
    id?: string;
    text: string;
}

export default function PollsList() {
    const [polls, setPolls] = useState<Poll[]>([]);
    const [loading, setLoading] = useState(true);
    const [deleteId, setDeleteId] = useState<string | null>(null);
    const [deleting, setDeleting] = useState(false);
    const [editPoll, setEditPoll] = useState<Poll | null>(null);
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [saving, setSaving] = useState(false);
    const [activatingId, setActivatingId] = useState<string | null>(null);

    const [question, setQuestion] = useState('');
    const [options, setOptions] = useState<FormOption[]>([{ text: '' }, { text: '' }]);

    useEffect(() => {
        fetchPolls();
    }, []);

    const fetchPolls = async () => {
        const { data, error } = await supabase
            .from('polls')
            .select('id, question, active, created_at, poll_options (id, text, votes, position)')
            .order('created_at', { ascending: false });

        if (error) {
            toast.error('Failed to fetch polls');
        } else {
            setPolls((data as Poll[]) || []);
        }
        setLoading(false);
    };

    const openNewDialog = () => {
        setEditPoll(null);
        setQuestion('');
        setOptions([{ text: '' }, { text: '' }]);
        setIsDialogOpen(true);
    };

    const openEditDialog = (poll: Poll) => {
        setEditPoll(poll);
        setQuestion(poll.question);
        const sorted = [...poll.poll_options].sort((a, b) => a.position - b.position);
        setOptions(sorted.map((o) => ({ id: o.id, text: o.text })));
        setIsDialogOpen(true);
    };

    const addOption = () => setOptions((prev) => [...prev, { text: '' }]);
    const removeOption = (index: number) =>
        setOptions((prev) => prev.filter((_, i) => i !== index));
    const updateOptionText = (index: number, text: string) =>
        setOptions((prev) => prev.map((o, i) => (i === index ? { ...o, text } : o)));

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        const trimmed = options.map((o) => ({ ...o, text: o.text.trim() })).filter((o) => o.text);

        if (!question.trim()) {
            toast.error('Question is required');
            return;
        }
        if (trimmed.length < 2) {
            toast.error('Add at least 2 options');
            return;
        }

        setSaving(true);

        if (editPoll) {
            const { error: pollError } = await supabase
                .from('polls')
                .update({ question: question.trim() })
                .eq('id', editPoll.id);

            if (pollError) {
                toast.error(pollError.message);
                setSaving(false);
                return;
            }

            const existingIds = editPoll.poll_options.map((o) => o.id);
            const keptIds = trimmed.filter((o) => o.id).map((o) => o.id as string);
            const removedIds = existingIds.filter((id) => !keptIds.includes(id));

            if (removedIds.length > 0) {
                const { error: deleteErr } = await supabase.from('poll_options').delete().in('id', removedIds);
                if (deleteErr) {
                    toast.error(deleteErr.message);
                    setSaving(false);
                    return;
                }
            }

            for (let i = 0; i < trimmed.length; i++) {
                const opt = trimmed[i];
                if (opt.id) {
                    await supabase.from('poll_options').update({ text: opt.text, position: i }).eq('id', opt.id);
                } else {
                    await supabase.from('poll_options').insert({ poll_id: editPoll.id, text: opt.text, position: i });
                }
            }

            toast.success('Poll updated');
        } else {
            const { data: newPoll, error: pollError } = await supabase
                .from('polls')
                .insert({ question: question.trim(), active: false })
                .select('id')
                .single();

            if (pollError || !newPoll) {
                toast.error(pollError?.message || 'Failed to create poll');
                setSaving(false);
                return;
            }

            const rows = trimmed.map((o, i) => ({ poll_id: newPoll.id, text: o.text, position: i }));
            const { error: optionsError } = await supabase.from('poll_options').insert(rows);

            if (optionsError) {
                toast.error(optionsError.message);
                setSaving(false);
                return;
            }

            toast.success('Poll created');
        }

        setSaving(false);
        setIsDialogOpen(false);
        fetchPolls();
    };

    const deletePoll = async () => {
        if (!deleteId) return;
        setDeleting(true);

        const { error } = await supabase.from('polls').delete().eq('id', deleteId);

        if (error) {
            toast.error('Failed to delete poll');
        } else {
            setPolls(polls.filter((p) => p.id !== deleteId));
            toast.success('Poll deleted');
        }

        setDeleting(false);
        setDeleteId(null);
    };

    const setActive = async (poll: Poll) => {
        setActivatingId(poll.id);

        const { error: deactivateError } = await supabase
            .from('polls')
            .update({ active: false })
            .neq('id', poll.id);

        if (deactivateError) {
            toast.error(deactivateError.message);
            setActivatingId(null);
            return;
        }

        const { error: activateError } = await supabase
            .from('polls')
            .update({ active: true })
            .eq('id', poll.id);

        if (activateError) {
            toast.error(activateError.message);
        } else {
            toast.success('Poll is now live on the homepage');
            fetchPolls();
        }

        setActivatingId(null);
    };

    return (
        <div className="p-4 sm:p-6 lg:p-8">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 sm:mb-8">
                <div>
                    <h1 className="text-2xl sm:text-3xl font-serif font-bold text-headline">Polls</h1>
                    <p className="text-muted-foreground mt-1 text-sm">
                        {polls.length} polls — one can be live on the homepage at a time
                    </p>
                </div>
                <Button onClick={openNewDialog} className="w-full sm:w-auto">
                    <Plus className="h-4 w-4 mr-2" />
                    New Poll
                </Button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {loading ? (
                    <div className="col-span-full flex justify-center py-12">
                        <Loader2 className="h-8 w-8 animate-spin text-primary" />
                    </div>
                ) : polls.length === 0 ? (
                    <div className="col-span-full text-center py-12">
                        <p className="text-muted-foreground">No polls yet</p>
                    </div>
                ) : (
                    polls.map((poll, index) => {
                        const totalVotes = poll.poll_options.reduce((sum, o) => sum + o.votes, 0);
                        return (
                            <motion.div
                                key={poll.id}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: index * 0.05 }}
                                className="bg-surface-elevated rounded-xl border border-divider p-5"
                            >
                                <div className="flex items-start justify-between mb-3 gap-2">
                                    <div>
                                        {poll.active && (
                                            <span className="flex items-center gap-1 px-2 py-0.5 text-[10px] font-bold uppercase rounded-full bg-green-500/15 text-green-600 w-fit">
                                                <CheckCircle2 className="h-3 w-3" />
                                                Live
                                            </span>
                                        )}
                                    </div>
                                    <div className="flex items-center gap-1 shrink-0">
                                        <Button variant="ghost" size="sm" onClick={() => openEditDialog(poll)}>
                                            <Edit className="h-4 w-4" />
                                        </Button>
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => setDeleteId(poll.id)}
                                            className="text-destructive hover:text-destructive"
                                        >
                                            <Trash2 className="h-4 w-4" />
                                        </Button>
                                    </div>
                                </div>

                                <h3 className="font-serif font-bold text-headline mb-2">{poll.question}</h3>

                                <ul className="space-y-1 mb-4">
                                    {[...poll.poll_options]
                                        .sort((a, b) => a.position - b.position)
                                        .map((o) => (
                                            <li key={o.id} className="flex items-center justify-between text-sm text-muted-foreground">
                                                <span>{o.text}</span>
                                                <span>{o.votes}</span>
                                            </li>
                                        ))}
                                </ul>

                                <div className="flex items-center justify-between">
                                    <span className="text-xs text-muted-foreground">{totalVotes} total votes</span>
                                    {!poll.active && (
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => setActive(poll)}
                                            disabled={activatingId === poll.id}
                                        >
                                            {activatingId === poll.id ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Set Live'}
                                        </Button>
                                    )}
                                </div>
                            </motion.div>
                        );
                    })
                )}
            </div>

            {/* Edit/Create Dialog */}
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle>{editPoll ? 'Edit Poll' : 'New Poll'}</DialogTitle>
                    </DialogHeader>
                    <form onSubmit={handleSubmit} className="space-y-5">
                        <div className="space-y-2">
                            <Label htmlFor="question">Question *</Label>
                            <Textarea
                                id="question"
                                value={question}
                                onChange={(e) => setQuestion(e.target.value)}
                                placeholder="Should...?"
                                rows={2}
                            />
                        </div>

                        <div className="space-y-2">
                            <Label>Options * (min 2)</Label>
                            <div className="space-y-2">
                                {options.map((opt, i) => (
                                    <div key={i} className="flex items-center gap-2">
                                        <Input
                                            value={opt.text}
                                            onChange={(e) => updateOptionText(i, e.target.value)}
                                            placeholder={`Option ${i + 1}`}
                                        />
                                        {options.length > 2 && (
                                            <Button type="button" variant="ghost" size="sm" onClick={() => removeOption(i)}>
                                                <XIcon className="h-4 w-4" />
                                            </Button>
                                        )}
                                    </div>
                                ))}
                            </div>
                            <Button type="button" variant="outline" size="sm" onClick={addOption}>
                                <Plus className="h-4 w-4 mr-1" />
                                Add option
                            </Button>
                        </div>

                        <div className="flex justify-end gap-3 pt-2">
                            <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                                Cancel
                            </Button>
                            <Button type="submit" disabled={saving}>
                                {saving ? (
                                    <Loader2 className="h-4 w-4 animate-spin" />
                                ) : (
                                    <>
                                        <Save className="h-4 w-4 mr-2" />
                                        {editPoll ? 'Update Poll' : 'Create Poll'}
                                    </>
                                )}
                            </Button>
                        </div>
                    </form>
                </DialogContent>
            </Dialog>

            {/* Delete Confirmation */}
            <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Delete Poll</AlertDialogTitle>
                        <AlertDialogDescription>
                            Are you sure you want to delete this poll? This cannot be undone.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={deletePoll}
                            disabled={deleting}
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                        >
                            {deleting ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Delete'}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
}