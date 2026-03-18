import { useState, useEffect } from 'react';
import { useGigs } from '../../hooks/useGigs';
import { useProposals } from '../../hooks/useProposals';
import { useContracts } from '../../hooks/useContracts';
import { useReviews } from '../../hooks/useReviews';
import { useAuth } from '../../context/AuthContext';
import { formatINR, formatRelativeTime, cn } from '../../lib/utils';
import { STATUS_COLORS } from '../../lib/constants';
import PageWrapper from '../../components/layout/PageWrapper';
import ReviewFormModal from '../../components/reviews/ReviewFormModal';
import {
    Megaphone, Users, Clock, CheckCircle, XCircle, Loader2, ChevronDown, ChevronUp, FileText, Star, AlertCircle
} from 'lucide-react';

export default function BrandContractsPage() {
    const { gigs, loading: gigsLoading } = useGigs();

    return (
        <PageWrapper title="My Campaigns" subtitle="Manage your gigs and review applications">
            {gigsLoading ? (
                <div className="space-y-4">
                    {[...Array(2)].map((_, i) => (
                        <div key={i} className="glass-card p-5 animate-pulse">
                            <div className="h-5 bg-white/10 rounded w-1/2 mb-3" />
                            <div className="h-3 bg-white/10 rounded w-full mb-2" />
                        </div>
                    ))}
                </div>
            ) : gigs.length === 0 ? (
                <div className="glass-card p-12 text-center">
                    <Megaphone className="w-12 h-12 text-text-muted mx-auto mb-3" />
                    <h3 className="font-semibold mb-1">No campaigns yet</h3>
                    <p className="text-sm text-text-secondary">Post your first gig to start receiving proposals!</p>
                </div>
            ) : (
                <div className="space-y-4">
                    {gigs.map(gig => <GigWithProposals key={gig.id} gig={gig} />)}
                </div>
            )}
        </PageWrapper>
    );
}

function GigWithProposals({ gig }) {
    const [expanded, setExpanded] = useState(false);

    return (
        <div className="glass-card overflow-hidden">
            {/* Gig Header */}
            <button onClick={() => setExpanded(!expanded)}
                className="w-full p-5 flex items-center justify-between cursor-pointer hover:bg-white/5 transition-colors text-left">
                <div>
                    <h3 className="font-semibold text-sm flex items-center gap-2">
                        <Megaphone className="w-4 h-4 text-primary" />
                        {gig.title}
                    </h3>
                    <div className="flex items-center gap-3 text-xs text-text-secondary mt-1">
                        <span>{gig.platform}</span>
                        <span>•</span>
                        <span>{formatINR(gig.budget)}</span>
                        <span>•</span>
                        <span>{gig.niche}</span>
                        <span>•</span>
                        <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{formatRelativeTime(gig.created_at)}</span>
                    </div>
                </div>
                <div className="flex items-center gap-3">
                    <span className={`text-xs px-2.5 py-1 rounded-full border font-medium ${STATUS_COLORS[gig.status]}`}>
                        {gig.status}
                    </span>
                    {expanded ? <ChevronUp className="w-4 h-4 text-text-muted" /> : <ChevronDown className="w-4 h-4 text-text-muted" />}
                </div>
            </button>

            {/* Content List */}
            {expanded && (
                <div className="border-t border-border-dark bg-white/[0.02]">
                    <ProposalsList gigId={gig.id} />
                    <ActiveContractsList gigId={gig.id} />
                </div>
            )}
        </div>
    );
}

function ActiveContractsList({ gigId }) {
    const { contracts, loading, approveMilestone, requestRevision } = useContracts();
    const activeContracts = contracts.filter(c => c.gig_id === gigId);

    if (loading) return null;
    if (activeContracts.length === 0) return null;

    return (
        <div className="p-4 space-y-4">
            <h4 className="text-[10px] font-bold uppercase tracking-widest text-text-muted px-1">Active Contracts</h4>
            {activeContracts.map(contract => (
                <ContractRow 
                    key={contract.id} 
                    contract={contract} 
                    onApprove={approveMilestone}
                    onRevision={requestRevision}
                />
            ))}
        </div>
    );
}

