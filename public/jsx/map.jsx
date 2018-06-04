const React = require('react');
const classNames = require('classnames');

const MapLayers = require('./map_layers.jsx');

const map = require('../js/map');
const config = require('../../frontendconfig.json');

class Map extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      showTruckeeButton: true
    };

    this.handleMapClick = (latlng) => {
      if (!this.props.startLocation) {
        if (map.latlngIsWithinBounds(latlng)) {
          this.props.setStartLocation(latlng);
        }
      } else if (!this.props.endLocation) {
        if (map.latlngIsWithinBounds(latlng)) {
          this.props.setEndLocation(latlng);
        }
      }
    };

    this.handleMarkerDrag = (latlng, type) => {
      if (map.latlngIsWithinBounds(latlng)) {
        if (type === 'start') {
          this.props.setStartLocation(latlng);
        } else if (type === 'end') {
          this.props.setEndLocation(latlng);
        }
      }
    };

    this.panToTruckee = () => {
      map.panTo({lat: 39.286855, lng: -120.133305});
      this.setState({
        showTruckeeButton: false
      })
    }
  }

  componentDidMount() {
    const point = [config.initialCenterLat, config.initialCenterLng];
    const draggable = !this.props.isMobile;
    map.drawMap(point, config.initialZoom, config.minZoom, draggable, this.handleMapClick, this.handleMarkerDrag);
  }

  componentWillReceiveProps(nextProps) {
    map.updateStartMarker(nextProps.startLocation);
    map.updateEndMarker(nextProps.endLocation);
    map.updatePath(nextProps.decodedPath);
    map.updateMapSize();
  }

  renderTruckeeButton() {
    if (this.state.showTruckeeButton) {
      return (
        <button className="btn btn-default btn-lg map-button-top" onClick={this.panToTruckee}>
          <i className="fa fa-arrow-up" aria-hidden="true"></i> Truckee
        </button>
      );
    }
  }

  render() {
    return (
      <div
        className={classNames(
          'map-container',
          { hide: this.props.isMobile && this.props.mobileView !== 'map' }
        )}
      >
        <div className="logo">
          <a href="http://tahoebike.org">
            <img src="/img/ltbc-logo.png" srcSet="img/ltbc-logo@2x.png 2x" alt="logo" />
          </a>
        </div>
        {this.renderTruckeeButton()}
        <div className="map" id="map" style={{ height: `${this.props.height}px` }}></div>
        <MapLayers
          isMobile={this.props.isMobile}
        />
      </div>
    );
  }
}

Map.propTypes = {
  startLocation: React.PropTypes.object,
  endLocation: React.PropTypes.object,
  setStartLocation: React.PropTypes.func.isRequired,
  setEndLocation: React.PropTypes.func.isRequired,
  height: React.PropTypes.number,
  isMobile: React.PropTypes.bool.isRequired,
  mobileView: React.PropTypes.string,
};

module.exports = Map;
