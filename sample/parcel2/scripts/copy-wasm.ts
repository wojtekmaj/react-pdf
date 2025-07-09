import fs from 'node:fs';
import path from 'node:path';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);

const wasmDir = path.join(path.dirname(require.resolve('pdfjs-dist/package.json')), 'wasm');
const targetDir = path.join('dist', 'wasm');

fs.cpSync(wasmDir, targetDir, { recursive: true });
