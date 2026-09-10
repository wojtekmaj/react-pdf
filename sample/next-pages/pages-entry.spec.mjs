import assert from 'node:assert/strict';
import { readdirSync, readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { describe, it } from 'node:test';
import { fileURLToPath } from 'node:url';

const pagesDir = join(dirname(fileURLToPath(import.meta.url)), 'pages');

const PAGE_FILE = /\.(js|jsx|ts|tsx)$/;
const SPECIAL_FILE = /^_/;
const STATIC_PDF_VALUE_IMPORT = /^import\s+(?!type\b).*\sfrom\s+['"](?:react-pdf|pdfjs-dist)['"]/m;

describe('next-pages sample', () => {
  it('does not statically import react-pdf into Pages Router routes', () => {
    const offenders = readdirSync(pagesDir).filter((name) => {
      if (SPECIAL_FILE.test(name) || !PAGE_FILE.test(name)) {
        return false;
      }

      const source = readFileSync(join(pagesDir, name), 'utf8');
      return STATIC_PDF_VALUE_IMPORT.test(source);
    });

    assert.deepEqual(
      offenders,
      [],
      'Files in pages/ are SSR routes. A static react-pdf import loads pdfjs-dist in Node and throws "DOMMatrix is not defined" during next build (collecting page data).',
    );
  });
});
