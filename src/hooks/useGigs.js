import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';

/**
 * useGigs — Gig CRUD operations for brands.
 */
export function useGigs() {
    const { user, role } = useAuth();
    const [gigs, setGigs] = useState([]);
    const [loading, setLoading] = useState(false);

    async function fetchGigs() {
        setLoading(true);
        let query = supabase
            .from('gigs')
            .select('*, profiles_brand!inner(company_name, logo_url)')
            .order('created_at', { ascending: false });

        // Brands see their own gigs, influencers see all open gigs
        if (role === 'brand') {
            query = query.eq('brand_id', user.id);
        } else {
            query = query.eq('status', 'Open');
        }

        const { data, error } = await query;
        if (error) console.error('Fetch gigs error:', error);
        else setGigs(data || []);
        setLoading(false);
    }

    useEffect(() => {
        if (user) fetchGigs();
    }, [user, role]);

    async function createGig(gigData) {
        const { data, error } = await supabase
            .from('gigs')
            .insert({
                brand_id: user.id,
                title: gigData.title,
                description: gigData.description,
                platform: gigData.platform,
                budget: parseFloat(gigData.budget),
                niche: gigData.niche,
                deadline: gigData.deadline || null,
                status: 'Open',
            })
            .select()
            .single();

        if (error) throw error;
        setGigs(prev => [data, ...prev]);
        return data;
    }

    async function updateGig(gigId, updates) {
        const { data, error } = await supabase
            .from('gigs')
            .update(updates)
            .eq('id', gigId)
            .eq('brand_id', user.id)
            .select()
            .single();

        if (error) throw error;
        setGigs(prev => prev.map(g => g.id === gigId ? data : g));
        return data;
    }

    async function closeGig(gigId) {
        return updateGig(gigId, { status: 'Closed' });
    }

    return { gigs, loading, fetchGigs, createGig, updateGig, closeGig };
}
