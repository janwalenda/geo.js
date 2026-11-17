import { expect } from 'vitest';

interface VecLike {
    x: number;
    y: number;
    z?: number;
    w?: number;
}

/** Compare vector-like objects component-wise with a floating-point tolerance. */
export function expectVec(actual: VecLike, expected: VecLike, digits = 6): void {
    for (const key of ['x', 'y', 'z', 'w'] as const) {
        const e = expected[key];
        if (e === undefined) continue;
        expect(actual[key], `component ${key}`).toBeCloseTo(e, digits);
    }
}

/** Compare two number arrays element-wise with a floating-point tolerance. */
export function expectArray(actual: ArrayLike<number>, expected: ArrayLike<number>, digits = 6): void {
    expect(actual.length).toBe(expected.length);
    for (let i = 0; i < expected.length; i++) {
        expect(actual[i], `index ${i}`).toBeCloseTo(expected[i], digits);
    }
}
