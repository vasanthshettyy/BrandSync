import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useGigs } from '../../hooks/useGigs';
import { NICHES, PLATFORMS } from '../../lib/constants';
import PageWrapper from '../../components/layout/PageWrapper';
import {
    Megaphone, FileText, DollarSign, Calendar, Loader2, Check
} from 'lucide-react';

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
    });

    function updateForm(key, value) {
        setForm(prev => ({ ...prev, [key]: value }));
    }

    function canSubmit() {
        return form.title.trim() && form.description.trim().length >= 50
            && form.platform && Number(form.budget) >= 500 && form.niche;
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
            <div className="max-w-2xl">
                <div className="glass-card p-6">
                    {error && (
                        <div className="mb-4 p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm">{error}</div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-5">
                        <div>
                            <label htmlFor="gig-title" className="text-sm text-text-secondary mb-1.5 block">Campaign Title *</label>
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
                                <label htmlFor="gig-platform" className="text-sm text-text-secondary mb-1.5 block">Platform *</label>
                                <select id="gig-platform" name="platform" value={form.platform}
                                    onChange={e => updateForm('platform', e.target.value)}
                                    className="w-full px-3 py-2.5 bg-white/5 border border-border-dark rounded-lg text-sm outline-none focus:border-primary cursor-pointer">
                                    <option value="">Select platform</option>
                                    {PLATFORMS.map(p => <option key={p} value={p}>{p}</option>)}
                                </select>
                            </div>
                            <div>
                                <label htmlFor="gig-niche" className="text-sm text-text-secondary mb-1.5 block">Niche *</label>
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
                                <label htmlFor="gig-budget" className="text-sm text-text-secondary mb-1.5 block">Budget (₹) *</label>
                                <div className="relative">
                                    <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
                                    <input id="gig-budget" name="budget" type="number" value={form.budget}
                                        onChange={e => updateForm('budget', e.target.value)}
                                        className="w-full pl-10 pr-4 py-2.5 bg-white/5 border border-border-dark rounded-lg text-sm outline-none focus:border-primary transition-colors"
                                        placeholder="Min. ₹500" min="500" />
                                </div>
                            </div>
                            <div>
                                <label htmlFor="gig-deadline" className="text-sm text-text-secondary mb-1.5 block">Deadline (Optional)</label>
                                <div className="relative">
                                    <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
                                    <input id="gig-deadline" name="deadline" type="date" value={form.deadline}
                                        onChange={e => updateForm('deadline', e.target.value)}
                                        className="w-full pl-10 pr-4 py-2.5 bg-white/5 border border-border-dark rounded-lg text-sm outline-none focus:border-primary transition-colors cursor-pointer" />
                                </div>
                            </div>
                        </div>

                        <div>
                            <label htmlFor="gig-description" className="text-sm text-text-secondary mb-1.5 block">
                                Description * <span className="text-text-muted">({form.description.length}/1000)</span>
                            </label>
                            <div className="relative">
                                <FileText className="absolute left-3 top-3 w-4 h-4 text-text-muted" />
                                <textarea id="gig-description" name="description" value={form.description}
                                    onChange={e => updateForm('description', e.target.value.slice(0, 1000))}
                                    rows={5}
                                    className="w-full pl-10 pr-4 py-2.5 bg-white/5 border border-border-dark rounded-lg text-sm outline-none focus:border-primary transition-colors resize-none"
                                    placeholder="Describe what you're looking for: content type, deliverables, target audience, key messages... (min. 50 characters)" />
                            </div>
                            {form.description.length > 0 && form.description.length < 50 && (
                                <p className="text-xs text-amber-400 mt-1">{50 - form.description.length} more characters needed</p>
                            )}
                        </div>

                        <button type="submit" disabled={!canSubmit() || loading}
                            className="w-full py-2.5 bg-gradient-brand text-white rounded-lg font-medium text-sm hover:opacity-90 transition-opacity disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer">
                            {loading ? <><Loader2 className="w-4 h-4 animate-spin" />Publishing...</> : <><Check className="w-4 h-4" />Publish Campaign</>}
                        </button>
                    </form>
                </div>
            </div>
        </PageWrapper>
    );
}
