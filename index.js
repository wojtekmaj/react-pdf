/**
 * @jsx React.DOM
 */

var React = require('react');


var Pdf = React.createClass({
  getInitialState: function() {
    return {};
  },
  componentDidMount: function() {
    var self = this;
    PDFJS.getDocument(this.props.file).then(function(pdf) {
      pdf.getPage(self.props.page).then(function(page) {
        self.setState({pdfPage: page, pdf: pdf});
      });
    });
  },
  componentWillReceiveProps: function(newProps) {
    var self = this;
    if (newProps.page) {
      self.state.pdf.getPage(newProps.page).then(function(page) {
        self.setState({pdfPage: page, pageId: newProps.page});
      });
    }
    this.setState({
      pdfPage: null
    });
  },
  getDefaultProps: function() {
    return {page: 1};
  },
  render: function() {
    var self = this;
    if (this.state.pdfPage) setTimeout(function() {
      var canvas = self.getDOMNode(),
          context = canvas.getContext('2d'),
          scale = self.props.scale || 1.0,
          viewport = self.state.pdfPage.getViewport(scale);
      canvas.height = viewport.height;
      canvas.width = viewport.width;
      var renderContext = {
        canvasContext: context,
        viewport: viewport
      };
      self.state.pdfPage.render(renderContext);
    });
    return this.state.pdfPage ? <canvas></canvas> : <div>Loading pdf..</div>;
  }
});


module.exports = Pdf;
