import { RenderingCancelledException } from 'pdfjs-dist';

import type { PDFDocumentProxy } from 'pdfjs-dist';

export default {
  _pdfInfo: {
    fingerprint: 'a62067476e69734bb8eb60122615dfbf',
    numPages: 4,
  },
  getDestination: () =>
    new Promise((resolve, reject) => reject(new RenderingCancelledException('Cancelled'))),
  getOutline: () =>
    new Promise((resolve, reject) => reject(new RenderingCancelledException('Cancelled'))),
  getPage: () =>
    new Promise((resolve, reject) => reject(new RenderingCancelledException('Cancelled'))),
  numPages: 4,
} as unknown as PDFDocumentProxy;
