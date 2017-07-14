'use strict';

var ReactPDF = require('./react-pdf');

var pdfjs = require('pdfjs-dist');
require('pdfjs-dist/web/compatibility');

pdfjs.PDFJS.disableWorker = true;

module.exports = ReactPDF;