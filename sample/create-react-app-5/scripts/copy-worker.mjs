import fs from 'node:fs';
import path from 'node:path';

const pdfjsDistPath = path.dirname(require.resolve('pdfjs-dist/package.json'));
const pdfWorkerPath = path.join(pdfjsDistPath, 'build', 'pdf.worker.js');

const targetDir = 'public';
const targetPath = path.join(targetDir, 'pdf.worker.js');

// Ensure target directory exists
fs.mkdirSync(targetDir, { recursive: true });

// Copy file
fs.copyFileSync(pdfWorkerPath, targetPath);
