import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, Reorder, AnimatePresence } from 'framer-motion';
import { 
    ChevronLeft, Loader2, MapPin, Users, Star, 
    Instagram, Youtube, Search, ArrowRight,
    CheckCircle, XCircle, MoreVertical, MessageSquare,
    ClipboardList, AlertCircle
} from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { useProposals } from '../../hooks/useProposals';
import PageWrapper from '../../components/layout/PageWrapper';
import ProposalActions from '../../components/proposals/ProposalActions';
import { formatFollowers, formatINR, cn } from '../../lib/utils';
import { PREMIUM_SPRING, STAGGER_CONTAINER, STAGGER_ITEM } from '../../lib/motion';

export default function ManageApplicationsPage() {
    const { gigId } = useParams();
    const navigate = useNavigate();
    const { proposals, loading, fetchProposals, acceptProposal, rejectProposal } = useProposals(gigId);
    
    const [gig, setGig] = useState(null);
    const [fetchingGig, setFetchingGig] = useState(true);
    const [actionLoading, setActionLoading] = useState(false);

    // Kanban Columns State (Local "In Talks" state)
    const [pending, setPending] = useState([]);
    const [inTalks, setInTalks] = useState([]);
    const [closed, setClosed] = useState([]);

    useEffect(() => {
        async function fetchGigDetails() {
            setFetchingGig(true);
            const { data, error } = await supabase
                .from('gigs')
                .select('*')
                .eq('id', gigId)
                .single();
            
            if (error) console.error('Error fetching gig:', error);
            else setGig(data);
            setFetchingGig(false);
        }
        fetchGigDetails();
    }, [gigId]);

    // Distribute proposals into columns
    useEffect(() => {
        if (proposals) {
            setPending(proposals.filter(p => p.status === 'Pending'));
            setClosed(proposals.filter(p => p.status === 'Accepted' || p.status === 'Rejected'));
            // Note: "In Talks" is purely local for MVP as per roadmap.md
        }
    }, [proposals]);

    const handleAccept = async (proposalId) => {
        setActionLoading(true);
        try {
            const contractId = await acceptProposal(proposalId);
            // On success, the SQL function auto-closes the gig and rejects others
            navigate(`/brand/contracts`); // Redirect to contracts (could also deep link to the new contract)
        } catch (err) {
            console.error('Acceptance failed:', err);
            alert('Failed to accept proposal. Please try again.');
        } finally {
            setActionLoading(false);
        }
    };

    const handleReject = async (proposalId) => {
        setActionLoading(true);
        try {
            await rejectProposal(proposalId);
        } catch (err) {
            console.error('Rejection failed:', err);
        } finally {
            setActionLoading(false);
        }
    };

    if (fetchingGig) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center gap-4">
                <Loader2 className="animate-spin text-primary w-10 h-10" />
                <p className="text-sm font-bold uppercase tracking-widest opacity-40">Loading Workspace...</p>
            </div>
        );
    }

    return (
        <PageWrapper title="Application Workspace" subtitle={gig?.title}>
            {/* Header Actions */}
            <div className="flex items-center justify-between mb-8">
                <button 
                    onClick={() => navigate(-1)}
                    className="flex items-center gap-2 text-xs font-bold text-text-muted hover:text-white transition-colors group uppercase tracking-widest"
                >
                    <ChevronLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                    Back to Dashboard
                </button>
                <div className="flex items-center gap-4">
                    <span className={cn(
                        "px-3 py-1 rounded-lg text-[10px] font-bold uppercase tracking-widest border",
                        gig?.status === 'Open' ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400" : "bg-white/5 border-white/10 text-text-muted"
                    )}>
                        Gig Status: {gig?.status}
                    </span>
                    <div className="h-4 w-px bg-white/10" />
                    <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-white">{proposals.length}</span>
                        <span className="text-[10px] font-bold text-text-muted uppercase tracking-widest">Applicants</span>
                    </div>
                </div>
            </div>

            {/* Kanban Board */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 h-full min-h-[600px] pb-12">
                {/* Column: Pending */}
                <KanbanColumn 
                    title="New Applications" 
                    count={pending.length} 
                    color="primary"
                    proposals={pending}
                    onAccept={handleAccept}
                    onReject={handleReject}
                    loading={actionLoading}
                />

                {/* Column: In Talks */}
                <KanbanColumn 
                    title="Shortlisted / In Talks" 
                    count={inTalks.length} 
                    color="amber"
                    proposals={inTalks}
                    isDraggable={true}
                    onAccept={handleAccept}
                    onReject={handleReject}
                    loading={actionLoading}
                />

                {/* Column: Decisions */}
                <KanbanColumn 
                    title="Closed / Decisions" 
                    count={closed.length} 
                    color="zinc"
                    proposals={closed}
                    onAccept={handleAccept}
                    onReject={handleReject}
                    loading={actionLoading}
                />
            </div>
        </PageWrapper>
    );
}

