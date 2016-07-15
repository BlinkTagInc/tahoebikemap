const React = require('react');

class TitleBar extends React.Component {
  constructor(props) {
    super(props);

    this.state = {};

    this.showControls = () => {
      this.props.changeMobileView('controls');
    };

    this.showDirections = () => {
      this.props.changeMobileView('directions');
    };

    this.showMap = () => {
      this.props.changeMobileView('map');
    };
  }

  getTitle() {
    let title = '';
    if (this.props.mobileView === 'controls') {
      title = 'Lake Tahoe Area Bike Mapper';
    }
    return title;
  }

  getLeftButton() {
    let button = '';
    if (this.props.mobileView === 'map' || this.props.mobileView === 'directions') {
      button = (
        <button className="btn btn-primary btn-sm btn-left" onClick={this.showControls}>
          <i className="fa fa-caret-left" aria-hidden="true"></i> Edit
        </button>
      );
    }
    return button;
  }

  getRightButton() {
    let button = '';
    if (this.props.mobileView === 'map') {
      button = (
        <button className="btn btn-primary btn-sm btn-right" onClick={this.showDirections}>
          <i className="fa fa-list-alt" aria-hidden="true"></i> Directions
        </button>
      );
    } else if (this.props.mobileView === 'directions') {
      button = (
        <button className="btn btn-primary btn-sm btn-right" onClick={this.showMap}>
          <i className="fa fa-map" aria-hidden="true"></i> Map
        </button>
      );
    }
    return button;
  }

  render() {
    return (
      <div className="titlebar">
        {this.getLeftButton()}
        <h1 className="site-title">
          <a href="http://tahoebike.org">
            <img
              src="/img/ltbc-logo.png"
              srcSet="img/ltbc-logo@2x.png 2x"
              alt="logo"
              className="logo"
            />
          </a>
          {this.getTitle()}
        </h1>
        {this.getRightButton()}
      </div>
    );
  }
}

TitleBar.propTypes = {
  changeMobileView: React.PropTypes.func.isRequired,
  isMobile: React.PropTypes.bool.isRequired,
  mobileView: React.PropTypes.string.isRequired,
};

module.exports = TitleBar;
