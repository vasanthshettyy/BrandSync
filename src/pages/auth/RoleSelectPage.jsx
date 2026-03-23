import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../context/AuthContext';
import { Building2, Users, Loader2 } from 'lucide-react';

export default function RoleSelectPage() {
    const navigate = useNavigate();
    const { user, role, refreshProfile } = useAuth();
    console.log('RoleSelectPage rendering:', { userId: user?.id, role });
    const [selectedRole, setSelectedRole] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        // Force refresh if role is missing but user is logged in
        if (user && !role) {
            refreshProfile();
        }

        // If user already has a role, redirect them
        if (role === 'brand') navigate('/brand/dashboard', { replace: true });
        else if (role === 'influencer') navigate('/influencer/dashboard', { replace: true });
        else if (role === 'admin') navigate('/admin/dashboard', { replace: true });
    }, [role, navigate, user, refreshProfile]);

    async function handleContinue() {
        console.log('Continue clicked. Role:', selectedRole, 'User:', user.id);
        if (!selectedRole || !user) return;
        setLoading(true);
        setError('');

        try {
            // Insert into users table
            console.log('Inserting into users table...');
            const { error: userError } = await supabase.from('users').insert({
                user_id: user.id,
                email: user.email,
                role: selectedRole,
            });

            if (userError) {
                console.error('Users insert error:', userError);
                throw userError;
            }

            // Create empty profile
            console.log('Creating profile...');
            const profileTable = selectedRole === 'brand' ? 'profiles_brand' : 'profiles_influencer';
            const { error: profileError } = await supabase.from(profileTable).insert({
                user_id: user.id,
                onboarding_complete: false,
            });

            if (profileError) {
                console.error('Profile insert error:', profileError);
                throw profileError;
            }

            console.log('Success! Redirecting to onboarding...');
            navigate('/onboarding');
        } catch (err) {
            console.error('Role select catch block:', err);
            setError(err.message || 'Something went wrong');
        } finally {
            setLoading(false);
        }
    }

    const roles = [
        {
            id: 'brand',
            icon: Building2,
            title: 'I\'m a Brand',
            description: 'Post campaigns, find influencers, and manage collaborations.',
        },
        {
            id: 'influencer',
            icon: Users,
            title: 'I\'m an Influencer',
            description: 'Discover brand deals, submit proposals, and grow your career.',
        },
    ];

    return (
        <div className="min-h-screen flex items-center justify-center p-4 bg-slate-900"
        >
            <div className="fixed top-0 left-0 bg-red-500 text-white p-2 z-[9999]">SELECT ROLE PAGE IS RENDERING</div>
            <div className="glass-card w-full max-w-lg p-8 border-2 border-yellow-500">
                <div className="bg-blue-500 p-2 text-white mb-4">CONTENT CONTAINER START</div>
                <div className="flex items-center gap-3 mb-8 justify-center">
                    <div className="w-10 h-10 rounded-xl bg-gradient-brand flex items-center justify-center">
                        <span className="text-white font-bold text-lg font-display">B</span>
                    </div>
                    <span className="font-display font-bold text-2xl text-gradient">BrandSync</span>
                </div>

                <h2 className="text-xl font-semibold text-center mb-1">How will you use BrandSync?</h2>
                <p className="text-text-secondary text-sm text-center mb-8">Select your role to get started</p>

                {error && (
                    <div className="mb-4 p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
                        {error}
                    </div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
                    {roles.map(({ id, title, description }) => (
                        <button
                            key={id}
                            onClick={() => setSelectedRole(id)}
                            className={`p-5 rounded-xl border-4 text-left transition-all cursor-pointer ${selectedRole === id
                                    ? 'border-green-500 bg-primary/10'
                                    : 'border-white hover:border-primary/30 hover:bg-white/5'
                                }`}
                        >
                            <h3 className="font-bold text-xl text-white mb-1">BUTTON: {title}</h3>
                            <p className="text-sm text-yellow-400 leading-relaxed">{description}</p>
                        </button>
                    ))}
                </div>

                <button
                    onClick={handleContinue}
                    disabled={!selectedRole || loading}
                    className="w-full py-2.5 bg-gradient-brand text-white rounded-lg font-medium text-sm hover:opacity-90 transition-opacity disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer"
                >
                    {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                    {loading ? 'Setting up...' : 'Continue'}
                </button>
            </div>
        </div>
    );
}
