import { test } from 'node:test';
import assert from 'node:assert';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.join(__dirname, '..');

test('Phase 10 Scaffolding: README Scaffolding', () => {
    const readmePath = path.join(rootDir, 'README.md');
    const content = fs.readFileSync(readmePath, 'utf8');
    
    assert.ok(content.includes('Phase 10 Scaffolding'), 'README should contain Phase 10 section');
    assert.ok(content.includes('enable_escrow'), 'README should mention enable_escrow flag');
    assert.ok(content.includes('platform_settings'), 'README should mention the settings table');
});

test('Phase 10 Foundation: Roadmap Alignment', () => {
    const roadmapPath = path.join(rootDir, 'roadmap.md');
    const content = fs.readFileSync(roadmapPath, 'utf8');
    
    assert.ok(content.includes('Phase 10 — Future-Proofing'), 'Roadmap should define Phase 10');
    assert.ok(content.includes('payment_gateway'), 'Roadmap DB section should have payment placeholders');
    assert.ok(content.includes('transaction_id'), 'Roadmap DB section should have transaction placeholders');
});

test('Phase 10 Foundation: Auth Context Hygiene', () => {
    const authPath = path.join(rootDir, 'src/context/AuthContext.jsx');
    const content = fs.readFileSync(authPath, 'utf8');
    
    // Ensure we don't have noisy logs that leak state during feature flag rollout
    assert.ok(!content.includes('console.log(\'Auth Event:\''), 'AuthContext should be clean of debug logs');
});
