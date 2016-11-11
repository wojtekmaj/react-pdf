react-pdf
=========

What
----

A component for showing a pdf page using [pdf.js](http://mozilla.github.io/pdf.js).

Usage
-----

Install with `npm install --save react-pdf`

Use in your app:

```js
import ReactPDF from 'react-pdf';

class MyApp extends React.Component {
    onDocumentLoad({ total }) {
        this.setState({ total });
    },
    onPageLoad({ pageIndex, pageNumber }) {
        this.setState({{ pageIndex, pageNumber });
    }
    render() {
        return (
            <div>
                <ReactPDF
                    file="somefile.pdf"
                    page={2}
                    onDocumentLoad={this.onDocumentLoad}
                    onPageLoad={this.onPageLoad}
                />
                <p>Page {this.state.pageNumber} of {this.state.total}</p>
            </div>
        );
    },
}
```

Check the sample drectory of this repository for a full working example.

License
-------

The MIT License

Author
------

Wojciech Maj <kontakt@wojtekmaj.pl>

Based on an awesome work of Niklas Närhinen <niklas@narhinen.net>
