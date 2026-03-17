import { useState } from 'react';
import { useGigs } from '../../hooks/useGigs';
import { useProposals } from '../../hooks/useProposals';
import { formatINR } from '../../lib/utils';
import PageWrapper from '../../components/layout/PageWrapper';
import { STATUS_COLORS } from '../../lib/constants';
import {
    Briefcase, MapPin, Clock, Send, Loader2,
    Instagram, Youtube, ChevronRight, X, IndianRupee, Target
} from 'lucide-react';

export default function GigFeedPage() {
    const { gigs, loading } = useGigs();
    const [selectedGig, setSelectedGig] = useState(null);

    return (
        <PageWrapper title="Opportunities" subtitle="High-value campaigns matching your profile.">
            {loading ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {[...Array(8)].map((_, i) => (
                        <div key={i} className="glass-card aspect-[4/5] animate-pulse overflow-hidden">
                            <div className="aspect-[16/10] bg-white/5 w-full" />
                            <div className="p-4 space-y-3">
                                <div className="h-4 bg-white/10 rounded w-3/4" />
                                <div className="h-3 bg-white/10 rounded w-1/2" />
                            </div>
                        </div>
                    ))}
                </div>
            ) : gigs.length === 0 ? (
                <div className="glass-card p-16 text-center border border-white/5">
                    <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center mx-auto mb-4 border border-white/5">
                        <Briefcase className="w-8 h-8 text-text-muted" />
                    </div>
                    <h3 className="text-xl font-display font-bold mb-2">No open gigs yet</h3>
                    <p className="text-text-secondary">Check back soon — new campaigns are posted daily!</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {gigs.map((gig, index) => (
                        <GigCard 
                            key={gig.id} 
                            gig={gig} 
                            index={index}
                            onApply={() => setSelectedGig(gig)} 
                        />
                    ))}
                </div>
            )}

            {/* Apply Modal */}
            {selectedGig && (
                <div className="modal-overlay animate-in fade-in">
                    <div className="modal-content max-w-2xl">
                        <div className="flex items-center justify-between p-6 border-b border-white/5">
                            <h2 className="text-xl font-display font-bold">Apply for Campaign</h2>
                            <button onClick={() => setSelectedGig(null)} className="p-2 hover:bg-white/5 rounded-full transition-colors">
                                <X className="w-5 h-5" />
                            </button>
                        </div>
                        <div className="p-6">
                            <div className="flex items-center gap-4 mb-6 p-4 rounded-2xl bg-white/5 border border-white/5">
                                <div className="w-12 h-12 rounded-xl bg-gradient-brand flex items-center justify-center shrink-0">
                                    <span className="text-white font-bold">{selectedGig.profiles_brand?.company_name?.charAt(0)}</span>
                                </div>
                                <div>
                                    <h3 className="font-bold text-sm">{selectedGig.title}</h3>
                                    <p className="text-xs text-text-secondary">{selectedGig.profiles_brand?.company_name}</p>
                                </div>
                                <div className="ml-auto text-right">
                                    <p className="text-[10px] font-bold text-text-muted uppercase">Budget</p>
                                    <p className="text-sm font-bold text-primary">{formatINR(selectedGig.budget)}</p>
                                </div>
                            </div>
                            <ApplyForm gigId={selectedGig.id} budget={selectedGig.budget} onClose={() => setSelectedGig(null)} />
                        </div>
                    </div>
                </div>
            )}
        </PageWrapper>
    );
}

