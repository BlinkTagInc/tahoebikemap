const React = require('react');

const MapLayers = require('./map_layers.jsx');

const map = require('../js/map');
const config = require('../../frontendconfig.json');

class Map extends React.Component {
  constructor(props) {
    super(props);

    this.state = {};

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
  }

  componentDidMount() {
    map.drawMap([config.initialCenterLat, config.initialCenterLng], config.initialZoom, this.handleMapClick, this.handleMarkerDrag);
  }

  componentWillReceiveProps(nextProps) {
    map.updateStartMarker(nextProps.startLocation);
    map.updateEndMarker(nextProps.endLocation);
    map.updatePath(nextProps.decodedPath);
  }

  render() {
    return (
      <div className="map-container">
        <div className="map" id="map" style={{ height: `${this.props.windowHeight}px` }}></div>
        <MapLayers />
      </div>
    );
  }
}

Map.propTypes = {
  startLocation: React.PropTypes.object,
  endLocation: React.PropTypes.object,
  setStartLocation: React.PropTypes.func.isRequired,
  setEndLocation: React.PropTypes.func.isRequired,
  windowHeight: React.PropTypes.number,
};

module.exports = Map;
