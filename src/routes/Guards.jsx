import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Loader2 } from 'lucide-react';

export function ProtectedRoute({ children }) {
    const { user, loading } = useAuth();
    console.log('ProtectedRoute:', { loading, user: user?.id });

    if (loading) {
        return (
            <div className="flex items-center justify-center h-screen bg-surface-900">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
        );
    }

    if (!user) return <Navigate to="/login" replace />;
    return children;
}

export function RoleRoute({ allowedRoles, children }) {
    const { role, profile, loading } = useAuth();

    if (loading) {
        return (
            <div className="flex items-center justify-center h-screen bg-surface-900">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
        );
    }

    if (!allowedRoles.includes(role)) {
        const redirectPath =
            role === 'brand' ? '/brand/dashboard'
                : role === 'influencer' ? '/influencer/dashboard'
                    : role === 'admin' ? '/admin/dashboard'
                        : '/login';
        return <Navigate to={redirectPath} replace />;
    }

    if (role !== 'admin' && profile && !profile.onboarding_complete) {
        return <Navigate to="/onboarding" replace />;
    }

    return children;
}
