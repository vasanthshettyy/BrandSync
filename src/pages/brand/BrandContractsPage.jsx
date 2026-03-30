import { useState } from 'react';
import { motion } from 'framer-motion';
import { useGigs } from '../../hooks/useGigs';
import { useProposals } from '../../hooks/useProposals';
import { useContracts } from '../../hooks/useContracts';
import { formatINR, formatRelativeTime } from '../../lib/utils';
import { STATUS_COLORS } from '../../lib/constants';
import PageWrapper from '../../components/layout/PageWrapper';
import ContractCard from '../../components/contracts/ContractCard';
import InfluencerDetailModal from '../../components/discovery/InfluencerDetailModal';
import {
    Megaphone, Users, Clock, CheckCircle, XCircle, Loader2, ChevronDown, ChevronUp
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
    const {
        contracts,
        loading,
        approveMilestone,
        requestRevision,
        addMilestone,
        updateMilestone,
        deleteMilestone
    } = useContracts();
    const activeContracts = contracts.filter(c => c.gig_id === gigId);

    if (loading) return null;
    if (activeContracts.length === 0) return null;

    return (
        <div className="p-4 space-y-4">
            <h4 className="text-[10px] font-bold uppercase tracking-widest text-text-muted px-1">Active Contracts</h4>
            {activeContracts.map(contract => (
                <ContractCard
                    key={contract.id}
                    contract={contract}
                    onApprove={approveMilestone}
                    onRevision={requestRevision}
                    onAddMilestone={addMilestone}
                    onUpdateMilestone={updateMilestone}
                    onDeleteMilestone={deleteMilestone}
                    isBrand={true}
                />
            ))}
        </div>
    );
}

function ProposalsList({ gigId }) {
    const { proposals, loading, acceptProposal, rejectProposal } = useProposals(gigId);
    const [actionLoading, setActionLoading] = useState(null);
    const [selectedInfluencer, setSelectedInfluencer] = useState(null);

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
                    <div
                        onClick={() => setSelectedInfluencer(p.profiles_influencer)}
                        className="flex items-start gap-3 flex-1 min-w-0 cursor-pointer hover:bg-white/5 rounded-xl transition-colors p-2 -ml-2"
                    >
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
                                <span className="text-primary font-semibold">{formatINR(p.quoted_price)}</span>
                                <span className="text-text-muted">{formatRelativeTime(p.created_at)}</span>
                                <span className={`px-2 py-0.5 rounded-full border text-[10px] font-medium ${STATUS_COLORS[p.status]}`}>{p.status}</span>
                            </div>
                        </div>
                    </div>

                    {/* Accept / Reject buttons */}
                    {p.status === 'Pending' && (
                        <div className="flex flex-col sm:flex-row gap-2.5 shrink-0">
                            <motion.button
                                onClick={() => handleAction(p.id, 'accept')}
                                disabled={actionLoading === p.id}
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.97 }}
                                transition={{ type: "spring", stiffness: 400, damping: 25 }}
                                className="h-10 px-5 rounded-xl border border-emerald-500/30 bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 hover:border-emerald-500/50 shadow-sm transition-colors duration-200 cursor-pointer font-medium text-sm flex items-center gap-2 disabled:opacity-50"
                            >
                                {actionLoading === p.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle className="w-4 h-4" />}
                                Accept
                            </motion.button>
                            <motion.button
                                onClick={() => handleAction(p.id, 'reject')}
                                disabled={actionLoading === p.id}
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.97 }}
                                transition={{ type: "spring", stiffness: 400, damping: 25 }}
                                className="h-10 px-5 rounded-xl border border-rose-500/30 bg-rose-500/10 text-rose-400 hover:bg-rose-500/20 hover:border-rose-500/50 shadow-sm transition-colors duration-200 cursor-pointer font-medium text-sm flex items-center gap-2 disabled:opacity-50"
                            >
                                <XCircle className="w-4 h-4" />
                                Decline
                            </motion.button>
                        </div>
                    )}
                </div>
            ))}
            {selectedInfluencer && (
                <InfluencerDetailModal
                    influencer={selectedInfluencer}
                    isOpen={!!selectedInfluencer}
                    onClose={() => setSelectedInfluencer(null)}
                />
            )}
        </div>
    );
}
