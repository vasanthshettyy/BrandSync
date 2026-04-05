import { supabase } from './supabase';

/**
 * Feature Flags & App Configuration Utility
 * Phase 10 Scaffolding: Provides a central interface for global feature toggles.
 */

// Local cache to avoid excessive DB hits
let configCache = {};
let lastFetched = 0;
const CACHE_TTL = 1000 * 60 * 5; // 5 minutes

export const fetchFeatureFlags = async (force = false) => {
    const now = Date.now();
    if (!force && Object.keys(configCache).length > 0 && (now - lastFetched < CACHE_TTL)) {
        return configCache;
    }

    try {
        // Fetch from new platform_settings table
        const { data: settings, error: settingsError } = await supabase
            .from('platform_settings')
            .select('key, value');

        // Optional: Fetch from legacy app_config for compatibility during transition
        const { data: appConfig, error: configError } = await supabase
            .from('app_config')
            .select('key, value');

        if (settingsError && configError) throw settingsError || configError;

        const newCache = {};
        
        // Process legacy config first
        if (appConfig) {
            appConfig.forEach(item => {
                if (item.value === 'true') newCache[item.key] = true;
                else if (item.value === 'false') newCache[item.key] = false;
                else newCache[item.key] = item.value;
            });
        }

        // Overwrite/Add with new platform_settings (proper JSONB)
        if (settings) {
            settings.forEach(item => {
                newCache[item.key] = item.value;
            });
        }

        configCache = newCache;
        lastFetched = now;
        return configCache;
    } catch (err) {
        console.error('Error fetching feature flags:', err);
        return configCache; 
    }
};

/**
 * Synchronous check for a feature flag.
 * Requires fetchFeatureFlags to have been called at least once (e.g., at app start).
 */
export const isFeatureEnabled = (key, defaultValue = false) => {
    return configCache[key] ?? defaultValue;
};
