const React = require('react');
const classNames = require('classnames');

class Disclaimer extends React.Component {

  render() {
    return (
      <div className={classNames('disclaimer', this.props.classes)}>
        This website should be used for reference purposes only.
        LTBC does not guarantee the accuracy, or reliability of the information.
        This site and all materials contained on it are distributed without any warranties of any kind.
        By using this website, the user expressly agrees that use of the information contained on this website is at the user's sole risk.
      </div>
    );
  }
}

Disclaimer.propTypes = {
  classes: React.PropTypes.object,
};

module.exports = Disclaimer;
