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

    onDocumentError = () => {
        this.callIfDefined(this.props.onDocumentError);

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

    onPageError = () => {
        this.callIfDefined(this.props.onPageError);

        this.setState({ page: false });
    }

    onPageRender = () => {
        this.callIfDefined(this.props.onPageRender);
    }

    callIfDefined = (fn, args) => {
        if (fn && typeof fn === 'function') {
            fn(args);
        }
    }

    isParameterObject = object =>
        object &&
        typeof object === 'object' &&
        (
            object.hasOwnProperty('data') ||
            object.hasOwnProperty('range') ||
            object.hasOwnProperty('url')
        )

    handleFileLoad(props = this.props) {
        let { file } = props;

        if (
            !file ||
            (
                this.isParameterObject(file) &&
                !file.data && !file.range && !file.url
            )
        ) return;

        this.setState({
            pdf: null,
            page: null,
        });

        // File is a string
        if (
            typeof file === 'string'
        ) {
            if (
                window.location.protocol === 'file:'
            ) {
                this.displayCORSWarning();
            }

            this.loadDocument(file);
            return;
        }

        // File is a File
        if (file instanceof File) {
            const reader = new FileReader();

            reader.onloadend = () => {
                this.loadDocument(new Uint8Array(reader.result));
            };

            reader.readAsArrayBuffer(file);
            return;
        }

        // File is a Blob
        if (file instanceof Blob) {
            file = URL.createObjectURL(file);

            this.loadDocument(file);
            return;
        }

        // File is an ArrayBuffer
        if (file instanceof ArrayBuffer) {
            this.loadDocument(file);
            return;
        }

        // File is a parameter object
        if (this.isParameterObject(file)) {
            if (
                file.url &&
                window.location.protocol === 'file:'
            ) {
                this.displayCORSWarning();
            }

            // File is a parameter object
            // Prevent from modifying props
            file = Object.assign({}, file);

            this.loadDocument(file);
            return;
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

    displayCORSWarning() {
        console.warn('Loading PDF as base64 strings/URLs might not work on protocols other than HTTP/HTTPS. On Google Chrome, you can use --allow-file-access-from-files flag for debugging purposes.');
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
        const { scale, file } = this.props;
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

                    const context = canvas.getContext('2d');
                    const viewport = page.getViewport(scale);

                    canvas.height = viewport.height;
                    canvas.width = viewport.width;

                    const renderContext = {
                        canvasContext: context,
                        viewport,
                    };

                    page.render(renderContext).then(this.onPageRender);
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
};
