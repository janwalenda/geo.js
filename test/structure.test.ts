import { readdirSync } from 'node:fs';
import { join, relative } from 'node:path';
import { fileURLToPath } from 'node:url';

import { describe, expect, it } from 'vitest';

const ROOT = fileURLToPath(new URL('..', import.meta.url));
const IGNORED = new Set(['node_modules', 'dist', '.git', 'test']);
const TEST_FILE = /\.(test|spec)\.[cm]?[jt]sx?$/;

function findTestFiles(dir: string): string[] {
  return readdirSync(dir, { withFileTypes: true }).flatMap(
    (entry): string[] => {
      if (IGNORED.has(entry.name)) {
        return [];
      }
      const path = join(dir, entry.name);
      if (entry.isDirectory()) {
        return findTestFiles(path);
      }
      return TEST_FILE.test(entry.name) ? [relative(ROOT, path)] : [];
    },
  );
}

describe('repository structure', () => {
  it('keeps every test file inside test/', () => {
    expect(findTestFiles(ROOT)).toEqual([]);
  });
});
