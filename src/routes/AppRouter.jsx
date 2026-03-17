import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ProtectedRoute, RoleRoute } from './Guards';

// Auth Pages
import LoginPage from '../pages/auth/LoginPage';
import SignupPage from '../pages/auth/SignupPage';
import RoleSelectPage from '../pages/auth/RoleSelectPage';

// Onboarding
import OnboardingFlow from '../pages/onboarding/OnboardingFlow';

// Brand Pages
import BrandLayout from '../pages/brand/BrandLayout';
import BrandDashboard from '../pages/brand/BrandDashboard';
import DiscoverPage from '../pages/brand/DiscoverPage';
import PostGigPage from '../pages/brand/PostGigPage';
import BrandContractsPage from '../pages/brand/BrandContractsPage';

// Influencer Pages
import InfluencerLayout from '../pages/influencer/InfluencerLayout';
import InfluencerDashboard from '../pages/influencer/InfluencerDashboard';
import GigFeedPage from '../pages/influencer/GigFeedPage';
import MyProposalsPage from '../pages/influencer/MyProposalsPage';
import InfluencerContractsPage from '../pages/influencer/InfluencerContractsPage';

// Admin Pages
import AdminLayout from '../pages/admin/AdminLayout';
import AdminDashboard from '../pages/admin/AdminDashboard';

export default function AppRouter() {
    return (
        <BrowserRouter>
            <Routes>
                {/* Public Routes */}
                <Route path="/login" element={<LoginPage />} />
                <Route path="/signup" element={<SignupPage />} />
                <Route path="/select-role" element={<RoleSelectPage />} />

                {/* Onboarding */}
                <Route path="/onboarding" element={
                    <ProtectedRoute><OnboardingFlow /></ProtectedRoute>
                } />

                {/* Brand Routes */}
                <Route path="/brand" element={
                    <ProtectedRoute>
                        <RoleRoute allowedRoles={['brand']}>
                            <BrandLayout />
                        </RoleRoute>
                    </ProtectedRoute>
                }>
                    <Route index element={<Navigate to="dashboard" replace />} />
                    <Route path="dashboard" element={<BrandDashboard />} />
                    <Route path="discover" element={<DiscoverPage />} />
                    <Route path="post-gig" element={<PostGigPage />} />
                    <Route path="contracts" element={<BrandContractsPage />} />
                </Route>

                {/* Influencer Routes */}
                <Route path="/influencer" element={
                    <ProtectedRoute>
                        <RoleRoute allowedRoles={['influencer']}>
                            <InfluencerLayout />
                        </RoleRoute>
                    </ProtectedRoute>
                }>
                    <Route index element={<Navigate to="dashboard" replace />} />
                    <Route path="dashboard" element={<InfluencerDashboard />} />
                    <Route path="gigs" element={<GigFeedPage />} />
                    <Route path="proposals" element={<MyProposalsPage />} />
                    <Route path="contracts" element={<InfluencerContractsPage />} />
                </Route>

                {/* Admin Routes */}
                <Route path="/admin" element={
                    <ProtectedRoute>
                        <RoleRoute allowedRoles={['admin']}>
                            <AdminLayout />
                        </RoleRoute>
                    </ProtectedRoute>
                }>
                    <Route index element={<Navigate to="dashboard" replace />} />
                    <Route path="dashboard" element={<AdminDashboard />} />
                </Route>

                {/* Catch-all */}
                <Route path="*" element={<Navigate to="/login" replace />} />
            </Routes>
        </BrowserRouter>
    );
}
