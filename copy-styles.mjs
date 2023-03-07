import fs from 'node:fs';

fs.copyFile('src/Page/AnnotationLayer.css', 'dist/esm/Page/AnnotationLayer.css', (error) => {
  if (error) {
    throw error;
  }
  // eslint-disable-next-line no-console
  console.log('AnnotationLayer.css copied successfully to ESM build.');
});

fs.copyFile('src/Page/AnnotationLayer.css', 'dist/cjs/Page/AnnotationLayer.css', (error) => {
  if (error) {
    throw error;
  }
  // eslint-disable-next-line no-console
  console.log('AnnotationLayer.css copied successfully to CJS build.');
});

fs.copyFile('src/Page/TextLayer.css', 'dist/esm/Page/TextLayer.css', (error) => {
  if (error) {
    throw error;
  }
  // eslint-disable-next-line no-console
  console.log('TextLayer.css copied successfully to ESM build.');
});

fs.copyFile('src/Page/TextLayer.css', 'dist/cjs/Page/TextLayer.css', (error) => {
  if (error) {
    throw error;
  }
  // eslint-disable-next-line no-console
  console.log('TextLayer.css copied successfully to CJS build.');
});
