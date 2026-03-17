import { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';

const AuthContext = createContext({});

export function AuthProvider({ children }) {
    const [user, setUser] = useState(null);
    const [profile, setProfile] = useState(null);
    const [role, setRole] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        supabase.auth.getSession().then(({ data: { session } }) => {
            if (session?.user) {
                setUser(session.user);
                fetchUserRole(session.user.id);
            } else {
                setLoading(false);
            }
        });

        const { data: { subscription } } = supabase.auth.onAuthStateChange(
            async (_event, session) => {
                if (session?.user) {
                    setUser(session.user);
                    await fetchUserRole(session.user.id);
                } else {
                    setUser(null);
                    setProfile(null);
                    setRole(null);
                }
                setLoading(false);
            }
        );

        return () => subscription.unsubscribe();
    }, []);

    async function fetchUserRole(userId) {
        try {
            const { data } = await supabase
                .from('users')
                .select('role')
                .eq('user_id', userId)
                .single();

            if (data) {
                setRole(data.role);
                const profileTable = data.role === 'brand' ? 'profiles_brand' : 'profiles_influencer';
                const { data: profileData } = await supabase
                    .from(profileTable)
                    .select('*')
                    .eq('user_id', userId)
                    .single();
                setProfile(profileData);
            }
        } catch (err) {
            console.error('Error fetching user role:', err);
        } finally {
            setLoading(false);
        }
    }

    async function signOut() {
        await supabase.auth.signOut();
        setUser(null);
        setProfile(null);
        setRole(null);
    }

    async function refreshProfile() {
        if (user?.id) await fetchUserRole(user.id);
    }

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
