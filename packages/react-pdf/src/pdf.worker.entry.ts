/**
 * PDF.js worker entry file.
 *
 * This file is identical to Mozilla's pdf.worker.entry.js, with one exception being placed inside
 * this bundle, not theirs.
 */

(
  (typeof window !== 'undefined' ? window : {}) as Window &
    typeof globalThis & { pdfjsWorker: unknown }
).pdfjsWorker =
  // @ts-expect-error - pdfjs-dist does not ship with types
  await import('pdfjs-dist/build/pdf.worker.mjs');

// biome-ignore lint/style/useExportType: This export is necessary for the file to be a module
export {};
