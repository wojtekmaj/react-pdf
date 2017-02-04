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
            nextState.page !== this.state.page
        );
    }

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

    onDocumentError = (error) => {
        this.callIfDefined(
            this.props.onDocumentError,
            error,
        );

        this.setState({ pdf: false });
    }

    onPageLoad = (page) => {
        this.callIfDefined(
            this.props.onPageLoad,
            {
                pageIndex: page.pageIndex,
                pageNumber: page.pageNumber,
            },
        );

        this.setState({ page });
    }

    onPageError = (error) => {
        this.callIfDefined(
            this.props.onPageError,
            error,
        );

        this.setState({ page: false });
    }

    onPageRender = () => {
        this.callIfDefined(this.props.onPageRender);
    }

    getPageScale(page, pixelRatio = 1) {
        const { scale, width } = this.props;

        // Be default, we'll render page at 100% * scale width.
        let pageScale = 1;

        // If width is defined, calculate the scale of the page so it could be of desired width.
        if (width) {
            const pageDimensions = this.getPageDimensions(page);
            pageScale = width / pageDimensions.width;
        }

        return scale * pageScale * pixelRatio;
    }

    getPageRenderScale(page) {
        return this.getPageScale(
            page,
            window.devicePixelRatio,
        );
    }

    getPageDisplayScale(page) {
        return this.getPageScale(
            page,
        );
    }

    getPageDimensions(page, scale = 1) {
        const viewport = page.getViewport(scale);

        return {
            width: viewport.width,
            height: viewport.height,
        };
    }

    getPageRenderDimensions(page) {
        return this.getPageDimensions(
            page,
            this.getPageRenderScale(page),
        );
    }

    getPageDisplayDimensions(page) {
        return this.getPageDimensions(
            page,
            this.getPageDisplayScale(page),
        );
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
        (
            object.hasOwnProperty('data') ||
            object.hasOwnProperty('range') ||
            object.hasOwnProperty('url')
        )

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
            pdf: null,
            page: null,
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
        if (!this.state.pdf) {
            throw new Error('Unexpected call to getPage() before the document has been loaded.');
        }

        let pageNumber = pageIndex + 1;

        if (!pageIndex || pageNumber < 1) {
            pageNumber = 1;
        } else if (pageNumber >= this.state.pdf.numPages) {
            pageNumber = this.state.pdf.numPages;
        }

        this.state.pdf.getPage(pageNumber)
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

                    const scale = this.getPageRenderScale(page);
                    const viewport = page.getViewport(scale);

                    const renderDimensions = this.getPageRenderDimensions(page);
                    canvas.height = renderDimensions.height;
                    canvas.width = renderDimensions.width;

                    const canvasContext = canvas.getContext('2d');

                    const renderContext = {
                        canvasContext,
                        viewport,
                    };

                    page
                        .render(renderContext)
                        .then(() => {
                            const displayDimensions = this.getPageDisplayDimensions(page);
                            canvas.style.height = `${displayDimensions.height}px`;
                            canvas.style.width = `${displayDimensions.width}px`;

                            this.onPageRender();
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
