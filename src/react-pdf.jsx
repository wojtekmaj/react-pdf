import React, { Component, PropTypes } from 'react';

require('pdfjs-dist/web/compatibility');
require('pdfjs-dist/build/pdf');
PDFJS.workerSrc = require('pdfjs-dist/build/pdf.worker.js');

export default class ReactPDF extends Component {
    state = {
        pdf: null,
        page: null,
    }

    componentDidMount() {
        this.handleFileLoad();
    }

    componentWillReceiveProps(newProps) {
        if (this.isParameterObject(newProps.file)) {
            // File is a parameter object
            if (
                newProps.file.url !== this.props.file.url ||
                newProps.file.data !== this.props.file.data ||
                newProps.file.range !== this.props.file.range
            ) {
                this.handleFileLoad(newProps);
                return;
            }
        } else if (newProps.file && newProps.file !== this.props.file) {
            // File is a normal object or not an object at all
            this.handleFileLoad(newProps);
            return;
        }

        if (
            this.state.pdf &&
            typeof newProps.pageIndex !== 'undefined' &&
            newProps.pageIndex !== this.props.pageIndex
        ) {
            this.loadPage(newProps.pageIndex);
        }
    }

    shouldComponentUpdate(nextProps, nextState) {
        return (
            nextState.pdf !== this.state.pdf ||
            nextState.page !== this.state.page
        );
    }

    onDocumentLoad = (pdf) => {
        if (
            this.props.onDocumentLoad &&
            typeof this.props.onDocumentLoad === 'function'
        ) {
            this.props.onDocumentLoad({
                total: pdf.numPages,
            });
        }

        this.setState({ pdf });

        this.loadPage(this.props.pageIndex);
    }

    onDocumentError = () => {
        if (
            this.props.onDocumentError &&
            typeof this.props.onDocumentError === 'function'
        ) {
            this.props.onDocumentError();
        }

        this.setState({ pdf: false });
    }

    onPageLoad = (page) => {
        if (
            this.props.onPageLoad &&
            typeof this.props.onPageLoad === 'function'
        ) {
            this.props.onPageLoad({
                pageIndex: page.pageIndex,
                pageNumber: page.pageNumber,
            });
        }

        this.setState({ page });
    }

    onPageError = () => {
        if (
            this.props.onPageError &&
            typeof this.props.onPageError === 'function'
        ) {
            this.props.onPageError();
        }

        this.setState({ page: false });
    }

    onPageRender = () => {
        if (
            this.props.onPageRender &&
            typeof this.props.onPageLoad === 'function'
        ) {
            this.props.onPageRender();
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
                console.warn('Loading PDF as base64 strings/URLs might not work on protocols other than HTTP/HTTPS. On Google Chrome, you can use --allow-file-access-from-files flag for debugging purposes.');
            }
            this.loadDocument(file);
            return;
        }

        // File is a file
        if (file instanceof File) {
            const reader = new FileReader();

            reader.onloadend = () => {
                this.loadDocument(new Uint8Array(reader.result));
            };

            reader.readAsArrayBuffer(file);
            return;
        }

        // File is a Uint8Array object or parameter object
        if (
            typeof file === 'object'
        ) {
            if (this.isParameterObject(file)) {
                // File is a parameter object
                // Prevent from modifying props
                file = Object.assign({}, file);
            }

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
        PropTypes.shape({
            url: PropTypes.string,
            data: PropTypes.object,
            range: PropTypes.object,
            httpHeaders: PropTypes.object,
        }),
    ]),
    loading: PropTypes.oneOfType([
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
