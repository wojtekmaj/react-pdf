import fs from 'node:fs';
import { createRequire } from 'node:module';
import path from 'node:path';

const require = createRequire(import.meta.url);

const standardFontsDir = path.join(
  path.dirname(require.resolve('pdfjs-dist/package.json')),
  'standard_fonts',
);
const targetDir = path.join('dist', 'standard_fonts');

fs.cpSync(standardFontsDir, targetDir, { recursive: true });
