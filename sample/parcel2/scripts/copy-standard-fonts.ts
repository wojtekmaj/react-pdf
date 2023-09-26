import fs from 'node:fs';
import path from 'node:path';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);

const standardFontsDir = path.join(
  path.dirname(require.resolve('pdfjs-dist/package.json')),
  'standard_fonts',
);
const targetDir = path.join('dist', 'standard_fonts');

fs.cpSync(standardFontsDir, targetDir, { recursive: true });
