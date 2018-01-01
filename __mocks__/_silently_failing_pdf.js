import { RenderingCancelledException } from 'pdfjs-dist';

export default {
  getDestination: () => {},
  getOutline: () => {},
  getPage: () => new Promise((resolve, reject) => reject(new RenderingCancelledException())),
  numPages: 4,
  pdfInfo: {
    fingerprint: 'a62067476e69734bb8eb60122615dfbf',
    numPages: 4,
  },
};
