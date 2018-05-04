![downloads](https://img.shields.io/npm/dt/react-pdf.svg) ![build](https://img.shields.io/travis/wojtekmaj/react-pdf/master.svg) ![dependencies](https://img.shields.io/david/wojtekmaj/react-pdf.svg
) ![dev dependencies](https://img.shields.io/david/dev/wojtekmaj/react-pdf.svg
) [![tested with jest](https://img.shields.io/badge/tested_with-jest-99424f.svg)](https://github.com/facebook/jest)

# React-PDF

Display PDFs in your React app as easily as if they were images.

## tl;dr
* Install by executing `npm install react-pdf` or `yarn add react-pdf`.
* Import by adding `import { Document } from 'react-pdf'`.
* Use by adding `<Document file="..." />`. `file` can be a URL, base64 content, Uint8Array, and more.
* Put `<Page />` components inside `<Document />` to render pages.

## Demo

Minimal demo page is included in sample directory.

[Online demo](http://projects.wojtekmaj.pl/react-pdf/) is also available!

## Before you continue

React-PDF is under constant development. This documentation is written for React-PDF 4.x branch. If you want to see documentation for other versions of React-PDF, use dropdown on top of GitHub page to switch to an appropriate tag. Here are quick links to the newest docs from each branch:

* [v3.x](https://github.com/wojtekmaj/react-pdf/blob/v3.0.4/README.md)
* [v2.x](https://github.com/wojtekmaj/react-pdf/blob/v2.5.3/README.md)
* [v1.x](https://github.com/wojtekmaj/react-pdf/blob/v1.8.3/README.md)

## Getting started

### Compatibility

To use the latest version of React-PDF, your project needs to use React 16.3 or later.

If you use older version of React, please refer to the table below to find suitable React-PDF version. Don't worry - as long as you're running React 15.5 or later, you won't be missing out a lot!

| React version | Newest compatible React-PDF version |
|-------|--------|
| ≥16.3 | 4.x    |
| ≥15.5 | 3.x    |
| ≥0.13 | 0.0.10 |
| ≥0.11 | 0.0.4  |

### Installation

Add React-PDF to your project by executing `npm install react-pdf` or `yarn add react-pdf`.

### Usage

Here's an example of basic usage:

```js
import React, { Component } from 'react';
import { Document, Page } from 'react-pdf';

class MyApp extends Component {
  state = {
    numPages: null,
    pageNumber: 1,
  }

  onDocumentLoad = ({ numPages }) => {
    this.setState({ numPages });
  }

  render() {
    const { pageNumber, numPages } = this.state;

    return (
      <div>
        <Document
          file="somefile.pdf"
          onLoadSuccess={this.onDocumentLoad}
        >
          <Page pageNumber={pageNumber} />
        </Document>
        <p>Page {pageNumber} of {numPages}</p>
      </div>
    );
  }
}
```

Check the sample directory of this repository for a full working example.

### Enable PDF.js worker

It is crucial for performance to use PDF.js worker whenever possible. This ensures that your PDF file will be rendered in a separate thread without affecting page performance. To make things a little easier, we've prepared several entry points you can use.

#### Webpack

If you use Webpack, you're in luck. Instead of directly importing/requiring `'react-pdf'`, import it like so:

```js
import { Document } from 'react-pdf/dist/entry.webpack';
```

…and you're all set!

#### Parcel

If you use Parcel, it's not a problem either. Instead of directly importing/requiring `'react-pdf'`, import it like so:

```js
import { Document } from 'react-pdf/dist/entry.parcel';
```

…and you're done!

#### Browserify and others

If you use Browserify or other bundling tools, you will have to make sure on your own that `pdf.worker.js` file from `pdfjs-dist/build` is copied to your project's output folder.

### Support for annotations

If you want to use annotations (e.g. links) in PDFs rendered by React-PDF, then you would need to include stylesheet necessary for annotations to be correctly displayed like so:

```js
import 'react-pdf/dist/Page/AnnotationLayer.css';
```

### Support for non-latin characters

If you want to ensure that PDFs with non-latin characters will render perfectly, or you have encountered the following warning:

```
Warning: The CMap "baseUrl" parameter must be specified, ensure that the "cMapUrl" and "cMapPacked" API parameters are provided.
```

then you would also need to include cMaps in your build and tell React-PDF where they are.

#### Copying cMaps

First, you need to copy cMaps from `pdfjs-dist` (React-PDF's dependency - it should be in your `node_modules` if you have React-PDF installed). cMaps are located in `pdfjs-dist/cmaps`.

##### Webpack

Add `copy-webpack-plugin` to your project if you haven't already:

```
npm install copy-webpack-plugin --save-dev
```

Now, in your Webpack config, import the plugin:

```js
import CopyWebpackPlugin from 'copy-webpack-plugin';
```

and in plugins section of your config, add the following:

```js
new CopyWebpackPlugin([
  {
    from: 'node_modules/pdfjs-dist/cmaps/',
    to: 'cmaps/'
  },
]),
```

##### Parcel, Browserify and others

If you use Parcel, Browserify or other bundling tools, you will have to make sure on your own that cMaps are copied to your project's output folder.

#### Setting up React-PDF

Now that you have cMaps in your build, pass required options to Document component by using `options` prop, like so:

```js
<Document
  options={{
    cMapUrl: 'cmaps/',
    cMapPacked: true,
  }}
/>
```

## User guide

### Document

Loads a document passed using `file` prop.

#### Props

|Prop name|Description|Example values|
|----|----|----|
|className|Defines custom class name(s), that will be added to rendered element along with the default `react-pdf__Document`.|<ul><li>String:<br />`"custom-class-name-1 custom-class-name-2"`</li><li>Array of strings:<br />`["custom-class-name-1", "custom-class-name-2"]`</li></ul>|
|error|Defines what the component should display in case of an error. Defaults to "Failed to load PDF file.".|<ul><li>String:<br />`"An error occurred!"`</li><li>React element:<br />`<div>An error occurred!</div>`</li><li>Function:<br />`this.renderError()`</li></ul>|
|file|Defines what PDF should be displayed.<br />Its value can be an URL, a file (imported using `import ... from ...` or from file input form element), or an object with parameters (`url` - URL; `data` - data, preferably Uint8Array; `range` - PDFDataRangeTransport; `httpHeaders` - custom request headers, e.g. for authorization), `withCredentials` - a boolean to indicate whether or not to include cookies in the request (defaults to `false`).|<ul><li>URL:<br />`"http://example.com/sample.pdf"`</li><li>File:<br />`import sample from '../static/sample.pdf'` and then<br />`sample`</li><li>Parameter object:<br />`{ url: 'http://example.com/sample.pdf', httpHeaders: { 'X-CustomHeader': '40359820958024350238508234' }, withCredentials: true }`</ul>|
|inputRef|A function that behaves like ref, but it's passed to main `<div>` rendered by `<Document>` component.|`(ref) => { this.myDocument = ref; }`|
|loading|Defines what the component should display while loading. Defaults to "Loading PDF…".|<ul><li>String:<br />`"Please wait!"`</li><li>React element:<br />`<div>Please wait!</div>`</li><li>Function:<br />`this.renderLoader()`</li></ul>|
|noData|Defines what the component should display in case of no data. Defaults to "No PDF file specified.".|<ul><li>String:<br />`"Please select a file."`</li><li>React element:<br />`<div>Please select a file.</div>`</li><li>Function:<br />`this.renderNoData()`</li></ul>|
|onItemClick|Function called when an item has been clicked. Usually, you would like to use this callback to move the user wherever they requested to.|`({ pageNumber }) => alert('Clicked an item from page ' + pageNumber + '!')`|
|onLoadError|Function called in case of an error while loading a document.|`(error) => alert('Error while loading document! ' + error.message)`|
|onLoadSuccess|Function called when the document is successfully loaded.|`(pdf) => alert('Loaded a file with ' + pdf.numPages + ' pages!')`|
|onSourceError|Function called in case of an error while retrieving document source from `file` prop.|`(error) => alert('Error while retreiving document source! ' + error.message)`|
|onSourceSuccess|Function called when document source is successfully retreived from `file` prop.|`() => alert('Document source retreived!')`|
|options|An object in which additional parameters to be passed to PDF.js can be defined. For a full list of possible parameters, check [PDF.js documentation on DocumentInitParameters](https://mozilla.github.io/pdf.js/api/draft/global.html#DocumentInitParameters).|`{ cMapUrl: 'cmaps/', cMapPacked: true }`|
|rotate|Defines the rotation of the document in degrees. If provided, will change rotation globally, even for the pages which were given `rotate` prop of their own. 90 = rotated to the right, 180 = upside down, 270 = rotated to the left.|`90`|

### Page

Displays a page. Must be placed inside `<Document />` or have `pdf` prop passed, which can be obtained from `<Document />`'s `onLoadSuccess` callback function.

**Note:** `<Page/>` must be a direct child of `<Document />` component. `<Document />` passes necessary props only to its direct children. If you wish to put a component in between of `<Document />` and `<Page/>`, you must ensure to pass all the props to `<Page/>` component by yourself.

#### Props

|Prop name|Description|Example values|
|----|----|----|
|canvasStyle|A style object passed to the `<canvas>` element, allows a user to override the default inline styling.|`{ width: '100%', height: 'auto' }`|
|className|Defines custom class name(s), that will be added to rendered element along with the default `react-pdf__Page`.|<ul><li>String:<br />`"custom-class-name-1 custom-class-name-2"`</li><li>Array of strings:<br />`["custom-class-name-1", "custom-class-name-2"]`</li></ul>|
|customTextRenderer|A function that customizes how a text layer is rendered. Passes itext item and index for item.|`({ str, itemIndex }) => { return (<mark>{str}</mark>) }`|
|error|Defines what the component should display in case of an error. Defaults to "Failed to load the page.".|<ul><li>String:<br />`"An error occurred!"`</li><li>React element:<br />`<div>An error occurred!</div>`</li><li>Function:<br />`this.renderError()`</li></ul>|
|inputRef|A function that behaves like ref, but it's passed to main `<div>` rendered by `<Page>` component.|`(ref) => { this.myPage = ref; }`|
|loading|Defines what the component should display while loading. Defaults to "Loading page…".|<ul><li>String:<br />`"Please wait!"`</li><li>React element:<br />`<div>Please wait!</div>`</li><li>Function:<br />`this.renderLoader()`</li></ul>|
|noData|Defines what the component should display in case of no data. Defaults to "No page specified.".|<ul><li>String:<br />`"Please select a page."`</li><li>React element:<br />`<div>Please select a page.</div>`</li><li>Function:<br />`this.renderNoData()`</li></ul>|
|onLoadError|Function called in case of an error while loading the page.|`(error) => alert('Error while loading page! ' + error.message)`|
|onLoadSuccess|Function called when the page is successfully loaded.|`(page) => alert('Now displaying a page number ' + page.pageNumber + '!')`|
|onRenderError|Function called in case of an error while rendering the page.|`(error) => alert('Error while loading page! ' + error.message)`|
|onRenderSuccess|Function called when the page is successfully rendered on the screen.|`() => alert('Rendered the page!')`|
|onGetAnnotationsSuccess|Function called when annotations are successfully loaded.|`(annotations) => alert('Now displaying ' + annotations.length + ' annotations!')`|
|onGetAnnotationsError|Function called in case of an error while loading annotations.|`(error) => alert('Error while loading annotations! ' + error.message)`|
|onGetTextSuccess|Function called when text layer items are successfully loaded.|`(items) => alert('Now displaying ' + items.length + ' text layer items!')`|
|onGetTextError|Function called in case of an error while loading text layer items.|`(error) => alert('Error while loading text layer items! ' + error.message)`|
|pageIndex|Defines which page from PDF file should be displayed. Defaults to 0.|`0`|
|pageNumber|Defines which page from PDF file should be displayed. If provided, `pageIndex` prop will be ignored. Defaults to 1.|`1`|
|renderAnnotations|Defines whether annotations (e.g. links) should be rendered. Defaults to true.|`false`|
|renderInteractiveForms|Defines whether interactive forms should be rendered. Defaults to false.|`true`|
|renderTextLayer|Defines whether a text layer should be rendered. Defaults to true.|`false`|
|rotate|Defines the rotation of the page in degrees. 90 = rotated to the right, 180 = upside down, 270 = rotated to the left. Defaults to page's default setting, usually 0.|`90`|
|scale|Defines the scale in which PDF file should be rendered. Defaults to 1.0.|`0.5`|
|width|Defines the width of the page. If not defined, canvas will be rendered at the width defined in PDF. If you define `width` and `scale` at the same time, the width will be multiplied by a given factor.|`300`|

### Outline

Displays an outline (table of contents). Must be placed inside `<Document />` or have `pdf` prop passed, which can be obtained from `<Document />`'s `onLoadSuccess` callback function.

#### Props

|Prop name|Description|Example values|
|----|----|----|
|className|Defines custom class name(s), that will be added to rendered element along with the default `react-pdf__Outline`.|<ul><li>String:<br />`"custom-class-name-1 custom-class-name-2"`</li><li>Array of strings:<br />`["custom-class-name-1", "custom-class-name-2"]`</li></ul>|
|onItemClick|Function called when an item has been clicked. Usually, you would like to use this callback to move the user wherever they requested to.|`({ pageNumber }) => alert('Clicked an item from page ' + pageNumber + '!')`|
|onLoadError|Function called in case of an error while retreiving the outline.|`(error) => alert('Error while retreiving the outline! ' + error.message)`|
|onLoadSuccess|Function called when the outline is successfully retreived.|`() => alert('The outline has been successfully retreived.')`|
|onParseError|Function called in case of an error while parsing the outline.|`(error) => alert('Error while parsing the outline! ' + error.message)`|
|onParseSuccess|Function called when the outline is successfully parsed.|`({ outline }) => alert('There are ' + outline.length + ' top level items in the table of contents.')`|

## License

The MIT License.

## Author

<table>
  <tr>
    <td>
      <img src="https://github.com/wojtekmaj.png?s=100" width="100">
    </td>
    <td>
      Wojciech Maj<br />
      <a href="mailto:kontakt@wojtekmaj.pl">kontakt@wojtekmaj.pl</a><br />
      <a href="http://wojtekmaj.pl">http://wojtekmaj.pl</a>
    </td>
  </tr>
</table>

## Thank you

This project wouldn't be possible without awesome work of Niklas Närhinen <niklas@narhinen.net> who created its initial version and without Mozilla, author of [pdf.js](http://mozilla.github.io/pdf.js). Thank you!
