import React, { Component, PropTypes } from 'react';

require('pdfjs-dist/web/compatibility');
require('pdfjs-dist/build/pdf');
PDFJS.workerSrc = require('pdfjs-dist/build/pdf.worker.js');

PDFJS.disableWorker = true;

export default class ReactPDF extends Component {
  state = {
    pdf: null,
    page: null,
  }

  componentDidMount() {
    this.handleFileLoad();
  }

  componentWillReceiveProps(nextProps) {
    if (this.isParameterObject(nextProps.file)) {
      // File is a parameter object
      if (
        (nextProps.file && !this.props.file) ||
        nextProps.file.data !== this.props.file.data ||
        nextProps.file.range !== this.props.file.range ||
        nextProps.file.url !== this.props.file.url
      ) {
        this.handleFileLoad(nextProps);
        return;
      }
    } else if (nextProps.file && nextProps.file !== this.props.file) {
      // File is a normal object or not an object at all
      this.handleFileLoad(nextProps);
      return;
    }

    if (
      this.state.pdf &&
      typeof nextProps.pageIndex !== 'undefined' &&
      nextProps.pageIndex !== this.props.pageIndex
    ) {
      this.loadPage(nextProps.pageIndex);
    }
  }

  shouldComponentUpdate(nextProps, nextState) {
    return (
      nextState.pdf !== this.state.pdf ||
      nextState.page !== this.state.page ||
      nextProps.width !== this.props.width ||
      nextProps.scale !== this.props.scale
    );
  }

  /**
   * Called when a document is loaded successfully.
   */
  onDocumentLoad = (pdf) => {
    this.callIfDefined(
      this.props.onDocumentLoad,
      {
        total: pdf.numPages,
      },
    );

    this.setState({ pdf });

    this.loadPage(this.props.pageIndex);
  }

  /**
   * Called when a document fails to load.
   */
  onDocumentError = (error) => {
    this.callIfDefined(
      this.props.onDocumentError,
      error,
    );

    this.setState({ pdf: false });
  }

  /**
   * Called when a page is loaded successfully.
   */
  onPageLoad = (page) => {
    const scale = this.getPageScale(page);

    this.callIfDefined(
      this.props.onPageLoad,
      {
        pageIndex: page.pageIndex,
        pageNumber: page.pageNumber,
        get width() { return page.view[2] * scale; },
        get height() { return page.view[3] * scale; },
        scale,
        get originalWidth() { return page.view[2]; },
        get originalHeight() { return page.view[3]; },
      },
    );

    this.setState({ page });
  }

  /**
   * Called when a page is rendered successfully.
   */
  onPageRender = () => {
    this.renderer = null;

    this.callIfDefined(this.props.onPageRender);
  }

  /**
   * Called when a page fails to load or render.
   */
  onPageError = (error) => {
    this.callIfDefined(
      this.props.onPageError,
      error,
    );

    this.setState({ page: false });
  }

  getPageScale(page = this.state.page) {
    const { scale, width } = this.props;

    // Be default, we'll render page at 100% * scale width.
    let pageScale = 1;

    // If width is defined, calculate the scale of the page so it could be of desired width.
    if (width) {
      pageScale = width / page.getViewport(scale).width;
    }

    return scale * pageScale;
  }

  callIfDefined = (fn, args) => {
    if (fn && typeof fn === 'function') {
      fn(args);
    }
  }

  displayCORSWarning = () => {
    // eslint-disable-next-line no-console
    console.warn('Loading PDF as base64 strings/URLs might not work on protocols other than HTTP/HTTPS. On Google Chrome, you can use --allow-file-access-from-files flag for debugging purposes.');
  }

  isParameterObject = object =>
    object &&
    typeof object === 'object' &&
    ['file', 'range', 'url'].some(key => Object.keys(object).includes(key))

  isDataURI = str => /^data:/.test(str)

  dataURItoBlob = (dataURI) => {
    let byteString;
    if (dataURI.split(',')[0].indexOf('base64') >= 0) {
      byteString = atob(dataURI.split(',')[1]);
    } else {
      byteString = unescape(dataURI.split(',')[1]);
    }

    const mimeString = dataURI.split(',')[0].split(':')[1].split(';')[0];

    const ia = new Uint8Array(byteString.length);
    for (let i = 0; i < byteString.length; i += 1) {
      ia[i] = byteString.charCodeAt(i);
    }

    return new Blob([ia], { type: mimeString });
  }

