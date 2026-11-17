import { describe, expect, it } from 'vitest';

describe('public API', () => {
    it('can be imported without a DOM (no side effects on import)', async () => {
        expect(typeof globalThis.document).toBe('undefined');
        const api = await import('../src/index');
        expect(Object.keys(api).length).toBeGreaterThan(0);
    });
});
