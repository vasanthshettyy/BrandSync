import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';

/**
 * useContracts — Contract and milestone management.
 */
export function useContracts() {
    const { user, role } = useAuth();
    const [contracts, setContracts] = useState([]);
    const [loading, setLoading] = useState(false);

    async function fetchContracts() {
        setLoading(true);
        let query = supabase
            .from('contracts')
            .select(`
        *,
        gigs(title, platform),
        profiles_brand(company_name, logo_url),
        profiles_influencer(full_name, avatar_url),
        contract_milestones(*)
      `)
            .order('created_at', { ascending: false });

        if (role === 'brand') {
            query = query.eq('brand_id', user.id);
        } else if (role === 'influencer') {
            query = query.eq('influencer_id', user.id);
        }

        const { data, error } = await query;
        if (error) console.error('Fetch contracts error:', error);
        else setContracts(data || []);
        setLoading(false);
    }

    useEffect(() => {
        if (user) fetchContracts();
    }, [user, role]);

    // Milestone operations (influencer submits, brand reviews)
    async function submitMilestone(milestoneId, submissionData) {
        const { data, error } = await supabase
            .from('contract_milestones')
            .update({
                status: 'Submitted',
                submission_url: submissionData.url || null,
                submission_note: submissionData.note || null,
                submitted_at: new Date().toISOString(),
            })
            .eq('id', milestoneId)
            .select()
            .single();

        if (error) throw error;
        await fetchContracts();
        return data;
    }

    async function approveMilestone(milestoneId) {
        const { data, error } = await supabase
            .from('contract_milestones')
            .update({
                status: 'Approved',
                reviewed_at: new Date().toISOString(),
            })
            .eq('id', milestoneId)
            .select()
            .single();

        if (error) throw error;

        // Check if all milestones are approved → complete contract
        const contract = contracts.find(c =>
            c.contract_milestones?.some(m => m.id === milestoneId)
        );
        if (contract) {
            const allApproved = contract.contract_milestones.every(m =>
                m.id === milestoneId ? true : m.status === 'Approved'
            );
            if (allApproved) {
                await supabase
                    .from('contracts')
                    .update({ status: 'Completed' })
                    .eq('id', contract.id);
            }
        }

        await fetchContracts();
        return data;
    }

    async function requestRevision(milestoneId, note) {
        const { data, error } = await supabase
            .from('contract_milestones')
            .update({
                status: 'Revision_Requested',
                revision_note: note,
                reviewed_at: new Date().toISOString(),
            })
            .eq('id', milestoneId)
            .select()
            .single();

        if (error) throw error;
        await fetchContracts();
        return data;
    }

    return {
        contracts, loading, fetchContracts,
        submitMilestone, approveMilestone, requestRevision,
    };
}
