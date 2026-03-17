import { useAuth } from '../../context/AuthContext';
import BrandOnboarding from '../../components/onboarding/BrandOnboarding';
import InfluencerOnboarding from '../../components/onboarding/InfluencerOnboarding';
import { Navigate } from 'react-router-dom';
import { Loader2 } from 'lucide-react';

export default function OnboardingFlow() {
    const { role, profile, loading } = useAuth();

    if (loading) {
        return (
            <div className="flex items-center justify-center h-screen"
                style={{ background: 'linear-gradient(135deg, var(--color-surface-900) 0%, #1a0a2e 50%, var(--color-surface-900) 100%)' }}
            >
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
        );
    }

    // If onboarding is already complete, redirect to dashboard
    if (profile?.onboarding_complete) {
        const dashPath = role === 'brand' ? '/brand/dashboard' : '/influencer/dashboard';
        return <Navigate to={dashPath} replace />;
    }

    if (role === 'brand') return <BrandOnboarding />;
    if (role === 'influencer') return <InfluencerOnboarding />;

    // No role set yet
    return <Navigate to="/select-role" replace />;
}
