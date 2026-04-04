import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { Mail, Lock, Loader2, Eye, EyeOff } from 'lucide-react';
import makerhqMark from '../../assets/makerhq-mark.png';

export default function SignupPage() {
    const navigate = useNavigate();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    async function handleSignup(e) {
        e.preventDefault();
        if (password !== confirmPassword) {
            setError('Passwords do not match');
            return;
        }
        if (password.length < 6) {
            setError('Password must be at least 6 characters');
            return;
        }

        setLoading(true);
        setError('');

        try {
            const { data, error: authError } = await supabase.auth.signUp({
                email,
                password,
                options: {
                    emailRedirectTo: `${window.location.origin}/select-role`,
                },
            });

            if (authError) {
                setError(authError.message);
                setLoading(false);
                return;
            }

            // If email confirmation is disabled, user gets a session immediately
            if (data?.session) {
                navigate('/select-role');
            } else if (data?.user && !data?.session) {
                // Email confirmation is still enabled in Supabase
                setError('Check your email for a confirmation link, then come back and log in. (Or disable email confirmation in Supabase Dashboard → Authentication → Email)');
            }
        } catch (err) {
            setError(err.message || 'An unexpected error occurred. Please try again.');
        } finally {
            setLoading(false);
        }
    }

    async function handleGoogleSignup() {
        const { error } = await supabase.auth.signInWithOAuth({
            provider: 'google',
            options: {
                redirectTo: `${window.location.origin}/select-role`,
            },
        });
        if (error) setError(error.message);
    }

    return (
        <div className="min-h-screen flex items-center justify-center p-4"
            style={{ background: 'linear-gradient(135deg, var(--color-surface-900) 0%, #1a0a2e 50%, var(--color-surface-900) 100%)' }}
        >
            <div className="glass-card w-full max-w-md p-8 animate-slide-up">
                <div className="flex items-center gap-3 mb-8 justify-center flex-col">
                    <div className="flex items-center gap-3">
                        <img src={makerhqMark} alt="MakerHQ" className="w-10 h-10 object-contain" />
                        <span className="font-display font-bold text-2xl text-gradient">MakerHQ</span>
                    </div>
                    <p className="text-text-secondary text-[10px] uppercase tracking-widest font-bold opacity-60 text-center">
                        Where the creator economy gets to work
                    </p>
                </div>

                <h2 className="text-xl font-semibold text-center mb-1">Create your account</h2>
                <p className="text-text-secondary text-sm text-center mb-6">Start connecting brands with influencers</p>

                {error && (
                    <div className="mb-4 p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
                        {error}
                    </div>
                )}

                <form onSubmit={handleSignup} className="space-y-4">
                    <div>
                        <label htmlFor="signup-email" className="text-sm text-text-secondary mb-1.5 block">Email</label>
                        <div className="relative">
                            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
                            <input
                                id="signup-email"
                                name="email"
                                type="email"
                                autoComplete="email"
                                value={email}
                                onChange={e => setEmail(e.target.value)}
                                className="w-full pl-10 pr-4 py-2.5 bg-white/5 border border-border-dark rounded-lg text-sm outline-none focus:border-primary transition-colors"
                                placeholder="you@example.com"
                                required
                            />
                        </div>
                    </div>

                    <div>
                        <label htmlFor="signup-password" className="text-sm text-text-secondary mb-1.5 block">Password</label>
                        <div className="relative">
                            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
                            <input
                                id="signup-password"
                                name="password"
                                type={showPassword ? 'text' : 'password'}
                                autoComplete="new-password"
                                value={password}
                                onChange={e => setPassword(e.target.value)}
                                className="w-full pl-10 pr-10 py-2.5 bg-white/5 border border-border-dark rounded-lg text-sm outline-none focus:border-primary transition-colors"
                                placeholder="Min. 6 characters"
                                required
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted hover:text-text-secondary cursor-pointer"
                            >
                                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                            </button>
                        </div>
                    </div>

                    <div>
                        <label htmlFor="signup-confirm-password" className="text-sm text-text-secondary mb-1.5 block">Confirm Password</label>
                        <div className="relative">
                            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
                            <input
                                id="signup-confirm-password"
                                name="confirmPassword"
                                type="password"
                                autoComplete="new-password"
                                value={confirmPassword}
                                onChange={e => setConfirmPassword(e.target.value)}
                                className="w-full pl-10 pr-4 py-2.5 bg-white/5 border border-border-dark rounded-lg text-sm outline-none focus:border-primary transition-colors"
                                placeholder="••••••••"
                                required
                            />
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full py-2.5 bg-gradient-brand text-white rounded-lg font-medium text-sm hover:opacity-90 transition-opacity disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer"
                    >
                        {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                        {loading ? 'Creating account...' : 'Create Account'}
                    </button>
                </form>

                <div className="relative my-6">
                    <div className="absolute inset-0 flex items-center">
                        <div className="w-full border-t border-border-dark"></div>
                    </div>
                    <div className="relative flex justify-center text-xs">
                        <span className="px-2 text-text-muted" style={{ background: 'var(--color-glass-dark)' }}>
                            or continue with
                        </span>
                    </div>
                </div>

                <button
                    onClick={handleGoogleSignup}
                    className="w-full py-2.5 border border-border-dark rounded-lg text-sm font-medium hover:bg-white/5 transition-colors flex items-center justify-center gap-2 cursor-pointer"
                >
                    <svg className="w-4 h-4" viewBox="0 0 24 24">
                        <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" />
                        <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                        <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                        <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                    </svg>
                    Continue with Google
                </button>

                <p className="text-center text-sm text-text-secondary mt-6">
                    Already have an account?{' '}
                    <Link to="/login" className="text-primary hover:underline cursor-pointer">Sign In</Link>
                </p>
            </div>
        </div>
    );
}
