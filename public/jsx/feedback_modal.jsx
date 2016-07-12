const React = require('react');
const Modal = require('react-modal');

const url = require('../js/url');

class FeedbackModal extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      selectedForm: 'collisionOrIncident',
    };

    this.showFeedbackForm = () => {
      this.setState({
        modalOpen: true,
      });
    };

    this.hideFeedbackForm = () => {
      this.setState({
        modalOpen: false,
      });
    };

    // this.sendFeedbackForm = (event) => {
    //   event.preventDefault();
    //
    //   console.log(event);
    //
    //   const feedback = {};
    //
    //   _.each(event.target, (input) => {
    //     feedback[input.name] = input.value;
    //   });
    //
    //   console.log(feedback);
    // };

    this.toggleFormCategory = (event) => {
      this.setState({ selectedForm: event.target.value });
    };
  }

  render() {
    const forms = {
      collisionOrIncident: (
        <div>
          <div className="form-group">
            <p>Choose type of incident, provide brief desription, & contact info (optional)</p>
            <label className="control-label">Incident Type</label>
            <div>
              <label className="checkbox-inline">
                <input type="radio" name="incidentType" value="bikeBike" /> Bike-bike
              </label>
              <label className="checkbox-inline">
                <input type="radio" name="incidentType" value="bikeCar" /> Bike-car
              </label>
              <label className="checkbox-inline">
                <input type="radio" name="incidentType" value="bikePed" /> Bike-ped
              </label>
            </div>
          </div>
          <div className="form-group">
            <label>Description</label>
            <textarea className="form-control" name="description"></textarea>
          </div>
          <div className="form-group">
            <label>Contact Info</label>
            <input className="form-control" name="contactInfo" />
          </div>
        </div>
      ),
      unsafeCondition: (
        <div>
          <div className="form-group">
            <p>Report an unsafe intesection, pothole, path/road condition, missing connection, incorrect signage, etc.</p>
            <label>Description</label>
            <textarea className="form-control" name="description"></textarea>
          </div>
        </div>
      ),
      constructionZone: (
        <div>
          <div className="form-group">
            <p>Report a construction zone that may require careful biking or a detour. Provide us the location of the construction zone.</p>
            <label>Description</label>
            <textarea className="form-control" name="description"></textarea>
          </div>
        </div>
      ),
      infrastructureRequest: (
        <div>
          <div className="form-group">
            <p>Let us know what would make it easier for you to get around (new or improved bike path, lane, or route; missing connection, improved design)</p>
            <label>Description</label>
            <textarea className="form-control" name="description"></textarea>
          </div>
        </div>
      ),
      bikeParking: (
        <div>
          <div className="form-group">
            <p>Tag or enter location of desired or exisiting bike parking</p>
          </div>
        </div>
      ),
      praiseOrFeedback: (
        <div>
          <div className="form-group">
            <label>How can we improve this map?</label>
            <textarea className="form-control" name="description"></textarea>
          </div>
        </div>
      ),
    };

    return (
      <div>
        <button onClick={this.showFeedbackForm} className="btn btn-default">Improve this map</button>
        <Modal
          isOpen={this.state.modalOpen}
          onRequestClose={this.hideFeedbackForm}
          style={{
            content: {
              left: '0',
              right: '0',
              maxWidth: '600px',
              margin: '0 auto',
            },
          }}
        >
          <h1>Feedback</h1>
          <form method="POST" action="/api/feedback">
            <div className="form-group">
              <label className="control-label">Feedback Type</label>
              <select className="form-control" onChange={this.toggleFormCategory}>
                <option value="collisionOrIncident">Collision or Incident</option>
                <option value="unsafeCondition">Unsafe Condition</option>
                <option value="constructionZone">Construction Zone</option>
                <option value="infrastructureRequest">Infrastructure Request or Idea</option>
                <option value="bikeParking">Bike Parking Request or Tag Existing</option>
                <option value="praiseOrFeedback">Praise / Feedback</option>
              </select>
            </div>
            {forms[this.state.selectedForm]}
            <input type="hidden" value={url.getUrl()} name="redirectUrl" />
            <button onClick={this.hideFeedbackForm} className="btn btn-danger">Cancel</button>&nbsp;
            <button type="submit" className="btn btn-primary">Send</button>
          </form>
        </Modal>
      </div>
    );
  }
}

FeedbackModal.propTypes = {
};

module.exports = FeedbackModal;
