import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../context/AuthContext';
import { Building2, Users, Loader2 } from 'lucide-react';
import makerhqMark from '../../assets/makerhq-mark.png';

export default function RoleSelectPage() {
    const navigate = useNavigate();
    const { user, role, refreshProfile } = useAuth();
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
        if (!selectedRole || !user) return;
        setLoading(true);
        setError('');

        try {
            // Insert into users table
            const { error: userError } = await supabase.from('users').insert({
                user_id: user.id,
                email: user.email,
                role: selectedRole,
            });

            if (userError) {
                throw userError;
            }

            // Create empty profile
            const profileTable = selectedRole === 'brand' ? 'profiles_brand' : 'profiles_influencer';
            const { error: profileError } = await supabase.from(profileTable).insert({
                user_id: user.id,
                onboarding_complete: false,
            });

            if (profileError) {
                throw profileError;
            }

            navigate('/onboarding');
        } catch (err) {
            console.error('Role select error:', err);
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
        <div className="min-h-screen flex items-center justify-center p-4 bg-slate-900">
            <div className="glass-card w-full max-w-lg p-8">
                <div className="flex items-center gap-3 mb-8 justify-center flex-col">
                    <div className="flex items-center gap-3">
                        <img src={makerhqMark} alt="MakerHQ" className="w-10 h-10 object-contain" />
                        <span className="font-display font-bold text-2xl text-gradient">MakerHQ</span>
                    </div>
                    <p className="text-text-secondary text-[10px] uppercase tracking-widest font-bold opacity-60 text-center">
                        Where the creator economy gets to work
                    </p>
                </div>

                <h2 className="text-xl font-semibold text-center mb-1">How will you use MakerHQ?</h2>
                <p className="text-text-secondary text-sm text-center mb-8">Select your role to get started</p>

                {error && (
                    <div className="mb-4 p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
                        {error}
                    </div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
                    {roles.map(({ id, title, description, icon: Icon }) => (
                        <button
                            key={id}
                            onClick={() => setSelectedRole(id)}
                            className={`p-6 rounded-2xl border transition-all cursor-pointer text-left group ${selectedRole === id
                                    ? 'border-primary bg-primary/10'
                                    : 'border-white/10 hover:border-primary/30 hover:bg-white/5'
                                }`}
                        >
                            <div className={`p-3 rounded-xl mb-4 w-fit transition-colors ${selectedRole === id ? 'bg-primary text-white' : 'bg-white/5 text-zinc-400 group-hover:text-primary'}`}>
                                <Icon size={24} />
                            </div>
                            <h3 className="font-bold text-lg text-white mb-1">{title}</h3>
                            <p className="text-xs text-text-muted leading-relaxed">{description}</p>
                        </button>
                    ))}
                </div>

                <button
                    onClick={handleContinue}
                    disabled={!selectedRole || loading}
                    className="w-full py-3 bg-gradient-brand text-white rounded-xl font-bold text-sm hover:opacity-90 transition-opacity disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-primary/20"
                >
                    {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                    {loading ? 'Setting up...' : 'Continue'}
                </button>
            </div>
        </div>
    );
}
