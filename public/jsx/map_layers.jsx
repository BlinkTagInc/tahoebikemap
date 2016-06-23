const React = require('react');

const FeedbackModal = require('./feedback_modal.jsx');

const map = require('../js/map');

class MapLayers extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      class1: true,
      class2: true,
      class3: true,
      bikeParking: true,
      bikeStores: true,
    };

    this.toggleClass1 = () => {
      map.toggleLayer('class1', !this.state.class1);
      this.setState({
        class1: !this.state.class1,
      });
    };

    this.toggleClass2 = () => {
      map.toggleLayer('class2', !this.state.class2);
      this.setState({
        class2: !this.state.class2,
      });
    };

    this.toggleClass3 = () => {
      map.toggleLayer('class3', !this.state.class3);
      this.setState({
        class3: !this.state.class3,
      });
    };

    this.toggleBikeParking = () => {
      map.toggleLayer('bikeParking', !this.state.bikeParking);
      this.setState({
        bikeParking: !this.state.bikeParking,
      });
    };

    this.toggleBikeStores = () => {
      map.toggleLayer('bikeStores', !this.state.bikeStores);
      this.setState({
        bikeStores: !this.state.bikeStores,
      });
    };
  }

  render() {
    return (
      <div className="map-layers">
        <div>
          <div className="map-layer-legend bikeParking"></div>
          <label>
            <input
              type="checkbox"
              checked={this.state.bikeParking}
              onChange={this.toggleBikeParking}
            />
            <span>Bike Parking</span>
          </label>
        </div>
        <div>
          <div className="map-layer-legend bikeStores"></div>
          <label>
            <input
              type="checkbox"
              checked={this.state.bikeStores}
              onChange={this.toggleBikeStores}
            />
            <span>Bike Stores</span>
          </label>
        </div>
        <div>
          <div className="map-layer-legend class1"></div>
          <label>
            <input
              type="checkbox"
              checked={this.state.class1}
              onChange={this.toggleClass1}
            />
            <span>Class 1</span>
          </label>
        </div>
        <div>
          <div className="map-layer-legend class2"></div>
          <label>
            <input
              type="checkbox"
              checked={this.state.class2}
              onChange={this.toggleClass2}
            />
            <span>Class 2</span>
          </label>
        </div>
        <div>
          <div className="map-layer-legend class3"></div>
          <label>
            <input
              type="checkbox"
              checked={this.state.class3}
              onChange={this.toggleClass3}
            />
            <span>Class 3</span>
          </label>
        </div>
        <FeedbackModal />
      </div>
    );
  }
}

MapLayers.propTypes = {
};

module.exports = MapLayers;
