/**
 * @jsx React.DOM
 */
var React = require('react'),
    PDF = require('../');

var App = React.createClass({
  getInitialState: function() {
    return {
      currentPage: 2,
      pages: 0
    }
  },
  prevPage: function(ev) {
    ev.preventDefault();
    this.setState({
      currentPage: this.state.currentPage > 1 ? this.state.currentPage - 1 : 1
    });
  },
  nextPage: function(ev) {
    ev.preventDefault();
    if(this.state.pages < this.state.pages)
      this.setState({currentPage: this.state.pages < this.state.pages ? this.state.currentPage + 1 : this.state.pages });
  },
  render: function() {
    return (
      <div className="container">
        <h1>PDF.js + React = &lt;3</h1>
        <PDF page={this.state.currentPage} file="example.pdf" onDocumentComplete={this._onDocumentComplete} />
        <div>
          <button onClick={this.prevPage}>Previous page</button>
          <button onClick={this.nextPage}>Next page</button>
        </div>
      </div>
    );
  },
  _onDocumentComplete: function(pages){
    this.setState({pages: pages});
  }
});

React.renderComponent(<App />, document.body);
