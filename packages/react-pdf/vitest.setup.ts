import * as pdfjs from 'pdfjs-dist';

import './src/pdf.worker.entry.js';

pdfjs.GlobalWorkerOptions.workerSrc = new URL(
  'pdfjs-dist/build/pdf.worker.min.mjs',
  import.meta.url,
).toString();

document.body.style.setProperty('--react-pdf-annotation-layer', '1');
document.body.style.setProperty('--react-pdf-text-layer', '1');
