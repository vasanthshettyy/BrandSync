import { useProposals } from '../../hooks/useProposals';
import { formatINR, formatRelativeTime } from '../../lib/utils';
import { STATUS_COLORS } from '../../lib/constants';
import PageWrapper from '../../components/layout/PageWrapper';
import { Send, Briefcase, Clock, XCircle, Loader2 } from 'lucide-react';
import { useState } from 'react';

export default function MyProposalsPage() {
    const { proposals, loading, withdrawProposal } = useProposals();

    return (
        <PageWrapper title="My Proposals" subtitle="Track your campaign applications">
            {loading ? (
                <div className="space-y-3">
                    {[...Array(3)].map((_, i) => (
                        <div key={i} className="glass-card p-5 animate-pulse">
                            <div className="h-4 bg-white/10 rounded w-1/2 mb-2" />
                            <div className="h-3 bg-white/10 rounded w-3/4" />
                        </div>
                    ))}
                </div>
            ) : proposals.length === 0 ? (
                <div className="glass-card p-12 text-center">
                    <Send className="w-12 h-12 text-text-muted mx-auto mb-3" />
                    <h3 className="font-semibold mb-1">No proposals yet</h3>
                    <p className="text-sm text-text-secondary">Browse the gig feed and apply to campaigns!</p>
                </div>
            ) : (
                <div className="space-y-3">
                    {proposals.map(proposal => (
                        <ProposalCard key={proposal.id} proposal={proposal} onWithdraw={withdrawProposal} />
                    ))}
                </div>
            )}
        </PageWrapper>
    );
}

function ProposalCard({ proposal, onWithdraw }) {
    const [withdrawing, setWithdrawing] = useState(false);

    async function handleWithdraw() {
        setWithdrawing(true);
        try {
            await onWithdraw(proposal.id);
        } catch (err) {
            console.error(err);
        }
        setWithdrawing(false);
    }

    return (
        <div className="glass-card p-5">
            <div className="flex items-start justify-between mb-2">
                <div>
                    <h3 className="font-semibold text-sm flex items-center gap-2">
                        <Briefcase className="w-4 h-4 text-primary" />
                        {proposal.gigs?.title || 'Campaign'}
                    </h3>
                    <div className="flex items-center gap-3 text-xs text-text-secondary mt-1">
                        <span>Budget: {formatINR(proposal.gigs?.budget)}</span>
                        <span>•</span>
                        <span>Your bid: {formatINR(proposal.quoted_price)}</span>
                        <span>•</span>
                        <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{formatRelativeTime(proposal.created_at)}</span>
                    </div>
                </div>
                <span className={`text-xs px-2.5 py-1 rounded-full border font-medium ${STATUS_COLORS[proposal.status]}`}>
                    {proposal.status}
                </span>
            </div>

            <p className="text-sm text-text-secondary mt-2 line-clamp-2">{proposal.cover_letter}</p>

            {proposal.status === 'Pending' && (
                <button onClick={handleWithdraw} disabled={withdrawing}
                    className="mt-3 flex items-center gap-1.5 text-xs text-red-400 hover:text-red-300 cursor-pointer">
                    {withdrawing ? <Loader2 className="w-3 h-3 animate-spin" /> : <XCircle className="w-3 h-3" />}
                    Withdraw
                </button>
            )}
        </div>
    );
}
