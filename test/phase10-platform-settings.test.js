import { test } from 'node:test';
import assert from 'node:assert';
import { DEFAULT_PLATFORM_SETTINGS } from '../src/lib/constants.js';

/**
 * Phase 10 Platform Settings Logic Test
 * Proves that the scaffolding handles defaults and parsing safely without network.
 */

// Helper to simulate the mapping logic used in usePlatformSettings and feature-flags
const mapSettings = (dbRows) => {
    const merged = { ...DEFAULT_PLATFORM_SETTINGS };
    dbRows.forEach(row => {
        merged[row.key] = row.value;
    });
    
    return {
        commissionRate: merged.commission_rate,
        paymentGateway: merged.payment_gateway,
        maxGigsPerBrandFree: merged.max_gigs_per_brand_free,
        enableEscrow: merged.enable_escrow,
        enableChat: merged.enable_chat
    };
};

test('Platform Settings: returns hardcoded defaults when DB is empty', () => {
    const settings = mapSettings([]);
    
    assert.strictEqual(settings.commissionRate, 10);
    assert.strictEqual(settings.enableEscrow, false);
    assert.strictEqual(settings.enableChat, false);
    assert.strictEqual(settings.paymentGateway, 'razorpay');
});

test('Platform Settings: overrides defaults with DB values', () => {
    const dbRows = [
        { key: 'commission_rate', value: 15 },
        { key: 'enable_escrow', value: true }
    ];
    
    const settings = mapSettings(dbRows);
    
    assert.strictEqual(settings.commissionRate, 15);
    assert.strictEqual(settings.enableEscrow, true);
    assert.strictEqual(settings.enableChat, false, 'Should keep default false if not in DB');
});

test('Platform Settings: handles boolean-like JSONB inputs correctly', () => {
    const dbRows = [
        { key: 'enable_chat', value: true },
        { key: 'enable_escrow', value: false }
    ];
    
    const settings = mapSettings(dbRows);
    
    assert.strictEqual(settings.enableChat, true);
    assert.strictEqual(settings.enableEscrow, false);
});

test('Constants: ensure Phase 10 defaults are strictly false for MVP', () => {
    assert.strictEqual(DEFAULT_PLATFORM_SETTINGS.enable_escrow, false);
    assert.strictEqual(DEFAULT_PLATFORM_SETTINGS.enable_chat, false);
});
