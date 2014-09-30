/**
 * @jsx React.DOM
 */
var React = require('react'),
    PDF = require('../');

var App = React.createClass({
  getInitialState: function() {
    return {
      currentPage: 2
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
    this.setState({
      currentPage: this.state.currentPage + 1 // No way currently checking if pdf has more pages :(
    });
  },
  render: function() {
    return (
      <div className="container">
        <h1>PDF.js + React = &lt;3</h1>
        <PDF page={this.state.currentPage} file="example.pdf" />
        <div>
          <button onClick={this.prevPage}>Previous page</button>
          <button onClick={this.nextPage}>Next page</button>
        </div>
      </div>
    );
  }
});

React.renderComponent(<App />, document.body);
