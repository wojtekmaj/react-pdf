import fs from 'node:fs';
import path from 'node:path';
import { createRequire } from 'node:module';

function copyDir(from: string, to: string) {
  // Ensure target directory exists
  fs.mkdirSync(to, { recursive: true });

  const files = fs.readdirSync(from);
  files.forEach((file) => {
    fs.copyFileSync(path.join(from, file), path.join(to, file));
  });
}

const require = createRequire(import.meta.url);
const cMapsDir = path.join(path.dirname(require.resolve('pdfjs-dist/package.json')), 'cmaps');
const targetDir = path.join('dist', 'assets', 'cmaps');

copyDir(cMapsDir, targetDir);