function GigCard({ gig, index, onApply }) {
    const PlatformIcon = gig.platform === 'YouTube' ? Youtube : Instagram;

    return (
        <div 
            className="glass-card group hover:-translate-y-2 hover:shadow-2xl hover:shadow-indigo-500/10 hover:border-primary/50 transition-all duration-500 cursor-pointer overflow-hidden flex flex-col h-full animate-in fade-slide-up"
            style={{ animationDelay: `${index * 50}ms` }}
        >
            <div className="relative aspect-[16/10] overflow-hidden bg-surface-800">
                <div className="absolute inset-0 bg-gradient-brand opacity-10 group-hover:opacity-20 transition-opacity" />
                <div className="absolute inset-0 flex items-center justify-center">
                    <PlatformIcon className="w-12 h-12 text-white/20 group-hover:scale-110 group-hover:text-white/40 transition-all duration-700" />
                </div>
                
                <div className="absolute top-3 right-3">
                    <span className={`px-2.5 py-1 rounded-full text-[9px] font-bold uppercase tracking-wider backdrop-blur-md border ${STATUS_COLORS[gig.status]}`}>
                        {gig.status}
                    </span>
                </div>

                <div className="absolute bottom-3 left-3 flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-black/40 backdrop-blur-md border border-white/10 flex items-center justify-center overflow-hidden">
                        {gig.profiles_brand?.logo_url ? (
                            <img src={gig.profiles_brand.logo_url} className="w-full h-full object-cover" />
                        ) : (
                            <span className="text-[10px] font-bold text-white">{gig.profiles_brand?.company_name?.charAt(0)}</span>
                        )}
                    </div>
                    <span className="text-[10px] font-bold text-white drop-shadow-md">{gig.profiles_brand?.company_name}</span>
                </div>
            </div>

            <div className="p-5 flex flex-col flex-1">
                <h3 className="font-display font-bold text-sm text-text-primary mb-2 line-clamp-1 group-hover:text-primary transition-colors">
                    {gig.title}
                </h3>
                
                <p className="text-xs text-text-secondary line-clamp-2 mb-4 leading-relaxed">
                    {gig.description}
                </p>

                <div className="flex items-center gap-4 mb-6">
                    <div className="flex items-center gap-1.5">
                        <Target className="w-3.5 h-3.5 text-accent" />
                        <span className="text-[11px] font-bold text-text-primary">{gig.niche}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                        <Clock className="w-3.5 h-3.5 text-text-muted" />
                        <span className="text-[11px] font-bold text-text-muted">
                            {new Date(gig.deadline).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                        </span>
                    </div>
                </div>

                <div className="mt-auto pt-4 border-t border-white/5 flex items-center justify-between">
                    <div>
                        <p className="text-[9px] font-bold text-text-muted uppercase tracking-wider mb-0.5">Budget</p>
                        <p className="text-sm font-display font-bold text-text-primary">{formatINR(gig.budget)}</p>
                    </div>
                    <button 
                        onClick={(e) => { e.stopPropagation(); onApply(); }}
                        className="btn-primary !px-4 !py-2 !text-xs !rounded-lg"
                    >
                        Apply <ChevronRight className="w-3 h-3 icon-scale" />
                    </button>
                </div>
            </div>
        </div>
    );
}

function ApplyForm({ gigId, budget, onClose }) {
    const { submitProposal } = useProposals();
    const [coverLetter, setCoverLetter] = useState('');
    const [proposedPrice, setProposedPrice] = useState(budget?.toString() || '');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);

    async function handleApply(e) {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            await submitProposal(gigId, { coverLetter, proposedPrice });
            setSuccess(true);
            setTimeout(onClose, 2000);
        } catch (err) {
            setError(err.message || 'Failed to submit proposal');
        } finally {
            setLoading(false);
        }
    }

    if (success) {
        return (
            <div className="p-8 text-center animate-in fade-in">
                <div className="w-16 h-16 bg-emerald-500/20 text-emerald-500 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Send className="w-8 h-8" />
                </div>
                <h3 className="text-lg font-bold mb-2">Proposal Sent!</h3>
                <p className="text-sm text-text-secondary">The brand will be notified of your interest.</p>
            </div>
        );
    }

    return (
        <form onSubmit={handleApply} className="space-y-5 animate-in fade-slide-up">
            {error && <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs">{error}</div>}

            <div className="stagger-1">
                <label className="filter-label mb-2 block">Cover Letter *</label>
                <textarea 
                    value={coverLetter}
                    onChange={e => setCoverLetter(e.target.value)} 
                    rows={4}
                    placeholder="Why are you the right creator for this campaign?" 
                    required 
                />
            </div>

            <div className="stagger-2">
                <label className="filter-label mb-2 block">Proposed Price (₹) *</label>
                <div className="relative group">
                    <IndianRupee className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted group-focus-within:text-primary transition-colors" />
                    <input 
                        type="number" 
                        value={proposedPrice}
                        onChange={e => setProposedPrice(e.target.value)}
                        className="pl-10"
                        placeholder="Your price" 
                        min="100" 
                        required 
                    />
                </div>
            </div>

            <div className="flex gap-3 pt-2 stagger-3">
                <button 
                    type="submit" 
                    disabled={loading || !coverLetter.trim()}
                    className="btn-primary flex-1"
                >
                    {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4 icon-scale" />}
                    {loading ? 'Submitting...' : 'Submit Application'}
                </button>
                <button type="button" onClick={onClose} className="btn-secondary">
                    Cancel
                </button>
            </div>
        </form>
    );
}
