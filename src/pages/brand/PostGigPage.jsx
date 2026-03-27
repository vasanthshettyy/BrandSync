import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useGigs } from '../../hooks/useGigs';
import { NICHES, PLATFORMS } from '../../lib/constants';
import PageWrapper from '../../components/layout/PageWrapper';
import {
    Megaphone, FileText, DollarSign, Calendar, Loader2, Check, Plus, Trash2, ListChecks
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const DEFAULT_MILESTONES = [
    { name: 'Script', order: 1 },
    { name: 'Draft', order: 2 },
    { name: 'Final', order: 3 }
];

export default function PostGigPage() {
    const navigate = useNavigate();
    const { createGig } = useGigs();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const [form, setForm] = useState({
        title: '',
        description: '',
        platform: '',
        budget: '',
        niche: '',
        deadline: '',
        milestones: DEFAULT_MILESTONES
    });

    function updateForm(key, value) {
        setForm(prev => ({ ...prev, [key]: value }));
    }

    function addMilestone() {
        if (form.milestones.length >= 6) return;
        const newOrder = form.milestones.length + 1;
        updateForm('milestones', [...form.milestones, { name: '', order: newOrder }]);
    }

    function removeMilestone(idx) {
        if (form.milestones.length <= 1) return;
        const newMilestones = form.milestones
            .filter((_, i) => i !== idx)
            .map((m, i) => ({ ...m, order: i + 1 }));
        updateForm('milestones', newMilestones);
    }

    function updateMilestoneName(idx, name) {
        const newMilestones = [...form.milestones];
        newMilestones[idx].name = name;
        updateForm('milestones', newMilestones);
    }

    function canSubmit() {
        const basicValid = form.title.trim() && form.description.trim().length >= 50
            && form.platform && Number(form.budget) >= 500 && form.niche;
        const milestonesValid = form.milestones.every(m => m.name.trim().length > 0);
        return basicValid && milestonesValid;
    }

    async function handleSubmit(e) {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            await createGig(form);
            navigate('/brand/dashboard');
        } catch (err) {
            setError(err.message || 'Failed to create gig');
        } finally {
            setLoading(false);
        }
    }

    return (
        <PageWrapper title="Post a New Campaign" subtitle="Create a gig to find the perfect influencer">
            <div className="max-w-3xl grid grid-cols-1 lg:grid-cols-5 gap-8">
                <div className="lg:col-span-3">
                    <div className="glass-card p-6">
                        {error && (
                            <div className="mb-4 p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm">{error}</div>
                        )}

                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div className="space-y-4">
                                <h3 className="text-xs font-bold text-primary uppercase tracking-widest flex items-center gap-2 px-1">
                                    <Megaphone size={14} /> Basic Information
                                </h3>
                                <div>
                                    <label htmlFor="gig-title" className="text-[10px] font-bold text-text-muted uppercase tracking-wider mb-1.5 block">Campaign Title *</label>
                                    <div className="relative">
                                        <Megaphone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
                                        <input id="gig-title" name="title" type="text" value={form.title}
                                            onChange={e => updateForm('title', e.target.value)}
                                            className="w-full pl-10 pr-4 py-2.5 bg-white/5 border border-border-dark rounded-lg text-sm outline-none focus:border-primary transition-colors"
                                            placeholder="e.g. Instagram Reel for Skincare Product Launch" />
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label htmlFor="gig-platform" className="text-[10px] font-bold text-text-muted uppercase tracking-wider mb-1.5 block">Platform *</label>
                                        <select id="gig-platform" name="platform" value={form.platform}
                                            onChange={e => updateForm('platform', e.target.value)}
                                            className="w-full px-3 py-2.5 bg-white/5 border border-border-dark rounded-lg text-sm outline-none focus:border-primary cursor-pointer">
                                            <option value="">Select platform</option>
                                            {PLATFORMS.map(p => <option key={p} value={p}>{p}</option>)}
                                        </select>
                                    </div>
                                    <div>
                                        <label htmlFor="gig-niche" className="text-[10px] font-bold text-text-muted uppercase tracking-wider mb-1.5 block">Niche *</label>
                                        <select id="gig-niche" name="niche" value={form.niche}
                                            onChange={e => updateForm('niche', e.target.value)}
                                            className="w-full px-3 py-2.5 bg-white/5 border border-border-dark rounded-lg text-sm outline-none focus:border-primary cursor-pointer">
                                            <option value="">Select niche</option>
                                            {NICHES.map(n => <option key={n} value={n}>{n}</option>)}
                                        </select>
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label htmlFor="gig-budget" className="text-[10px] font-bold text-text-muted uppercase tracking-wider mb-1.5 block">Budget (₹) *</label>
                                        <div className="relative">
                                            <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
                                            <input id="gig-budget" name="budget" type="number" value={form.budget}
                                                onChange={e => updateForm('budget', e.target.value)}
                                                className="w-full pl-10 pr-4 py-2.5 bg-white/5 border border-border-dark rounded-lg text-sm outline-none focus:border-primary transition-colors"
                                                placeholder="Min. ₹500" min="500" />
                                        </div>
                                    </div>
                                    <div>
                                        <label htmlFor="gig-deadline" className="text-[10px] font-bold text-text-muted uppercase tracking-wider mb-1.5 block">Deadline (Optional)</label>
                                        <div className="relative">
                                            <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
                                            <input id="gig-deadline" name="deadline" type="date" value={form.deadline}
                                                onChange={e => updateForm('deadline', e.target.value)}
                                                className="w-full pl-10 pr-4 py-2.5 bg-white/5 border border-border-dark rounded-lg text-sm outline-none focus:border-primary transition-colors cursor-pointer" />
                                        </div>
                                    </div>
                                </div>

                                <div>
                                    <label htmlFor="gig-description" className="text-[10px] font-bold text-text-muted uppercase tracking-wider mb-1.5 block">
                                        Description * <span className="text-text-muted">({form.description.length}/1000)</span>
                                    </label>
                                    <div className="relative">
                                        <FileText className="absolute left-3 top-3 w-4 h-4 text-text-muted" />
                                        <textarea id="gig-description" name="description" value={form.description}
                                            onChange={e => updateForm('description', e.target.value.slice(0, 1000))}
                                            rows={5}
                                            className="w-full pl-10 pr-4 py-2.5 bg-white/5 border border-border-dark rounded-lg text-sm outline-none focus:border-primary transition-colors resize-none"
                                            placeholder="Describe deliverables, target audience, and key messages... (min. 50 characters)" />
                                    </div>
                                    {form.description.length > 0 && form.description.length < 50 && (
                                        <p className="text-[10px] text-amber-400 mt-1 font-bold italic">{50 - form.description.length} more characters needed</p>
                                    )}
                                </div>
                            </div>

                            <button type="submit" disabled={!canSubmit() || loading}
                                className="w-full py-3 bg-gradient-brand text-white rounded-xl font-bold text-xs uppercase tracking-widest hover:opacity-90 transition-opacity disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-primary/20">
                                {loading ? <><Loader2 className="w-4 h-4 animate-spin" />Publishing...</> : <><Check className="w-4 h-4" />Publish Campaign</>}
                            </button>
                        </form>
                    </div>
                </div>

                {/* Milestone Configuration Side Panel */}
                <div className="lg:col-span-2 space-y-6">
                    <div className="glass-card p-6 bg-gradient-to-br from-indigo-500/5 to-transparent">
                        <div className="flex items-center justify-between mb-6 px-1">
                            <h3 className="text-xs font-bold text-white uppercase tracking-widest flex items-center gap-2">
                                <ListChecks size={16} className="text-primary" /> Workflow Builder
                            </h3>
                            <button 
                                onClick={addMilestone}
                                disabled={form.milestones.length >= 6}
                                className="p-1.5 rounded-lg bg-primary/10 text-primary hover:bg-primary/20 transition-all disabled:opacity-20 cursor-pointer"
                                title="Add Step"
                            >
                                <Plus size={16} />
                            </button>
                        </div>

                        <p className="text-[10px] text-text-muted font-medium mb-6 leading-relaxed">
                            Define the steps for this campaign. Influencers will submit work sequentially. 
                            <span className="text-primary font-bold"> Max 6 steps.</span>
                        </p>

                        <div className="space-y-3">
                            <AnimatePresence initial={false}>
                                {form.milestones.map((m, idx) => (
                                    <motion.div 
                                        key={idx}
                                        initial={{ opacity: 0, x: 10 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        exit={{ opacity: 0, scale: 0.9 }}
                                        className="flex items-center gap-3 group"
                                    >
                                        <div className="w-6 h-6 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-[10px] font-bold text-text-muted shrink-0 group-hover:border-primary/50 transition-colors">
                                            {idx + 1}
                                        </div>
                                        <div className="flex-1 relative">
                                            <input 
                                                type="text" 
                                                value={m.name}
                                                onChange={e => updateMilestoneName(idx, e.target.value)}
                                                placeholder={`Step ${idx + 1} Name (e.g. Script)`}
                                                className="w-full px-3 py-2 bg-black/20 border border-white/5 rounded-xl text-xs outline-none focus:border-primary transition-all placeholder:text-text-muted/30"
                                            />
                                        </div>
                                        <button 
                                            onClick={() => removeMilestone(idx)}
                                            disabled={form.milestones.length <= 1}
                                            className="p-2 rounded-lg text-rose-500/40 hover:text-rose-500 hover:bg-rose-500/10 transition-all disabled:opacity-0 cursor-pointer"
                                        >
                                            <Trash2 size={14} />
                                        </button>
                                    </motion.div>
                                ))}
                            </AnimatePresence>
                        </div>

                        <div className="mt-8 pt-6 border-t border-white/5">
                            <div className="flex items-center justify-between mb-2">
                                <span className="text-[10px] font-bold text-text-muted uppercase tracking-widest">Default Workflows</span>
                            </div>
                            <div className="flex gap-2">
                                <button 
                                    onClick={() => updateForm('milestones', DEFAULT_MILESTONES)}
                                    className="px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 text-[10px] font-bold text-white hover:bg-white/10 transition-all cursor-pointer"
                                >
                                    Standard (3 Steps)
                                </button>
                                <button 
                                    onClick={() => updateForm('milestones', [{ name: 'Deliverable', order: 1 }])}
                                    className="px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 text-[10px] font-bold text-white hover:bg-white/10 transition-all cursor-pointer"
                                >
                                    Express (1 Step)
                                </button>
                            </div>
                        </div>
                    </div>

                    <div className="p-4 rounded-2xl bg-amber-500/5 border border-amber-500/10">
                        <p className="text-[10px] text-amber-400/80 leading-relaxed italic">
                            <b>Pro Tip:</b> Keep workflows under 4 steps for faster turnaround. Influencers prefer clear, concise deliverables.
                        </p>
                    </div>
                </div>
            </div>
        </PageWrapper>
    );
}
