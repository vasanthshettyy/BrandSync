import { useState } from 'react';
import { useGigs } from '../../hooks/useGigs';
import { NICHES, PLATFORMS } from '../../lib/constants';
import {
    Megaphone, FileText, DollarSign, Loader2, Check, X
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

/**
 * CreateGigModal — A specialized modal for posting gigs with only basic details.
 * Removes workflow and milestone configuration for a faster, streamlined experience.
 */
export default function CreateGigModal({ isOpen, onClose }) {
    const { createGig } = useGigs();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const [form, setForm] = useState({
        title: '',
        description: '',
        platform: '',
        budget: '',
        niche: ''
    });

    if (!isOpen) return null;

    function updateForm(key, value) {
        setForm(prev => ({ ...prev, [key]: value }));
    }

    function canSubmit() {
        return form.title.trim() && 
               form.description.trim().length >= 50 && 
               form.platform && 
               Number(form.budget) >= 500 && 
               form.niche;
    }

    async function handleSubmit(e) {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            await createGig(form);
            onClose();
            // Reset form
            setForm({
                title: '',
                description: '',
                platform: '',
                budget: '',
                niche: ''
            });
        } catch (err) {
            setError(err.message || 'Failed to create gig');
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
            <motion.div 
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                className="w-full max-w-lg glass-card relative overflow-hidden"
            >
                {/* Header */}
                <div className="p-6 border-b border-white/5 flex items-center justify-between">
                    <div>
                        <h2 className="text-lg font-bold text-white flex items-center gap-2">
                            <Megaphone className="text-primary w-5 h-5" />
                            Post a New Gig
                        </h2>
                        <p className="text-[10px] text-text-muted uppercase tracking-widest font-bold mt-1">
                            Fill in the basics to find your influencer
                        </p>
                    </div>
                    <button 
                        onClick={onClose}
                        className="p-2 rounded-full hover:bg-white/5 text-text-muted hover:text-white transition-colors cursor-pointer"
                    >
                        <X size={20} />
                    </button>
                </div>

                {/* Form Body */}
                <form onSubmit={handleSubmit} className="p-6 space-y-5">
                    {error && (
                        <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-xs">
                            {error}
                        </div>
                    )}

                    <div className="space-y-4">
                        {/* Title */}
                        <div>
                            <label className="text-[10px] font-bold text-text-muted uppercase tracking-wider mb-1.5 block">
                                Campaign Title *
                            </label>
                            <div className="relative">
                                <Megaphone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
                                <input 
                                    type="text" 
                                    value={form.title}
                                    onChange={e => updateForm('title', e.target.value)}
                                    className="w-full pl-10 pr-4 py-2.5 bg-white/5 border border-border-dark rounded-xl text-sm outline-none focus:border-primary transition-colors"
                                    placeholder="e.g. Summer Collection Review" 
                                />
                            </div>
                        </div>

                        {/* Platform & Niche */}
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="text-[10px] font-bold text-text-muted uppercase tracking-wider mb-1.5 block">
                                    Platform *
                                </label>
                                <select 
                                    value={form.platform}
                                    onChange={e => updateForm('platform', e.target.value)}
                                    className="w-full px-3 py-2.5 bg-white/5 border border-border-dark rounded-xl text-sm outline-none focus:border-primary cursor-pointer"
                                >
                                    <option value="">Select</option>
                                    {PLATFORMS.map(p => <option key={p} value={p}>{p}</option>)}
                                </select>
                            </div>
                            <div>
                                <label className="text-[10px] font-bold text-text-muted uppercase tracking-wider mb-1.5 block">
                                    Niche *
                                </label>
                                <select 
                                    value={form.niche}
                                    onChange={e => updateForm('niche', e.target.value)}
                                    className="w-full px-3 py-2.5 bg-white/5 border border-border-dark rounded-xl text-sm outline-none focus:border-primary cursor-pointer"
                                >
                                    <option value="">Select</option>
                                    {NICHES.map(n => <option key={n} value={n}>{n}</option>)}
                                </select>
                            </div>
                        </div>

                        {/* Budget */}
                        <div>
                            <label className="text-[10px] font-bold text-text-muted uppercase tracking-wider mb-1.5 block">
                                Budget (₹) *
                            </label>
                            <div className="relative">
                                <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
                                <input 
                                    type="number" 
                                    value={form.budget}
                                    onChange={e => updateForm('budget', e.target.value)}
                                    className="w-full pl-10 pr-4 py-2.5 bg-white/5 border border-border-dark rounded-xl text-sm outline-none focus:border-primary transition-colors"
                                    placeholder="Min. ₹500" 
                                    min="500" 
                                />
                            </div>
                        </div>

                        {/* Description */}
                        <div>
                            <label className="text-[10px] font-bold text-text-muted uppercase tracking-wider mb-1.5 block">
                                Description * <span className="text-text-muted opacity-50">({form.description.length}/1000)</span>
                            </label>
                            <div className="relative">
                                <FileText className="absolute left-3 top-3 w-4 h-4 text-text-muted" />
                                <textarea 
                                    value={form.description}
                                    onChange={e => updateForm('description', e.target.value.slice(0, 1000))}
                                    rows={4}
                                    className="w-full pl-10 pr-4 py-2.5 bg-white/5 border border-border-dark rounded-xl text-sm outline-none focus:border-primary transition-colors resize-none"
                                    placeholder="Describe deliverables and requirements... (min. 50 characters)" 
                                />
                            </div>
                            {form.description.length > 0 && form.description.length < 50 && (
                                <p className="text-[10px] text-amber-400 mt-1 font-bold italic">
                                    {50 - form.description.length} more characters needed
                                </p>
                            )}
                        </div>
                    </div>

                    {/* Footer / Submit */}
                    <div className="pt-2">
                        <button 
                            type="submit" 
                            disabled={!canSubmit() || loading}
                            className="w-full py-3.5 bg-gradient-brand text-white rounded-xl font-bold text-xs uppercase tracking-widest hover:opacity-90 transition-opacity disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-primary/20"
                        >
                            {loading ? (
                                <><Loader2 className="w-4 h-4 animate-spin" /> Publishing...</>
                            ) : (
                                <><Check className="w-4 h-4" /> Publish Gig</>
                            )}
                        </button>
                    </div>
                </form>
            </motion.div>
        </div>
    );
}
