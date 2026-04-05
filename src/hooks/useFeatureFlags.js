import { useState, useEffect } from 'react';
import { fetchFeatureFlags } from '../lib/feature-flags';

/**
 * Hook for using feature flags in components.
 * Phase 10 Scaffolding: Allows components to conditionally render based on DB flags.
 */
export const useFeatureFlags = () => {
    const [flags, setFlags] = useState({});
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        let mounted = true;

        const loadFlags = async () => {
            try {
                const data = await fetchFeatureFlags();
                if (mounted) {
                    setFlags(data);
                    setLoading(false);
                }
            } catch (err) {
                if (mounted) {
                    setError(err);
                    setLoading(false);
                }
            }
        };

        loadFlags();

        return () => {
            mounted = false;
        };
    }, []);

    const isEnabled = (key, defaultValue = false) => {
        return flags[key] ?? defaultValue;
    };

    return { flags, isEnabled, loading, error };
};
