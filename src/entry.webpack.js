import Document from './Document';
import Page from './Page';

import { isLocalFileSystem } from './shared/util';

if (isLocalFileSystem()) {
  // eslint-disable-next-line no-console
  console.warn('You are running React-PDF from your local file system. PDF.js Worker may fail to load due to browser\'s security policies. If you\'re on Google Chrome, you can use --allow-file-access-from-files flag for debugging purposes.');
}

require('pdfjs-dist/webpack');
require('pdfjs-dist/web/compatibility');

export {
  Document,
  Page,
};
