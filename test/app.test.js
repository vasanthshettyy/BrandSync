import { test } from 'node:test';
import assert from 'node:assert';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

// Import our pure logic helpers to test
import { getGigNiche, formatGigDeadline } from '../src/lib/utils.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.join(__dirname, '..');

test('Gig Logic Fallbacks: getGigNiche', () => {
    // 1. Should use niche if present
    assert.strictEqual(getGigNiche({ niche: 'Tech', niche_required: 'Gaming' }), 'Tech');
    
    // 2. Should fallback to niche_required if niche is missing/falsy
    assert.strictEqual(getGigNiche({ niche: null, niche_required: 'Gaming' }), 'Gaming');
    assert.strictEqual(getGigNiche({ niche_required: 'Beauty' }), 'Beauty');
    
    // 3. Should fallback to General if both missing
    assert.strictEqual(getGigNiche({}), 'General');
    assert.strictEqual(getGigNiche(null), 'General');
});

test('Gig Logic Fallbacks: formatGigDeadline', () => {
    // 1. Valid deadline
    const d1 = new Date('2026-10-15T00:00:00Z');
    const d1Str = d1.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
    assert.strictEqual(formatGigDeadline('2026-10-15T00:00:00Z', null), d1Str);
    
    // 2. Invalid deadline falls back to created_at
    const c1 = new Date('2026-09-01T00:00:00Z');
    const c1Str = c1.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
    assert.strictEqual(formatGigDeadline('invalid-date', '2026-09-01T00:00:00Z'), c1Str);
    
    // 3. Both missing or invalid falls back to 'No deadline'
    assert.strictEqual(formatGigDeadline(null, null), 'No deadline');
    assert.strictEqual(formatGigDeadline('invalid-date', 'another-invalid'), 'No deadline');
});

test('Router Safety: Config Existence', () => {
    // 1. Assert Admin Routes exist in AppRouter
    const appRouterPath = path.join(rootDir, 'src/routes/AppRouter.jsx');
    const appRouterContent = fs.readFileSync(appRouterPath, 'utf8');
    
    assert.ok(
        appRouterContent.includes('<Route path="dashboard" element={<AdminDashboard />} />') ||
        appRouterContent.includes('path="/admin"'),
        'AppRouter should contain /admin route declarations'
    );
    
    // 2. Assert Brand route targets /brand/gigs and not /brand/post-gig in Sidebar
    const sidebarPath = path.join(rootDir, 'src/components/layout/Sidebar.jsx');
    const sidebarContent = fs.readFileSync(sidebarPath, 'utf8');
    
    assert.ok(
        sidebarContent.includes("path: '/brand/gigs'"),
        'Sidebar config should use /brand/gigs'
    );
    
    assert.ok(
        !sidebarContent.includes("path: '/brand/post-gig'"),
        'Sidebar config must not use broken /brand/post-gig route'
    );
});
