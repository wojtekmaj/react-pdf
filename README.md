# React-PDF
Easily display PDF files in your React application.

## tl;dr
* Install by executing `npm install --save react-pdf`.
* Import by addding `import ReactPDF from 'react-pdf'`.
* Use by adding `<ReactPDF file="..." />`. `file` can be an URL, base64 content, Uint8Array, and more.

## Demo
Demo page is included in sample directory.

[Online demo](http://projekty.wojtekmaj.pl/react-pdf/) is also available!

## Getting started
### Prerequisites

You'll need to have Node >= 4 on your machine.

We strongly recommend to use Node >= 6 and npm >= 3 for faster installation speed and better disk usage.

Your project needs to use React 15.0.0 or later.

### Installation

Add React-PDF to your project by executing `npm install --save react-pdf`.

### Usage

Here's an example of basic usage:

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
                    pageIndex={2}
                    onDocumentLoad={this.onDocumentLoad}
                    onPageLoad={this.onPageLoad}
                />
                <p>Page {this.state.pageNumber} of {this.state.total}</p>
            </div>
        );
    },
}
```

Check the sample directory of this repository for a full working example.

## User guide

### Props

|Prop name|Description|Example of usage|
|----|----|----|
|file|Defines what PDF should be displayed.<br />Its value can be an URL, a file (imported using `import ... from ...` or from file input form element), or an object with parameters (`url` - URL; `data` - data, preferably Uint8Array; `range` - PDFDataRangeTransport; `httpHeaders` - custom request headers, e.g. for authorization).|<ul><li>URL:<br />`file="http://example.com/sample.pdf"`</li><li>File:<br />`import sample from '../static/sample.pdf'` and then<br />`file={sample}`</li><li>Parameter object:<br />`file={{ url: 'http://example.com/sample.pdf', httpHeaders: { 'X-CustomHeader': '40359820958024350238508234' }}}`</ul>|
|loading|Defines what the component should display while loading. Defaults to "Loading PDF…".|<ul><li>String:<br />`loading="Please wait!"`</li><li>React element:<Br />`loading={<div>Please wait!</div>}`</li><li>Function:<Br />`loading={this.renderLoader()}`</li></ul>|
|error|Defines what the component should display in case of an error. Defaults to "Failed to load PDF file.".|<ul><li>String:<br />`error="An error occurred!"`</li><li>React element:<Br />`error={<div>An error occurred!</div>}`</li><li>Function:<Br />`error={this.renderError()}`</li></ul>|
|noData|Defines what the component should display in case of no data. Defaults to "No PDF file specified.".|<ul><li>String:<br />`error="Please select a file."`</li><li>React element:<Br />`error={<div>Please select a file.</div>}`</li><li>Function:<Br />`error={this.renderNoData()}`</li></ul>|
|pageIndex|Defines which page from PDF file should be displayed. Defaults to 0.|`pageIndex={2}`|
|scale|Defines the scale in which PDF file should be rendered. Defaults to 1.0.|`scale={0.5}`|
|width|Defines the width of the page. If not defined, canvas will be rendered at the width defined in PDF. If you define `width` and `scale` at the same time, the width will be multiplied by a given factor.|`width={300}`|
|onDocumentLoad|Function called when the document is successfully loaded to the memory.|`onDocumentLoad={({ total }) => alert('Loaded a file with ' + total + ' pages!')}`|
|onDocumentError|Function called in case of an error while loading a document.|`onDocumentError={({ message }) => alert('Error while loading document! ' + message)}`|
|onPageLoad|Function called when the page is successfully loaded to the memory.|`onPageLoad={({ pageIndex, pageNumber, width, height, originalWidth, originalHeight, scale }) => alert('Now displaying a page number ' + pageNumber + '!')}`|
|onPageRender|Function called when the page is successfully rendered on the screen.|`onPageLoad={() => alert('Rendered the page!')}`|
|onPageError|Function called in case of an error while rendering a page.|`onPageError={({ message }) => alert('Error while loading page! ' + message)}`|

## License

The MIT License

## Author
Wojciech Maj<br />
<kontakt@wojtekmaj.pl><br />
[wojtekmaj.pl](http://wojtekmaj.pl)

This project wouldn't be possible without awesome work of Niklas Närhinen <niklas@narhinen.net> who created its initial version and without Mozilla, author of [pdf.js](http://mozilla.github.io/pdf.js). Thank you!
