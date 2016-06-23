const React = require('react');

const helper = require('../js/helper');
const map = require('../js/map');

class Directions extends React.Component {
  constructor(props) {
    super(props);

    this.state = {};
  }

  getDirectionsHeight() {
    const controlsHeight = 208;
    return this.props.windowHeight - controlsHeight;
  }

  getDistance() {
    return map.getPathDistance(this.props.decodedPath);
  }

  render() {
    if (!this.props.directions || !this.props.directions.length) {
      return <div />;
    }

    const directionsList = this.props.directions.map((direction, idx) => {
      return (
        <li key={idx}>{direction[0]} on {direction[1]}</li>
      );
    });

    directionsList.push((
      <li key="final">arrive at {this.props.endAddress}</li>
    ));

    const totalDistance = this.getDistance();

    return (
      <div className="directions" style={{ height: `${this.getDirectionsHeight()}px` }}>
        <h3>Directions to {this.props.endAddress}</h3>
        <div className="stats">
          <div className="stat">
            Distance: {helper.formatDistance(totalDistance)}
          </div>
          <div className="stat">
            Time: {helper.formatTime(totalDistance)}
          </div>
          <div className="stat">
            Total Feet of Climbing: {helper.formatElevation(helper.getElevationGain(this.props.elevationProfile))}
          </div>
        </div>
        <ul className="directions-list">
          {directionsList}
        </ul>
      </div>
    );
  }
}

Directions.propTypes = {
  directions: React.PropTypes.array,
  endAddress: React.PropTypes.string,
  decodedPath: React.PropTypes.array,
  elevationProfile: React.PropTypes.array,
  windowHeight: React.PropTypes.number,
};

module.exports = Directions;
