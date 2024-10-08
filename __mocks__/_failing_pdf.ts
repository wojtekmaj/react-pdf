import type { PDFDocumentProxy } from 'pdfjs-dist';

export default {
  _pdfInfo: {
    fingerprint: 'a62067476e69734bb8eb60122615dfbf',
    numPages: 4,
  },
  getDestination: () => new Promise((_resolve, reject) => reject(new Error())),
  getOutline: () => new Promise((_resolve, reject) => reject(new Error())),
  getPage: () => new Promise((_resolve, reject) => reject(new Error())),
  numPages: 4,
} as unknown as PDFDocumentProxy;
