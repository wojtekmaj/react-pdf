react-pdf
=========

What
----

A component for showing a pdf page using [pdf.js](http://mozilla.github.io/pdf.js).

Usage
-----

Install with `npm install react-pdf`

Use in your app:

```js
var PDF = require('react-pdf');

var MyApp = React.createClass({
  render: function() {

    return <PDF file="somefile.pdf" page="2" />
  },
  _onPdfCompleted: function(page, pages){
    this.setState({page: page, pages: pages});
  }
});
```
or
```js
var PDF = require('react-pdf');

var MyApp = React.createClass({
  render: function() {

    return <PDF content="YSBzaW1wbGUgcGRm..." page="1" scale="1.0" onDocumentComplete={this._onDocumentComplete} onPageComplete={this._onPageComplete} loading="Your own loading message" />
  },
  _onDocumentCompleted: function(pages){
    this.setState({pages: pages});
  },
  _onPageCompleted: function(page){
    this.setState({currentPage: page});
  }
});
```

Check the example-directory of this repository for a full working example


License
-------

The MIT License

Author
------

Niklas Närhinen <niklas@narhinen.net>

Bart Van Houtte <bart.van.houtte@ading.be> Added Base64 Content, update PDF.js, document and page completion notification callbacks and custom loading message

Wojciech Maj <kontakt@wojtekmaj.pl> Rewritten React-PDF to ES6 module, upgraded module to support React 15.x, included PDF.js as a native npm module to avoid necessity of constant manual updating, removed necessity of adding global PDFJS variable