  handleFileLoad(props = this.props) {
    let { file } = props;

    if (
      !file ||
      (
        this.isParameterObject(file) &&
        !file.data && !file.range && !file.url
      )
    ) {
      return null;
    }

    this.setState({
      page: null,
      pdf: null,
    });

    // File is a string
    if (typeof file === 'string') {
      // File is not data URI
      if (!this.isDataURI(file)) {
        if (window.location.protocol === 'file:') {
          this.displayCORSWarning();
        }

        return this.loadDocument(file);
      }

      // File is data URI
      file = this.dataURItoBlob(file);

      // Fall through to "File is a blob"
    }

    // File is a Blob
    if (file instanceof Blob) {
      file = URL.createObjectURL(file);

      return this.loadDocument(file);
    }

    // File is a File
    if (file instanceof File) {
      const reader = new FileReader();

      reader.onloadend = () => {
        this.loadDocument(new Uint8Array(reader.result));
      };

      return reader.readAsArrayBuffer(file);
    }

    // File is an ArrayBuffer
    if (file instanceof ArrayBuffer) {
      return this.loadDocument(file);
    }

    // File is a parameter object
    if (this.isParameterObject(file)) {
      if (
        file.url &&
        window.location.protocol === 'file:'
      ) {
        this.displayCORSWarning();
      }

      // Prevent from modifying props
      file = Object.assign({}, file);

      // File is data URI
      if (file.url && this.isDataURI(file.url)) {
        file = URL.createObjectURL(this.dataURItoBlob(file.url));
      }

      return this.loadDocument(file);
    }

    throw new Error('Unrecognized input type.');
  }

  loadDocument(...args) {
    PDFJS.getDocument(...args)
      .then(this.onDocumentLoad)
      .catch(this.onDocumentError);
  }

  loadPage(pageIndex) {
    const { pdf } = this.state;

    if (!pdf) {
      throw new Error('Unexpected call to getPage() before the document has been loaded.');
    }

    let pageNumber = pageIndex + 1;

    if (!pageIndex || pageNumber < 1) {
      pageNumber = 1;
    } else if (pageNumber >= pdf.numPages) {
      pageNumber = pdf.numPages;
    }

    pdf.getPage(pageNumber)
      .then(this.onPageLoad)
      .catch(this.onPageError);
  }

  renderNoData() {
    return (
      <div>{this.props.noData}</div>
    );
  }

  renderError() {
    return (
      <div>{this.props.error}</div>
    );
  }

  renderLoader() {
    return (
      <div>{this.props.loading}</div>
    );
  }

  render() {
    const { file } = this.props;
    const { pdf, page } = this.state;

    if (!file) {
      return this.renderNoData();
    }

    if (pdf === false || page === false) {
      return this.renderError();
    }

    if (pdf === null || page === null) {
      return this.renderLoader();
    }

    return (
      <canvas
        ref={(ref) => {
          if (!ref) return;

          const canvas = ref;

          const pixelRatio = window.devicePixelRatio || 1;
          const viewport = page.getViewport(this.getPageScale() * pixelRatio);

          canvas.height = viewport.height;
          canvas.width = viewport.width;

          canvas.style.height = `${viewport.height / pixelRatio}px`;
          canvas.style.width = `${viewport.width / pixelRatio}px`;

          const canvasContext = canvas.getContext('2d');

          const renderContext = {
            canvasContext,
            viewport,
          };

          // If another render is in progress, let's cancel it
          /* eslint-disable no-underscore-dangle */
          if (this.renderer && this.renderer._internalRenderTask.running) {
            this.renderer._internalRenderTask.cancel();
          }
          /* eslint-enable no-underscore-dangle */

          this.renderer = page.render(renderContext);

          this.renderer
            .then(this.onPageRender)
            .catch((dismiss) => {
              if (dismiss === 'cancelled') {
                // Everything's alright
                return;
              }

              this.onPageError(dismiss);
            });
        }}
      />
    );
  }
}

ReactPDF.defaultProps = {
  pageIndex: 0,
  scale: 1.0,
  error: 'Failed to load PDF file.',
  loading: 'Loading PDF…',
  noData: 'No PDF file specified.',
};

ReactPDF.propTypes = {
  error: PropTypes.oneOfType([
    PropTypes.string,
    PropTypes.node,
  ]),
  file: PropTypes.oneOfType([
    PropTypes.string,
    PropTypes.instanceOf(File),
    PropTypes.instanceOf(Blob),
    PropTypes.shape({
      data: PropTypes.object,
      httpHeaders: PropTypes.object,
      range: PropTypes.object,
      url: PropTypes.string,
    }),
  ]),
  loading: PropTypes.oneOfType([
    PropTypes.string,
    PropTypes.node,
  ]),
  noData: PropTypes.oneOfType([
    PropTypes.string,
    PropTypes.node,
  ]),
  onDocumentError: PropTypes.func,
  onDocumentLoad: PropTypes.func,
  onPageError: PropTypes.func,
  onPageLoad: PropTypes.func,
  onPageRender: PropTypes.func,
  pageIndex: PropTypes.number,
  scale: PropTypes.number,
  width: PropTypes.number,
};
