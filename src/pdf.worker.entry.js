/**
 * PDF.js worker entry file.
 *
 * This file is identical to Mozilla's pdf.worker.entry.js, with one exception being placed inside
 * this bundle, not theirs.
 */

(typeof window !== 'undefined' ? window : {}).pdfjsWorker = require('pdfjs-dist/legacy/build/pdf.worker');
