import { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { supabase } from '../lib/supabase';

const AuthContext = createContext({});

export function AuthProvider({ children }) {
    const [user, setUser] = useState(null);
    const [profile, setProfile] = useState(null);
    const [role, setRole] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const { data: { subscription } } = supabase.auth.onAuthStateChange(
            (event, session) => {
                if (session?.user) {
                    setUser(session.user);
                    fetchUserRole(session.user.id);
                } else {
                    setUser(null);
                    setProfile(null);
                    setRole(null);
                    setLoading(false);
                }
            }
        );

        return () => {
            subscription.unsubscribe();
        };
    }, []);

    const fetchUserRole = useCallback(async (userId) => {
        setLoading(true);
        try {
            const { data, error } = await supabase
                .from('users')
                .select('role')
                .eq('user_id', userId)
                .maybeSingle();

            if (error) throw error;

            if (data) {
                setRole(data.role);
                const profileTable = data.role === 'brand' ? 'profiles_brand' : 'profiles_influencer';
                const { data: profileData, error: profileError } = await supabase
                    .from(profileTable)
                    .select('*')
                    .eq('user_id', userId)
                    .maybeSingle();

                if (profileError) throw profileError;
                setProfile(profileData);
            } else {
                setRole(null);
                setProfile(null);
            }
        } catch (err) {
            console.error('Error fetching user role:', err);
            setRole(null);
            setProfile(null);
        } finally {
            setLoading(false);
        }
    }, []);

    async function signOut() {
        await supabase.auth.signOut();
        setUser(null);
        setProfile(null);
        setRole(null);
    }

    const refreshProfile = useCallback(async () => {
        if (user?.id) await fetchUserRole(user.id);
    }, [user?.id, fetchUserRole]);

    return (
        <AuthContext.Provider value={{ user, profile, role, loading, signOut, refreshProfile }}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (!context) throw new Error('useAuth must be used within an AuthProvider');
    return context;
}
