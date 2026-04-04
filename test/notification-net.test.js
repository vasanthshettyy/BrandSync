import { test } from 'node:test';
import assert from 'node:assert';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.join(__dirname, '..');

test('Notification Migrations: Avoid Deprecated Paths', () => {
    const migrationsDir = path.join(rootDir, 'supabase', 'migrations');
    const files = fs.readdirSync(migrationsDir).filter(f => f.endsWith('.sql'));
    
    // Check all migrations for deprecated routes that should have been patched
    for (const file of files) {
        // We only care about the latest standardized migration for current logic
        if (file === '20260404000000_standardize_notification_flow.sql') {
            const content = fs.readFileSync(path.join(migrationsDir, file), 'utf8');
            assert.ok(
                !content.includes("'/brand/post-gig'"),
                `Migration file ${file} should not contain deprecated /brand/post-gig path.`
            );
            assert.ok(
                !content.includes("'/brand/gigs/' || NEW.gig_id || '/applications'"),
                `Standardized migration ${file} should use /brand/contracts instead of deep link.`
            );
        }
    }
});

test('Notification Migrations: Use Standardized Routes', () => {
    const migrationPath = path.join(rootDir, 'supabase', 'migrations', '20260404000000_standardize_notification_flow.sql');
    
    if (fs.existsSync(migrationPath)) {
        const content = fs.readFileSync(migrationPath, 'utf8');
        
        // Assert valid routes from Prompt 1 architecture
        assert.ok(content.includes("'/brand/contracts'"), 'Migration should use /brand/contracts route');
        assert.ok(content.includes("'/influencer/contracts'"), 'Migration should use /influencer/contracts route');
        assert.ok(content.includes("'/influencer/proposals'"), 'Migration should use /influencer/proposals route');
    }
});

test('Edge Function: Send Email Link Composition', () => {
    const edgeFunctionPath = path.join(rootDir, 'supabase', 'functions', 'send-email', 'index.ts');
    
    if (fs.existsSync(edgeFunctionPath)) {
        const content = fs.readFileSync(edgeFunctionPath, 'utf8');
        
        // Should rely on APP_BASE_URL
        assert.ok(content.includes('APP_BASE_URL'), 'Edge function should rely on APP_BASE_URL');
        assert.ok(content.includes('Deno.env.get("APP_BASE_URL")'), 'Edge function should fetch APP_BASE_URL from env');
        
        // Should NOT hardcode makerhq.ai or brandsync.in in the logic
        assert.ok(!content.includes('href="https://makerhq.ai'), 'Edge function must not hardcode makerhq.ai in CTA links');
        
        // Should use robust link building from Prompt 2
        assert.ok(content.includes('APP_BASE_URL.replace(/\\/$/, \'\')'), 'Edge function must handle trailing slash in APP_BASE_URL');
        assert.ok(content.includes('link.startsWith(\'/\')'), 'Edge function must handle leading slash in notification links');
        assert.ok(content.includes('href="${ctaUrl}"'), 'Edge function must use sanitized ctaUrl for CTA button');
    }
});

test('App Router: Valid Route Existence', () => {
    const appRouterPath = path.join(rootDir, 'src/routes/AppRouter.jsx');
    const content = fs.readFileSync(appRouterPath, 'utf8');
    
    const requiredRoutes = [
        'path="contracts"',
        'path="proposals"',
        'path="gigs/:gigId/applications"'
    ];
    
    for (const route of requiredRoutes) {
        assert.ok(content.includes(route), `AppRouter should define route matching: ${route}`);
    }
});
