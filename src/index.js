import React from 'react';

require('pdfjs-dist/web/compatibility');
require('pdfjs-dist/build/pdf');
PDFJS.workerSrc = require('pdfjs-dist/build/pdf.worker.js');

export default class ReactPDF extends React.Component {
    constructor(props) {
        super(props);

        this.state = {};

        this.onDocumentComplete = this.onDocumentComplete.bind(this);
        this.onPageComplete = this.onPageComplete.bind(this);
    }

    componentDidMount() {
        this._isMounted = true;

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
            newProps.page &&
            newProps.page !== this.props.page
        ) {
            this.setState({ page: null });
            this.state.pdf.getPage(newProps.page).then(this.onPageComplete);
        }
    }

    componentWillUnmount() {
        this._isMounted = false;
    }

    onDocumentComplete(pdf) {
        if (!this._isMounted) return;

        this.setState({
            pdf,
        });

        if (this.props.onDocumentComplete && typeof this.props.onDocumentComplete === 'function') {
            this.props.onDocumentComplete(pdf.numPages);
        }

        pdf.getPage(this.props.page).then(this.onPageComplete);
    }

    onPageComplete(page) {
        if (!this._isMounted) return;

        this.setState({
            page,
        });

        if (this.props.onPageComplete && typeof this.props.onPageComplete === 'function') {
            this.props.onPageComplete(page.pageIndex + 1);
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

            for (let index = 0; index < byteLength; index++) {
                byteArray[index] = bytes.charCodeAt(index);
            }

            this.loadPDFDocument(byteArray);
        } else {
            console.error('React-PDF works with a file(URL) or (base64)content. At least one needs to be provided!'); // eslint-disable-line max-len, no-console
        }
    }

    loadPDFDocument(byteArray) {
        PDFJS.getDocument(byteArray).then(this.onDocumentComplete);
    }

    render() {
        const self = this;

        if (this.state.page) {
            setTimeout(() => {
                if (self._isMounted) {
                    const canvas = self.pdfCanvas;
                    const context = canvas.getContext('2d');
                    const scale = self.props.scale;
                    const viewport = self.state.page.getViewport(scale);

                    canvas.height = viewport.height;
                    canvas.width = viewport.width;

                    context.clearRect(0, 0, canvas.width, canvas.height);

                    const renderContext = {
                        canvasContext: context,
                        viewport,
                    };
                    self.state.page.render(renderContext);
                }
            });

            return (
                <canvas ref={ref => (this.pdfCanvas = ref)} />
            );
        }

        return (
            <div>{this.props.loading}</div>
        );
    }
}

ReactPDF.defaultProps = {
    page: 1,
    scale: 1.0,
    loading: 'Loading PDF…',
};

ReactPDF.propTypes = {
    file: React.PropTypes.string,
    content: React.PropTypes.string,
    page: React.PropTypes.number,
    scale: React.PropTypes.number,
    loading: React.PropTypes.string,
    onDocumentComplete: React.PropTypes.func,
    onPageComplete: React.PropTypes.func,
};
