// Loads a PDF file as a Buffer.

const fs = require('fs');

module.exports = fs.readFileSync('./test/test.pdf');
