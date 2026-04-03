import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error(
        'Missing Supabase environment variables. Check .env or .env.local for VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY'
    );
}
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: true,
        flowType: 'pkce',
        storageKey: 'makerhq-session-v4',
        storage: window.sessionStorage,
    },
    db: {
        schema: 'public',
    },
});
