/**
 * @jsx React.DOM
 */
var React = require('react');

var Pdf = React.createClass({
  displayName: 'React-PDF',
  propTypes: {
    file: React.PropTypes.string,
    content: React.PropTypes.string,
    page: React.PropTypes.number,
    scale: React.PropTypes.number,
    onDocumentComplete: React.PropTypes.func,
    onPageComplete: React.PropTypes.func
  },
  getInitialState: function() {
    return { };
  },
  getDefaultProps: function() {
    return {page: 1, scale: 1.0};
  },
  componentDidMount: function() {
    var self = this;
    if(!!this.props.file){
      PDFJS.getDocument(this.props.file).then(this._onDocumentComplete);
    }
    else if(!!this.props.content){
      var bytes = window.atob(this.props.content);
      var byteLength = bytes.length;
      var byteArray = new Uint8Array(new ArrayBuffer(byteLength));
      for(index = 0; index < byteLength; index++) {
        byteArray[index] = bytes.charCodeAt(index);
      }
      PDFJS.getDocument(byteArray).then(this._onDocumentComplete);   
    }
    else {
      console.error('React_Pdf works with a file(URL) or (base64)content. At least one needs to be provided!')
    }
  },
  componentWillReceiveProps: function(newProps) {
    if (!!this.state.pdf && !!newProps.page && newProps.page !== this.props.page) {
      this.setState({page: null});
      this.state.pdf.getPage(newProps.page).then(this._onPageComplete);
    }
  },
  render: function() {
    var self = this;
    if (!!this.state.page){
      setTimeout(function() {
        if(self.isMounted()){
          var canvas = self.refs.pdfCanvas.getDOMNode(),
            context = canvas.getContext('2d'),
            scale = self.props.scale,
            viewport = self.state.page.getViewport(scale);
          canvas.height = viewport.height;
          canvas.width = viewport.width;
          var renderContext = {
            canvasContext: context,
            viewport: viewport
          };
          self.state.page.render(renderContext);
        }
      });
      return (React.createElement("canvas", {ref: "pdfCanvas"}));
    }
    return (this.props.loading || React.createElement("div", null, "Loading pdf...."));
  },
  _onDocumentComplete: function(pdf){
    this.setState({ pdf: pdf })
    if(!!this.props.onDocumentComplete && typeof this.props.onDocumentComplete === 'function'){
      this.props.onDocumentComplete(pdf.numPages);
    }
    pdf.getPage(this.props.page).then(this._onPageComplete);
  },
  _onPageComplete: function(page){
    this.setState({ page: page });
    if(!!this.props.onPageComplete && typeof this.props.onPageComplete === 'function'){
      this.props.onPageComplete(page.pageIndex + 1);
    }
  }
});

module.exports = Pdf;