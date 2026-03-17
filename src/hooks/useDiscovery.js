import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';

/**
 * useDiscovery — Dynamic influencer search with filters.
 * Builds Supabase queries based on active filters.
 */
export function useDiscovery() {
    const [influencers, setInfluencers] = useState([]);
    const [loading, setLoading] = useState(false);
    const [totalCount, setTotalCount] = useState(0);

    const [filters, setFilters] = useState({
        search: '',
        niche: '',
        city: '',
        language: '',
        platform: '',
        minFollowers: 0,
        maxFollowers: 0,
        minPrice: 0,
        maxPrice: 0,
        verifiedOnly: false,
        sortBy: 'followers_count',
        sortOrder: 'desc',
        page: 1,
        pageSize: 12,
    });

    const fetchInfluencers = useCallback(async () => {
        setLoading(true);

        let query = supabase
            .from('profiles_influencer')
            .select('*, users!inner(email, is_active)', { count: 'exact' })
            .eq('onboarding_complete', true)
            .eq('users.is_active', true);

        // Text search — match name, bio, or niche
        if (filters.search.trim()) {
            const term = `%${filters.search.trim()}%`;
            query = query.or(`full_name.ilike.${term},bio.ilike.${term},niche.ilike.${term}`);
        }

        // Filter by niche
        if (filters.niche) {
            query = query.eq('niche', filters.niche);
        }

        // Filter by city
        if (filters.city) {
            query = query.eq('city', filters.city);
        }

        // Filter by language
        if (filters.language) {
            query = query.eq('language', filters.language);
        }

        // Filter by platform
        if (filters.platform) {
            query = query.eq('platform_primary', filters.platform.toLowerCase());
        }

        // Filter by follower range
        if (filters.minFollowers > 0) {
            query = query.gte('followers_count', filters.minFollowers);
        }
        if (filters.maxFollowers > 0) {
            query = query.lte('followers_count', filters.maxFollowers);
        }

        // Filter by price range
        if (filters.minPrice > 0) {
            query = query.gte('price_per_post', filters.minPrice);
        }
        if (filters.maxPrice > 0) {
            query = query.lte('price_per_post', filters.maxPrice);
        }

        // Filter by verification
        if (filters.verifiedOnly) {
            query = query.eq('is_verified', true);
        }

        // Sorting
        query = query.order(filters.sortBy, { ascending: filters.sortOrder === 'asc' });

        // Pagination
        const from = (filters.page - 1) * filters.pageSize;
        const to = from + filters.pageSize - 1;
        query = query.range(from, to);

        const { data, count, error } = await query;

        if (error) {
            console.error('Discovery fetch error:', error);
        } else {
            setInfluencers(data || []);
            setTotalCount(count || 0);
        }

        setLoading(false);
    }, [filters]);

    useEffect(() => {
        fetchInfluencers();
    }, [fetchInfluencers]);

    function updateFilter(key, value) {
        setFilters(prev => ({ ...prev, [key]: value, page: 1 }));
    }

    function resetFilters() {
        setFilters({
            search: '', niche: '', city: '', language: '', platform: '',
            minFollowers: 0, maxFollowers: 0, minPrice: 0, maxPrice: 0,
            verifiedOnly: false, sortBy: 'followers_count', sortOrder: 'desc',
            page: 1, pageSize: 12,
        });
    }

    function setPage(page) {
        setFilters(prev => ({ ...prev, page }));
    }

    const totalPages = Math.ceil(totalCount / filters.pageSize);

    return {
        influencers, loading, totalCount, totalPages,
        filters, updateFilter, resetFilters, setPage, refetch: fetchInfluencers,
    };
}
