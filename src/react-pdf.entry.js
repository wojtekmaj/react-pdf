/**
 * Entry file for React-PDF - worker included.
 *
 * This entry file produces larger builds, but require no additional configuration.
 */

const pdfjsLib = require('pdfjs-dist');
const pdfjsWorker = require('pdfjs-dist/build/pdf.worker.min');
require('pdfjs-dist/web/compatibility');

const ReactPDF = require('./react-pdf');

const pdfjsWorkerBlob = new Blob([pdfjsWorker]);
const pdfjsWorkerBlobURL = URL.createObjectURL(pdfjsWorkerBlob);

pdfjsLib.PDFJS.workerSrc = pdfjsWorkerBlobURL;

module.exports = ReactPDF;
