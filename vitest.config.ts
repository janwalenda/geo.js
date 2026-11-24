import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    // All tests live in test/ (mirroring src/). Test files anywhere else are
    // not run and are rejected by test/structure.test.ts.
    include: ['test/**/*.test.ts'],
    environment: 'node',
  },
});
