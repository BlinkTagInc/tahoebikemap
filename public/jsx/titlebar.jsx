const React = require('react');
const PropTypes = require('prop-types');

class TitleBar extends React.Component {
  constructor(props) {
    super(props);

    this.state = {};

    this.showDirections = () => {
      this.props.changeMobileView('directions');
    };

    this.showMap = () => {
      this.props.changeMobileView('map');
    };
  }

  getRightButton() {
    let button = '';
    if (this.props.mobileView === 'map') {
      button = (
        <button
          className="btn btn-primary btn-sm btn-right hidden-print"
          onClick={this.showDirections}
        >
          <i className="fa fa-list-alt" aria-hidden="true"></i> Directions
        </button>
      );
    } else if (this.props.mobileView === 'directions') {
      button = (
        <button
          className="btn btn-primary btn-sm btn-right hidden-print"
          onClick={this.showMap}
        >
          <i className="fa fa-map" aria-hidden="true"></i> Map
        </button>
      );
    }
    return button;
  }

  render() {
    return (
      <div className="titlebar">
        <h1 className="site-title">
          <a href="http://tahoebike.org">
            <img
              src="/img/ltbc-logo.png"
              srcSet="img/ltbc-logo@2x.png 2x"
              alt="logo"
              className="logo"
            />
          </a>
          <span className="titlebar-text">Bike Map</span>
        </h1>
        {this.getRightButton()}
      </div>
    );
  }
}

TitleBar.propTypes = {
  changeMobileView: PropTypes.func.isRequired,
  isMobile: PropTypes.bool.isRequired,
  mobileView: PropTypes.string.isRequired,
};

module.exports = TitleBar;
