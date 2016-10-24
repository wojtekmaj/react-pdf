react-pdf
=========

## Maintainer needed

I'm not using this library in any of my active projects at the moment. I'm reviewing and accepting pull requests constantly but I would be happy to grant push rights to someone actively using this library.

Open an issue or contact me directly at niklas@narhinen.net if interested.

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

    return <PDF content="YSBzaW1wbGUgcGRm..." page="1" scale="1.0" onDocumentComplete={this._onDocumentComplete} onPageComplete={this._onPageComplete} loading={(<span>Your own loading message ...</span>)} />
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

Bart Van Houtte <bart.van.houtte@ading.be> Added Base64 Content , update PDFJS, document and page completion notification callbacks and custom loading message

Wojciech Maj <kontakt@wojtekmaj.pl> Upgraded module to support React 15.x, included PDF.js as a native npm module to avoid necessity of constant manual updating, removed necessity of adding global PDFJS variable
