import React, { Component, PropTypes } from 'react';

require('pdfjs-dist/web/compatibility');
require('pdfjs-dist/build/pdf');
PDFJS.workerSrc = require('pdfjs-dist/build/pdf.worker.js');

export default class ReactPDF extends Component {
    state = {}

    componentDidMount() {
        this.handleProps();
    }

    componentWillReceiveProps(newProps) {
        if (
            (newProps.file && newProps.file !== this.props.file) ||
            (newProps.content && newProps.content !== this.props.content)
        ) {
            this.handleProps(newProps);
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
        return nextState.page !== this.state.page;
    }

    onDocumentLoad = (pdf) => {
        this.pdf = pdf;

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

    onPageRender = () => {
        if (
            this.props.onPageRender &&
            typeof this.props.onPageLoad === 'function'
        ) {
            this.props.onPageRender();
        }
    }

    handleProps(props = this.props) {
        const self = this;

        if (props.file) {
            if (typeof props.file === 'string') {
                this.loadPDFDocument(props.file);
                return;
            }

            const reader = new FileReader();

            reader.onloadend = () => {
                self.loadPDFDocument(new Uint8Array(reader.result));
            };

            reader.readAsArrayBuffer(props.file);
        } else if (props.content) {
            const bytes = window.atob(props.content);
            const byteLength = bytes.length;
            const byteArray = new Uint8Array(new ArrayBuffer(byteLength));

            for (let index = 0; index < byteLength; index += 1) {
                byteArray[index] = bytes.charCodeAt(index);
            }

            this.loadPDFDocument(byteArray);
        } else {
            console.error('React-PDF works with a file(URL) or (base64)content. At least one needs to be provided!'); // eslint-disable-line max-len, no-console
        }
    }

    loadPage(pageIndex) {
        if (!this.pdf) {
            throw new Error('Unexpected call to getPage() before the document has been loaded.');
        }

        let pageNumber = pageIndex + 1;

        if (!pageIndex || pageNumber < 1) {
            pageNumber = 1;
        } else if (pageNumber >= this.pdf.numPages) {
            pageNumber = this.pdf.numPages;
        }

        this.pdf.getPage(pageNumber).then(this.onPageLoad);
    }

    loadPDFDocument(byteArray) {
        PDFJS.getDocument(byteArray).then(this.onDocumentLoad);
    }

    render() {
        const { scale } = this.props;
        const { page } = this.state;

        if (!page) {
            return (
                <div>{this.props.loading}</div>
            );
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
    loading: 'Loading PDF…',
};

ReactPDF.propTypes = {
    content: PropTypes.string,
    file: PropTypes.oneOfType([PropTypes.string, PropTypes.object]),
    loading: PropTypes.oneOfType([PropTypes.string, PropTypes.node]),
    onDocumentLoad: PropTypes.func,
    onPageLoad: PropTypes.func,
    onPageRender: PropTypes.func,
    pageIndex: PropTypes.number,
    scale: PropTypes.number,
};
