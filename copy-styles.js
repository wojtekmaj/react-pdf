const fs = require('fs');

fs.copyFile('src/Page/AnnotationLayer.css', 'dist/esm/Page/AnnotationLayer.css', (error) => {
  if (error) {
    throw error;
  }
  // eslint-disable-next-line no-console
  console.log('AnnotationLayer.css copied successfully to ESM build.');
});

fs.copyFile('src/Page/AnnotationLayer.css', 'dist/umd/Page/AnnotationLayer.css', (error) => {
  if (error) {
    throw error;
  }
  // eslint-disable-next-line no-console
  console.log('AnnotationLayer.css copied successfully to UMD build.');
});
