import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';

/**
 * useProposals — Proposal submission and management.
 */
export function useProposals(gigId = null) {
    const { user, role } = useAuth();
    const [proposals, setProposals] = useState([]);
    const [loading, setLoading] = useState(false);

    async function fetchProposals() {
        setLoading(true);
        let query = supabase
            .from('proposals')
            .select('*, profiles_influencer(full_name, avatar_url, niche, followers_count, city), gigs(title, budget, platform)')
            .order('created_at', { ascending: false });

        if (gigId) {
            // Brand viewing applications for a specific gig
            query = query.eq('gig_id', gigId);
        } else if (role === 'influencer') {
            // Influencer viewing their own proposals
            query = query.eq('influencer_id', user.id);
        }

        const { data, error } = await query;
        if (error) console.error('Fetch proposals error:', error);
        else setProposals(data || []);
        setLoading(false);
    }

    useEffect(() => {
        if (user) fetchProposals();
    }, [user, gigId]);

    async function submitProposal(gigId, proposalData) {
        const { data, error } = await supabase
            .from('proposals')
            .insert({
                gig_id: gigId,
                influencer_id: user.id,
                cover_letter: proposalData.coverLetter,
                quoted_price: parseFloat(proposalData.proposedPrice),
                status: 'Pending',
            })
            .select()
            .single();

        if (error) throw error;
        setProposals(prev => [data, ...prev]);
        return data;
    }

    async function acceptProposal(proposalId) {
        // Uses the atomic accept_proposal PostgreSQL function
        const { data, error } = await supabase.rpc('accept_proposal', {
            p_proposal_id: proposalId,
            p_brand_id: user.id,
        });

        if (error) throw error;
        await fetchProposals(); // Refresh list
        return data;
    }

    async function rejectProposal(proposalId) {
        const { data, error } = await supabase
            .from('proposals')
            .update({ status: 'Rejected' })
            .eq('id', proposalId)
            .select()
            .single();

        if (error) throw error;
        setProposals(prev => prev.map(p => p.id === proposalId ? data : p));
        return data;
    }

    async function withdrawProposal(proposalId) {
        const { data, error } = await supabase
            .from('proposals')
            .update({ status: 'Withdrawn' })
            .eq('id', proposalId)
            .eq('influencer_id', user.id)
            .select()
            .single();

        if (error) throw error;
        setProposals(prev => prev.map(p => p.id === proposalId ? data : p));
        return data;
    }

    return { proposals, loading, fetchProposals, submitProposal, acceptProposal, rejectProposal, withdrawProposal };
}
