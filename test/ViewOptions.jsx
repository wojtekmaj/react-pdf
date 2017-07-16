import React, { Component } from 'react';
import PropTypes from 'prop-types';

export default class ViewOptions extends Component {
  onDisplayAllChange = event =>
    this.props.setState({ displayAll: event.target.checked })

  onPageWidthChange = (event) => {
    event.preventDefault();

    const form = event.target;

    const width = form.pageWidth.value;

    if (!width) {
      return;
    }

    this.props.setState({
      pageWidth: parseInt(width, 10),
    });
  }

  rotateLeft = () => this.changeRotation(-90);

  rotateRight = () => this.changeRotation(90);

  changeRotation(by) {
    this.props.setState(prevState => ({ rotate: (prevState.rotate + by) % 360 }));
  }

  resetRotation = () => this.props.setState({ rotate: null })

  resetWidth = () => this.props.setState({ pageWidth: null })

  render() {
    const { pageWidth, rotate } = this.props;

    return (
      <fieldset id="viewoptions">
        <legend htmlFor="viewoptions">View options</legend>

        <form onSubmit={this.onPageWidthChange}>
          <label htmlFor="pageWidth">Page width:</label>&nbsp;
          <input
            type="number"
            min={0}
            name="pageWidth"
            defaultValue={pageWidth}
          />&nbsp;
          <button
            style={{ display: 'none' }}
            type="submit"
          >
            Set width
          </button>
          <button
            disabled={pageWidth === null}
            onClick={this.resetWidth}
            type="button"
          >
            Reset width
          </button>
        </form>

        <div>
          <label htmlFor>Rotation:</label>
          <button onClick={this.rotateLeft}>Rotate left</button>&nbsp;
          <button onClick={this.rotateRight}>Rotate right</button>&nbsp;
          <button
            disabled={rotate === null}
            onClick={this.resetRotation}
          >
            Reset rotation
          </button>
        </div>

        <input id="displayAll" type="checkbox" onChange={this.onDisplayAllChange} />
        <label htmlFor="displayAll">View all pages</label>
      </fieldset>
    );
  }
}

ViewOptions.propTypes = {
  pageWidth: PropTypes.number,
  rotate: PropTypes.number,
  setState: PropTypes.func.isRequired,
};
