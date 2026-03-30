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
import ManageApplicationsPage from '../pages/brand/ManageApplicationsPage';
import BrandContractsPage from '../pages/brand/BrandContractsPage';
import BrandSettingsPage from '../pages/brand/BrandSettingsPage';

// Influencer Pages
import InfluencerLayout from '../pages/influencer/InfluencerLayout';
import InfluencerDashboard from '../pages/influencer/InfluencerDashboard';
import GigFeedPage from '../pages/influencer/GigFeedPage';
import MyProposalsPage from '../pages/influencer/MyProposalsPage';
import InfluencerContractsPage from '../pages/influencer/InfluencerContractsPage';
import InfluencerSettingsPage from '../pages/influencer/InfluencerSettingsPage';
import ChatInterface from '../components/messages/ChatInterface';
import PublicProfile from '../pages/influencer/PublicProfile';

// Admin Pages
import AdminLayout from '../pages/admin/AdminLayout';
import AdminDashboard from '../pages/admin/AdminDashboard';
import UserManagementPage from '../pages/admin/UserManagementPage';
import GigModerationPage from '../pages/admin/GigModerationPage';
import AdminVerificationPage from '../pages/admin/AdminVerificationPage';

export default function AppRouter() {
    return (
        <BrowserRouter>
            <Routes>
                {/* Public Routes */}
                <Route path="/login" element={<LoginPage />} />
                <Route path="/signup" element={<SignupPage />} />
                <Route path="/select-role" element={
                    <ProtectedRoute><RoleSelectPage /></ProtectedRoute>
                } />

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
                    <Route path="gigs/:gigId/applications" element={<ManageApplicationsPage />} />
                    <Route path="contracts" element={<BrandContractsPage />} />
                    <Route path="messages" element={<ChatInterface />} />
                    <Route path="settings" element={<BrandSettingsPage />} />
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
                    <Route path="messages" element={<ChatInterface />} />
                    <Route path="settings" element={<InfluencerSettingsPage />} />
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
                    <Route path="users" element={<UserManagementPage />} />
                    <Route path="gigs" element={<GigModerationPage />} />
                    <Route path="verification" element={<AdminVerificationPage />} />
                </Route>

                {/* Catch-all */}
                <Route path="/influencer/:id" element={
                    <ProtectedRoute><PublicProfile /></ProtectedRoute>
                } />
                <Route path="*" element={<Navigate to="/login" replace />} />
            </Routes>
        </BrowserRouter>
    );
}
