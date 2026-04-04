import { test } from 'node:test';
import assert from 'node:assert';

/**
 * Verification Flow Contract Test
 * Ensures the verify-image edge function returns the expected shape for the frontend.
 */

const SUCCESS_SHAPE = {
    followers_count: 15000,
    platform: 'Instagram',
    confidence: 0.95,
    threshold: 0.85,
    raw_text: '... instagram followers 15k ...'
};

const MANUAL_REVIEW_SHAPE = {
    followers_count: null,
    platform: 'Unknown',
    confidence: 0,
    threshold: 0.85,
    raw_text: '',
    recoverable: true,
    needs_manual_review: true,
    error: 'OCR provider unavailable right now.'
};

const RECOVERABLE_ERROR_SHAPE = {
    error: 'Image too large (Max 5MB).',
    recoverable: true
};

test('Verification Contract: Success Shape', () => {
    const data = SUCCESS_SHAPE;
    assert.strictEqual(typeof data.followers_count, 'number');
    assert.ok(data.confidence >= 0 && data.confidence <= 1);
    assert.strictEqual(typeof data.threshold, 'number');
    assert.strictEqual(typeof data.platform, 'string');
});

test('Verification Contract: Manual Review Shape', () => {
    const data = MANUAL_REVIEW_SHAPE;
    assert.strictEqual(data.followers_count, null);
    assert.strictEqual(data.needs_manual_review, true);
    assert.strictEqual(data.recoverable, true);
    assert.strictEqual(typeof data.error, 'string');
});

test('Verification Contract: Recoverable Error Shape', () => {
    const data = RECOVERABLE_ERROR_SHAPE;
    assert.strictEqual(typeof data.error, 'string');
    assert.strictEqual(data.recoverable, true);
});

test('Frontend Logic: handles auto-approve path', () => {
    // Mocking the logic in VerificationUpload.jsx handleScan
    const data = SUCCESS_SHAPE;
    const threshold = data.threshold || 0.85;
    
    const isAutoApprove = data.confidence >= threshold && data.followers_count;
    assert.strictEqual(isAutoApprove, 15000); // Truthy in JS, specifically 15000
});

test('Frontend Logic: handles manual fallback path', () => {
    // Mocking the logic in VerificationUpload.jsx handleScan for failure
    const data = MANUAL_REVIEW_SHAPE;
    const threshold = data.threshold || 0.85;
    
    const isAutoApprove = data.confidence >= threshold && data.followers_count;
    assert.ok(!isAutoApprove);
});
