[![npm](https://img.shields.io/npm/v/react-pdf.svg)](https://www.npmjs.com/package/react-pdf) ![downloads](https://img.shields.io/npm/dt/react-pdf.svg) [![CI](https://github.com/wojtekmaj/react-pdf/actions/workflows/ci.yml/badge.svg)](https://github.com/wojtekmaj/react-pdf/actions)

# React-PDF

Display PDFs in your React app as easily as if they were images.

## Lost?

This package is used to _display_ existing PDFs. If you wish to _create_ PDFs using React, you may be looking for [@react-pdf/renderer](https://www.npmjs.com/package/@react-pdf/renderer).

## tl;dr

- Install by executing `npm install react-pdf` or `yarn add react-pdf`.
- Import by adding `import { Document } from 'react-pdf'`.
- Use by adding `<Document file="..." />`. `file` can be a URL, base64 content, Uint8Array, and more.
- Put `<Page />` components inside `<Document />` to render pages.
- Import stylesheets for [annotations](#support-for-annotations) and [text layer](#support-for-text-layer) if applicable.

## Demo

A minimal demo page can be found in `sample` directory.

[Online demo](https://projects.wojtekmaj.pl/react-pdf/) is also available!

## Before you continue

React-PDF is under constant development. This documentation is written for React-PDF 9.x branch. If you want to see documentation for other versions of React-PDF, use dropdown on top of GitHub page to switch to an appropriate tag. Here are quick links to the newest docs from each branch:

- [v9.x](https://github.com/wojtekmaj/react-pdf/blob/v9.x/packages/react-pdf/README.md)
- [v8.x](https://github.com/wojtekmaj/react-pdf/blob/v8.x/packages/react-pdf/README.md)
- [v7.x](https://github.com/wojtekmaj/react-pdf/blob/v7.x/packages/react-pdf/README.md)
- [v6.x](https://github.com/wojtekmaj/react-pdf/blob/v6.x/README.md)
- [v5.x](https://github.com/wojtekmaj/react-pdf/blob/v5.x/README.md)
- [v4.x](https://github.com/wojtekmaj/react-pdf/blob/v4.x/README.md)
- [v3.x](https://github.com/wojtekmaj/react-pdf/blob/v3.x/README.md)
- [v2.x](https://github.com/wojtekmaj/react-pdf/blob/v2.x/README.md)
- [v1.x](https://github.com/wojtekmaj/react-pdf/blob/v1.x/README.md)

## Getting started

### Compatibility

#### Browser support

React-PDF supports the latest versions of all major modern browsers.

Browser compatibility for React-PDF primarily depends on PDF.js support. For details, refer to the [PDF.js documentation](https://github.com/mozilla/pdf.js/wiki/Frequently-Asked-Questions#faq-support).

You may extend the list of supported browsers by providing additional polyfills (e.g. `Array.prototype.at`, `Promise.allSettled` or `Promise.withResolvers`) and configuring your bundler to transpile `pdfjs-dist`.

#### React

To use the latest version of React-PDF, your project needs to use React 16.8 or later.

#### Preact

React-PDF may be used with Preact.

### Installation

Add React-PDF to your project by executing `npm install react-pdf` or `yarn add react-pdf`.

#### Next.js

If you use Next.js prior to v15 (v15.0.0-canary.53, specifically), you may need to add the following to your `next.config.js`:

```diff
module.exports = {
+ swcMinify: false,
}
```

### Configure PDF.js worker

For React-PDF to work, PDF.js worker needs to be provided. You have several options.

#### Import worker (recommended)

For most cases, the following example will work:

```ts
import { pdfjs } from 'react-pdf';

pdfjs.GlobalWorkerOptions.workerSrc = new URL(
  'pdfjs-dist/build/pdf.worker.min.mjs',
  import.meta.url,
).toString();
```

> [!NOTE]
> In Next.js, make sure to skip SSR when importing the module you're using this code in. Here's how to do this in [Pages Router](https://nextjs.org/docs/pages/guides/lazy-loading#with-no-ssr) and [App Router](https://nextjs.org/docs/app/guides/lazy-loading#skipping-ssr).

> [!NOTE]
> pnpm requires an `.npmrc` file with `public-hoist-pattern[]=pdfjs-dist` for this to work.

<details>
<summary>See more examples</summary>

##### Parcel 2

For Parcel 2, you need to use a slightly different code:

```diff
 pdfjs.GlobalWorkerOptions.workerSrc = new URL(
-  'pdfjs-dist/build/pdf.worker.min.mjs',
+  'npm:pdfjs-dist/build/pdf.worker.min.mjs',
   import.meta.url,
 ).toString();
```

</details>

#### Copy worker to public directory

You will have to make sure on your own that `pdf.worker.mjs` file from `pdfjs-dist/build` is copied to your project's output folder.

For example, you could use a custom script like:

```ts
import path from 'node:path';
import fs from 'node:fs';

const pdfjsDistPath = path.dirname(require.resolve('pdfjs-dist/package.json'));
const pdfWorkerPath = path.join(pdfjsDistPath, 'build', 'pdf.worker.mjs');

fs.cpSync(pdfWorkerPath, './dist/pdf.worker.mjs', { recursive: true });
```

#### Use external CDN

```ts
import { pdfjs } from 'react-pdf';

pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;
```

### Usage

Here's an example of basic usage:

```tsx
import { useState } from 'react';
import { Document, Page } from 'react-pdf';

function MyApp() {
  const [numPages, setNumPages] = useState<number>();
  const [pageNumber, setPageNumber] = useState<number>(1);

  function onDocumentLoadSuccess({ numPages }: { numPages: number }): void {
    setNumPages(numPages);
  }

  return (
    <div>
      <Document file="somefile.pdf" onLoadSuccess={onDocumentLoadSuccess}>
        <Page pageNumber={pageNumber} />
      </Document>
      <p>
        Page {pageNumber} of {numPages}
      </p>
    </div>
  );
}
```

Check the [sample directory](https://github.com/wojtekmaj/react-pdf/tree/main/sample) in this repository for a full working example. For more examples and more advanced use cases, check [Recipes](https://github.com/wojtekmaj/react-pdf/wiki/Recipes) in [React-PDF Wiki](https://github.com/wojtekmaj/react-pdf/wiki/).

### Support for annotations

If you want to use annotations (e.g. links) in PDFs rendered by React-PDF, then you would need to include stylesheet necessary for annotations to be correctly displayed like so:

```ts
import 'react-pdf/dist/Page/AnnotationLayer.css';
```

### Support for text layer

If you want to use text layer in PDFs rendered by React-PDF, then you would need to include stylesheet necessary for text layer to be correctly displayed like so:

```ts
import 'react-pdf/dist/Page/TextLayer.css';
```

### Support for non-latin characters

If you want to ensure that PDFs with non-latin characters will render perfectly, or you have encountered the following warning:

```
Warning: The CMap "baseUrl" parameter must be specified, ensure that the "cMapUrl" and "cMapPacked" API parameters are provided.
```

then you would also need to include cMaps in your build and tell React-PDF where they are.

#### Copying cMaps

First, you need to copy cMaps from `pdfjs-dist` (React-PDF's dependency - it should be in your `node_modules` if you have React-PDF installed). cMaps are located in `pdfjs-dist/cmaps`.

##### Vite

Add [`vite-plugin-static-copy`](https://www.npmjs.com/package/vite-plugin-static-copy) by executing `npm install vite-plugin-static-copy --save-dev` or `yarn add vite-plugin-static-copy --dev` and add the following to your Vite config:

```diff
+import path from 'node:path';
+import { createRequire } from 'node:module';

-import { defineConfig } from 'vite';
+import { defineConfig, normalizePath } from 'vite';
+import { viteStaticCopy } from 'vite-plugin-static-copy';

+const require = createRequire(import.meta.url);
+
+const pdfjsDistPath = path.dirname(require.resolve('pdfjs-dist/package.json'));
+const cMapsDir = normalizePath(path.join(pdfjsDistPath, 'cmaps'));

export default defineConfig({
  plugins: [
+   viteStaticCopy({
+     targets: [
+       {
+         src: cMapsDir,
+         dest: '',
+       },
+     ],
+   }),
  ]
});
```

##### Webpack

Add [`copy-webpack-plugin`](https://www.npmjs.com/package/copy-webpack-plugin) by executing `npm install copy-webpack-plugin --save-dev` or `yarn add copy-webpack-plugin --dev` and add the following to your Webpack config:

```diff
+import path from 'node:path';
+import CopyWebpackPlugin from 'copy-webpack-plugin';

+const pdfjsDistPath = path.dirname(require.resolve('pdfjs-dist/package.json'));
+const cMapsDir = path.join(pdfjsDistPath, 'cmaps');

module.exports = {
  plugins: [
+   new CopyWebpackPlugin({
+     patterns: [
+       {
+         from: cMapsDir,
+         to: 'cmaps/'
+       },
+     ],
+   }),
  ],
};
```

##### Other tools

If you use other bundlers, you will have to make sure on your own that cMaps are copied to your project's output folder.

For example, you could use a custom script like:

```ts
import path from 'node:path';
import fs from 'node:fs';

const pdfjsDistPath = path.dirname(require.resolve('pdfjs-dist/package.json'));
const cMapsDir = path.join(pdfjsDistPath, 'cmaps');

fs.cpSync(cMapsDir, 'dist/cmaps/', { recursive: true });
```

#### Setting up React-PDF

Now that you have cMaps in your build, pass required options to Document component by using `options` prop, like so:

```ts
// Outside of React component
const options = {
  cMapUrl: '/cmaps/',
};

// Inside of React component
<Document options={options} />;
```

> [!NOTE]
> Make sure to define `options` object outside of your React component or use `useMemo` if you can't.

Alternatively, you could use cMaps from external CDN:

```tsx
// Outside of React component
import { pdfjs } from 'react-pdf';

const options = {
  cMapUrl: `https://unpkg.com/pdfjs-dist@${pdfjs.version}/cmaps/`,
};

// Inside of React component
<Document options={options} />;
```

### Support for JPEG 2000

If you want to ensure that JPEG 2000 images in PDFs will render, or you have encountered the following warning:

```
Warning: Unable to decode image "img_p0_1": "JpxError: OpenJPEG failed to initialize".
```

then you would also need to include wasm directory in your build and tell React-PDF where it is.

#### Copying wasm directory

First, you need to copy wasm from `pdfjs-dist` (React-PDF's dependency - it should be in your `node_modules` if you have React-PDF installed). cMaps are located in `pdfjs-dist/wasm`.

##### Vite

Add [`vite-plugin-static-copy`](https://www.npmjs.com/package/vite-plugin-static-copy) by executing `npm install vite-plugin-static-copy --save-dev` or `yarn add vite-plugin-static-copy --dev` and add the following to your Vite config:

```diff
+import path from 'node:path';
+import { createRequire } from 'node:module';

-import { defineConfig } from 'vite';
+import { defineConfig, normalizePath } from 'vite';
+import { viteStaticCopy } from 'vite-plugin-static-copy';

+const require = createRequire(import.meta.url);
+
+const pdfjsDistPath = path.dirname(require.resolve('pdfjs-dist/package.json'));
+const wasmDir = normalizePath(path.join(pdfjsDistPath, 'wasm'));

export default defineConfig({
  plugins: [
+   viteStaticCopy({
+     targets: [
+       {
+         src: wasmDir,
+         dest: '',
+       },
+     ],
+   }),
  ]
});
```

##### Webpack

Add [`copy-webpack-plugin`](https://www.npmjs.com/package/copy-webpack-plugin) by executing `npm install copy-webpack-plugin --save-dev` or `yarn add copy-webpack-plugin --dev` and add the following to your Webpack config:

```diff
+import path from 'node:path';
+import CopyWebpackPlugin from 'copy-webpack-plugin';

+const pdfjsDistPath = path.dirname(require.resolve('pdfjs-dist/package.json'));
+const wasmDir = path.join(pdfjsDistPath, 'wasm');

module.exports = {
  plugins: [
+   new CopyWebpackPlugin({
+     patterns: [
+       {
+         from: wasmDir,
+         to: 'wasm/'
+       },
+     ],
+   }),
  ],
};
```

##### Other tools

If you use other bundlers, you will have to make sure on your own that wasm directory is copied to your project's output folder.

For example, you could use a custom script like:

```ts
import path from 'node:path';
import fs from 'node:fs';

const pdfjsDistPath = path.dirname(require.resolve('pdfjs-dist/package.json'));
const wasmDir = path.join(pdfjsDistPath, 'wasm');

fs.cpSync(wasmDir, 'dist/wasm/', { recursive: true });
```

#### Setting up React-PDF

Now that you have wasm directory in your build, pass required options to Document component by using `options` prop, like so:

```ts
// Outside of React component
const options = {
  wasmUrl: '/wasm/',
};

// Inside of React component
<Document options={options} />;
```

> [!NOTE]
> Make sure to define `options` object outside of your React component or use `useMemo` if you can't.

Alternatively, you could use wasm directory from external CDN:

```tsx
// Outside of React component
import { pdfjs } from 'react-pdf';

const options = {
  wasmUrl: `https://unpkg.com/pdfjs-dist@${pdfjs.version}/wasm/`,
};

// Inside of React component
<Document options={options} />;
```

### Support for standard fonts

If you want to support PDFs using standard fonts (deprecated in PDF 1.5, but still around), ot you have encountered the following warning:

```
The standard font "baseUrl" parameter must be specified, ensure that the "standardFontDataUrl" API parameter is provided.
```

then you would also need to include standard fonts in your build and tell React-PDF where they are.

#### Copying fonts

First, you need to copy standard fonts from `pdfjs-dist` (React-PDF's dependency - it should be in your `node_modules` if you have React-PDF installed). Standard fonts are located in `pdfjs-dist/standard_fonts`.

##### Vite

Add [`vite-plugin-static-copy`](https://www.npmjs.com/package/vite-plugin-static-copy) by executing `npm install vite-plugin-static-copy --save-dev` or `yarn add vite-plugin-static-copy --dev` and add the following to your Vite config:

```diff
+import path from 'node:path';
+import { createRequire } from 'node:module';

-import { defineConfig } from 'vite';
+import { defineConfig, normalizePath } from 'vite';
+import { viteStaticCopy } from 'vite-plugin-static-copy';

+const require = createRequire(import.meta.url);
+const standardFontsDir = normalizePath(
+  path.join(path.dirname(require.resolve('pdfjs-dist/package.json')), 'standard_fonts')
+);

export default defineConfig({
  plugins: [
+   viteStaticCopy({
+     targets: [
+       {
+         src: standardFontsDir,
+         dest: '',
+       },
+     ],
+   }),
  ]
});
```

##### Webpack

Add [`copy-webpack-plugin`](https://www.npmjs.com/package/copy-webpack-plugin) by executing `npm install copy-webpack-plugin --save-dev` or `yarn add copy-webpack-plugin --dev` and add the following to your Webpack config:

```diff
+import path from 'node:path';
+import CopyWebpackPlugin from 'copy-webpack-plugin';

+const standardFontsDir = path.join(path.dirname(require.resolve('pdfjs-dist/package.json')), 'standard_fonts');

module.exports = {
  plugins: [
+   new CopyWebpackPlugin({
+     patterns: [
+       {
+         from: standardFontsDir,
+         to: 'standard_fonts/'
+       },
+     ],
+   }),
  ],
};
```

##### Other tools

If you use other bundlers, you will have to make sure on your own that standard fonts are copied to your project's output folder.

For example, you could use a custom script like:

```ts
import path from 'node:path';
import fs from 'node:fs';

const pdfjsDistPath = path.dirname(require.resolve('pdfjs-dist/package.json'));
const standardFontsDir = path.join(pdfjsDistPath, 'standard_fonts');

fs.cpSync(standardFontsDir, 'dist/standard_fonts/', { recursive: true });
```

#### Setting up React-PDF

Now that you have standard fonts in your build, pass required options to Document component by using `options` prop, like so:

```tsx
// Outside of React component
const options = {
  standardFontDataUrl: '/standard_fonts/',
};

// Inside of React component
<Document options={options} />;
```

> [!NOTE]
> Make sure to define `options` object outside of your React component or use `useMemo` if you can't.

Alternatively, you could use standard fonts from external CDN:

```tsx
// Outside of React component
import { pdfjs } from 'react-pdf';

const options = {
  standardFontDataUrl: `https://unpkg.com/pdfjs-dist@${pdfjs.version}/standard_fonts/`,
};

// Inside of React component
<Document options={options} />;
```

## User guide

### Document

Loads a document passed using `file` prop.

#### Props

| Prop name          | Description                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                  | Default value                                         | Example values                                                                                                                                                                                                                                                               |
| ------------------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| className          | Class name(s) that will be added to rendered element along with the default `react-pdf__Document`.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                           | n/a                                                   | <ul><li>String:<br />`"custom-class-name-1 custom-class-name-2"`</li><li>Array of strings:<br />`["custom-class-name-1", "custom-class-name-2"]`</li></ul>                                                                                                                   |
| error              | What the component should display in case of an error.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                       | `"Failed to load PDF file."`                          | <ul><li>String:<br />`"An error occurred!"`</li><li>React element:<br />`<p>An error occurred!</p>`</li><li>Function:<br />`this.renderError`</li></ul>                                                                                                                      |
| externalLinkRel    | Link rel for links rendered in annotations.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                  | `"noopener noreferrer nofollow"`                      | One of valid [values for `rel` attribute](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/a#attr-rel).<ul><li>`"noopener"`</li><li>`"noreferrer"`</li><li>`"nofollow"`</li><li>`"noopener noreferrer"`</li></ul>                                                   |
| externalLinkTarget | Link target for external links rendered in annotations.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      | unset, which means that default behavior will be used | One of valid [values for `target` attribute](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/a#attr-target).<ul><li>`"_self"`</li><li>`"_blank"`</li><li>`"_parent"`</li><li>`"_top"`</li></ul>                                                                    |
| file               | What PDF should be displayed.<br />Its value can be an URL, a file (imported using `import … from …` or from file input form element), or an object with parameters (`url` - URL; `data` - data, preferably Uint8Array; `range` - PDFDataRangeTransport.<br />**Warning**: Since equality check (`===`) is used to determine if `file` object has changed, it must be memoized by setting it in component's state, `useMemo` or other similar technique.                                                                                                                                                                                     | n/a                                                   | <ul><li>URL:<br />`"https://example.com/sample.pdf"`</li><li>File:<br />`import importedPdf from '../static/sample.pdf'` and then<br />`sample`</li><li>Parameter object:<br />`{ url: 'https://example.com/sample.pdf' }`</ul>                                              |
| imageResourcesPath | The path used to prefix the src attributes of annotation SVGs.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                               | n/a (pdf.js will fallback to an empty string)         | `"/public/images/"`                                                                                                                                                                                                                                                          |
| inputRef           | A prop that behaves like [ref](https://reactjs.org/docs/refs-and-the-dom.html), but it's passed to main `<div>` rendered by `<Document>` component.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                          | n/a                                                   | <ul><li>Function:<br />`(ref) => { this.myDocument = ref; }`</li><li>Ref created using `createRef`:<br />`this.ref = createRef();`<br />…<br />`inputRef={this.ref}`</li><li>Ref created using `useRef`:<br />`const ref = useRef();`<br />…<br />`inputRef={ref}`</li></ul> |
| loading            | What the component should display while loading.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                             | `"Loading PDF…"`                                      | <ul><li>String:<br />`"Please wait!"`</li><li>React element:<br />`<p>Please wait!</p>`</li><li>Function:<br />`this.renderLoader`</li></ul>                                                                                                                               |
| noData             | What the component should display in case of no data.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                        | `"No PDF file specified."`                            | <ul><li>String:<br />`"Please select a file."`</li><li>React element:<br />`<p>Please select a file.</p>`</li><li>Function:<br />`this.renderNoData`</li></ul>                                                                                                               |
| onItemClick        | Function called when an outline item or a thumbnail has been clicked. Usually, you would like to use this callback to move the user wherever they requested to.                                                                                                                                                                                                                                                                                                                                                                                                                                                                              | n/a                                                   | `({ dest, pageIndex, pageNumber }) => alert('Clicked an item from page ' + pageNumber + '!')`                                                                                                                                                                                |
| onLoadError        | Function called in case of an error while loading a document.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                | n/a                                                   | `(error) => alert('Error while loading document! ' + error.message)`                                                                                                                                                                                                         |
| onLoadProgress     | Function called, potentially multiple times, as the loading progresses.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      | n/a                                                   | `({ loaded, total }) => alert('Loading a document: ' + (loaded / total) * 100 + '%')`                                                                                                                                                                                        |
| onLoadSuccess      | Function called when the document is successfully loaded.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                    | n/a                                                   | `(pdf) => alert('Loaded a file with ' + pdf.numPages + ' pages!')`                                                                                                                                                                                                           |
| onPassword         | Function called when a password-protected PDF is loaded.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                     | Function that prompts the user for password.          | `(callback) => callback('s3cr3t_p4ssw0rd')`                                                                                                                                                                                                                                  |
| onSourceError      | Function called in case of an error while retrieving document source from `file` prop.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                       | n/a                                                   | `(error) => alert('Error while retrieving document source! ' + error.message)`                                                                                                                                                                                               |
| onSourceSuccess    | Function called when document source is successfully retrieved from `file` prop.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                             | n/a                                                   | `() => alert('Document source retrieved!')`                                                                                                                                                                                                                                  |
| options            | An object in which additional parameters to be passed to PDF.js can be defined. Most notably:<ul><li>`cMapUrl`;</li><li>`httpHeaders` - custom request headers, e.g. for authorization);</li><li>`withCredentials` - a boolean to indicate whether or not to include cookies in the request (defaults to `false`)</li></ul>For a full list of possible parameters, check [PDF.js documentation on DocumentInitParameters](https://mozilla.github.io/pdf.js/api/draft/module-pdfjsLib.html#~DocumentInitParameters).<br /><br />**Note**: Make sure to define options object outside of your React component or use `useMemo` if you can't. | n/a                                                   | `{ cMapUrl: '/cmaps/' }`                                                                                                                                                                                                                                                     |
| renderMode         | Rendering mode of the document. Can be `"canvas"`, `"custom"` or `"none"`. If set to `"custom"`, `customRenderer` must also be provided.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                     | `"canvas"`                                            | `"custom"`                                                                                                                                                                                                                                                                   |
| rotate             | Rotation of the document in degrees. If provided, will change rotation globally, even for the pages which were given `rotate` prop of their own. `90` = rotated to the right, `180` = upside down, `270` = rotated to the left.                                                                                                                                                                                                                                                                                                                                                                                                              | n/a                                                   | `90`                                                                                                                                                                                                                                                                         |
| scale              | Document scale.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                              | `1`                                                   | `0.5`                                                                                                                                                                                                                                                                        |

### Page

Displays a page. Should be placed inside `<Document />`. Alternatively, it can have `pdf` prop passed, which can be obtained from `<Document />`'s `onLoadSuccess` callback function, however some advanced functions like rendering annotations and linking between pages inside a document may not be working correctly.

#### Props

| Prop name                      | Description                                                                                                                                                                                                                                                                                      | Default value                                       | Example values                                                                                                                                                                                                                                                             |
| ------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | --------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| canvasBackground               | Canvas background color. Any valid `canvas.fillStyle` can be used.                                                                                                                                                                                                                               | n/a                                                 | `"transparent"`                                                                                                                                                                                                                                                            |
| canvasRef                      | A prop that behaves like [ref](https://reactjs.org/docs/refs-and-the-dom.html), but it's passed to `<canvas>` rendered by `<Canvas>` component.                                                                                                                                                  | n/a                                                 | <ul><li>Function:<br />`(ref) => { this.myCanvas = ref; }`</li><li>Ref created using `createRef`:<br />`this.ref = createRef();`<br />…<br />`inputRef={this.ref}`</li><li>Ref created using `useRef`:<br />`const ref = useRef();`<br />…<br />`inputRef={ref}`</li></ul> |
| className                      | Class name(s) that will be added to rendered element along with the default `react-pdf__Page`.                                                                                                                                                                                                   | n/a                                                 | <ul><li>String:<br />`"custom-class-name-1 custom-class-name-2"`</li><li>Array of strings:<br />`["custom-class-name-1", "custom-class-name-2"]`</li></ul>                                                                                                                 |
| customRenderer                 | Function that customizes how a page is rendered. You must set `renderMode` to `"custom"` to use this prop.                                                                                                                                                                                       | n/a                                                 | `MyCustomRenderer`                                                                                                                                                                                                                                                         |
| customTextRenderer             | Function that customizes how a text layer is rendered.                                                                                                                                                                                                                                           | n/a                                                 | ``({ str, itemIndex }) => str.replace(/ipsum/g, value => `<mark>${value}</mark>`)``                                                                                                                                                                                        |
| devicePixelRatio               | The ratio between physical pixels and device-independent pixels (DIPs) on the current device.                                                                                                                                                                                                    | `window.devicePixelRatio`                           | `1`                                                                                                                                                                                                                                                                        |
| error                          | What the component should display in case of an error.                                                                                                                                                                                                                                           | `"Failed to load the page."`                        | <ul><li>String:<br />`"An error occurred!"`</li><li>React element:<br />`<p>An error occurred!</p>`</li><li>Function:<br />`this.renderError`</li></ul>                                                                                                                    |
| height                         | Page height. If neither `height` nor `width` are defined, page will be rendered at the size defined in PDF. If you define `width` and `height` at the same time, `height` will be ignored. If you define `height` and `scale` at the same time, the height will be multiplied by a given factor. | Page's default height                               | `300`                                                                                                                                                                                                                                                                      |
| imageResourcesPath             | The path used to prefix the src attributes of annotation SVGs.                                                                                                                                                                                                                                   | n/a (pdf.js will fallback to an empty string)       | `"/public/images/"`                                                                                                                                                                                                                                                        |
| inputRef                       | A prop that behaves like [ref](https://reactjs.org/docs/refs-and-the-dom.html), but it's passed to main `<div>` rendered by `<Page>` component.                                                                                                                                                  | n/a                                                 | <ul><li>Function:<br />`(ref) => { this.myPage = ref; }`</li><li>Ref created using `createRef`:<br />`this.ref = createRef();`<br />…<br />`inputRef={this.ref}`</li><li>Ref created using `useRef`:<br />`const ref = useRef();`<br />…<br />`inputRef={ref}`</li></ul>   |
| loading                        | What the component should display while loading.                                                                                                                                                                                                                                                 | `"Loading page…"`                                   | <ul><li>String:<br />`"Please wait!"`</li><li>React element:<br />`<p>Please wait!</p>`</li><li>Function:<br />`this.renderLoader`</li></ul>                                                                                                                               |
| noData                         | What the component should display in case of no data.                                                                                                                                                                                                                                            | `"No page specified."`                              | <ul><li>String:<br />`"Please select a page."`</li><li>React element:<br />`<p>Please select a page.</p>`</li><li>Function:<br />`this.renderNoData`</li></ul>                                                                                                             |
| onGetAnnotationsError          | Function called in case of an error while loading annotations.                                                                                                                                                                                                                                   | n/a                                                 | `(error) => alert('Error while loading annotations! ' + error.message)`                                                                                                                                                                                                    |
| onGetAnnotationsSuccess        | Function called when annotations are successfully loaded.                                                                                                                                                                                                                                        | n/a                                                 | `(annotations) => alert('Now displaying ' + annotations.length + ' annotations!')`                                                                                                                                                                                         |
| onGetStructTreeError           | Function called in case of an error while loading structure tree.                                                                                                                                                                                                                                | n/a                                                 | `(error) => alert('Error while loading structure tree! ' + error.message)`                                                                                                                                                                                                 |
| onGetStructTreeSuccess         | Function called when structure tree is successfully loaded.                                                                                                                                                                                                                                      | n/a                                                 | `(structTree) => alert(JSON.stringify(structTree))`                                                                                                                                                                                                                        |
| onGetTextError                 | Function called in case of an error while loading text layer items.                                                                                                                                                                                                                              | n/a                                                 | `(error) => alert('Error while loading text layer items! ' + error.message)`                                                                                                                                                                                               |
| onGetTextSuccess               | Function called when text layer items are successfully loaded.                                                                                                                                                                                                                                   | n/a                                                 | `({ items, styles }) => alert('Now displaying ' + items.length + ' text layer items!')`                                                                                                                                                                                    |
| onLoadError                    | Function called in case of an error while loading the page.                                                                                                                                                                                                                                      | n/a                                                 | `(error) => alert('Error while loading page! ' + error.message)`                                                                                                                                                                                                           |
| onLoadSuccess                  | Function called when the page is successfully loaded.                                                                                                                                                                                                                                            | n/a                                                 | `(page) => alert('Now displaying a page number ' + page.pageNumber + '!')`                                                                                                                                                                                                 |
| onRenderAnnotationLayerError   | Function called in case of an error while rendering the annotation layer.                                                                                                                                                                                                                        | n/a                                                 | `(error) => alert('Error while loading annotation layer! ' + error.message)`                                                                                                                                                                                               |
| onRenderAnnotationLayerSuccess | Function called when annotations are successfully rendered on the screen.                                                                                                                                                                                                                        | n/a                                                 | `() => alert('Rendered the annotation layer!')`                                                                                                                                                                                                                            |
| onRenderError                  | Function called in case of an error while rendering the page.                                                                                                                                                                                                                                    | n/a                                                 | `(error) => alert('Error while loading page! ' + error.message)`                                                                                                                                                                                                           |
| onRenderSuccess                | Function called when the page is successfully rendered on the screen.                                                                                                                                                                                                                            | n/a                                                 | `() => alert('Rendered the page!')`                                                                                                                                                                                                                                        |
| onRenderTextLayerError         | Function called in case of an error while rendering the text layer.                                                                                                                                                                                                                              | n/a                                                 | `(error) => alert('Error while rendering text layer! ' + error.message)`                                                                                                                                                                                                   |
| onRenderTextLayerSuccess       | Function called when the text layer is successfully rendered on the screen.                                                                                                                                                                                                                      | n/a                                                 | `() => alert('Rendered the text layer!')`                                                                                                                                                                                                                                  |
| pageIndex                      | Which page from PDF file should be displayed, by page index. Ignored if `pageNumber` prop is provided.                                                                                                                                                                                           | `0`                                                 | `1`                                                                                                                                                                                                                                                                        |
| pageNumber                     | Which page from PDF file should be displayed, by page number. If provided, `pageIndex` prop will be ignored.                                                                                                                                                                                     | `1`                                                 | `2`                                                                                                                                                                                                                                                                        |
| pdf                            | pdf object obtained from `<Document />`'s `onLoadSuccess` callback function.                                                                                                                                                                                                                     | (automatically obtained from parent `<Document />`) | `pdf`                                                                                                                                                                                                                                                                      |
| renderAnnotationLayer          | Whether annotations (e.g. links) should be rendered.                                                                                                                                                                                                                                             | `true`                                              | `false`                                                                                                                                                                                                                                                                    |
| renderForms                    | Whether forms should be rendered. `renderAnnotationLayer` prop must be set to `true`.                                                                                                                                                                                                            | `false`                                             | `true`                                                                                                                                                                                                                                                                     |
| renderMode                     | Rendering mode of the document. Can be `"canvas"`, `"custom"` or `"none"`. If set to `"custom"`, `customRenderer` must also be provided.                                                                                                                                                         | `"canvas"`                                          | `"custom"`                                                                                                                                                                                                                                                                 |
| renderTextLayer                | Whether a text layer should be rendered.                                                                                                                                                                                                                                                         | `true`                                              | `false`                                                                                                                                                                                                                                                                    |
| rotate                         | Rotation of the page in degrees. `90` = rotated to the right, `180` = upside down, `270` = rotated to the left.                                                                                                                                                                                  | Page's default setting, usually `0`                 | `90`                                                                                                                                                                                                                                                                       |
| scale                          | Page scale.                                                                                                                                                                                                                                                                                      | `1`                                                 | `0.5`                                                                                                                                                                                                                                                                      |
| width                          | Page width. If neither `height` nor `width` are defined, page will be rendered at the size defined in PDF. If you define `width` and `height` at the same time, `height` will be ignored. If you define `width` and `scale` at the same time, the width will be multiplied by a given factor.    | Page's default width                                | `300`                                                                                                                                                                                                                                                                      |

### Outline

Displays an outline (table of contents). Should be placed inside `<Document />`. Alternatively, it can have `pdf` prop passed, which can be obtained from `<Document />`'s `onLoadSuccess` callback function.

#### Props

| Prop name     | Description                                                                                                                                        | Default value | Example values                                                                                                                                                                                                                                                              |
| ------------- | -------------------------------------------------------------------------------------------------------------------------------------------------- | ------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| className     | Class name(s) that will be added to rendered element along with the default `react-pdf__Outline`.                                                  | n/a           | <ul><li>String:<br />`"custom-class-name-1 custom-class-name-2"`</li><li>Array of strings:<br />`["custom-class-name-1", "custom-class-name-2"]`</li></ul>                                                                                                                  |
| inputRef      | A prop that behaves like [ref](https://reactjs.org/docs/refs-and-the-dom.html), but it's passed to main `<div>` rendered by `<Outline>` component. | n/a           | <ul><li>Function:<br />`(ref) => { this.myOutline = ref; }`</li><li>Ref created using `createRef`:<br />`this.ref = createRef();`<br />…<br />`inputRef={this.ref}`</li><li>Ref created using `useRef`:<br />`const ref = useRef();`<br />…<br />`inputRef={ref}`</li></ul> |
| onItemClick   | Function called when an outline item has been clicked. Usually, you would like to use this callback to move the user wherever they requested to.   | n/a           | `({ dest, pageIndex, pageNumber }) => alert('Clicked an item from page ' + pageNumber + '!')`                                                                                                                                                                               |
| onLoadError   | Function called in case of an error while retrieving the outline.                                                                                  | n/a           | `(error) => alert('Error while retrieving the outline! ' + error.message)`                                                                                                                                                                                                  |
| onLoadSuccess | Function called when the outline is successfully retrieved.                                                                                        | n/a           | `(outline) => alert('The outline has been successfully retrieved.')`                                                                                                                                                                                                        |

### Thumbnail

Displays a thumbnail of a page. Does not render the annotation layer or the text layer. Does not register itself as a link target, so the user will not be scrolled to a Thumbnail component when clicked on an internal link (e.g. in Table of Contents). When clicked, attempts to navigate to the page clicked (similarly to a link in Outline). Should be placed inside `<Document />`. Alternatively, it can have `pdf` prop passed, which can be obtained from `<Document />`'s `onLoadSuccess` callback function.

#### Props

Props are the same as in `<Page />` component, but certain annotation layer and text layer-related props are not available:

- customTextRenderer
- onGetAnnotationsError
- onGetAnnotationsSuccess
- onGetTextError
- onGetTextSuccess
- onRenderAnnotationLayerError
- onRenderAnnotationLayerSuccess
- onRenderTextLayerError
- onRenderTextLayerSuccess
- renderAnnotationLayer
- renderForms
- renderTextLayer

On top of that, additional props are available:

| Prop name   | Description                                                                                                                                  | Default value | Example values                                                                                                                                             |
| ----------- | -------------------------------------------------------------------------------------------------------------------------------------------- | ------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------- |
| className   | Class name(s) that will be added to rendered element along with the default `react-pdf__Thumbnail`.                                          | n/a           | <ul><li>String:<br />`"custom-class-name-1 custom-class-name-2"`</li><li>Array of strings:<br />`["custom-class-name-1", "custom-class-name-2"]`</li></ul> |
| onItemClick | Function called when a thumbnail has been clicked. Usually, you would like to use this callback to move the user wherever they requested to. | n/a           | `({ dest, pageIndex, pageNumber }) => alert('Clicked an item from page ' + pageNumber + '!')`                                                              |

## Useful links

- [React-PDF Wiki](https://github.com/wojtekmaj/react-pdf/wiki/)

## License

The MIT License.

## Author

<table>
  <tr>
    <td >
      <img src="https://avatars.githubusercontent.com/u/5426427?v=4&s=128" width="64" height="64" alt="Wojciech Maj">
    </td>
    <td>
      <a href="https://github.com/wojtekmaj">Wojciech Maj</a>
    </td>
  </tr>
</table>

## Thank you

This project wouldn't be possible without the awesome work of [Niklas Närhinen](https://github.com/nnarhinen) who created its original version and without Mozilla, author of [pdf.js](http://mozilla.github.io/pdf.js). Thank you!

### Sponsors

Thank you to all our sponsors! [Become a sponsor](https://opencollective.com/react-pdf-wojtekmaj#sponsor) and get your image on our README on GitHub.

<a href="https://opencollective.com/react-pdf-wojtekmaj#sponsors" target="_blank"><img src="https://opencollective.com/react-pdf-wojtekmaj/sponsors.svg?width=890"></a>

### Backers

Thank you to all our backers! [Become a backer](https://opencollective.com/react-pdf-wojtekmaj#backer) and get your image on our README on GitHub.

<a href="https://opencollective.com/react-pdf-wojtekmaj#backers" target="_blank"><img src="https://opencollective.com/react-pdf-wojtekmaj/backers.svg?width=890"></a>

### Top Contributors

Thank you to all our contributors that helped on this project!

![Top Contributors](https://opencollective.com/react-pdf/contributors.svg?width=890&button=false)
