"use strict";

/**
 * PDF.js Worker entry file.
 *
 * This file is identical to Mozilla's pdf.worker.entry.js, with one exception being placed inside
 * this bundle, not theirs. This file can be safely removed and replaced with Mozilla's after the
 * issue mentioned below has been resolved on Parcel's side.
 * See: https://github.com/parcel-bundler/parcel/issues/670
 */
(typeof window !== 'undefined' ? window : {}).pdfjsWorker = require('pdfjs-dist/build/pdf.worker.js');