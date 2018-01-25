const fs = require('fs');

fs.copyFile('src/Page/AnnotationLayer.css', 'dist/Page/AnnotationLayer.css', (error) => {
  if (error) {
    throw error;
  }
  // eslint-disable-next-line no-console
  console.log('AnnotationLayer.css copied successfully.');
});
