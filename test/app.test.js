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
    const appRouterPath = path.join(rootDir, 'src/routes/AppRouter.jsx');
    const appRouterContent = fs.readFileSync(appRouterPath, 'utf8');
    
    // 1. Sidebar vs Router Mismatch Check
    const sidebarPath = path.join(rootDir, 'src/components/layout/Sidebar.jsx');
    const sidebarContent = fs.readFileSync(sidebarPath, 'utf8');

    // Extract paths from Sidebar ROLE_NAV_CONFIG
    // Simple regex to find path: '/...' or path: "/..."
    const pathRegex = /path:\s*['"]([^'"]+)['"]/g;
    let match;
    const sidebarPaths = [];
    while ((match = pathRegex.exec(sidebarContent)) !== null) {
        sidebarPaths.push(match[1]);
    }

    // Verify each sidebar path has a corresponding route or is a known nested route
    for (const fullPath of sidebarPaths) {
        const parts = fullPath.split('/').filter(Boolean); // e.g. ["brand", "dashboard"]
        if (parts.length < 2) continue;

        const role = parts[0];
        const routePath = parts[1];

        // Check if the routePath exists within the role's route block in AppRouter
        // This is a heuristic check on the file content
        const roleBlockRegex = new RegExp(`<Route path="/${role}"[\\s\\S]+?<\\/Route>`, 'g');
        const roleBlockMatch = appRouterContent.match(roleBlockRegex);
        
        assert.ok(roleBlockMatch, `AppRouter should have a route block for /${role}`);
        
        const roleBlock = roleBlockMatch[0];
        assert.ok(
            roleBlock.includes(`path="${routePath}"`) || 
            roleBlock.includes(`path='${routePath}'`) ||
            appRouterContent.includes(`path="${fullPath}"`),
            `AppRouter should contain route for ${fullPath}`
        );
    }

    // 2. Specific fix verification
    assert.ok(
        appRouterContent.includes('path="settings"') && appRouterContent.includes("allowedRoles={['admin']}"),
        'Admin settings route should now exist and be protected'
    );

    // 4. Verify Admin Route protection structure
    const adminBlockRegex = /<Route path="\/admin"[\s\S]+?allowedRoles={?\[['"]admin['"]\]}?[\s\S]+?<\/Route>/;
    assert.ok(adminBlockRegex.test(appRouterContent), 'Admin routes must be wrapped in RoleRoute with admin role');

    // 3. Negative check for deprecated routes
    assert.ok(
        !sidebarContent.includes("path: '/brand/post-gig'"),
        'Sidebar config must not use broken /brand/post-gig route'
    );
});
