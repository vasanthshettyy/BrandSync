import { useState } from 'react';
import { useGigs } from '../../hooks/useGigs';
import { useProposals } from '../../hooks/useProposals';
import { useAuth } from '../../context/AuthContext';
import { formatINR } from '../../lib/utils';
import PageWrapper from '../../components/layout/PageWrapper';
import { STATUS_COLORS } from '../../lib/constants';
import {
    Briefcase, MapPin, Users, Clock, Send, Loader2,
    Instagram, Youtube, ChevronDown, ChevronUp,
} from 'lucide-react';

export default function GigFeedPage() {
    const { gigs, loading } = useGigs();

    return (
        <PageWrapper title="Gig Feed" subtitle="Browse open campaigns from brands">
            {loading ? (
                <div className="space-y-4">
                    {[...Array(3)].map((_, i) => (
                        <div key={i} className="glass-card p-5 animate-pulse">
                            <div className="h-5 bg-white/10 rounded w-3/4 mb-3" />
                            <div className="h-3 bg-white/10 rounded w-full mb-2" />
                            <div className="h-3 bg-white/10 rounded w-2/3" />
                        </div>
                    ))}
                </div>
            ) : gigs.length === 0 ? (
                <div className="glass-card p-12 text-center">
                    <Briefcase className="w-12 h-12 text-text-muted mx-auto mb-3" />
                    <h3 className="font-semibold mb-1">No open gigs yet</h3>
                    <p className="text-sm text-text-secondary">Check back soon — new campaigns are posted daily!</p>
                </div>
            ) : (
                <div className="space-y-4">
                    {gigs.map(gig => <GigCard key={gig.id} gig={gig} />)}
                </div>
            )}
        </PageWrapper>
    );
}

function GigCard({ gig }) {
    const [expanded, setExpanded] = useState(false);
    const [showApply, setShowApply] = useState(false);

    const PlatformIcon = gig.platform === 'YouTube' ? Youtube : Instagram;

    return (
        <div className="glass-card p-5 hover:shadow-card-hover transition-all duration-300">
            {/* Header */}
            <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-gradient-brand flex items-center justify-center overflow-hidden shrink-0">
                        {gig.profiles_brand?.logo_url ? (
                            <img src={gig.profiles_brand.logo_url} alt="" className="w-full h-full object-cover" />
                        ) : (
                            <span className="text-white font-bold text-sm">{gig.profiles_brand?.company_name?.charAt(0)}</span>
                        )}
                    </div>
                    <div>
                        <h3 className="font-semibold text-sm">{gig.title}</h3>
                        <p className="text-xs text-text-secondary">{gig.profiles_brand?.company_name}</p>
                    </div>
                </div>
                <span className={`text-xs px-2.5 py-1 rounded-full border font-medium ${STATUS_COLORS[gig.status]}`}>
                    {gig.status}
                </span>
            </div>

            {/* Meta */}
            <div className="flex items-center gap-4 mb-3 text-xs text-text-secondary">
                <span className="flex items-center gap-1"><PlatformIcon className="w-3.5 h-3.5" />{gig.platform}</span>
                <span className="flex items-center gap-1 text-primary font-semibold">{formatINR(gig.budget)}</span>
                <span>{gig.niche}</span>
                {gig.deadline && (
                    <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5" />{new Date(gig.deadline).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}</span>
                )}
            </div>

            {/* Description */}
            <p className={`text-sm text-text-secondary mb-3 ${expanded ? '' : 'line-clamp-2'}`}>{gig.description}</p>
            {gig.description?.length > 150 && (
                <button onClick={() => setExpanded(!expanded)} className="text-xs text-primary hover:underline cursor-pointer flex items-center gap-1 mb-3">
                    {expanded ? <><ChevronUp className="w-3 h-3" />Show less</> : <><ChevronDown className="w-3 h-3" />Read more</>}
                </button>
            )}

            {/* Apply Button */}
            {!showApply ? (
                <button onClick={() => setShowApply(true)}
                    className="flex items-center gap-2 px-4 py-2 bg-gradient-brand text-white rounded-lg text-sm font-medium hover:opacity-90 transition-opacity cursor-pointer">
                    <Send className="w-4 h-4" /> Apply Now
                </button>
            ) : (
                <ApplyForm gigId={gig.id} budget={gig.budget} onClose={() => setShowApply(false)} />
            )}
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
        } catch (err) {
            setError(err.message || 'Failed to submit proposal');
        } finally {
            setLoading(false);
        }
    }

    if (success) {
        return (
            <div className="p-4 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-sm animate-fade-in">
                ✅ Proposal submitted! The brand will review your application.
            </div>
        );
    }

    return (
        <form onSubmit={handleApply} className="space-y-3 p-4 rounded-lg bg-white/5 border border-border-dark animate-slide-up">
            {error && <div className="p-2 rounded bg-red-500/10 border border-red-500/20 text-red-400 text-xs">{error}</div>}

            <div>
                <label htmlFor={`cover-${gigId}`} className="text-xs text-text-secondary mb-1 block">Cover Letter *</label>
                <textarea id={`cover-${gigId}`} name="coverLetter" value={coverLetter}
                    onChange={e => setCoverLetter(e.target.value)} rows={3}
                    className="w-full px-3 py-2 bg-white/5 border border-border-dark rounded-lg text-sm outline-none focus:border-primary resize-none"
                    placeholder="Why are you the right creator for this campaign?" required />
            </div>

            <div>
                <label htmlFor={`price-${gigId}`} className="text-xs text-text-secondary mb-1 block">Your Price (₹)</label>
                <input id={`price-${gigId}`} name="proposedPrice" type="number" value={proposedPrice}
                    onChange={e => setProposedPrice(e.target.value)}
                    className="w-full px-3 py-2 bg-white/5 border border-border-dark rounded-lg text-sm outline-none focus:border-primary"
                    placeholder="Your proposed price" min="100" required />
            </div>

            <div className="flex gap-2">
                <button type="submit" disabled={loading || !coverLetter.trim()}
                    className="flex-1 py-2 bg-gradient-brand text-white rounded-lg text-sm font-medium hover:opacity-90 disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer">
                    {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                    {loading ? 'Submitting...' : 'Submit Proposal'}
                </button>
                <button type="button" onClick={onClose}
                    className="px-4 py-2 border border-border-dark rounded-lg text-sm hover:bg-white/5 cursor-pointer">
                    Cancel
                </button>
            </div>
        </form>
    );
}
