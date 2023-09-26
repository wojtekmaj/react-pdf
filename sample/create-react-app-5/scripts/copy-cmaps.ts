import fs from 'node:fs';
import path from 'node:path';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);

const cMapsDir = path.join(path.dirname(require.resolve('pdfjs-dist/package.json')), 'cmaps');
const targetDir = path.join('public', 'cmaps');

fs.cpSync(cMapsDir, targetDir, { recursive: true });
