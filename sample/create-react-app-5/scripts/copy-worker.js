const fs = require('fs');
const path = require('path');

const pdfjsDistPath = path.dirname(require.resolve('pdfjs-dist/package.json'));
const sourcePath = path.join(pdfjsDistPath, 'legacy', 'build', 'pdf.worker.js');

const targetDir = 'public';
const targetPath = path.join(targetDir, 'pdf.worker.js');

// Ensure target directory exists
fs.mkdirSync(targetDir, { recursive: true });

// Copy file
fs.copyFileSync(sourcePath, targetPath);
