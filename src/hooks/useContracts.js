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
                submission_link: submissionData.link || null,
                submission_notes: submissionData.notes || null,
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
            const currentMilestones = contract.contract_milestones;
            const allApproved = currentMilestones.every(m =>
                m.id === milestoneId ? true : m.status === 'Approved'
            );

            if (allApproved) {
                await supabase
                    .from('contracts')
                    .update({
                        status: 'Completed',
                        completed_at: new Date().toISOString()
                    })
                    .eq('id', contract.id);
            }
        }

        await fetchContracts();
        return data;
    }

    async function requestRevision(milestoneId, feedback) {
        const { data, error } = await supabase
            .from('contract_milestones')
            .update({
                status: 'Revision_Requested',
                brand_feedback: feedback,
                reviewed_at: new Date().toISOString(),
            })
            .eq('id', milestoneId)
            .select()
            .single();

        if (error) throw error;
        await fetchContracts();
        return data;
    }

    // --- Collaborative Workflow Management (Phase 6b) ---

    async function addMilestone(contractId, milestoneData) {
        const { data, error } = await supabase
            .from('contract_milestones')
            .insert({
                contract_id: contractId,
                milestone_name: milestoneData.name,
                sort_order: milestoneData.order,
                status: 'Pending',
            })
            .select()
            .single();

        if (error) throw error;
        await fetchContracts();
        return data;
    }

    async function updateMilestone(milestoneId, updates) {
        const { data, error } = await supabase
            .from('contract_milestones')
            .update({
                milestone_name: updates.name,
                sort_order: updates.order,
            })
            .eq('id', milestoneId)
            .select()
            .single();

        if (error) throw error;
        await fetchContracts();
        return data;
    }

    async function deleteMilestone(milestoneId) {
        const { error } = await supabase
            .from('contract_milestones')
            .delete()
            .eq('id', milestoneId);

        if (error) throw error;
        await fetchContracts();
    }

    return {
        contracts, loading, fetchContracts,
        submitMilestone, approveMilestone, requestRevision,
        addMilestone, updateMilestone, deleteMilestone,
    };
}
