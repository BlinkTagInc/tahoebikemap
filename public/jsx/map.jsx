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
        <div className="logo">
          <a href="http://tahoebike.org">
            <img src="/img/ltbc-logo.png" srcSet="img/ltbc-logo@2x.png 2x" alt="logo" />
          </a>
        </div>
        <div className="disclaimer">The Lake Tahoe Bicycle Coalition is solely responsible for the content on this site.</div>
        <div className="map" id="map" style={{ height: `${this.props.height}px` }}></div>
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
  height: React.PropTypes.number,
};

module.exports = Map;
