const ReactPDF = require('./react-pdf');

const pdfjs = require('pdfjs-dist');
require('pdfjs-dist/web/compatibility');

pdfjs.PDFJS.disableWorker = true;

module.exports = ReactPDF;
