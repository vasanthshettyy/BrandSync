import React, { Suspense, lazy } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ProtectedRoute, RoleRoute } from './Guards';
import { Loader2 } from 'lucide-react';

// Auth Pages (Not lazy-loaded to keep initial interaction fast)
import LoginPage from '../pages/auth/LoginPage';
import SignupPage from '../pages/auth/SignupPage';
import RoleSelectPage from '../pages/auth/RoleSelectPage';

// Onboarding
const OnboardingFlow = lazy(() => import('../pages/onboarding/OnboardingFlow'));

// Brand Pages
const BrandLayout = lazy(() => import('../pages/brand/BrandLayout'));
const BrandDashboard = lazy(() => import('../pages/brand/BrandDashboard'));
const DiscoverPage = lazy(() => import('../pages/brand/DiscoverPage'));
const BrandGigsPage = lazy(() => import('../pages/brand/BrandGigsPage'));
const ManageApplicationsPage = lazy(() => import('../pages/brand/ManageApplicationsPage'));
const BrandContractsPage = lazy(() => import('../pages/brand/BrandContractsPage'));
const BrandSettingsPage = lazy(() => import('../pages/brand/BrandSettingsPage'));

// Influencer Pages
const InfluencerLayout = lazy(() => import('../pages/influencer/InfluencerLayout'));
const InfluencerDashboard = lazy(() => import('../pages/influencer/InfluencerDashboard'));
const GigFeedPage = lazy(() => import('../pages/influencer/GigFeedPage'));
const MyProposalsPage = lazy(() => import('../pages/influencer/MyProposalsPage'));
const InfluencerContractsPage = lazy(() => import('../pages/influencer/InfluencerContractsPage'));
const InfluencerProfilePage = lazy(() => import('../pages/influencer/InfluencerProfilePage'));
const InfluencerSettingsPage = lazy(() => import('../pages/influencer/InfluencerSettingsPage'));
const ChatInterface = lazy(() => import('../components/messages/ChatInterface'));
const PublicProfile = lazy(() => import('../pages/influencer/PublicProfile'));
const NotFoundPage = lazy(() => import('../pages/NotFoundPage'));

// Admin Pages
const AdminLayout = lazy(() => import('../pages/admin/AdminLayout'));
const AdminDashboard = lazy(() => import('../pages/admin/AdminDashboard'));
const UserManagementPage = lazy(() => import('../pages/admin/UserManagementPage'));
const GigModerationPage = lazy(() => import('../pages/admin/GigModerationPage'));
const AdminVerificationPage = lazy(() => import('../pages/admin/AdminVerificationPage'));
const AdminPlatformSettingsPage = lazy(() => import('../pages/admin/AdminPlatformSettingsPage'));

// High-level loading state
const PageFallback = () => (
    <div className="flex items-center justify-center h-screen bg-surface-900">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
    </div>
);

export default function AppRouter() {
    return (
        <BrowserRouter>
            <Suspense fallback={<PageFallback />}>
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
                        <Route path="gigs" element={<BrandGigsPage />} />
                        <Route path="gigs/:gigId/applications" element={<ManageApplicationsPage />} />
                        <Route path="contracts" element={<BrandContractsPage />} />
                        <Route path="contracts/:contractId" element={<BrandContractsPage />} />
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
                        <Route path="contracts/:contractId" element={<InfluencerContractsPage />} />
                        <Route path="messages" element={<ChatInterface />} />
                        <Route path="profile" element={<InfluencerProfilePage />} />
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
                        <Route path="settings" element={<AdminPlatformSettingsPage />} />
                    </Route>

                    {/* Catch-all */}
                    <Route path="/influencer/:id" element={
                        <ProtectedRoute><PublicProfile /></ProtectedRoute>
                    } />
                    <Route path="*" element={<NotFoundPage />} />
                </Routes>
            </Suspense>
        </BrowserRouter>
    );
}