function ContractRow({ contract, onApprove, onRevision }) {
    const { user } = useAuth();
    const { canLeaveReview } = useReviews();
    const [showReviewModal, setShowReviewModal] = useState(false);
    const [reviewAllowed, setReviewAllowed] = useState(false);

    useEffect(() => {
        const checkReviewStatus = async () => {
            if (contract.status === 'Completed' && user) {
                const allowed = await canLeaveReview(contract.id, user.id);
                setReviewAllowed(allowed);
            }
        };
        checkReviewStatus();
    }, [contract, user]);

    return (
        <div className="p-4 rounded-2xl bg-white/5 border border-white/5 space-y-4">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-gradient-brand flex items-center justify-center overflow-hidden shrink-0">
                        {contract.profiles_influencer?.avatar_url ? (
                            <img src={contract.profiles_influencer.avatar_url} alt="" className="w-full h-full object-cover" />
                        ) : (
                            <span className="text-white text-xs font-semibold">{contract.profiles_influencer?.full_name?.charAt(0)}</span>
                        )}
                    </div>
                    <div>
                        <p className="text-sm font-bold text-white">{contract.profiles_influencer?.full_name}</p>
                        <p className="text-[10px] text-text-muted uppercase tracking-wider font-bold">{formatINR(contract.agreed_price)}</p>
                    </div>
                </div>

                <div className="flex items-center gap-2">
                    {reviewAllowed && (
                        <button
                            onClick={() => setShowReviewModal(true)}
                            className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-yellow-500/10 text-yellow-500 border border-yellow-500/20 text-[10px] font-bold uppercase tracking-wider hover:bg-yellow-500/20 transition-all"
                        >
                            <Star size={12} fill="currentColor" />
                            Leave a Review
                        </button>
                    )}
                    <span className={`text-[10px] px-2.5 py-1 rounded-full border font-bold uppercase tracking-wider ${STATUS_COLORS[contract.status]}`}>
                        {contract.status}
                    </span>
                </div>
            </div>

            {/* Milestones from Phase 6 */}
            {contract.contract_milestones?.length > 0 && (
                <div className="space-y-2 pl-2 border-l border-white/5">
                    {contract.contract_milestones
                        .sort((a, b) => a.order_index - b.order_index)
                        .map(ms => (
                            <div key={ms.id} className="flex items-center justify-between py-1">
                                <div className="flex items-center gap-2 text-xs">
                                    <div className={cn("w-1.5 h-1.5 rounded-full", 
                                        ms.status === 'Approved' ? "bg-emerald-500" : 
                                        ms.status === 'Submitted' ? "bg-blue-500" : "bg-zinc-600"
                                    )} />
                                    <span className="text-text-secondary">{ms.title}</span>
                                    <span className="text-[10px] text-text-muted italic">({ms.status})</span>
                                </div>
                                {ms.status === 'Submitted' && (
                                    <div className="flex gap-2">
                                        <button onClick={() => onRevision(ms.id, 'Please revise')} className="text-[10px] text-amber-500 hover:underline">Request Revision</button>
                                        <button onClick={() => onApprove(ms.id)} className="text-[10px] text-emerald-500 font-bold hover:underline">Approve</button>
                                    </div>
                                )}
                            </div>
                        ))}
                </div>
            )}

            <ReviewFormModal
                isOpen={showReviewModal}
                onClose={() => setShowReviewModal(false)}
                contractId={contract.id}
                targetId={contract.influencer_id}
                targetName={contract.profiles_influencer?.full_name}
                onSuccess={() => setReviewAllowed(false)}
            />
        </div>
    );
}

function ProposalsList({ gigId }) {
    const { proposals, loading, acceptProposal, rejectProposal } = useProposals(gigId);
    const [actionLoading, setActionLoading] = useState(null);

    async function handleAction(proposalId, action) {
        setActionLoading(proposalId);
        try {
            if (action === 'accept') await acceptProposal(proposalId);
            else await rejectProposal(proposalId);
        } catch (err) {
            console.error(err);
        }
        setActionLoading(null);
    }

    if (loading) {
        return <div className="p-5 pt-0 text-sm text-text-secondary">Loading proposals...</div>;
    }

    if (proposals.length === 0) {
        return (
            <div className="px-5 pb-5 text-sm text-text-muted flex items-center gap-2">
                <Users className="w-4 h-4" /> No applications yet
            </div>
        );
    }

    return (
        <div className="border-t border-border-dark">
            {proposals.map(p => (
                <div key={p.id} className="p-4 border-b border-border-dark last:border-b-0 flex items-start gap-3">
                    {/* Influencer avatar */}
                    <div className="w-9 h-9 rounded-full bg-gradient-brand flex items-center justify-center overflow-hidden shrink-0">
                        {p.profiles_influencer?.avatar_url ? (
                            <img src={p.profiles_influencer.avatar_url} alt="" className="w-full h-full object-cover" />
                        ) : (
                            <span className="text-white text-xs font-semibold">{p.profiles_influencer?.full_name?.charAt(0)}</span>
                        )}
                    </div>

                    <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-0.5">
                            <span className="font-medium text-sm">{p.profiles_influencer?.full_name}</span>
                            <span className="text-xs text-text-muted">• {p.profiles_influencer?.niche}</span>
                            <span className="text-xs text-text-muted">• {p.profiles_influencer?.city}</span>
                        </div>
                        <p className="text-xs text-text-secondary line-clamp-2 mb-1">{p.cover_letter}</p>
                        <div className="flex items-center gap-3 text-xs">
                            <span className="text-primary font-semibold">{formatINR(p.proposed_price)}</span>
                            <span className="text-text-muted">{formatRelativeTime(p.created_at)}</span>
                            <span className={`px-2 py-0.5 rounded-full border text-[10px] font-medium ${STATUS_COLORS[p.status]}`}>{p.status}</span>
                        </div>
                    </div>

                    {/* Accept / Reject buttons */}
                    {p.status === 'Pending' && (
                        <div className="flex gap-1.5 shrink-0">
                            <button onClick={() => handleAction(p.id, 'accept')} disabled={actionLoading === p.id}
                                className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 transition-colors cursor-pointer">
                                {actionLoading === p.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle className="w-4 h-4" />}
                            </button>
                            <button onClick={() => handleAction(p.id, 'reject')} disabled={actionLoading === p.id}
                                className="p-1.5 rounded-lg bg-red-500/10 text-red-400 hover:bg-red-500/20 transition-colors cursor-pointer">
                                <XCircle className="w-4 h-4" />
                            </button>
                        </div>
                    )}
                </div>
            ))}
        </div>
    );
}
