import { test } from 'node:test';
import assert from 'node:assert';

/**
 * Admin Guards Logic Test
 * Simulates the redirection logic within src/routes/Guards.jsx
 */

const getRedirectPath = (userRole, allowedRoles) => {
    if (!allowedRoles.includes(userRole)) {
        return userRole === 'brand' ? '/brand/dashboard'
            : userRole === 'influencer' ? '/influencer/dashboard'
                : userRole === 'admin' ? '/admin/dashboard'
                    : '/login';
    }
    return null; // Allowed
};

const getOnboardingRedirect = (userRole, profile) => {
    // Admin is exempt from onboarding redirect
    if (userRole !== 'admin' && profile && !profile.onboarding_complete) {
        return '/onboarding';
    }
    return null; // Allowed
};

test('Role Guard: blocks brand from admin route', () => {
    const userRole = 'brand';
    const allowedRoles = ['admin'];
    const redirect = getRedirectPath(userRole, allowedRoles);
    assert.strictEqual(redirect, '/brand/dashboard');
});

test('Role Guard: blocks influencer from admin route', () => {
    const userRole = 'influencer';
    const allowedRoles = ['admin'];
    const redirect = getRedirectPath(userRole, allowedRoles);
    assert.strictEqual(redirect, '/influencer/dashboard');
});

test('Role Guard: allows admin into admin route', () => {
    const userRole = 'admin';
    const allowedRoles = ['admin'];
    const redirect = getRedirectPath(userRole, allowedRoles);
    assert.strictEqual(redirect, null);
});

test('Onboarding Guard: redirects brand if incomplete', () => {
    const userRole = 'brand';
    const profile = { onboarding_complete: false };
    const redirect = getOnboardingRedirect(userRole, profile);
    assert.strictEqual(redirect, '/onboarding');
});

test('Onboarding Guard: allows admin even if profile incomplete/missing', () => {
    const userRole = 'admin';
    const profile = null;
    const redirect = getOnboardingRedirect(userRole, profile);
    assert.strictEqual(redirect, null);
});
