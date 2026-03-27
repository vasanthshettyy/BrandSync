import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Star, FileText, Clock, MessageSquare } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useReviews } from '../../hooks/useReviews';
import { formatINR, formatRelativeTime } from '../../lib/utils';
import { STATUS_COLORS } from '../../lib/constants';
import ReviewFormModal from '../reviews/ReviewFormModal';
import MilestoneWorkflow from './MilestoneWorkflow';

export default function ContractCard({ 
    contract, 
    onApprove, 
    onRevision, 
    onSubmitMilestone, 
    onAddMilestone,
    onUpdateMilestone,
    onDeleteMilestone,
    isBrand 
}) {
    const { user } = useAuth();
    const navigate = useNavigate();
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

    // Role-specific data
    const partnerName = isBrand 
        ? contract.profiles_influencer?.full_name 
        : contract.profiles_brand?.company_name;
    
    const partnerAvatar = isBrand
        ? contract.profiles_influencer?.avatar_url
        : contract.profiles_brand?.logo_url;

    const targetId = isBrand ? contract.influencer_id : contract.brand_id;

    return (
        <div className="glass-card p-5 mb-4">
            <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-gradient-brand flex items-center justify-center overflow-hidden shrink-0 shadow-lg shadow-indigo-500/20">
                        {partnerAvatar ? (
                            <img src={partnerAvatar} alt="" className="w-full h-full object-cover" />
                        ) : (
                            <span className="text-white text-sm font-bold">{partnerName?.charAt(0)}</span>
                        )}
                    </div>
                    <div>
                        <h3 className="font-bold text-sm text-white flex items-center gap-2">
                            <FileText size={14} className="text-primary" />
                            {isBrand ? partnerName : contract.gigs?.title}
                        </h3>
                        <div className="flex items-center gap-3 text-[10px] text-text-muted mt-0.5 uppercase tracking-widest font-bold">
                            {isBrand ? (
                                <span className="text-primary">{formatINR(contract.agreed_price)}</span>
                            ) : (
                                <span>with {partnerName}</span>
                            )}
                            <span>•</span>
                            <span className="flex items-center gap-1"><Clock size={10} />{formatRelativeTime(contract.created_at)}</span>
                        </div>
                    </div>
                </div>

                <div className="flex items-center gap-2">
                    {contract.status !== 'Pending' && (
                        <button
                            onClick={() => navigate(isBrand ? '/brand/messages' : '/influencer/messages')}
                            className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 text-[10px] font-bold uppercase tracking-wider hover:bg-indigo-500/20 transition-all cursor-pointer"
                        >
                            <MessageSquare size={12} />
                            Message
                        </button>
                    )}
                    {reviewAllowed && (
                        <button
                            onClick={() => setShowReviewModal(true)}
                            className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-yellow-500/10 text-yellow-500 border border-yellow-500/20 text-[10px] font-bold uppercase tracking-wider hover:bg-yellow-500/20 transition-all cursor-pointer"
                        >
                            <Star size={12} fill="currentColor" />
                            Review
                        </button>
                    )}
                    <span className={`text-[10px] px-2.5 py-1 rounded-full border font-bold uppercase tracking-wider ${STATUS_COLORS[contract.status]}`}>
                        {contract.status}
                    </span>
                </div>
            </div>

            {/* Milestones */}
            {contract.contract_milestones?.length >= 0 && (
                <div className="mt-6 border-t border-white/5 pt-6">
                    <MilestoneWorkflow 
                        contractId={contract.id}
                        milestones={contract.contract_milestones || []} 
                        isBrand={isBrand}
                        onApprove={onApprove}
                        onRevision={onRevision}
                        onSubmit={onSubmitMilestone}
                        onAddMilestone={onAddMilestone}
                        onUpdateMilestone={onUpdateMilestone}
                        onDeleteMilestone={onDeleteMilestone}
                    />
                </div>
            )}

            <ReviewFormModal
                isOpen={showReviewModal}
                onClose={() => setShowReviewModal(false)}
                contractId={contract.id}
                targetId={targetId}
                targetName={partnerName}
                onSuccess={() => setReviewAllowed(false)}
            />
        </div>
    );
}
