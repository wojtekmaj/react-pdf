import Document from './Document';
import Outline from './Outline';
import Page from './Page';

// eslint-disable-next-line no-underscore-dangle
if (!window._babelPolyfill) {
  // eslint-disable-next-line global-require
  require('babel-polyfill');
}

require('pdfjs-dist');
require('pdfjs-dist/web/compatibility');

export {
  Document,
  Outline,
  Page,
};
