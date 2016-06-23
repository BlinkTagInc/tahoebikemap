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
const helper = require('../js/helper');

class App extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      windowHeight: window.innerHeight,
    };

    this.handleResize = () => {
      this.setState({
        windowHeight: window.innerHeight,
      });
    };

    this.updateRoute = (startAddress, endAddress) => {
      this.clearRoute();
      this.setState({
        startAddress,
        endAddress,
        startLocation: undefined,
        endLocation: undefined,
      });
      const promises = [
        geocode.geocode(startAddress),
        geocode.geocode(endAddress),
      ];
      Promise.all(promises).then((results) => {
        this.setState({
          startLocation: results[0],
          endLocation: results[1],
        });

        if (!this.state.startLocation || !this.state.endLocation) {
          error.handleError(new Error('Unable to geocode start or end location.'));
          return;
        }

        this.fetchRoute();
      }, error.handleError);
    };

    this.fetchRoute = () => {
      api.getRoute(this.state.startLocation, this.state.endLocation)
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
        this.updateUrlParams();
        analytics.logQuery(this.state.startAddress, this.state.endAddress, this.state.startLocation, this.state.endLocation);
      });
    };

    this.setStartLocation = (latlng) => {
      this.clearRoute();
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
      this.clearRoute();
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
  }

  componentDidMount() {
    window.addEventListener('resize', this.handleResize);
    this.readUrlParams();
  }

  componentWillUnmount() {
    window.removeEventListener('resize', this.handleResize);
  }

  updateUrlParams() {
    const newHash = `#${helper.encode(this.state.startAddress)}/${helper.encode(this.state.endAddress)}/${helper.encode(this.state.routing)}`;
    window.location.hash = newHash;
  }

  readUrlParams() {
    const urlParams = window.location.hash.replace(/^#\/?|\/$/g, '').split('/');
    if (urlParams.length === 3) {
      this.updateRoute(helper.decode(urlParams[0]), helper.decode(urlParams[1]), helper.decode(urlParams[2]));
    }
  }

  clearRoute() {
    this.setState({
      decodedPath: undefined,
      directions: undefined,
      elevationProfile: undefined,
    });
  }

  render() {
    return (
      <div>
        <Controls
          updateRoute={this.updateRoute}
          windowHeight={this.state.windowHeight}
          startAddress={this.state.startAddress}
          endAddress={this.state.endAddress}
        />
        <Directions
          directions={this.state.directions}
          decodedPath={this.state.decodedPath}
          endAddress={this.state.endAddress}
          elevationProfile={this.state.elevationProfile}
          windowHeight={this.state.windowHeight}
        />
        <Map
          startLocation={this.state.startLocation}
          endLocation={this.state.endLocation}
          decodedPath={this.state.decodedPath}
          setStartLocation={this.setStartLocation}
          setEndLocation={this.setEndLocation}
          windowHeight={this.state.windowHeight}
        />
        <Elevation
          elevationProfile={this.state.elevationProfile}
        />
      </div>
    );
  }
}

ReactDOM.render(
  <App />,
  document.getElementById('app')
);
