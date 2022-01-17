const fs = require('fs');
const path = require('path');

const pdfjsDistPath = path.dirname(require.resolve('pdfjs-dist/package.json'));
const sourceDir = path.join(pdfjsDistPath, 'cmaps');

const targetDir = path.join('public', 'cmaps');

// Ensure target directory exists
fs.mkdirSync(targetDir, { recursive: true });

// Copy all files from the source directory to the target directory
const files = fs.readdirSync(sourceDir);
files.forEach((file) => {
  fs.copyFileSync(path.join(sourceDir, file), path.join(targetDir, file));
});
