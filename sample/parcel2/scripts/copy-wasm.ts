import fs from 'node:fs';
import { createRequire } from 'node:module';
import path from 'node:path';

const require = createRequire(import.meta.url);

const wasmDir = path.join(path.dirname(require.resolve('pdfjs-dist/package.json')), 'wasm');
const targetDir = path.join('dist', 'wasm');

fs.cpSync(wasmDir, targetDir, { recursive: true });
