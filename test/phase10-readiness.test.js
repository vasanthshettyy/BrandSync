import { test } from 'node:test';
import assert from 'node:assert';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.join(__dirname, '..');

test('Phase 10 Readiness: README Scaffolding', () => {
    const readmePath = path.join(rootDir, 'README.md');
    const content = fs.readFileSync(readmePath, 'utf8');
    
    assert.ok(content.includes('Phase 10 Readiness'), 'README should contain Phase 10 section');
    assert.ok(content.includes('platform_settings'), 'README should mention planned platform_settings');
    assert.ok(content.includes('payment_gateway'), 'README should mention payment_gateway placeholders');
});

test('Phase 10 Readiness: Roadmap Alignment', () => {
    const roadmapPath = path.join(rootDir, 'roadmap.md');
    const content = fs.readFileSync(roadmapPath, 'utf8');
    
    assert.ok(content.includes('Phase 10 — Future-Proofing'), 'Roadmap should define Phase 10');
    assert.ok(content.includes('payment_gateway'), 'Roadmap DB section should have payment placeholders');
    assert.ok(content.includes('transaction_id'), 'Roadmap DB section should have transaction placeholders');
});

test('Phase 10 Readiness: Auth Context Hygiene', () => {
    const authPath = path.join(rootDir, 'src/context/AuthContext.jsx');
    const content = fs.readFileSync(authPath, 'utf8');
    
    // Ensure we don't have noisy logs that leak state during feature flag rollout
    assert.ok(!content.includes('console.log(\'Auth Event:\''), 'AuthContext should be clean of debug logs');
    assert.ok(!content.includes('console.log(\'Role found:\''), 'AuthContext should be clean of debug logs');
});
