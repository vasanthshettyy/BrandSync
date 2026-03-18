import { useContracts } from '../../hooks/useContracts';
import { useReviews } from '../../hooks/useReviews';
import { useAuth } from '../../context/AuthContext';
import { formatINR, formatRelativeTime } from '../../lib/utils';
import { STATUS_COLORS } from '../../lib/constants';
import PageWrapper from '../../components/layout/PageWrapper';
import ReviewFormModal from '../../components/reviews/ReviewFormModal';
import { FileText, Clock, CheckCircle, AlertCircle, Loader2, Send, Star } from 'lucide-react';
import { useState, useEffect } from 'react';

export default function InfluencerContractsPage() {
    const { contracts, loading, submitMilestone } = useContracts();

    return (
        <PageWrapper title="My Contracts" subtitle="Track active campaigns and milestones">
            {loading ? (
                <div className="space-y-4">
                    {[...Array(2)].map((_, i) => (
                        <div key={i} className="glass-card p-5 animate-pulse">
                            <div className="h-5 bg-white/10 rounded w-1/2 mb-3" />
                            <div className="h-3 bg-white/10 rounded w-3/4" />
                        </div>
                    ))}
                </div>
            ) : contracts.length === 0 ? (
                <div className="glass-card p-12 text-center">
                    <FileText className="w-12 h-12 text-text-muted mx-auto mb-3" />
                    <h3 className="font-semibold mb-1">No contracts yet</h3>
                    <p className="text-sm text-text-secondary">When a brand accepts your proposal, your contract will appear here</p>
                </div>
            ) : (
                <div className="space-y-4">
                    {contracts.map(contract => (
                        <ContractCard key={contract.id} contract={contract} onSubmitMilestone={submitMilestone} />
                    ))}
                </div>
            )}
        </PageWrapper>
    );
}

function ContractCard({ contract, onSubmitMilestone }) {
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
        <div className="glass-card p-5">
            {/* Header */}
            <div className="flex items-start justify-between mb-4">
                <div>
                    <h3 className="font-semibold text-sm flex items-center gap-2">
                        <FileText className="w-4 h-4 text-primary" />
                        {contract.gigs?.title}
                    </h3>
                    <div className="flex items-center gap-3 text-xs text-text-secondary mt-1">
                        <span>with {contract.profiles_brand?.company_name}</span>
                        <span>•</span>
                        <span className="text-primary font-semibold">{formatINR(contract.agreed_price)}</span>
                        <span>•</span>
                        <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{formatRelativeTime(contract.created_at)}</span>
                    </div>
                </div>
                <div className="flex items-center gap-3">
                    {reviewAllowed && (
                        <button
                            onClick={() => setShowReviewModal(true)}
                            className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-yellow-500/10 text-yellow-500 border border-yellow-500/20 text-[10px] font-bold uppercase tracking-wider hover:bg-yellow-500/20 transition-all"
                        >
                            <Star size={12} fill="currentColor" />
                            Leave a Review
                        </button>
                    )}
                    <span className={`text-xs px-2.5 py-1 rounded-full border font-medium ${STATUS_COLORS[contract.status]}`}>
                        {contract.status}
                    </span>
                </div>
            </div>

            {/* Milestones */}
            {contract.contract_milestones?.length > 0 && (
                <div className="space-y-2">
                    <h4 className="text-xs font-semibold text-text-secondary uppercase tracking-wider">Milestones</h4>
                    {contract.contract_milestones
                        .sort((a, b) => a.order_index - b.order_index)
                        .map(ms => (
                            <MilestoneRow key={ms.id} milestone={ms} onSubmit={onSubmitMilestone} />
                        ))}
                </div>
            )}

            <ReviewFormModal
                isOpen={showReviewModal}
                onClose={() => setShowReviewModal(false)}
                contractId={contract.id}
                targetId={contract.brand_id}
                targetName={contract.profiles_brand?.company_name}
                onSuccess={() => setReviewAllowed(false)}
            />
        </div>
    );
}

function MilestoneRow({ milestone, onSubmit }) {
    const [submitting, setSubmitting] = useState(false);
    const [showForm, setShowForm] = useState(false);
    const [url, setUrl] = useState('');
    const [note, setNote] = useState('');

    const statusIcon = {
        Pending: <Clock className="w-4 h-4 text-text-muted" />,
        Submitted: <Send className="w-4 h-4 text-blue-400" />,
        Approved: <CheckCircle className="w-4 h-4 text-emerald-400" />,
        Revision_Requested: <AlertCircle className="w-4 h-4 text-amber-400" />,
    };

    async function handleSubmit(e) {
        e.preventDefault();
        setSubmitting(true);
        try {
            await onSubmit(milestone.id, { url, note });
            setShowForm(false);
        } catch (err) {
            console.error(err);
        }
        setSubmitting(false);
    }

    return (
        <div className="p-3 rounded-lg bg-white/5 border border-border-dark">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                    {statusIcon[milestone.status] || statusIcon.Pending}
                    <span className="text-sm font-medium">{milestone.title}</span>
                    <span className={`text-[10px] px-2 py-0.5 rounded-full border font-medium ${STATUS_COLORS[milestone.status] || ''}`}>
                        {milestone.status?.replace('_', ' ')}
                    </span>
                </div>

                {(milestone.status === 'Pending' || milestone.status === 'Revision_Requested') && (
                    <button onClick={() => setShowForm(!showForm)}
                        className="text-xs text-primary hover:underline cursor-pointer">
                        Submit Work
                    </button>
                )}
            </div>

            {milestone.revision_note && milestone.status === 'Revision_Requested' && (
                <p className="text-xs text-amber-400 mt-2 flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" /> Revision: {milestone.revision_note}
                </p>
            )}

            {showForm && (
                <form onSubmit={handleSubmit} className="mt-3 space-y-2 animate-fade-in">
                    <input type="url" value={url} onChange={e => setUrl(e.target.value)}
                        placeholder="Link to your deliverable (Google Drive, etc.)"
                        className="w-full px-3 py-2 bg-white/5 border border-border-dark rounded-lg text-xs outline-none focus:border-primary" />
                    <textarea value={note} onChange={e => setNote(e.target.value)}
                        placeholder="Add a note (optional)" rows={2}
                        className="w-full px-3 py-2 bg-white/5 border border-border-dark rounded-lg text-xs outline-none focus:border-primary resize-none" />
                    <button type="submit" disabled={submitting || !url.trim()}
                        className="px-4 py-1.5 bg-gradient-brand text-white rounded-lg text-xs font-medium hover:opacity-90 disabled:opacity-50 flex items-center gap-1.5 cursor-pointer">
                        {submitting ? <Loader2 className="w-3 h-3 animate-spin" /> : <Send className="w-3 h-3" />}
                        {submitting ? 'Submitting...' : 'Submit Deliverable'}
                    </button>
                </form>
            )}
        </div>
    );
}
