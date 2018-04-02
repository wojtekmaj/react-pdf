import { RenderingCancelledException } from 'pdfjs-dist';

export default {
  getDestination: () => new Promise((resolve, reject) => reject(new RenderingCancelledException())),
  getOutline: () => new Promise((resolve, reject) => reject(new RenderingCancelledException())),
  getPage: () => new Promise((resolve, reject) => reject(new RenderingCancelledException())),
  numPages: 4,
  pdfInfo: {
    fingerprint: 'a62067476e69734bb8eb60122615dfbf',
    numPages: 4,
  },
};
