const React = require('react');
const _ = require('underscore');
const classNames = require('classnames');

const config = require('../../frontendconfig.json');

class Controls extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      errorFields: [],
    };

    this.processForm = (event) => {
      event.preventDefault();

      const errorFields = this.validateForm();

      if (errorFields.length) {
        this.setState({ errorFields });
        return false;
      }

      return this.props.updateRoute(this.state.startAddress, this.state.endAddress);
    };

    this.handleStartAddressChange = (event) => {
      this.setState({ startAddress: event.target.value });
    };

    this.handleEndAddressChange = (event) => {
      this.setState({ endAddress: event.target.value });
    };
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.startAddress !== this.state.startAddress) {
      this.setState({
        startAddress: nextProps.startAddress,
      });
    }

    if (nextProps.endAddress !== this.state.endAddress) {
      this.setState({
        endAddress: nextProps.endAddress,
      });
    }
  }

  validateForm() {
    const errorFields = [];
    if (!this.state.startAddress) {
      errorFields.push('startAddress');
    }

    if (!this.state.endAddress) {
      errorFields.push('endAddress');
    }

    return errorFields;
  }

  render() {
    return (
      <div className="controls">
        <form onSubmit={this.processForm}>
          <div className={classNames('form-group', 'form-inline', 'start-address', { 'has-error': _.contains(this.state.errorFields, 'startAddress') })}>
            <label className="control-label">Start Location</label>
            <img src="img/start_marker.png" srcSet="img/start_marker@2x.png 2x" className="control-icon" />
            <input
              type="text"
              value={this.state.startAddress}
              onChange={this.handleStartAddressChange}
              className="form-control"
              placeholder={config.startAddressPlaceholder}
            />
          </div>
          <div className={classNames('form-group', 'form-inline', 'end-address', { 'has-error': _.contains(this.state.errorFields, 'endAddress') })}>
            <label className="control-label">End Location</label>
            <img src="img/end_marker.png" srcSet="img/end_marker@2x.png 2x" className="control-icon" />
            <input
              type="text"
              value={this.state.endAddress}
              onChange={this.handleEndAddressChange}
              className="form-control"
              placeholder={config.endAddressPlaceholder}
            />
          </div>
          <div className="form-group form-inline route-type">
            <label className="control-label">Route Type</label>
            <select className="form-control">
              <option value="direct">The most direct route</option>
              <option value="comfortable">Prefer bike lanes & routes</option>
            </select>
          </div>
          <input type="submit" value="Get Directions" className="btn btn-success" />
        </form>
      </div>
    );
  }
}

Controls.propTypes = {
  updateRoute: React.PropTypes.func.isRequired,
  startAddress: React.PropTypes.string,
  endAddress: React.PropTypes.string,
};

module.exports = Controls;
