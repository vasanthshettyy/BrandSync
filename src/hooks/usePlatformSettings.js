import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { DEFAULT_PLATFORM_SETTINGS } from '../lib/constants';

/**
 * usePlatformSettings Hook
 * Phase 10 Scaffolding: Read-only access to global platform configuration.
 */
export function usePlatformSettings() {
    const [settings, setSettings] = useState({
        commissionRate: DEFAULT_PLATFORM_SETTINGS.commission_rate,
        paymentGateway: DEFAULT_PLATFORM_SETTINGS.payment_gateway,
        maxGigsPerBrandFree: DEFAULT_PLATFORM_SETTINGS.max_gigs_per_brand_free,
        enableEscrow: DEFAULT_PLATFORM_SETTINGS.enable_escrow,
        enableChat: DEFAULT_PLATFORM_SETTINGS.enable_chat
    });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        let mounted = true;

        async function fetchSettings() {
            try {
                const { data, error: queryError } = await supabase
                    .from('platform_settings')
                    .select('key, value');

                if (queryError) throw queryError;

                if (data && mounted) {
                    const mappedSettings = { ...DEFAULT_PLATFORM_SETTINGS };
                    data.forEach(item => {
                        mappedSettings[item.key] = item.value;
                    });

                    setSettings({
                        commissionRate: mappedSettings.commission_rate,
                        paymentGateway: mappedSettings.payment_gateway,
                        maxGigsPerBrandFree: mappedSettings.max_gigs_per_brand_free,
                        enableEscrow: mappedSettings.enable_escrow,
                        enableChat: mappedSettings.enable_chat
                    });
                }
            } catch (err) {
                console.error('Error loading platform settings:', err);
                if (mounted) setError(err);
            } finally {
                if (mounted) setLoading(false);
            }
        }

        fetchSettings();

        return () => {
            mounted = false;
        };
    }, []);

    return { settings, loading, error };
}
