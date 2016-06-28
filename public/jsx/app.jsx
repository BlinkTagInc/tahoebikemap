const React = require('react');
const ReactDOM = require('react-dom');
const polyline = require('polyline');
import 'whatwg-fetch';

const Controls = require('./controls.jsx');
const Directions = require('./directions.jsx');
const Elevation = require('./elevation.jsx');
const Map = require('./map.jsx');
const api = require('../js/api');
const analytics = require('../js/analytics');
const error = require('../js/error');
const geocode = require('../js/geocode');
const url = require('../js/url');

class App extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      windowHeight: window.innerHeight,
      windowWidth: window.innerWidth,
      elevationVisible: true,
      scenario: '1',
    };

    this.handleResize = () => {
      this.setState({
        windowHeight: window.innerHeight,
        windowWidth: window.innerWidth,
      });
    };

    this.updateRoute = (startAddress, endAddress, scenario) => {
      this.clearPath();
      this.setState({
        startAddress,
        endAddress,
        scenario,
      });
      const promises = [
        geocode.geocode(startAddress).catch(() => {
          alert('Invalid start address. Please try a different address.');
        }),
        geocode.geocode(endAddress).catch(() => {
          alert('Invalid end address. Please try a different address.');
        }),
      ];
      Promise.all(promises)
      .then((results) => {
        if (!results || !results[0] || !results[1]) {
          return;
        }

        this.setState({
          startLocation: results[0],
          endLocation: results[1],
        });

        this.fetchRoute();
      });
    };

    this.fetchRoute = () => {
      api.getRoute(this.state.startLocation, this.state.endLocation, this.state.scenario)
      .then((results) => {
        if (!results.path | !results.path.length) {
          error.handleError(new Error('No path recieved'));
          return;
        }

        this.setState({
          decodedPath: polyline.decode(results.path[0]),
          directions: results.directions,
          elevationProfile: results.elevation_profile,
        });
        url.updateUrlParams([this.state.startAddress, this.state.endAddress, this.state.scenario]);
        analytics.logQuery(this.state.startAddress, this.state.endAddress, this.state.startLocation, this.state.endLocation);
      });
    };

    this.setStartLocation = (latlng) => {
      this.clearPath();
      this.setState({
        startLocation: latlng,
        startAddress: undefined,
      });

      if (this.state.endLocation) {
        this.fetchRoute();
      }

      geocode.reverseGeocode(latlng).then((address) => {
        if (!address) {
          error.handleError(new Error('Unable to get reverse geocoding result.'));
          return;
        }

        return this.setState({
          startAddress: address,
        });
      });
    };

    this.setEndLocation = (latlng) => {
      this.clearPath();
      this.setState({
        endLocation: latlng,
        endAddress: undefined,
      });

      if (this.state.startLocation) {
        this.fetchRoute();
      }

      geocode.reverseGeocode(latlng).then((address) => {
        if (!address) {
          return this.handleError('Unable to get reverse geocoding result.');
        }

        return this.setState({
          endAddress: address,
        });
      });
    };

    this.updateDistance = (totalDistance) => {
      this.setState({
        totalDistance,
      });
    };

    this.clearRoute = () => {
      this.clearPath();
      this.clearMarkers();
    };

    this.toggleElevationVisibility = () => {
      this.setState({
        elevationVisible: !this.state.elevationVisible,
      });
    };
  }

  componentDidMount() {
    window.addEventListener('resize', this.handleResize);
    const urlParams = url.readUrlParams();

    if (url.validateUrlParams(urlParams)) {
      this.updateRoute(urlParams[0], urlParams[1], urlParams[2]);
    }
  }

  componentWillUnmount() {
    window.removeEventListener('resize', this.handleResize);
  }

  clearPath() {
    this.setState({
      decodedPath: undefined,
      directions: undefined,
      elevationProfile: undefined,
    });
  }

  clearMarkers() {
    this.setState({
      startLocation: undefined,
      endLocation: undefined,
      startAddress: undefined,
      endAddress: undefined,
    });
  }

  getMapHeight() {
    const elevationHeight = 175;
    let mapHeight = this.state.windowHeight;

    if (this.state.elevationVisible && this.state.elevationProfile) {
      mapHeight -= elevationHeight;
    }

    return mapHeight;
  }

  render() {
    const controlsHeight = 208;
    const directionsHeight = this.state.windowHeight - controlsHeight;
    const sidebarWidth = 300;
    const elevationWidth = this.state.windowWidth - sidebarWidth;

    return (
      <div>
        <Controls
          updateRoute={this.updateRoute}
          clearRoute={this.clearRoute}
          startAddress={this.state.startAddress}
          endAddress={this.state.endAddress}
          scenario={this.state.scenario}
        />
        <Directions
          directions={this.state.directions}
          decodedPath={this.state.decodedPath}
          endAddress={this.state.endAddress}
          elevationProfile={this.state.elevationProfile}
          height={directionsHeight}
        />
        <Map
          startLocation={this.state.startLocation}
          endLocation={this.state.endLocation}
          decodedPath={this.state.decodedPath}
          setStartLocation={this.setStartLocation}
          setEndLocation={this.setEndLocation}
          height={this.getMapHeight()}
        />
        <Elevation
          elevationProfile={this.state.elevationProfile}
          width={elevationWidth}
          toggleElevationVisibility={this.toggleElevationVisibility}
          elevationVisible={this.state.elevationVisible && !!this.state.elevationProfile}
        />
      </div>
    );
  }
}

ReactDOM.render(
  <App />,
  document.getElementById('app')
);
