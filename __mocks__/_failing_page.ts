import type { PDFPageProxy } from 'pdfjs-dist';

export default {
  cleanup: () => {
    return true;
  },
  commonObjs: {
    get: () => {
      // Intentionally empty
    },
  },
  getAnnotations: () => new Promise((resolve, reject) => reject(new Error())),
  getOperatorList: () => new Promise((resolve, reject) => reject(new Error())),
  getStructTree: () => new Promise<void>((resolve, reject) => reject(new Error())),
  getTextContent: () => new Promise((resolve, reject) => reject(new Error())),
  getViewport: () => ({
    width: 600,
    height: 800,
    rotation: 0,
  }),
  render: () => ({
    promise: new Promise((resolve, reject) => reject(new Error())),
    cancel: () => {
      // Intentionally empty
    },
  }),
} as unknown as PDFPageProxy;