function KanbanColumn({ title, count, color, proposals, onAccept, onReject, loading, isDraggable = false }) {
    const colorMap = {
        primary: "bg-indigo-500",
        amber: "bg-amber-500",
        zinc: "bg-zinc-500"
    };

    return (
        <div className="flex flex-col h-full bg-white/[0.02] border border-white/5 rounded-[2rem] p-4">
            <div className="flex items-center justify-between mb-6 px-2">
                <div className="flex items-center gap-3">
                    <div className={cn("w-2 h-2 rounded-full shadow-[0_0_10px_rgba(0,0,0,0.5)]", colorMap[color])} />
                    <h3 className="text-sm font-bold uppercase tracking-widest text-text-primary">{title}</h3>
                </div>
                <span className="px-2 py-0.5 rounded-lg bg-white/5 text-[10px] font-bold text-text-muted border border-white/5">
                    {count}
                </span>
            </div>

            <div className="flex-1 space-y-4 overflow-y-auto pr-2 custom-scrollbar">
                {proposals.length === 0 ? (
                    <div className="h-full flex flex-col items-center justify-center opacity-10 py-20 border-2 border-dashed border-white/10 rounded-3xl">
                        <ClipboardList size={40} />
                        <p className="mt-4 text-[10px] font-bold uppercase tracking-widest">No Cards Here</p>
                    </div>
                ) : (
                    proposals.map((proposal) => (
                        <ProposalCard 
                            key={proposal.id} 
                            proposal={proposal} 
                            onAccept={onAccept}
                            onReject={onReject}
                            loading={loading}
                        />
                    ))
                )}
            </div>
        </div>
    );
}

function ProposalCard({ proposal, onAccept, onReject, loading }) {
    const influencer = proposal.profiles_influencer;

    return (
        <motion.div
            layout
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="glass-card p-5 group hover:border-white/20 transition-all border-white/5"
        >
            <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-xl bg-gradient-brand p-0.5">
                        <div className="w-full h-full rounded-[10px] bg-surface-900 overflow-hidden">
                            {influencer?.avatar_url ? (
                                <img src={influencer.avatar_url} className="w-full h-full object-cover" alt="" />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center text-white/20 font-bold">
                                    {influencer?.full_name?.charAt(0)}
                                </div>
                            )}
                        </div>
                    </div>
                    <div>
                        <h4 className="text-sm font-bold text-white flex items-center gap-1.5">
                            {influencer?.full_name}
                            {influencer?.is_verified && <CheckCircle size={12} className="text-primary" />}
                        </h4>
                        <p className="text-[10px] text-text-muted uppercase tracking-wider font-medium">{influencer?.niche} • {influencer?.city}</p>
                    </div>
                </div>
                <div className="flex items-center gap-1 px-2 py-1 rounded-lg bg-white/5 text-[10px] font-bold text-white border border-white/5">
                    <Star size={10} className="text-yellow-500" fill="currentColor" />
                    4.8
                </div>
            </div>

            <div className="space-y-3 mb-4">
                <div className="flex items-center justify-between text-[11px]">
                    <span className="text-text-muted">Quoted Price:</span>
                    <span className="font-bold text-white">{formatINR(proposal.quoted_price)}</span>
                </div>
                <div className="flex items-center justify-between text-[11px]">
                    <span className="text-text-muted">Followers:</span>
                    <span className="font-bold text-indigo-400">{formatFollowers(influencer?.followers_count)}</span>
                </div>
                <div className="p-3 rounded-xl bg-white/[0.02] border border-white/5">
                    <p className="text-[11px] text-text-secondary line-clamp-2 italic leading-relaxed">
                        "{proposal.cover_letter}"
                    </p>
                </div>
            </div>

            {proposal.status === 'Pending' && (
                <ProposalActions 
                    proposal={proposal} 
                    onAccept={onAccept} 
                    onReject={onReject} 
                    loading={loading} 
                />
            )}

            {proposal.status === 'Accepted' && (
                <div className="flex items-center justify-center gap-2 p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-bold">
                    <CheckCircle size={14} />
                    Hired
                </div>
            )}

            {proposal.status === 'Rejected' && (
                <div className="flex items-center justify-center gap-2 p-3 rounded-xl bg-white/5 border border-white/5 text-text-muted text-xs font-bold">
                    <XCircle size={14} />
                    Rejected
                </div>
            )}
        </motion.div>
    );
}
