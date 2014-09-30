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
  }
});
```

Check the example-directory of this repository for a full working example

Pitfalls
--------

Unfortunately pdf.js isn't too friendly for commonjs environments so react-pdf
assumes a global `PDFJS` variable, see the example directory of this repository
for an example.


License
-------

The MIT License

Author
------

Niklas Närhinen <niklas@narhinen.net>
