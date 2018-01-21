export default {
  getAnnotations: () => new Promise((resolve, reject) => reject(new Error())),
  getTextContent: () => new Promise((resolve, reject) => reject(new Error())),
  getViewport: () => ({
    width: 600,
    height: 800,
    rotation: 0,
  }),
};
