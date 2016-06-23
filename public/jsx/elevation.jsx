const React = require('react');

const helper = require('../js/helper');

class Elevation extends React.Component {
  constructor(props) {
    super(props);

    this.state = {};
  }

  render() {
    if (!this.props.elevationProfile || !this.props.elevationProfile.length) {
      return <div />;
    }


    return (
      <div className="elevation">
        
      </div>
    );
  }
}

Elevation.propTypes = {
  elevationProfile: React.PropTypes.array,
};

module.exports = Elevation;
